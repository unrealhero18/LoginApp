import React, { forwardRef, useEffect, useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

import { logger } from '@/utils/logger';
import { cn } from '@/utils/styles';

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

    const hasError = Boolean(errorMessage);
    const shouldFloat = isFocused || value.length > 0;
    const showClear = !hasError && value.length > 0 && Boolean(onClear);

    useEffect(() => {
      if (hasError) {
        logger.debug('[Input] error', { label, errorMessage });
      }
    }, [hasError, errorMessage, label]);

    const containerStyle = cn(styles, 'container', {
      containerError: hasError,
      containerFocused: !hasError && shouldFloat,
    });

    const labelStyle = cn(styles, 'label', {
      labelError: hasError,
      labelFocused: !hasError && shouldFloat,
    });

    const handleFocus: TextInputProps['onFocus'] = e => {
      logger.debug('[Input] focus', { label });
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur: TextInputProps['onBlur'] = e => {
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
            shouldFloat={shouldFloat}
            style={labelStyle}
          />

          <TextInput
            ref={ref}
            style={cn(styles, 'input', { inputWithClear: showClear })}
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

        {errorMessage && <InputError message={errorMessage} testID={testID} />}
      </View>
    );
  },
);

Input.displayName = 'Input';
