import type { Organization, User } from './user';

export type EventStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PUBLISHED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type EventCategory =
  | 'TECHNICAL'
  | 'CULTURAL'
  | 'WORKSHOP'
  | 'SEMINAR'
  | 'HACKATHON'
  | 'SPORTS'
  | 'SOCIAL'
  | 'OTHER';

export interface EventDocument {
  url: string;
  name: string;
}

export interface EventRegistrationInfo {
  id: string;
  status: 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED';
  qrCode: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface EventSummary {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  tags: string[];
  startDate: string;
  endDate: string;
  venue: string;
  capacity: number;
  waitlistEnabled: boolean;
  posterUrl?: string | null;
  status: EventStatus;
  organizer: Pick<User, 'id' | 'name' | 'email'>;
  org?: Organization | null;
  _count: {
    registrations: number;
  };
}

export interface EventDetail extends EventSummary {
  registrations?: EventRegistrationInfo[];
  customFields?: string | Record<string, unknown> | null;
}

export interface OrganizedEventsResponse {
  view: 'active' | 'archived' | 'all';
  tabs: {
    active: number;
    archived: number;
    all: number;
  };
  stats: {
    totalEvents: number;
    totalRegistrations: number;
    totalAttended: number;
    attendanceRate: number;
    upcomingEvents: number;
  };
  events: Array<
    EventSummary & {
      registrations: Array<{ attendance?: { id: string } | null }>;
    }
  >;
}
