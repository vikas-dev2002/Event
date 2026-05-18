import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { AppText } from './Typography';

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-neutral-900',
  outline: 'bg-white border border-neutral-300',
  secondary: 'bg-neutral-100',
  destructive: 'bg-red-600',
  ghost: 'bg-transparent',
};

const textTones: Record<ButtonVariant, 'inverse' | 'default' | 'muted'> = {
  default: 'inverse',
  outline: 'default',
  secondary: 'default',
  destructive: 'inverse',
  ghost: 'muted',
};

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = 'default',
  fullWidth = true,
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      className={[
        'min-h-12 items-center justify-center rounded-2xl px-4',
        variantClasses[variant],
        disabled || loading ? 'opacity-60' : '',
        fullWidth ? 'w-full' : '',
      ].join(' ')}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'secondary' ? '#171717' : '#ffffff'} />
      ) : (
        <AppText variant="label" tone={textTones[variant]}>{title}</AppText>
      )}
    </Pressable>
  );
}
