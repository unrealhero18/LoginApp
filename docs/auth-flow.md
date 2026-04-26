[← Getting Started](getting-started.md) · [Back to README](../README.md)

# Authentication Flow

LoginApp's authentication is built on the [DummyJSON Auth API](https://dummyjson.com/docs/auth). The flow is layered: a typed HTTP client at the bottom, a service that calls it, an `AuthProvider` that owns auth state, and a `RootNavigator` that switches between an authenticated and unauthenticated stack based on that state.

## Summary

- **Storage:** access/refresh tokens persist to the iOS Keychain / Android Keystore via `react-native-keychain`. `AsyncStorage` is **never** used for tokens.
- **Hydration:** on app start, `AuthProvider` reads the stored token, calls `GET /auth/me`, and only then renders the navigator. Failed hydration clears the keychain and falls through to `AuthStack`.
- **Routing:** state-driven. `RootNavigator` reads `useAuth()` and renders `AppStack` (Profile) when a token is present, otherwise `AuthStack` (Home, Login). Screens never call `navigate(Login)` after logout — the stack swap happens automatically when state changes.
- **401/403:** any `apiFetch` response with these statuses (or any React Query mutation/query that fails with one) triggers `AuthProvider.logout()` via a single registered handler. The user lands on `AuthStack` instantly, with React Query's cache cleared.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│ App.tsx                                                  │
│  └── QueryClientProvider                                 │
│       └── AuthProvider                                   │
│            └── NavigationContainer                       │
│                 └── RootNavigator (reads useAuth)        │
│                      ├── AuthStack: Home, Login          │
│                      └── AppStack:  Profile              │
└──────────────────────────────────────────────────────────┘
```

Dependency direction is strictly downward (per `.ai-factory/ARCHITECTURE.md`):

`screens` → `hooks` → `services` → (no React, no hooks)

## Modules

### Types — `src/types/auth.ts`

`LoginPayload`, `AuthToken`, `AuthUser`. All shared types live here per the project rules.

### HTTP client — `src/services/api/client.ts`

A small typed `apiFetch<T>` wrapper around `fetch` with:

- Base URL `https://dummyjson.com`.
- Automatic `Authorization: Bearer <token>` injection from a module-private variable, controlled via `setAuthToken(token: string | null)`.
- A single registered unauthorized handler set via `setOnUnauthorized(handler)`. Any 401/403 response calls the handler before throwing.
- An `ApiError` class extending `Error` with a numeric `status` field for downstream pattern matching.

### Auth service — `src/services/api/auth.ts`

```ts
login(payload: LoginPayload): Promise<AuthToken>   // POST /auth/login
getMe(): Promise<AuthUser>                          // GET /auth/me
```

Plain async functions, no React. Tokens are never passed in explicitly — `apiFetch` reads the token registered via `setAuthToken`.

### Secure token storage — `src/services/storage/secureTokenStore.ts`

Wraps `react-native-keychain` with three async functions:

- `saveToken(token: AuthToken)` — `Keychain.setGenericPassword` under service `loginapp.auth`.
- `loadToken()` — returns the deserialized `AuthToken` or `null`.
- `clearToken()` — `Keychain.resetGenericPassword`.

### `AuthProvider` — `src/providers/AuthProvider.tsx`

Owns context value `{ user, token, isHydrating, login, logout }`.

- **Hydration (mount):** loads stored token → calls `setAuthToken` → calls `getMe()`. Failure clears the keychain and resets state. `isHydrating` flips to `false` either way.
- **`login(payload)`:** `auth.login` → `saveToken` → `setAuthToken` → `getMe` → updates context state. The whole pipeline is one promise so consumers see one success/failure.
- **`logout()`:** clears React Query cache (`queryClient.clear()`), `setAuthToken(null)`, resets state, then `clearToken()` (errors logged but swallowed so logout always completes).
- **401 bridge:** registers the same `logout()` handler with both `client.setOnUnauthorized` (direct apiFetch path) and `queryClient.setQueryClientUnauthorizedHandler` (React Query cache path). Logout is idempotent under double-fire.

