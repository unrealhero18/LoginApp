import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { Colors, Timing } from '@/theme';
import { logger } from '@/utils/logger';

import { InputClearButton } from './InputClearButton';
import { InputError } from './InputError';
import { InputLabel } from './InputLabel';
import { styles } from './Input.styles';

export type InputProps = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  value: string;
  onChangeText: (text: string) => void;
  label: string;
  errorMessage?: string;
  onClear?: () => void;
  testID?: string;
};

const ANIMATION_DURATION = Timing.quick;

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      value,
      onChangeText,
      label,
      errorMessage,
      onClear,
      onFocus,
      onBlur,
      style,
      testID,
      ...rest
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const labelAnim = useRef(new Animated.Value(value.length > 0 ? 1 : 0)).current;

    const hasError = Boolean(errorMessage);
    const shouldFloat = isFocused || value.length > 0;
    const showClear = !hasError && value.length > 0;

    useEffect(() => {
      Animated.timing(labelAnim, {
        toValue: shouldFloat ? 1 : 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }).start();
    }, [shouldFloat, labelAnim]);

    useEffect(() => {
      if (hasError) {
        logger.debug('[Input] error', { label, errorMessage });
      }
    }, [hasError, errorMessage, label]);

    const borderColor = hasError
      ? Colors.danger
      : shouldFloat
        ? Colors.primary
        : Colors.borderInput;

    const labelColor = hasError
      ? Colors.danger
      : shouldFloat
        ? Colors.primary
        : Colors.textSecondary;

    const handleFocus: TextInputProps['onFocus'] = (e) => {
      logger.debug('[Input] focus', { label });
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur: TextInputProps['onBlur'] = (e) => {
      logger.debug('[Input] blur', { label, value });
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleClear = () => {
      logger.debug('[Input] clear', { label });
      onClear?.();
    };

    return (
      <View style={style} testID={testID}>
        <View style={[styles.container, { borderColor }]}>
          <InputLabel
            label={label}
            labelAnim={labelAnim}
            color={labelColor}
          />

          <TextInput
            ref={ref}
            style={[styles.input, showClear && styles.inputWithClear]}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            accessibilityLabel={label}
            {...rest}
          />

          {showClear && (
            <InputClearButton
              onClear={handleClear}
              label={label}
              testID={testID}
            />
          )}
        </View>

        {hasError && errorMessage && (
          <InputError message={errorMessage} testID={testID} />
        )}
      </View>
    );
  },
);

Input.displayName = 'Input';
