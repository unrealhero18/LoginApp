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

## Phase 2 — Login Form & Authentication Flow

API: `https://dummyjson.com/docs/auth`

### Navigation
- 🔲 Home screen has a "Sign In" button that navigates to Login

### Auth service (`src/services/api/auth.ts`)
- 🔲 `POST https://dummyjson.com/auth/login` — typed `LoginPayload` (`username`, `password`) → `AuthToken` (`accessToken`, `refreshToken`, `id`, …)
- 🔲 `GET https://dummyjson.com/auth/me` — fetch the authenticated user's profile (Bearer token)

### Auth state (`src/providers/AuthProvider.tsx`)
- 🔲 `AuthProvider` wraps the app; exposes `user`, `token`, `login()`, `logout()` via context
- 🔲 Token persisted to `@react-native-async-storage/async-storage` on login
- 🔲 On app start, read stored token and rehydrate auth state before first render
- 🔲 `useAuth()` hook for consuming the context

### Login screen (`src/screens/LoginScreen.tsx`)
- 🔲 Username and password text inputs (controlled, TypeScript-typed)
- 🔲 `useLogin` mutation hook (`useMutation` wrapping the login service)
- 🔲 Inline error message shown when credentials are rejected by the API (401)
- 🔲 On success: store token via `AuthProvider.login()` and navigate to Profile
- 🔲 Loading indicator on the submit button while the request is in flight
- 🔲 Dismiss keyboard on submit

### Protected routing (`src/navigation/RootNavigator.tsx`)
- 🔲 Split navigator into `AuthStack` (Home, Login) and `AppStack` (Profile)
- 🔲 `RootNavigator` reads auth state from `AuthProvider` and renders the correct stack
- 🔲 Unauthenticated users cannot reach the Profile screen

### Profile screen (`src/screens/ProfileScreen.tsx`)
- 🔲 `useProfile` query hook — `useQuery` wrapping `GET /auth/me` with the stored token
- 🔲 Display: name, email, username, avatar (from API response)
- 🔲 If the API returns 401/403 (token invalid or expired): clear stored token, reset auth state, and navigate to Home automatically
- 🔲 Logout button — calls `AuthProvider.logout()`, clears token, navigates to Home

### Session invalidation
- 🔲 React Query `onError` handler on the `useProfile` query detects 401/403 and triggers automatic logout
- 🔲 Works at runtime: if the token expires while the user is on the Profile screen, they are redirected to Home without manual action

---

## Phase 3 — Polish & Quality

- 🔲 Loading skeleton on Profile screen while user data is fetching
- 🔲 Error boundary for unexpected crashes
- 🔲 Accessibility labels on all inputs and buttons
- 🔲 Dark mode tested on iOS and Android
- 🔲 Unit tests: `useLogin` mutation, `useProfile` query, `AuthProvider` state transitions
- 🔲 E2E smoke test: login → profile → logout flow

---

## Out of scope (v1)

- ❌ Social / OAuth login (Google, Apple)
- ❌ Token refresh (`refreshToken` flow)
- ❌ Edit profile
- ❌ Push notifications
- ❌ Offline mode / optimistic queue
