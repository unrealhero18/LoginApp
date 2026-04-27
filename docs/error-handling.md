# Error Handling Strategy

This document outlines how errors are handled in the LoginApp application.

## App-Wide Error Boundary

The application uses a root-level `ErrorBoundary` component (implemented in `src/components/common/ErrorBoundary/ErrorBoundary.tsx`) to catch unexpected React crashes.

### Purpose
- Prevent the "White Screen of Death" by providing a fallback UI.
- Allow users to restart the application without a full app relaunch if the error is transient.
- [x] Log critical errors for debugging using the project's `logger` utility.

### Fallback UI: CrashScreen
When a crash occurs, the `CrashScreen` is displayed. It informs the user that something went wrong and provides a "Restart App" button which resets the error state of the boundary.

### Integration
The `ErrorBoundary` is integrated at the very root of `App.tsx`, wrapping all providers to ensure maximum coverage:

```tsx
<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SafeAreaProvider>
        ...
      </SafeAreaProvider>
    </AuthProvider>
  </QueryClientProvider>
</ErrorBoundary>
```

## Future Enhancements
- **Remote Logging:** Integrate with Sentry or a similar service in `componentDidCatch`.
- **Granular Boundaries:** Add specific error boundaries for non-critical sections (e.g., a specific widget or list) to prevent the whole app from crashing if only one part fails.
