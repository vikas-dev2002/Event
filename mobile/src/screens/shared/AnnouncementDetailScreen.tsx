import React, { useMemo, useState } from 'react';
import { Alert, Pressable, Switch, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pin } from 'lucide-react-native';
import {
  deleteAnnouncement,
  getAnnouncementById,
  postAnnouncementComment,
  toggleAnnouncementReaction,
  toggleCommentReaction,
  updateAnnouncement,
} from '@/api/announcements.api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { OrgIdentity } from '@/components/ui/OrgIdentity';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import type { AnnouncementComment, AnnouncementDetail } from '@/types/announcement';
import { getErrorMessage } from '@/utils/errors';

type DetailRoute = {
  params?: {
    id?: string;
  };
};

type DetailNavigation = {
  goBack: () => void;
};

const REACTIONS = ['👍', '🎉', '❤️'];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ReactionBar({
  reactionCounts,
  userReactions,
  onReact,
}: {
  reactionCounts: Array<{ emoji: string; count: number }>;
  userReactions: string[];
  onReact: (emoji: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {REACTIONS.map(emoji => {
        const count = reactionCounts.find(item => item.emoji === emoji)?.count ?? 0;
        const active = userReactions.includes(emoji);

        return (
          <Pressable key={emoji} onPress={() => onReact(emoji)}>
            <View className={`rounded-full border px-3 py-2 ${active ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-200 bg-white'}`}>
              <AppText variant="caption" tone={active ? 'inverse' : 'default'}>
                {emoji} {count > 0 ? count : ''}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function CommentThread({
  comment,
  replyTo,
  setReplyTo,
  onReact,
}: {
  comment: AnnouncementComment;
  replyTo: string | null;
  setReplyTo: (value: string | null) => void;
  onReact: (commentId: string, emoji: string) => void;
}) {
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <View className="gap-1">
            <AppText variant="label">{comment.author.name}</AppText>
            <AppText variant="caption" tone="muted">
              {formatDateTime(comment.createdAt)}
            </AppText>
          </View>
          <AppText variant="bodySmall">{comment.content}</AppText>
          <ReactionBar
            reactionCounts={comment.reactionCounts}
            userReactions={comment.userReactions}
            onReact={emoji => onReact(comment.id, emoji)}
          />
          <Pressable onPress={() => setReplyTo(replyTo === comment.id ? null : comment.id)}>
            <AppText variant="caption" tone="primary">
              {replyTo === comment.id ? 'Cancel reply' : 'Reply'}
            </AppText>
          </Pressable>
        </View>
      </Card>

      {comment.replies.length ? (
        <View className="ml-4 gap-3 border-l border-neutral-200 pl-4">
          {comment.replies.map(reply => (
            <Card key={reply.id}>
              <View className="gap-3">
                <View className="gap-1">
                  <AppText variant="label">{reply.author.name}</AppText>
                  <AppText variant="caption" tone="muted">
                    {formatDateTime(reply.createdAt)}
                  </AppText>
                </View>
                <AppText variant="bodySmall">{reply.content}</AppText>
                <ReactionBar
                  reactionCounts={reply.reactionCounts}
                  userReactions={reply.userReactions}
                  onReact={emoji => onReact(reply.id, emoji)}
                />
              </View>
            </Card>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function AnnouncementDetailScreen({
  route,
  navigation,
}: {
  route: DetailRoute;
  navigation: DetailNavigation;
}) {
  const announcementId = route.params?.id as string;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPinned, setEditPinned] = useState(false);

  const detailQuery = useQuery<AnnouncementDetail>({
    queryKey: ['announcement', announcementId],
    queryFn: () => getAnnouncementById(announcementId),
    enabled: Boolean(announcementId),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['announcement', announcementId] });
    await queryClient.invalidateQueries({ queryKey: ['announcements'] });
  };

  const announcementReactionMutation = useMutation({
    mutationFn: (emoji: string) => toggleAnnouncementReaction(announcementId, emoji),
    onSuccess: refresh,
    onError: error => Alert.alert('Reaction failed', getErrorMessage(error)),
  });

  const commentReactionMutation = useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) => toggleCommentReaction(commentId, emoji),
    onSuccess: refresh,
    onError: error => Alert.alert('Reaction failed', getErrorMessage(error)),
  });

  const commentMutation = useMutation({
    mutationFn: () => postAnnouncementComment(announcementId, { content: draft.trim(), parentId: replyTo }),
    onSuccess: async () => {
      setDraft('');
      setReplyTo(null);
      await refresh();
    },
    onError: error => Alert.alert('Comment failed', getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateAnnouncement(announcementId, {
        title: editTitle.trim(),
        content: editContent.trim(),
        isPinned: editPinned,
      }),
    onSuccess: async () => {
      setEditing(false);
      await refresh();
    },
    onError: error => Alert.alert('Update failed', getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAnnouncement(announcementId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['announcements'] });
      navigation.goBack();
    },
    onError: error => Alert.alert('Delete failed', getErrorMessage(error)),
  });

  const placeholder = useMemo(() => {
    if (!replyTo) return 'Write a comment...';

    const match = detailQuery.data?.comments
      .flatMap(comment => [comment, ...comment.replies])
      .find(comment => comment.id === replyTo);

    return match ? `Replying to ${match.author.name}...` : 'Write a reply...';
  }, [detailQuery.data?.comments, replyTo]);

  const submitComment = () => {
    if (!draft.trim()) {
      Alert.alert('Missing comment', 'Write something before posting.');
      return;
    }

    commentMutation.mutate();
  };

  if (detailQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading announcement..." />
      </Screen>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <Screen>
        <ErrorState description="Unable to load this announcement." onRetry={() => detailQuery.refetch()} />
      </Screen>
    );
  }

  const announcement = detailQuery.data;
  const canManage = user?.id === announcement.author.id || user?.role === 'ADMIN';

  const beginEdit = () => {
    setEditTitle(announcement.title);
    setEditContent(announcement.content);
    setEditPinned(announcement.isPinned);
    setEditing(true);
  };

  return (
    <Screen refreshing={detailQuery.isRefetching} onRefresh={() => detailQuery.refetch()}>
      <View className="flex-row items-center justify-between">
        <Pressable onPress={() => navigation.goBack()} className="h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
          <ArrowLeft size={20} color="#171717" />
        </Pressable>
        <AppText variant="label">Announcement</AppText>
        <View className="w-11" />
      </View>

      <Card>
        <View className="gap-4">
          {editing ? (
            <>
              <TextInput
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Announcement title"
                placeholderTextColor="#737373"
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-xl font-semibold text-neutral-900"
              />
              <TextInput
                multiline
                textAlignVertical="top"
                value={editContent}
                onChangeText={setEditContent}
                placeholder="Announcement message"
                placeholderTextColor="#737373"
                className="min-h-36 rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-base text-neutral-900"
              />
              <View className="flex-row items-center justify-between rounded-2xl bg-neutral-50 px-4 py-4">
                <AppText variant="label">Pin this announcement</AppText>
                <Switch value={editPinned} onValueChange={setEditPinned} />
              </View>
              <Button title="Save Changes" onPress={() => updateMutation.mutate()} loading={updateMutation.isPending} />
              <Button title="Cancel Editing" variant="outline" onPress={() => setEditing(false)} />
            </>
          ) : (
            <>
              <View className="gap-2">
                <View className="flex-row flex-wrap items-center gap-2">
                  <AppText variant="screenTitle">{announcement.title}</AppText>
                  {announcement.isPinned ? <Badge label="Pinned" tone="warning" /> : null}
                </View>
                {announcement.org ? (
                  <OrgIdentity
                    name={announcement.org.name}
                    logoUrl={announcement.org.logo}
                    subtitle={`${announcement.author.name} • ${announcement.author.role} • ${formatDateTime(announcement.createdAt)}`}
                    size="sm"
                    variant="plain"
                  />
                ) : (
                  <AppText variant="bodySmall" tone="muted">
                    {announcement.author.name} • {announcement.author.role} • {formatDateTime(announcement.createdAt)}
                  </AppText>
                )}
              </View>

              <AppText variant="body">{announcement.content}</AppText>

              {announcement.event ? (
                <View className="flex-row items-center gap-2 rounded-2xl bg-neutral-100 px-3 py-3">
                  <Pin size={14} color="#171717" />
                  <AppText variant="bodySmall">{announcement.event.title}</AppText>
                </View>
              ) : null}

              <ReactionBar
                reactionCounts={announcement.reactionCounts}
                userReactions={announcement.userReactions}
                onReact={emoji => announcementReactionMutation.mutate(emoji)}
              />

              {canManage ? (
                <View className="gap-3">
                  <Button title="Edit Announcement" variant="outline" onPress={beginEdit} />
                  <Button
                    title="Delete Announcement"
                    variant="destructive"
                    onPress={() =>
                      Alert.alert('Delete announcement', 'This will remove the announcement permanently.', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
                      ])
                    }
                    loading={deleteMutation.isPending}
                  />
                </View>
              ) : null}
            </>
          )}
        </View>
      </Card>

      <Card>
        <View className="gap-4">
          <AppText variant="sectionTitle">Comments</AppText>

          {user ? (
            <>
              <TextInput
                multiline
                textAlignVertical="top"
                value={draft}
                onChangeText={setDraft}
                placeholder={placeholder}
                placeholderTextColor="#737373"
                className="min-h-28 rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-base text-neutral-900"
              />
              <Button
                title={replyTo ? 'Post Reply' : 'Post Comment'}
                onPress={submitComment}
                loading={commentMutation.isPending}
              />
            </>
          ) : null}

          {announcement.comments.length ? (
            <View className="gap-4">
              {announcement.comments.map(comment => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  replyTo={replyTo}
                  setReplyTo={setReplyTo}
                  onReact={(commentId, emoji) => commentReactionMutation.mutate({ commentId, emoji })}
                />
              ))}
            </View>
          ) : (
            <EmptyState title="No comments yet" description="Start the conversation with the first reply." />
          )}
        </View>
      </Card>
    </Screen>
  );
}
