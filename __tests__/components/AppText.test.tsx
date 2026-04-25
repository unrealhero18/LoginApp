import React from 'react';

import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { AppText } from '@/components/common/AppText';

describe('AppText', () => {
  it('renders correctly', async () => {
    await ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<AppText>Test Text</AppText>);
    });
  });

  it('renders children content', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(<AppText>Hello World</AppText>);
    });
    const root = component!.root;
    const text = root.findByProps({ children: 'Hello World' });
    expect(text).toBeDefined();
  });

  it('applies custom fontWeight', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(<AppText fontWeight="600">Bold Text</AppText>);
    });
    const root = component!.root;
    const text = root.findByType(Text);
    expect(text.props.style).toContainEqual({ fontWeight: '600' });
  });

  it('applies custom styles', async () => {
    const customStyle = { color: 'red' };
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(<AppText style={customStyle}>Styled Text</AppText>);
    });
    const root = component!.root;
    const text = root.findByType(Text);
    expect(text.props.style).toContainEqual(customStyle);
  });
});
