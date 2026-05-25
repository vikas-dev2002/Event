import { API_BASE_URL } from '@/constants/config';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function resolveAssetUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const resolved =
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('file:') ||
    value.startsWith('content:')
      ? value
      : value.startsWith('//')
        ? `https:${value}`
        : `${trimTrailingSlash(API_BASE_URL)}${value.startsWith('/') ? value : `/${value}`}`;

  return encodeURI(resolved);
}

export function isLikelyVideoUrl(value?: string | null) {
  if (!value) {
    return false;
  }

  const normalized = value.toLowerCase();
  return (
    normalized.includes('/video/upload/') ||
    normalized.endsWith('.mp4') ||
    normalized.endsWith('.webm') ||
    normalized.endsWith('.mov') ||
    normalized.includes('.mp4?') ||
    normalized.includes('.webm?') ||
    normalized.includes('.mov?')
  );
}

export function resolvePosterPreviewUrl(value?: string | null) {
  const resolved = resolveAssetUrl(value);

  if (!resolved) {
    return null;
  }

  if (!isLikelyVideoUrl(resolved)) {
    return resolved;
  }

  if (resolved.includes('res.cloudinary.com') && resolved.includes('/video/upload/')) {
    const withFrameTransform = resolved.replace('/video/upload/', '/video/upload/so_0/');
    return withFrameTransform.replace(/\.(mp4|webm|mov)(\?.*)?$/i, '.jpg$2');
  }

  return null;
}
