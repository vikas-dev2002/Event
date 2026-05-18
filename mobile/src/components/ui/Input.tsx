import React, { forwardRef } from 'react';
import { TextInput, TextInputProps } from 'react-native';

export const Input = forwardRef<TextInput, TextInputProps>(function Input(props, ref) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor="#737373"
      className="min-h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-base text-neutral-900"
      {...props}
    />
  );
});
