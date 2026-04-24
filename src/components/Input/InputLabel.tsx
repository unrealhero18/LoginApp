import React from 'react';
import { Animated } from 'react-native';

import { AppText } from '@/components/AppText';
import { Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';

import { styles } from './Input.styles';

const LABEL_FLOAT_TOP = Spacing.inputLabelFloatTop;
const LABEL_REST_TOP = Spacing.inputLabelRestTop;

const AnimatedAppText = Animated.createAnimatedComponent(AppText);

interface Props {
  label: string;
  labelAnim: Animated.Value;
  color: string;
}

export const InputLabel: React.FC<Props> = ({ label, labelAnim, color }) => {
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
        styles.label,
        {
          top: labelTop,
          fontSize: labelFontSize,
          color,
        },
      ]}
      numberOfLines={1}
    >
      {label}
    </AnimatedAppText>
  );
};