### `useAuth` — `src/hooks/useAuth.ts`

Throws if used outside `AuthProvider`.

### `RootNavigator` — `src/navigation/RootNavigator.tsx`

```
if (isHydrating) → ActivityIndicator (full-screen)
else if (token)  → AppStack (Profile)
else             → AuthStack (Home, Login)
```

Each stack has its own param list type (`AuthStackParamList`, `AppStackParamList`); `RootStackParamList` is exported as the union for backward-compatible imports.

### `useLogin` — `src/hooks/useLogin.ts`

`useMutation` thin wrapper around `useAuth().login`. Lets `LoginScreen` consume `mutate`, `isPending`, `error`, and `reset` without owning the persistence pipeline.

### `useProfile` — `src/hooks/useProfile.ts`

`useQuery({ queryKey: ['profile'], queryFn: getMe, enabled: !!token })`. Disabled while logged out so the cache stays empty.

## Login screen behavior

`src/screens/LoginScreen.tsx`:

- Controlled `username`/`password` inputs with `autoCapitalize="none"`, `autoCorrect={false}`.
- Submit button is disabled until both fields are non-empty and the mutation is idle.
- On press: `Keyboard.dismiss()` → `mutation.reset()` if a previous error existed → `mutate({ username, password })`.
- While `isPending`: button shows `<ActivityIndicator />` and is non-pressable (`PrimaryButton.isLoading` prop).
- On 400/401: a generic message ("Wrong username or password") is shown above the button via the shared `resolveErrorMessage` helper. The screen never displays raw API error text.
- On success: nothing — `AuthProvider` updates state, `RootNavigator` swaps to `AppStack`.

## Profile screen behavior

`src/screens/ProfileScreen.tsx`:

- Calls `useProfile()`. Shows `<ActivityIndicator />` until data resolves.
- Renders `firstName lastName`, `username`, `email`, and the avatar (`Image` with a 96px circular frame).
- Logout button calls `useAuth().logout()` and never navigates manually.

## Session invalidation

| Trigger | Path | Result |
|---|---|---|
| `apiFetch` returns 401/403 | `setOnUnauthorized` registry | `AuthProvider.logout()` |
| React Query mutation/query fails with `ApiError` (401/403) | `QueryCache`/`MutationCache` global `onError` → `setQueryClientUnauthorizedHandler` | `AuthProvider.logout()` |

Both paths route through the same handler. Logout is idempotent — keychain, in-memory state, and `setAuthToken(null)` are all safe to call repeatedly.

## Configuration

- **Environment:** none. Base URL is hard-coded in `src/services/api/client.ts`.
- **Native:** iOS requires `pod install` after pulling. The keychain entry uses service name `loginapp.auth`.

## Testing

Run with:

```sh
pnpm test
```

Coverage:

- `src/providers/__tests__/AuthProvider.test.tsx` — hydration (logged-out, success, failure), login transition, logout, 401 handler registration.
- `src/hooks/__tests__/useLogin.test.tsx` — pending/success/error states.
- `src/hooks/__tests__/useProfile.test.tsx` — disabled without token, fetches once token hydrates.
- `src/screens/__tests__/LoginScreen.test.tsx` — does not submit when fields are empty, shows generic error on 401.
- `src/screens/__tests__/ProfileScreen.test.tsx` — renders user data, logout invokes keychain reset.

`react-native-keychain` is mocked globally in `jest.setup.ts` (including the `STORAGE_TYPE` enum). `src/test-utils/renderWithAuth.tsx` provides a wrapper that renders inside `QueryClientProvider` + `AuthProvider` with a fresh non-retrying test query client.

## Out of scope

- Token refresh (`refreshToken` flow) — see `.ai-factory/ROADMAP.md` "Out of scope".
- OAuth, edit profile, push notifications, offline mode.

## See Also

- [Getting Started](getting-started.md) — prerequisites, install, running the app and tests
