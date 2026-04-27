import React, { Component, ErrorInfo, ReactNode } from 'react';

import { logger } from '@/utils/logger';

import { CrashScreen } from './CrashScreen';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch unexpected React crashes.
 * Note: Must be a class component as functional components do not yet support
 * getDerivedStateFromError or componentDidCatch.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Minimal logging as per plan
    logger.error('[ErrorBoundary] Caught unexpected error:', error);
    // Optional: could send to a logging service here in the future
    logger.debug('[ErrorBoundary] Stack trace:', errorInfo.componentStack);
  }

  private resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <CrashScreen resetError={this.resetError} />;
    }

    return this.props.children;
  }
}
