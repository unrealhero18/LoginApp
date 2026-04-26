import React from 'react';

import { render } from '@testing-library/react-native';

import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the message correctly', () => {
    const message = "User doesn't exist";
    const { getByText } = render(<ErrorMessage message={message} />);

    expect(getByText(message)).toBeTruthy();
  });

  it('renders nothing when message is empty', () => {
    const { queryByTestId } = render(<ErrorMessage message="" testID="error-container" />);

    expect(queryByTestId('error-container')).toBeNull();
  });

  it('applies testID correctly', () => {
    const testID = 'login-error';
    const { getByTestId } = render(<ErrorMessage message="Error" testID={testID} />);

    expect(getByTestId(testID)).toBeTruthy();
  });
});
