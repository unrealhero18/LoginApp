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

import { logger } from '@/utils/logger';

import { Timing } from '@/theme';

import { styles } from './Input.styles';
import { InputClearButton } from './InputClearButton';
import { InputError } from './InputError';
import { InputLabel } from './InputLabel';

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
    const showClear = !hasError && value.length > 0 && Boolean(onClear);

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

    const containerStyle = [
      styles.container,
      hasError ? styles.containerError : shouldFloat && styles.containerFocused,
    ];

    const labelStyle = [
      styles.label,
      hasError ? styles.labelError : shouldFloat && styles.labelFocused,
    ];

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
        <View style={containerStyle}>
          <InputLabel
            label={label}
            labelAnim={labelAnim}
            style={labelStyle}
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

        {errorMessage && (
          <InputError message={errorMessage} testID={testID} />
        )}
      </View>
    );
  },
);

Input.displayName = 'Input';
