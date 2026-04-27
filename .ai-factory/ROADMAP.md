# Roadmap

Product and engineering milestones for LoginApp.

## Status legend

- ✅ Done
- 🔄 In progress
- 🔲 Planned
- ❌ Out of scope

---

## Phase 1 — Foundation (complete)

- ✅ Project scaffolding (React Native 0.85, TypeScript)
- ✅ React Navigation v7 — native stack with Home, Login, Profile screens
- ✅ TanStack React Query v5 wired up via `QueryClientProvider`
- ✅ Path alias `@/` configured in `tsconfig.json` and `babel-plugin-module-resolver`
- ✅ ESLint with `import/order` rule and Prettier
- ✅ Jest baseline test suite

---

## Phase 2 — Login Form & Authentication Flow (complete)

API: `https://dummyjson.com/docs/auth`

Completed: 2026-04-25 (`feature/auth-flow`)

### Navigation

- ✅ Home screen has a "Sign In" button that navigates to Login

### Auth service (`src/services/api/auth.ts`)

- ✅ `POST https://dummyjson.com/auth/login` — typed `LoginPayload` (`username`, `password`) → `AuthToken` (`accessToken`, `refreshToken`, `id`, …)
- ✅ `GET https://dummyjson.com/auth/me` — fetch the authenticated user's profile (Bearer token)
- ✅ Global interceptor (Axios or custom fetch wrapper) configured to catch 401/403 responses globally

### Auth state (`src/providers/AuthProvider.tsx`)

- ✅ `AuthProvider` wraps the app; exposes `user`, `token`, `login()`, `logout()` via context
- ✅ Token securely persisted to `expo-secure-store` or `react-native-keychain` on login (DO NOT use `AsyncStorage` for tokens)
- ✅ On app start, read stored token and rehydrate auth state before first render
- ✅ `useAuth()` hook for consuming the context

### Login screen (`src/screens/LoginScreen.tsx`)

- ✅ Username and password text inputs (controlled, TypeScript-typed)
- ✅ `useLogin` mutation hook (`useMutation` wrapping the login service)
- ✅ Inline error message shown when credentials are rejected by the API (401)
- ✅ On success: store token securely via `AuthProvider.login()`
- ✅ Loading indicator on the submit button; **button is disabled while `isPending`** to prevent double-click submissions
- ✅ Dismiss keyboard on submit

### Protected routing (`src/navigation/RootNavigator.tsx`)

- ✅ Split navigator into `AuthStack` (Home, Login) and `AppStack` (Profile)
- ✅ `RootNavigator` reads auth state from `AuthProvider` and conditionally renders the correct stack
- ✅ Unauthenticated users cannot reach the Profile screen (routing is strictly state-driven, no manual redirects inside components)

### Profile screen (`src/screens/ProfileScreen.tsx`)

- ✅ `useProfile` query hook — `useQuery` wrapping `GET /auth/me` with the stored token
- ✅ Display: name, email, username, avatar (from API response)
- ✅ Logout button — calls `AuthProvider.logout()`, clears secure token, triggering automatic stack switch to `AuthStack`

### Session invalidation

- ✅ Global API interceptor or React Query `QueryCache` global callback detects 401/403
- ✅ Automatically triggers `AuthProvider.logout()` (clears SecureStore and auth state)
- ✅ Works at runtime: state update instantly drops the user from `AppStack` to `AuthStack` without local `useEffect` or component-level `onError` handling
- ✅ Client-side JWT expiry check — decode `exp` claim from the stored token without a network request; if expired, call `logout()` immediately. Checked in two places: (1) `AuthProvider` hydration on app start, (2) `AppState` `change` listener when the app returns to foreground. Complements the existing 401/403 interceptor — the interceptor remains as fallback for server-side revocation and clock skew. (delivered `feature/client-side-jwt-expiry-check`, 2026-04-26)

---

## Phase 3 — Polish & Quality

- ✅ Error boundary for unexpected crashes
- ✅ Accessibility labels on all inputs and buttons
- ✅ Unit tests: `useLogin` mutation, `useProfile` query, `AuthProvider` state transitions (delivered in `feature/auth-flow`, 2026-04-25)
- ✅ Form validation — per-field error messages (username length, required fields) triggered on submit (delivered 2026-04-25)
- ✅ Offline state handling — `OfflineScreen` shown when `getMe()` fails with a network error during hydration; Reconnect button retries the session (delivered 2026-04-26)

---

## Out of scope (v1)

- ❌ Loading skeleton on Profile screen while user data is fetching
- ❌ Dark mode tested on iOS and Android
- ❌ Social / OAuth login (Google, Apple)
- ❌ Token refresh (`refreshToken` flow)
- ❌ Edit profile
- ❌ Push notifications
- ❌ Offline optimistic queue (offline detection during hydration was delivered in Phase 3)
- ❌ E2E smoke test: login → profile → logout flow

---

## Completed

| Milestone | Date | Branch |
| :--- | :--- | :--- |
| Accessibility labels on all inputs and buttons | 2026-04-27 | `feature/accessibility-labels` |
