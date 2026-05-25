import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { AppText } from './Typography';
import { Button } from './Button';

type StatusPopupVariant = 'success' | 'error';

interface StatusPopupProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: StatusPopupVariant;
  onClose: () => void;
}

const variantConfig: Record<
  StatusPopupVariant,
  { badgeClassName: string; badgeText: string; titleTone: 'success' | 'destructive' }
> = {
  success: {
    badgeClassName: 'bg-green-100',
    badgeText: 'Success',
    titleTone: 'success',
  },
  error: {
    badgeClassName: 'bg-red-100',
    badgeText: 'Failed',
    titleTone: 'destructive',
  },
};

export function StatusPopup({
  visible,
  title,
  message,
  variant = 'success',
  onClose,
}: StatusPopupProps) {
  const config = variantConfig[variant];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/45 px-6">
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
        />
        <View className="w-full max-w-sm rounded-3xl bg-white p-6">
          <View className={`self-start rounded-full px-3 py-1 ${config.badgeClassName}`}>
            <AppText
              variant="caption"
              tone={config.titleTone}>
              {config.badgeText}
            </AppText>
          </View>

          <AppText
            variant="sectionTitle"
            tone={config.titleTone}
            style={{ marginTop: 16 }}>
            {title}
          </AppText>

          <AppText
            variant="body"
            tone="muted"
            style={{ marginTop: 10 }}>
            {message}
          </AppText>

          <View style={{ marginTop: 20 }}>
            <Button
              title="OK"
              onPress={onClose}
              variant={variant === 'success' ? 'default' : 'destructive'}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
