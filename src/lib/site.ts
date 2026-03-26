const FALLBACK_SITE_URL = 'http://localhost:5173';

export function getSiteOrigin() {
  const configuredUrl = import.meta.env.VITE_SITE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return FALLBACK_SITE_URL;
}

export function getCanonicalUrl() {
  if (typeof window === 'undefined') {
    return getSiteOrigin();
  }

  return `${getSiteOrigin()}${window.location.pathname}`;
}
