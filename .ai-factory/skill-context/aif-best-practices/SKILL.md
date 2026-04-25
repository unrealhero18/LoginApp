---
name: aif-best-practices
description: Project-specific best practices context and overrides for the aif-best-practices skill.
---

# Project Rules: aif-best-practices

- **AVOID PREMATURE OPTIMIZATION**: Do not use `useCallback` or `useMemo` by default. Only use them when there is a demonstrated performance issue or a clear need for reference stability (e.g., when a function is passed as a dependency to another hook or to a component wrapped in `React.memo`).
- **SIMPLICITY FIRST**: Prioritize readable and straightforward code over complex memoization patterns.
- **HOOK INPUTS**: If a hook receives non-memoized functions or objects as arguments, avoid using those arguments as dependencies in internal `useCallback`/`useMemo` calls, as it will cause them to re-run on every render regardless.
