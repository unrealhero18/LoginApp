# Implementation Plan: Client-Side JWT Expiry Check

Branch: feature/client-side-jwt-expiry-check
Created: 2026-04-26

## Settings

- Testing: yes
- Logging: minimal
- Docs: no

## Roadmap Linkage

Milestone: "Phase 2 — Login Form & Authentication Flow"
Rationale: This completes the planned Session invalidation item — client-side JWT expiry check before network calls.

## Tasks

### Phase 1: Utility

- [x] Task 1: Add JWT expiry utility function
  - Install `jwt-decode` package
  - Create `src/utils/jwt.ts` — exports `isTokenExpired(accessToken: string): boolean`
  - Decode `exp` claim; compare to `Date.now() / 1000`
  - Malformed token → return `true` (fail safe)
  - WARN log on expiry or decode failure; silent on valid token
  - Files: `src/utils/jwt.ts`, `package.json`

### Phase 2: AuthProvider Integration

- [x] Task 2: Integrate expiry check into AuthProvider hydration (blocked by Task 1)

  - In `src/providers/AuthProvider.tsx`, inside `hydrate()`, after `loadToken()` returns a non-null token:
    - Call `isTokenExpired(stored.accessToken)`
    - If expired: `clearToken()`, return early without calling `getMe()`
    - If valid: continue existing flow unchanged
  - WARN log: `[AuthProvider] stored token expired on hydration — clearing session`
  - Files: `src/providers/AuthProvider.tsx`

- [x] Task 3: Add AppState foreground listener for expiry check (blocked by Task 1)
  - In `src/providers/AuthProvider.tsx`, add a `useEffect` that subscribes to `AppState.addEventListener('change', ...)`
  - On `nextAppState === 'active'`: check `isTokenExpired(token.accessToken)` via a `tokenRef` (avoids stale closure); call `logout()` if expired
  - Cleanup listener on unmount
  - WARN log: `[AuthProvider] token expired on foreground — logging out`
  - Files: `src/providers/AuthProvider.tsx`

### Phase 3: Tests

- [x] Task 4: Write tests (blocked by Tasks 1, 2, 3)
  - `src/utils/__tests__/jwt.test.ts` — covers: expired token, valid token, malformed string, empty string
  - `src/providers/__tests__/AuthProvider.test.tsx` — covers:
    - Hydration with expired token: `clearToken()` called, `getMe()` NOT called, state logged-out
    - Hydration with valid token: existing behaviour unchanged (no regression)
    - AppState `active` with expired token: `logout()` triggered
    - AppState `active` with valid token: `logout()` NOT triggered
    - AppState `background`: no action
  - Mock `logger` to suppress WARN output during tests
  - Files: `src/utils/__tests__/jwt.test.ts`, `src/providers/__tests__/AuthProvider.test.tsx`
