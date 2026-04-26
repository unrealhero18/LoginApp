[Back to README](../README.md) · [Auth Flow →](auth-flow.md)

# Getting Started

Everything you need to install, run, and test LoginApp locally.

## Prerequisites

| Tool           | Minimum version | Notes                                                                             |
| -------------- | --------------- | --------------------------------------------------------------------------------- |
| Node.js        | 18 LTS          | Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schacon/fnm) |
| pnpm           | 8+              | `corepack enable` or `npm install -g pnpm`                                        |
| Ruby           | 3.x             | Required for CocoaPods (iOS only)                                                 |
| CocoaPods      | 1.14+           | Managed via Bundler — see below                                                   |
| Xcode          | 15+             | iOS builds (macOS only)                                                           |
| Android Studio | Hedgehog+       | Android builds                                                                    |

> Follow the [React Native environment setup guide](https://reactnative.dev/docs/set-up-your-environment) to install Xcode command-line tools and configure the Android SDK.

## Install

```bash
# 1. Install JavaScript dependencies
pnpm install

# 2. iOS only — install CocoaPods gem via Bundler (once per machine)
bundle install

# 3. iOS only — install native pods (re-run whenever native deps change)
bundle exec pod install
```

## Running the app

Start Metro first, then launch the native build in a second terminal.

### Start Metro

```bash
pnpm start
```

### iOS

```bash
pnpm ios
```

Runs in the iOS Simulator by default. To target a physical device, open `ios/LoginApp.xcworkspace` in Xcode and select your device.

### Android

```bash
pnpm android
```

Requires a running Android emulator or a connected device with USB debugging enabled.

### Hot reload

Metro enables [Fast Refresh](https://reactnative.dev/docs/fast-refresh) by default — save a file and the app updates instantly. For a full reload:

- **iOS Simulator:** press `R`
- **Android Emulator:** press `R` twice, or open the Dev Menu with `Cmd ⌘ + M` (macOS) / `Ctrl + M` (Windows/Linux)

## Running tests

```bash
pnpm test
```

All 52 tests should pass. The suite covers hooks, `AuthProvider` transitions, and screen smoke tests.

For lint and type checks:

```bash
pnpm lint             # ESLint
npx tsc --noEmit      # TypeScript
```

## What happens on first launch

1. `AuthProvider` mounts and calls `loadToken()` from the keychain.
2. No stored token → `isHydrating` flips to `false` → `AuthStack` renders (Home screen).
3. Navigate to Login, sign in with a [DummyJSON test account](https://dummyjson.com/docs/auth) (e.g. `emilys` / `emilyspass`).
4. On success the token is saved to the keychain, `AuthProvider` calls `GET /auth/me`, and `RootNavigator` swaps to `AppStack` (Profile screen).
5. Kill and reopen the app — the token rehydrates and you land directly on Profile.

## See Also

- [Auth Flow](auth-flow.md) — architecture, module breakdown, session invalidation
