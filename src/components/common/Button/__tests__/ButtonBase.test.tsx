import { View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { ButtonBase } from '../ButtonBase';

describe('ButtonBase', () => {
  it('renders correctly', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ButtonBase>
          <View />
        </ButtonBase>,
      );
    });
  });

  it('renders children', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(
        <ButtonBase>
          <View testID="child" />
        </ButtonBase>,
      );
    });
    const root = component!.root;
    expect(root.findByProps({ testID: 'child' })).toBeDefined();
  });

  it('handles onPress', async () => {
    const onPressMock = jest.fn();
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(
        <ButtonBase onPress={onPressMock}>
          <View />
        </ButtonBase>,
      );
    });
    const root = component!.root;
    const pressable = root.findByProps({ onPress: onPressMock });
    pressable.props.onPress();
    expect(onPressMock).toHaveBeenCalled();
  });

  it('respects disabled prop', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(
        <ButtonBase disabled={true}>
          <View />
        </ButtonBase>,
      );
    });
    const root = component!.root;
    const pressable = root.findByProps({ disabled: true });
    expect(pressable.props.disabled).toBe(true);
  });
});
