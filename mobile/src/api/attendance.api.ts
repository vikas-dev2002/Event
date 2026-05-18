import { apiClient } from './client';

export async function selfCheckIn(qrCode: string) {
  const { data } = await apiClient.post('/api/attendance/self-checkin', { qrCode });
  return data;
}

export async function verifyQrCode(qrCode: string) {
  const { data } = await apiClient.get('/api/attendance', { params: { qrCode } });
  return data;
}

export async function markAttendance(qrCode: string) {
  const { data } = await apiClient.post('/api/attendance', { qrCode, method: 'QR' });
  return data;
}
