import { apiClient } from './client';

export async function getAdminOverview() {
  const { data } = await apiClient.get('/api/mobile/admin/overview');
  return data as {
    stats: {
      totalColleges: number;
      totalUsers: number;
      totalEvents: number;
      totalRegistrations: number;
      totalCertificates: number;
      pendingOrganizerRequests: number;
    };
    recentOrganizations: Array<{
      id: string;
      name: string;
      slug: string;
      logo?: string | null;
      _count: { users: number; events: number };
    }>;
    recentEvents: Array<{
      id: string;
      title: string;
      startDate: string;
      status: string;
      org?: { name: string; logo?: string | null } | null;
      organizer?: { name: string } | null;
      _count: { registrations: number };
    }>;
  };
}

export async function getOrganizations(page = 1, limit = 20, search = '') {
  const { data } = await apiClient.get('/api/organizations', { params: { page, limit, search } });
  return data as {
    organizations: Array<{
      id: string;
      name: string;
      slug: string;
      logo?: string | null;
      _count: { users: number; events: number };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export async function createOrganization(payload: { name: string; slug: string; logo?: string }) {
  const { data } = await apiClient.post('/api/organizations', payload);
  return data;
}

export async function getOrganizerRequests() {
  const { data } = await apiClient.get('/api/organizer-requests');
  return data as {
    requests: Array<{
      id: string;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      collegeName: string;
      designation: string;
      organizationWeb?: string | null;
      reason: string;
      rejectionReason?: string | null;
      createdAt: string;
      user: {
        name: string;
        email: string;
        department?: string | null;
        createdAt: string;
      };
      reviewer?: { name: string } | null;
    }>;
    pendingCount: number;
  };
}

export async function reviewOrganizerRequest(
  id: string,
  payload: { action: 'APPROVED' | 'REJECTED'; rejectionReason?: string },
) {
  const { data } = await apiClient.patch(`/api/organizer-requests/${id}`, payload);
  return data;
}
