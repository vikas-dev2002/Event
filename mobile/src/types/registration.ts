import type { EventSummary } from './event';
import type { User } from './user';

export type RegistrationStatus = 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED';

export interface RegistrationAttendance {
  id?: string;
  checkedInAt: string;
  method: 'QR' | 'MANUAL';
}

export interface Registration {
  id: string;
  status: RegistrationStatus;
  qrCode: string;
  registeredAt: string;
  cancelledAt?: string | null;
  waitlistPosition?: number | null;
  attendance?: RegistrationAttendance | null;
  event: EventSummary;
  user?: User;
}
