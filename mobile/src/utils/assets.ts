import { API_BASE_URL } from '@/constants/config';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function resolveAssetUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('file:') ||
    value.startsWith('content:')
  ) {
    return value;
  }

  if (value.startsWith('//')) {
    return `https:${value}`;
  }

  const baseUrl = trimTrailingSlash(API_BASE_URL);
  const path = value.startsWith('/') ? value : `/${value}`;
  return `${baseUrl}${path}`;
}
