export type UserRole = 'STUDENT' | 'ORGANIZER' | 'ADMIN';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string | null;
  year?: string | null;
  phone?: string | null;
  interests: string[];
  avatarUrl?: string | null;
  orgId?: string | null;
  org?: Organization | null;
  isVerified: boolean;
  profileCompleted: boolean;
}
