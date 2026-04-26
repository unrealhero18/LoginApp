import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { ButtonBase } from '../ButtonBase';
import { PrimaryButton } from '../PrimaryButton';

describe('PrimaryButton', () => {
  it('renders correctly', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<PrimaryButton title="Test Button" />);
    });
  });

  it('renders the title', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(
        <PrimaryButton title="Test Button" />,
      );
    });
    const root = component!.root;
    const text = root.findByProps({ children: 'Test Button' });
    expect(text).toBeDefined();
  });

  it('passes onPress to ButtonBase', async () => {
    const onPressMock = jest.fn();
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(
        <PrimaryButton title="Test Button" onPress={onPressMock} />,
      );
    });
    const root = component!.root;
    const buttonBase = root.findByType(ButtonBase);
    buttonBase.props.onPress();
    expect(onPressMock).toHaveBeenCalled();
  });

  it('passes disabled to ButtonBase', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(
        <PrimaryButton title="Test Button" disabled={true} />,
      );
    });
    const root = component!.root;
    const buttonBase = root.findByType(ButtonBase);
    expect(buttonBase.props.disabled).toBe(true);
  });
});
