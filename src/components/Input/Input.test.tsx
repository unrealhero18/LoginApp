import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { Input } from './index';

describe('Input', () => {
  const baseProps = {
    label: 'Username',
    value: '',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders label and no clear button or error by default', () => {
    render(<Input {...baseProps} />);

    expect(screen.getByText('Username')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByLabelText('Clear Username')).toBeNull();
  });

  it('calls onFocus and onBlur callbacks on focus and blur', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(<Input {...baseProps} onFocus={onFocus} onBlur={onBlur} />);

    const input = screen.getByLabelText('Username');

    act(() => {
      fireEvent(input, 'focus');
    });
    expect(onFocus).toHaveBeenCalledTimes(1);

    act(() => {
      fireEvent(input, 'blur');
    });
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('shows clear button when value is non-empty and no error', () => {
    render(<Input {...baseProps} value="hello" onClear={jest.fn()} />);

    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('hides clear button when error is present', () => {
    render(
      <Input {...baseProps} value="hello" onClear={jest.fn()} errorMessage="Invalid" />,
    );

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('calls onClear when clear button is pressed', () => {
    const onClear = jest.fn();
    render(<Input {...baseProps} value="hello" onClear={onClear} />);

    fireEvent.press(screen.getByRole('button'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('shows error message and no clear button in error state', () => {
    render(
      <Input {...baseProps} value="bad" errorMessage="This field is required" />,
    );

    expect(screen.getByText('This field is required')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('passes secureTextEntry through to the TextInput', () => {
    render(<Input {...baseProps} secureTextEntry testID="password-input" />);

    const input = screen.getByLabelText('Username');
    expect(input.props.secureTextEntry).toBe(true);
  });
});
