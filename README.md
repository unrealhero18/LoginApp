# LoginApp

> React Native authentication demo — secure token storage, protected routing, and session invalidation.

A fully typed React Native app demonstrating a complete authentication flow: login form, keychain-backed token persistence, automatic hydration on startup, and instant stack switching on 401/403. Built as a learning reference for production-grade auth patterns.

## Quick Start

```bash
pnpm install
bundle exec pod install   # iOS only — installs CocoaPods native deps
pnpm ios                  # or: pnpm android
```

> First-time iOS setup: run `bundle install` once before `pod install`.

## Key Features

- **Secure storage** — tokens persisted to iOS Keychain / Android Keystore via `react-native-keychain`. `AsyncStorage` is never used for tokens.
- **Automatic hydration** — on startup `AuthProvider` rehydrates from the keychain and calls `GET /auth/me` before the first render.
- **State-driven routing** — `RootNavigator` switches between `AuthStack` (Home, Login) and `AppStack` (Profile) based on auth state. Screens never call `navigate()` after logout.
- **401/403 invalidation** — any API call or React Query cache error with these statuses triggers `AuthProvider.logout()` via a single registered handler.
- **React Query integration** — `useLogin` mutation, `useProfile` query, and a global `QueryCache`/`MutationCache` error handler that bridges to the auth logout bridge.
- **63 tests** — hooks, provider transitions, screen smoke tests, and keychain mock coverage.

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React Native 0.85 + TypeScript |
| Navigation | React Navigation v7 (native stack) |
| Server state | TanStack React Query v5 |
| Secure storage | react-native-keychain |
| API | [DummyJSON Auth](https://dummyjson.com/docs/auth) |
| Testing | Jest + @testing-library/react-native |

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | Prerequisites, install, run iOS/Android, run tests |
| [Auth Flow](docs/auth-flow.md) | Architecture, modules, screen behavior, session invalidation |

## License

MIT
