import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';

import { ErrorBoundaryMessages } from '@/constants/messages';

import { ErrorBoundary } from '../ErrorBoundary';

jest.mock('@/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test Error');
  }
  return <View testID="child-component" />;
};

describe('ErrorBoundary', () => {
  // Prevent console.error from cluttering test output when React handles the throw
  const originalError = console.error;

  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    const { getByTestId } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(getByTestId('child-component')).toBeTruthy();
  });

  it('renders CrashScreen when an error is caught', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(getByText(ErrorBoundaryMessages.CRASH_TITLE)).toBeTruthy();
    expect(getByText(ErrorBoundaryMessages.CRASH_MESSAGE)).toBeTruthy();
  });

  it('resets the error state when retry button is pressed', () => {
    const { getByText, rerender, getByTestId } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText(ErrorBoundaryMessages.CRASH_TITLE)).toBeTruthy();

    // Rerender with shouldThrow={false} so that after reset it works
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    fireEvent.press(getByText(ErrorBoundaryMessages.CRASH_RETRY_BUTTON));

    expect(getByTestId('child-component')).toBeTruthy();
  });
});
