import React from 'react';
import { Pressable } from 'react-native';

import { cn } from '@/utils/styles';

import CloseIcon from '@/assets/icons/close.svg';
import { globalStyles } from '@/theme/styles';

import { styles } from './Input.styles';

type Props = {
  onClear: () => void;
  label: string;
  testID?: string;
};

export const InputClearButton: React.FC<Props> = ({
  onClear,
  label,
  testID,
}) => {
  return (
    <Pressable
      onPress={onClear}
      accessibilityRole="button"
      accessibilityLabel={`Clear ${label}`}
      style={({ pressed }) => cn([styles, globalStyles], 'clearButton', { pressed })}
      testID={testID ? `${testID}-clear-button` : undefined}
    >
      <CloseIcon width={20} height={20} />
    </Pressable>
  );
};
