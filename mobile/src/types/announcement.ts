import type { User } from './user';

export interface ReactionCount {
  emoji: string;
  count: number;
}

export interface AnnouncementAuthor extends Pick<User, 'id' | 'name' | 'avatarUrl' | 'role'> {}

export interface AnnouncementEventLink {
  id: string;
  title: string;
  slug?: string;
}

export interface AnnouncementComment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  parentId?: string | null;
  author: AnnouncementAuthor;
  replies: AnnouncementComment[];
  reactionCounts: ReactionCount[];
  userReactions: string[];
}

export interface AnnouncementSummary {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  author: AnnouncementAuthor;
  event?: AnnouncementEventLink | null;
  _count: {
    comments: number;
    reactions: number;
  };
  reactionCounts: ReactionCount[];
  userReactions: string[];
}

export interface AnnouncementDetail extends AnnouncementSummary {
  comments: AnnouncementComment[];
}

export interface AnnouncementListResponse {
  announcements: AnnouncementSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
