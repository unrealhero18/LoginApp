# Plan: Phase 2 — Login Form & Authentication Flow

- **Branch:** `feature/auth-flow`
- **Created:** 2026-04-25
- **API:** https://dummyjson.com/docs/auth
- **Mode:** Full

## Settings

- **Testing:** yes — useLogin mutation, useProfile query, AuthProvider transitions, screen smoke tests
- **Logging:** minimal — `WARN`/`ERROR` only via `@/utils/logger`; no DEBUG/INFO in success paths
- **Docs:** yes — mandatory `/aif-docs` checkpoint at completion

## Roadmap Linkage

- **Milestone:** "Phase 2 — Login Form & Authentication Flow"
- **Rationale:** This plan implements the full Phase 2 milestone end-to-end (auth service, secure-token state, protected navigation, login + profile screens, 401/403 session invalidation). Phase 3 test items for `useLogin`, `useProfile`, and `AuthProvider` transitions are pulled forward into this plan because the user opted in to tests.

## Pre-flight Notes

- The repo is bare React Native (no Expo). **Use `react-native-keychain`**, not `expo-secure-store`. Native pods must be installed for iOS.
- `src/screens/LoginScreen.tsx` already has uncommitted scaffolding (controlled username/password inputs). Task 9 will replace its `onPress={() => {}}` with a real submit handler — do not start a fresh file, edit the existing one.
- `src/screens/HomeScreen.tsx` already has a "Go to login" button — the roadmap "Sign In" navigation requirement is satisfied. No new task needed for it.
- Architecture is layered (screen-centric): screens → hooks → services. Never call services directly from screens. Never use `any` (RULES §Language & Types).
- Imports must follow the ESLint `import/order` groups: `react` → externals → `@/*` → relative → assets/theme, with blank lines between groups.

## Tasks

### Phase A — Foundations

#### Task 1 — Add auth domain types

- **Deliverable:** `src/types/auth.ts` exporting `LoginPayload`, `AuthToken`, `AuthUser`.
- **Shapes:**
  - `LoginPayload = { username: string; password: string }`
  - `AuthToken = { accessToken: string; refreshToken: string; id: number; expiresInMins?: number }`
  - `AuthUser = { id: number; username: string; email: string; firstName: string; lastName: string; image: string }` (subset of dummyjson `/auth/me` response — keep minimal, expand only as screens need it).
- **Logging:** none.
- **Notes:** Use `type`, not `interface` (RULES). No `any`.

#### Task 2 — Install secure storage and create token store

- **Deliverable:**
  - Add `react-native-keychain` to `package.json`; run pod install for iOS.
  - `src/services/storage/secureTokenStore.ts` exporting `saveToken(token: AuthToken)`, `loadToken()`, `clearToken()`.
- **Behaviour:** wrap `Keychain.setGenericPassword` / `getGenericPassword` / `resetGenericPassword`. Serialise the full `AuthToken` JSON under a single keychain entry (service: `loginapp.auth`).
- **Logging:** `logger.error` on keychain failures only.
- **Notes:** AsyncStorage is forbidden for tokens (roadmap rule). All functions return `Promise<T>` with explicit return types.
- **Blocked by:** Task 1.

#### Task 3 — Build typed HTTP client with 401/403 hook

- **Deliverable:** `src/services/api/client.ts` exporting:
  - `setAuthToken(accessToken: string | null)` — updates an in-module variable used to set `Authorization: Bearer <token>`.
  - `setOnUnauthorized(handler: () => void)` — registers a single global handler.
  - `apiFetch<T>(path: string, init?: RequestInit): Promise<T>` — base URL `https://dummyjson.com`, throws `Error` on non-OK, calls registered handler on `401`/`403` before throwing.
- **Logging:** `logger.warn` once when the unauthorized handler fires; `logger.error` on network failures. Nothing else.
- **Notes:** No `any`. Generic over `T`. Service layer only — do not import from `screens`/`hooks`/`components`.
- **Blocked by:** Task 1.

### Phase B — Auth state and protected routing

#### Task 4 — Implement auth service

