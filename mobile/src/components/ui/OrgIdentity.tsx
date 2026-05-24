import React from 'react';
import { Image, Text, View } from 'react-native';
import { Building2 } from 'lucide-react-native';
import { AppText } from './Typography';

type OrgIdentitySize = 'sm' | 'md';
type OrgIdentityVariant = 'subtle' | 'plain';

interface OrgIdentityProps {
  name: string;
  logoUrl?: string | null;
  subtitle?: string | null;
  size?: OrgIdentitySize;
  variant?: OrgIdentityVariant;
  className?: string;
}

const sizeClasses: Record<OrgIdentitySize, { avatar: string; wrapper: string; initials: string; icon: number }> = {
  sm: {
    avatar: 'h-8 w-8',
    wrapper: 'gap-2',
    initials: 'text-xs',
    icon: 14,
  },
  md: {
    avatar: 'h-10 w-10',
    wrapper: 'gap-3',
    initials: 'text-sm',
    icon: 18,
  },
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

export function OrgIdentity({
  name,
  logoUrl,
  subtitle,
  size = 'md',
  variant = 'subtle',
  className = '',
}: OrgIdentityProps) {
  const styles = sizeClasses[size];
  const showSubtitle = Boolean(subtitle);

  return (
    <View
      className={`flex-row items-center ${styles.wrapper} ${
        variant === 'subtle' ? 'rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2' : ''
      } ${className}`.trim()}>
      <View className={`${styles.avatar} items-center justify-center overflow-hidden rounded-2xl bg-neutral-200`}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} className="h-full w-full" resizeMode="cover" />
        ) : getInitials(name) ? (
          <Text className={`${styles.initials} font-semibold text-neutral-700`}>{getInitials(name)}</Text>
        ) : (
          <Building2 size={styles.icon} color="#525252" />
        )}
      </View>
      <View className="flex-1">
        <AppText variant={size === 'sm' ? 'label' : 'cardTitle'} numberOfLines={1}>
          {name}
        </AppText>
        {showSubtitle ? (
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
