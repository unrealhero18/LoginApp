# React Native Styling Conventions

## Conditional Styles

We use a custom `cn` utility located at `src/utils/styles.ts` to manage conditional styles cleanly. It is built on top of `clsx` and provides the same developer experience, but maps directly to React Native `StyleSheet` objects while maintaining strict TypeScript typing (uses `any[]` return type only where unavoidable to satisfy RN component overloads).

**Rule:** DO NOT use inline ternary operators for arrays of conditional styles (e.g., `style={[styles.base, disabled && styles.disabled]}`). Instead, use the `cn` utility.

### ✅ Good: Using `cn`
```tsx
import { cn } from '@/utils/styles';

<Pressable style={[cn(styles, 'base', { disabled }), style]}>
  <Text style={cn(styles, 'text', { textDisabled: disabled })}>Submit</Text>
</Pressable>
```

### ❌ Bad: Using arrays with booleans
```tsx
<Pressable style={[styles.base, style, disabled && styles.disabled]}>
  <Text style={[styles.text, disabled ? styles.textDisabled : null]}>Submit</Text>
</Pressable>
```

### Important Notes for AI Agents:
- Do NOT install or suggest Tailwind CSS/NativeWind for conditional styling.
- The `cn` utility takes the `StyleSheet` object as the first argument, followed by strings or condition objects.
- It returns an array of strictly-typed styles, which React Native will recursively flatten. So nesting it within another array like `style={[cn(...), externalStyle]}` is 100% correct and expected.