- **Deliverable:** `src/services/api/auth.ts`:
  - `login(payload: LoginPayload): Promise<AuthToken>` → `POST /auth/login`.
  - `getMe(): Promise<AuthUser>` → `GET /auth/me` (relies on `apiFetch`'s in-module bearer token; do not pass token explicitly).
- **Logging:** none in success paths; rely on `apiFetch` for error logs.
- **Notes:** Plain async functions, no React, no hooks. Throw `Error` on non-OK (already handled inside `apiFetch`).
- **Blocked by:** Task 3.

#### Task 5 — Create `AuthProvider` and `useAuth`

- **Deliverable:**
  - `src/providers/AuthProvider.tsx` with context value `{ user: AuthUser | null; token: AuthToken | null; isHydrating: boolean; login: (payload: LoginPayload) => Promise<void>; logout: () => Promise<void> }`.
  - `src/hooks/useAuth.ts` exporting a `useAuth()` hook that reads the context (throw if used outside provider).
- **Behaviour:**
  - On mount: `loadToken()` from keychain; if present, call `setAuthToken(token.accessToken)` then `getMe()` to populate `user`. Set `isHydrating = false` when done (success or fail).
  - On `login`: call `auth.login`, persist via `saveToken`, `setAuthToken`, fetch `getMe`, update state.
  - On `logout`: clear keychain (`clearToken`), `setAuthToken(null)`, reset state, call `queryClient.clear()` to drop cached server data.
  - If `getMe()` fails during hydration, treat as logged-out: clear token, reset state.
- **Logging:** `logger.warn` on hydration failure; `logger.error` on keychain write/clear failures. No success logs.
- **Notes:** Token is server state but kept in context because it gates routing — do not duplicate `user` into a `useState` that React Query could own; use `useQuery` internally for `me` keyed by token if it simplifies the rehydration flow (optional, judgement call).
- **Blocked by:** Tasks 2, 4.

#### Task 6 — Wire `AuthProvider` into `App.tsx` and connect 401 invalidation

- **Deliverable:**
  - `App.tsx`: wrap `<NavigationContainer>` with `<AuthProvider>` (inside `<QueryClientProvider>` so the provider can use the client).
  - Inside `AuthProvider` (or a sibling effect), call `setOnUnauthorized(() => logout())` on mount.
  - Add a global `QueryCache`/`MutationCache` `onError` callback in `src/providers/queryClient.ts` (or via `setQueryDefaults`) that detects 401/403 errors thrown by `apiFetch` and triggers logout via the same handler bridge.
- **Logging:** `logger.warn` once per 401 trigger.
- **Notes:** Bridge the React Query global error to the auth handler via the `setOnUnauthorized` registry — do not import `AuthProvider` into `queryClient.ts` (that would create a cycle). Throw a typed `ApiError` (extend `Error` with `status: number`) from `apiFetch` so the cache callback can pattern-match.
- **Blocked by:** Tasks 3, 5.

#### Task 7 — Split `RootNavigator` into `AuthStack` and `AppStack`

- **Deliverable:** Refactor `src/navigation/RootNavigator.tsx`:
  - Move `Home` and `Login` into `AuthStack`.
  - Move `Profile` into `AppStack`.
  - `RootNavigator` reads `useAuth()`; while `isHydrating` render a minimal centered `ActivityIndicator` placeholder; otherwise pick stack by `token` presence.
  - Keep the single `RootStackParamList` or split into `AuthStackParamList` / `AppStackParamList` — prefer the split, then re-export a union type for consumers that need it.
- **Logging:** none.
- **Notes:** Routing must be strictly state-driven — no `navigation.navigate(Login)` after logout from screens (RULES + roadmap). Update `Routes` enum only if you introduce a loading route; otherwise leave it as-is.
- **Blocked by:** Task 5.

### Phase C — Login screen

#### Task 8 — Create `useLogin` mutation hook

- **Deliverable:** `src/hooks/useLogin.ts` exporting `useLogin()` that returns the result of `useMutation({ mutationFn: ({ username, password }) => auth.login({ username, password }) })`.
- **Behaviour:** On `onSuccess`, call `useAuth().login` flow — but to avoid duplicating the login pipeline (token persist + getMe), have the hook delegate the **whole** flow to `AuthProvider.login()` and wrap it in `useMutation` so callers still get `isPending`/`error`/`mutate`. The mutationFn becomes `(payload) => authContext.login(payload)`.
- **Logging:** none — `AuthProvider` already logs failures.
- **Notes:** Type `error` as `Error`; no `any`. Do not import the service directly here — go through `AuthProvider`.
- **Blocked by:** Tasks 4, 5.

#### Task 9 — Wire `LoginScreen` to `useLogin`

- **Deliverable:** Update existing `src/screens/LoginScreen.tsx`:
  - Replace `onPress={() => {}}` with `submit()` that calls `useLogin().mutate({ username, password })`.
  - Show inline error message above the submit button when `mutation.isError` (text from `mutation.error.message`; map "Invalid credentials" / 401 generically to "Wrong username or password").
  - Disable the submit button while `mutation.isPending`; show a spinner inside `PrimaryButton` (extend `PrimaryButton` only if needed — otherwise pass an `isLoading` prop you add to it).
  - Call `Keyboard.dismiss()` at the start of `submit()`.
  - Remove the placeholder client-side password length validation — server is the source of truth (revert that line; keep field controlled).
- **Logging:** none.
- **Notes:** No business logic outside the hook — keep the screen thin. Successful login must NOT call `navigation.navigate` — the navigator switch is automatic via `AuthProvider` state (Task 7).
- **Blocked by:** Tasks 7, 8.

### Phase D — Profile screen

#### Task 10 — Create `useProfile` query hook

- **Deliverable:** `src/hooks/useProfile.ts` exporting `useProfile()` returning `useQuery({ queryKey: ['profile'], queryFn: getMe, enabled: !!token })`.
- **Behaviour:** Read `token` from `useAuth()` to drive `enabled`. Stale time: rely on the `queryClient` default (5 min).
- **Logging:** none.
- **Notes:** No `any`. Errors here are picked up by the global `QueryCache` 401 handler; do not handle 401 locally.
- **Blocked by:** Tasks 4, 5.

#### Task 11 — Update `ProfileScreen` to render user and provide logout

- **Deliverable:** `src/screens/ProfileScreen.tsx`:
  - Use `useProfile()`.
  - When loading: render `<ActivityIndicator />` (skeleton task is Phase 3 — out of scope).
  - When data: show `firstName lastName`, `email`, `username`, and avatar (`<Image source={{ uri: image }} />` with a fixed size from theme).
  - Replace "Back to Home" button with a "Logout" `PrimaryButton` calling `useAuth().logout()`.
- **Logging:** none.
- **Notes:** Do not call `navigation.goBack()` or `navigation.navigate(Home)` after logout — stack switch is automatic.
- **Blocked by:** Tasks 7, 10.

### Phase E — Tests

#### Task 12 — Cover hooks, provider, and screens with tests

- **Deliverable:** Co-located or `__tests__/` files (RULES allows either):
  - `src/hooks/__tests__/useLogin.test.ts` — successful login resolves, failed login surfaces error.
  - `src/hooks/__tests__/useProfile.test.ts` — disabled when no token; fetches when token present.
  - `src/providers/__tests__/AuthProvider.test.tsx` — initial hydration with stored token, login transition, logout transition, 401 bridge calls logout.
  - `src/screens/__tests__/LoginScreen.test.tsx` — renders smoke; disables button while pending; shows inline error on failure.
  - `src/screens/__tests__/ProfileScreen.test.tsx` — renders smoke with mocked `useProfile` data; logout button invokes `useAuth().logout`.
- **Tooling:** `@testing-library/react-native`, mock `react-native-keychain`, `react-native`'s `Keyboard`, and the `apiFetch` client. Wrap renders in `<QueryClientProvider>` + `<AuthProvider>` (or a thin test-utils helper).
- **Logging:** none (silence `logger.warn`/`error` in test setup).
- **Notes:** Each screen test must pass the smoke bar (RULES §Testing).
- **Blocked by:** Tasks 9, 11.

## Commit Plan

Conventional Commits, scope-prefixed. Each checkpoint groups logically related tasks.

| # | Tasks | Suggested message |
|---|---|---|
| 1 | T1 → T3 | `feat(auth): scaffold types, secure token store, and api client` |
| 2 | T4 → T6 | `feat(auth): add provider, service, and 401 invalidation bridge` |
| 3 | T7 | `refactor(nav): split root navigator into auth and app stacks` |
| 4 | T8 → T9 | `feat(login): wire login mutation, inline errors, and pending state` |
| 5 | T10 → T11 | `feat(profile): render authenticated user and add logout` |
| 6 | T12 | `test(auth): cover login, profile, provider transitions, and screens` |

## Progress Tracker

- [x] T1 — Add auth domain types
- [x] T2 — Install secure storage and create token store
- [x] T3 — Build typed HTTP client with 401/403 hook
- [x] T4 — Implement auth service
- [x] T5 — Create AuthProvider and useAuth
- [x] T6 — Wire AuthProvider into App and connect 401 invalidation
- [x] T7 — Split RootNavigator into AuthStack and AppStack
- [ ] T8 — Create useLogin mutation hook
- [ ] T9 — Wire LoginScreen to useLogin
- [ ] T10 — Create useProfile query hook
- [ ] T11 — Update ProfileScreen with user data and logout
- [ ] T12 — Cover hooks, provider, and screens with tests

## Out of scope (explicit)

- Token refresh flow (`refreshToken`) — roadmap "Out of scope".
- Edit profile, push notifications, OAuth, offline mode — roadmap "Out of scope".
- Loading skeleton, error boundary, accessibility audit, dark-mode QA, E2E flow — Phase 3.

## Completion checklist

- [ ] All 12 tasks marked `completed`.
- [ ] `npm run lint` and `npm test` clean.
- [ ] iOS app launches, hydrates auth, blocks Profile while logged out, recovers from 401 by dropping to AuthStack.
- [ ] Mandatory `/aif-docs` checkpoint run before merge.
