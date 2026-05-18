export interface PaginatedResponse<T> {
  data?: T;
  events?: T;
  announcements?: T;
  notifications?: T;
  certificates?: T;
  registrations?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: string;
}
