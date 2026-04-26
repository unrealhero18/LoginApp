# Rules

Coding rules and conventions for LoginApp. These apply to all code written in this project.

## Language & Types

- **NO `any` POLICY**: The use of `any` is strictly forbidden across the entire codebase.
  - Use proper TypeScript types, generics, or `unknown` (with type guards) instead.
  - For React Native styles, use `StyleProp<ViewStyle | TextStyle | ImageStyle>`.
  - For events, use specific types like `NativeSyntheticEvent<TextInputFocusEventData>`.
- TypeScript strict mode is on.
- No `@ts-ignore` or `@ts-expect-error` without a compelling reason and a detailed explanatory comment.
- Prefer `type` over `interface` for object shapes; use `interface` only when extension is intentional.
- Export types from `src/types/` when shared across more than one file.
- All async functions must have explicit return types.

## Imports

- Always use the `@/` path alias (maps to `src/`) — never use relative `../` paths.
- Import order enforced by ESLint `import/order`:
  1. External packages (`react`, `react-native`, `@react-navigation/…`, etc.)
  2. Internal absolute imports (`@/navigation`, `@/hooks`, `@/services`, `@/constants`, `@/types`)
  3. Relative imports (siblings only — avoid)
  4. Assets and theme (`@/theme/**`, `@/assets/**`)
- A blank line between each import group is required (ESLint enforced).
- Alphabetical order within each group.

## Components & Screens

- One component per file; filename matches the exported component name.
- Screen components must use `NativeStackScreenProps<RootStackParamList, Routes.X>` for props.
- No business logic inside screens — extract to a custom hook if logic grows beyond ~80 lines.
- No inline styles except for values that are truly dynamic (e.g., computed widths). Use `StyleSheet.create`.
- Functional components only — no class components.
- Default exports for screens; named exports for shared components.

## Hooks

- Prefix all custom hooks with `use`.
- Hooks that call services must use TanStack React Query (`useQuery` / `useMutation`).
- Do not call `fetch` or any API client directly inside a component — always go through a hook.

## Services

- Service files live in `src/services/api/`.
- Services export plain async functions — no React, no hooks inside service files.
- All service functions must return typed data (no `any`).
- Throw an `Error` on non-OK HTTP responses rather than returning `null` or `undefined`.

## Navigation

- All route names must come from the `Routes` enum (`src/constants/routes.ts`).
- All screen param types must be declared in `RootStackParamList` (or equivalent navigator param list).
- Navigation calls must use the typed `navigation` prop — never `useNavigation` inside a screen that already receives `navigation` as a prop.

## State Management

- React Query owns all server state — do not duplicate it in `useState`.
- Local UI state (form fields, toggles) lives in component-level `useState`.
- Global client state (auth session, user preferences) lives in a context provider under `src/providers/`.

## Styling

- `StyleSheet.create` is the only permitted way to define static styles.
- Global/shared styles live in `src/theme/styles.ts`.
- All colors must be imported from `src/theme/colors.ts` — raw hex strings (e.g. `'#338BFF'`) are forbidden in component and screen files.
- Spacing, font sizes, border radii, and other numeric design tokens belong in `src/theme/` — no magic numbers in component files.
- Dark mode support via `useColorScheme` and React Navigation theme tokens.

## Testing

- Test files live in `__tests__/` at the root or co-located as `ComponentName.test.tsx`.
- Use `@testing-library/react-native` for component tests.
- Each screen must have at least a smoke test (renders without crashing).
- Mock navigation with `@react-navigation/native` testing utilities.

## Naming Conventions

- Files: `PascalCase` for components/screens, `camelCase` for hooks/services/utils.
- Variables: `camelCase`; boolean variables prefixed with `is`, `has`, or `can`.
- Constants (non-enum): `SCREAMING_SNAKE_CASE`.
- Enum members: `SCREAMING_SNAKE_CASE` (as in `Routes.LOGIN`).

## Optimization

- **NO PREMATURE OPTIMIZATION**: Avoid using `useCallback` or `useMemo` unless there is a measured performance bottleneck or a specific requirement for reference stability (e.g., dependencies of other hooks or `React.memo` components).
  - In most cases, the overhead of dependency tracking in these hooks exceeds the cost of re-creating small functions or objects.
  - If the consumer of a hook passes non-memoized functions (like inline arrows), `useCallback`/`useMemo` inside the hook are useless and should be avoided.

## Commits

- Follow Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`.
- Scope is optional but encouraged: `feat(auth): add login mutation`.
- Keep subject line under 72 characters.
