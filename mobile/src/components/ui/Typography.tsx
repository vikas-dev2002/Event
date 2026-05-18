import React from 'react';
import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';
import { theme } from '@/constants/theme';
import { typography, type TypographyVariant } from '@/constants/typography';

type TypographyTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'primary'
  | 'inverse'
  | 'success'
  | 'warning'
  | 'destructive';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  tone?: TypographyTone;
  style?: StyleProp<TextStyle>;
}

const toneStyles: Record<TypographyTone, TextStyle> = {
  default: { color: theme.colors.foreground },
  muted: { color: theme.colors.mutedForeground },
  subtle: { color: theme.colors.secondaryForeground },
  primary: { color: theme.colors.primary },
  inverse: { color: theme.colors.primaryForeground },
  success: { color: theme.colors.success },
  warning: { color: theme.colors.warning },
  destructive: { color: theme.colors.destructive },
};

export function AppText({
  variant = 'body',
  tone = 'default',
  style,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[typography[variant], toneStyles[tone], style]}>
      {children}
    </Text>
  );
}
