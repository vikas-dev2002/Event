import React, { useState } from 'react';
import { Alert, Pressable, Switch, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react-native';
import { createAnnouncement } from '@/api/announcements.api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/Typography';
import { getErrorMessage } from '@/utils/errors';

type ComposeNavigation = {
  goBack: () => void;
};

export function CreateAnnouncementScreen({ navigation }: { navigation: ComposeNavigation }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        isPinned,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['announcements'] });
      Alert.alert('Posted', 'Announcement published successfully.');
      navigation.goBack();
    },
    onError: error => Alert.alert('Post failed', getErrorMessage(error)),
  });

  const submit = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing details', 'Please add both a title and message.');
      return;
    }

    mutation.mutate();
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
          <ArrowLeft size={20} color="#171717" />
        </Pressable>
        <AppText variant="label">New Announcement</AppText>
        <View className="w-11" />
      </View>

      <Card>
        <View className="gap-4">
          <View className="gap-2">
            <AppText variant="bodySmall" tone="subtle">Title</AppText>
            <Input value={title} onChangeText={setTitle} placeholder="Announcement title" />
          </View>

          <View className="gap-2">
            <AppText variant="bodySmall" tone="subtle">Message</AppText>
            <TextInput
              multiline
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
              placeholder="Share updates, reminders, or event information..."
              placeholderTextColor="#737373"
              className="min-h-40 rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-base text-neutral-900"
            />
          </View>

          <View className="flex-row items-center justify-between rounded-2xl bg-neutral-50 px-4 py-4">
            <View className="flex-1 gap-1">
              <AppText variant="label">Pin this announcement</AppText>
              <AppText variant="caption" tone="muted">Pinned updates stay at the top of the feed.</AppText>
            </View>
            <Switch value={isPinned} onValueChange={setIsPinned} />
          </View>

          <Button title="Publish Announcement" onPress={submit} loading={mutation.isPending} />
        </View>
      </Card>
    </Screen>
  );
}
