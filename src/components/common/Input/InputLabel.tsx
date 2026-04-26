import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, TextStyle } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { Spacing, Timing, Typography } from '@/theme';

const LABEL_FLOAT_TOP = Spacing.inputLabelFloatTop;
const LABEL_REST_TOP = Spacing.inputLabelRestTop;
const ANIMATION_DURATION = Timing.quick;

const AnimatedAppText = Animated.createAnimatedComponent(AppText);

type Props = {
  label: string;
  shouldFloat: boolean;
  style?: StyleProp<TextStyle>;
};

export const InputLabel: React.FC<Props> = ({ label, shouldFloat, style }) => {
  const labelAnim = useRef(new Animated.Value(shouldFloat ? 1 : 0)).current;

  useEffect(() => {
    const animation = Animated.timing(labelAnim, {
      toValue: shouldFloat ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shouldFloat, labelAnim]);

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [LABEL_REST_TOP, LABEL_FLOAT_TOP],
  });

  const labelFontSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Typography.size.md, Typography.size.xs],
  });

  return (
    <AnimatedAppText
      style={[
        style,
        {
          top: labelTop,
          fontSize: labelFontSize,
        },
      ]}
      numberOfLines={1}
    >
      {label}
    </AnimatedAppText>
  );
};
