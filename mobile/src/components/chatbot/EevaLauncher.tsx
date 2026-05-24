import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircleMore, Sparkles } from 'lucide-react-native';
import { AppText } from '@/components/ui/Typography';

interface EevaLauncherProps {
  onPress: () => void;
}

export function EevaLauncher({ onPress }: EevaLauncherProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', right: 20, bottom: insets.bottom + 84 }}>
      <View className="items-end gap-3">
        <View className="rounded-2xl border border-violet-100 bg-white px-3 py-2 shadow-sm">
          <AppText variant="caption" tone="primary">
            Need help? Ask Eeva!
          </AppText>
        </View>

        <Pressable onPress={onPress}>
          <View className="h-16 w-16 items-center justify-center rounded-full bg-violet-600 shadow-lg">
            <View className="absolute right-3 top-3 h-3 w-3 rounded-full bg-amber-300" />
            <MessageCircleMore size={28} color="#ffffff" />
            <View className="absolute bottom-2 right-2 rounded-full bg-violet-400 p-1">
              <Sparkles size={10} color="#ffffff" />
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
