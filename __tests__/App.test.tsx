/**
 * @format
 */

import React from 'react';

import ReactTestRenderer from 'react-test-renderer';

import App from '../App';

jest.mock('@/navigation/RootNavigator', () => () => null);

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
