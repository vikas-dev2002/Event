import { apiClient } from './client';

export async function getCertificates() {
  const { data } = await apiClient.get('/api/certificates');
  return data;
}

export async function getCertificateById(id: string) {
  const { data } = await apiClient.get(`/api/certificates/${id}`);
  return data;
}

export async function verifyCertificate(code: string) {
  const { data } = await apiClient.get(`/api/public/certificates/verify/${encodeURIComponent(code)}`);
  return data as {
    valid: boolean;
    code?: string;
    message?: string;
    certificate?: {
      id: string;
      verificationCode: string;
      issuedAt: string;
      user: {
        name: string;
        email: string;
        department?: string | null;
      };
      event: {
        title: string;
        startDate: string;
        endDate?: string | null;
        venue: string;
        category: string;
        org?: {
          name: string;
        } | null;
      };
    };
  };
}
