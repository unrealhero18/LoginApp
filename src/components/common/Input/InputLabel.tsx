import React from 'react';

import { Animated, StyleProp, TextStyle } from 'react-native';

import { AppText } from '@/components/common/AppText';

import { Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';


const LABEL_FLOAT_TOP = Spacing.inputLabelFloatTop;
const LABEL_REST_TOP = Spacing.inputLabelRestTop;

const AnimatedAppText = Animated.createAnimatedComponent(AppText);

type Props = {
  label: string;
  labelAnim: Animated.Value;
  style?: StyleProp<TextStyle>;
};

export const InputLabel: React.FC<Props> = ({ label, labelAnim, style }) => {
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
