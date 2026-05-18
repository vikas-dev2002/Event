import type { User } from './user';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface VerificationPendingResponse {
  requiresVerification: true;
  message: string;
  user: Partial<User>;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'STUDENT' | 'ORGANIZER';
  department?: string;
  year?: string;
  collegeName?: string;
  designation?: string;
  organizationWeb?: string;
  reason?: string;
}
