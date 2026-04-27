# LoginApp - Premium React Native Authentication

## Overview
LoginApp is a state-of-the-art React Native application focused on providing a premium, accessible, and robust authentication experience. Built with performance and scalability in mind, it leverages modern React patterns and a strong design system to deliver a high-quality user interface.

## Core Features
- **Secure Authentication**: Full JWT-based authentication flow including login and logout.
- **Dynamic Profile Management**: User profile fetching and display with real-time updates via React Query.
- **Accessibility First**: Comprehensive support for screen readers with proper roles, labels, and interaction states.
- **Premium Design System**: 
  - Dynamic dark mode support.
  - Glassmorphism and rich gradients.
  - Consistent spacing and typography tokens.
  - Smooth micro-animations for interactive elements.
- **Error Resilience**: Robust Error Boundary implementation for unexpected crashes with premium fallback UI.
- **Offline Readiness**: Integrated NetInfo for handling connectivity states.

## Tech Stack
- **Language**: TypeScript (Strict Mode)
- **Framework**: React Native 0.85.2
- **Navigation**: React Navigation 7 (Native Stack)
- **State Management**: 
  - Server State: TanStack React Query 5
  - Global UI State: React Context (AuthProvider)
- **Styling**: 
  - StyleSheet API with `clsx`-like utility (`cn`)
  - React Native Linear Gradient
  - React Native SVG
- **Testing**: Jest & React Native Testing Library
- **Architecture**: Domain-driven directory structure (`src/components`, `src/hooks`, `src/navigation`, `src/providers`, `src/services`, `src/theme`, `src/utils`).

## Project Patterns
- **Import Grouping**: Enforced order (External -> Internal Absolute -> Relative -> Assets/Theme).
- **Service Layer**: Decoupled API logic using plain async functions.
- **Hook-Based Logic**: Business logic extracted into custom hooks for reusability and testability.
- **Atomic Components**: Shared generic components (`ButtonBase`, `Input`, `AppText`) used to build complex screens.
- **Logging**: Structured debug logging with semantic prefixes (e.g., `[FIX]`, `[Input]`).

## Development Guidelines
- Follow Conventional Commits.
- Maintain strict TypeScript safety (No `any`).
- Ensure all new components have proper accessibility props.
- Use the `@/` path alias for all internal absolute imports.
