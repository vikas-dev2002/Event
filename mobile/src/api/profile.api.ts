import { apiClient } from './client';

export { getCurrentUser, updateCurrentUser } from './auth.api';

export interface CollegeOption {
  name: string;
  slug: string;
  city: string;
  type: string;
}

export async function getMappedColleges() {
  const { data } = await apiClient.get<{ colleges: CollegeOption[] }>('/api/mobile/colleges');
  return data.colleges;
}
