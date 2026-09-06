const DEFAULT_API_ORIGIN = 'https://api.seekonapparelglobal.com';

const normalizeOrigin = (url) => {
  const cleanUrl = (url || DEFAULT_API_ORIGIN).trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
  // Force api subdomain if Vercel environment variable is set to apex or www domain
  if (cleanUrl === 'https://seekonapparelglobal.com' || cleanUrl === 'https://www.seekonapparelglobal.com') {
    return 'https://api.seekonapparelglobal.com';
  }
  return cleanUrl;
};

/** Backend origin without trailing /api (e.g. https://api.seekonapparelglobal.com) */
export const API_ORIGIN = normalizeOrigin(import.meta.env.VITE_API_URL);

/** API base path including /api suffix */
export const API_URL = `${API_ORIGIN}/api`;
