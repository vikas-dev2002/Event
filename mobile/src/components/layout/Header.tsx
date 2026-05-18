import React, { useContext } from 'react';
import { NavigationContext } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/Typography';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export function Header({ title, subtitle, showBackButton = true }: HeaderProps) {
  const navigation = useContext(NavigationContext);
  const canGoBack = showBackButton && (navigation?.canGoBack?.() ?? false);

  return (
    <View className="flex-row items-start gap-3">
      {canGoBack ? (
        <Pressable
          onPress={() => navigation?.goBack()}
          className="mt-1 h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
          <ArrowLeft size={20} color="#171717" />
        </Pressable>
      ) : null}

      <View className="flex-1 gap-1">
        <AppText variant="screenTitle">{title}</AppText>
        {subtitle ? <AppText variant="bodySmall" tone="muted">{subtitle}</AppText> : null}
      </View>
    </View>
  );
}
