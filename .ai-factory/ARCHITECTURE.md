# Architecture: Layered (Screen-Centric)

## Overview

LoginApp is a React Native mobile application (iOS + Android) built with TypeScript. It uses a screen-centric layered architecture — the standard pattern for React Native — where each layer has a single responsibility and dependencies flow strictly downward: screens depend on hooks and services, hooks depend on API clients, and nothing in the presentation layer reaches directly into the data layer.

This pattern was chosen because the project is maintained by a single developer, has a focused domain (authentication + user profile), and benefits from predictable structure over abstraction overhead.

## Decision Rationale

- **Project type:** Mobile authentication app (React Native)
- **Tech stack:** TypeScript, React Native 0.85, React Navigation v7, TanStack React Query v5
- **Key factor:** Solo developer, small scope — layered structure maximises clarity without adding DDD/Clean Architecture overhead

## Folder Structure

```
src/
├── constants/          # Enums and static values (routes, keys, config)
├── navigation/         # Stack and tab navigators, param list types
├── providers/          # React context providers (QueryClient, Auth, etc.)
├── screens/            # Screen components — one file per screen
├── components/         # Shared UI components
│   ├── common/         # Truly generic (Button, Input, Card…)
│   └── [feature]/      # Feature-scoped components
├── hooks/              # Custom hooks (useAuth, useProfile…)
├── services/           # API clients and data-fetching functions
│   └── api/            # Typed fetch/axios wrappers
├── store/              # Local state (if needed beyond React Query)
├── theme/              # StyleSheet tokens and global styles
└── types/              # Shared TypeScript interfaces and types
```

## Dependency Rules

- ✅ `screens` → `hooks`, `components`, `constants`, `theme`, `types`
- ✅ `hooks` → `services`, `providers`, `constants`, `types`
- ✅ `services` → `types`, `constants`
- ✅ `navigation` → `screens`, `constants`, `types`
- ❌ `services` must not import from `screens`, `hooks`, or `components`
- ❌ `components` must not import from `screens` or `navigation`
- ❌ No cross-screen imports — screens are siblings, not dependents

## Layer / Module Communication

- Screens call custom hooks; they do not call services directly.
- Hooks use TanStack React Query (`useQuery` / `useMutation`) to fetch and cache data.
- Services expose plain async functions that return typed data — no React inside.
- Providers wrap the app at the root level (`App.tsx`) and expose context via hooks.
- Navigation state is managed by React Navigation; auth-gating is handled in `RootNavigator`.

## Key Principles

1. **One screen per file** — `src/screens/LoginScreen.tsx`, typed with `NativeStackScreenProps`.
2. **Path alias everywhere** — always use `@/` (mapped to `src/`) instead of relative `../../`.
3. **Typed navigation** — all screen props must use the `RootStackParamList` param list type.
4. **No business logic in screens** — extract to a custom hook if a screen exceeds ~100 lines of logic.
5. **React Query owns server state** — do not duplicate remote data in local state.
6. **StyleSheet over inline styles** — always use `StyleSheet.create`; inline styles are forbidden except for truly dynamic values.

## Code Examples

### Typed screen component

```tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/RootNavigator';
import { Routes } from '@/constants/routes';

type Props = NativeStackScreenProps<RootStackParamList, Routes.LOGIN>;

export default function LoginScreen({ navigation }: Props) {
  // ...
}
```

### Custom hook wrapping a service

```ts
// src/hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { login } from '@/services/api/auth';

export function useLogin() {
  return useMutation({ mutationFn: login });
}
```

### Service function (no React)

```ts
// src/services/api/auth.ts
import type { LoginPayload, AuthToken } from '@/types/auth';

export async function login(payload: LoginPayload): Promise<AuthToken> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
}
```

## Anti-Patterns

- ❌ Calling fetch/axios directly inside a screen component
- ❌ Using relative imports (`../../`) instead of `@/` path alias
- ❌ Storing server data in `useState` when React Query can own it
- ❌ Defining navigation param types inline — always use `RootStackParamList`
- ❌ Sharing state between screens via prop drilling — use context or React Query
