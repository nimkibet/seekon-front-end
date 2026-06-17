const DEFAULT_API_ORIGIN = 'https://api.seekonapparelglobal.com';

const normalizeOrigin = (url) =>
  (url || DEFAULT_API_ORIGIN).replace(/\/api\/?$/, '').replace(/\/$/, '');

/** Backend origin without trailing /api (e.g. https://api.seekonapparelglobal.com) */
export const API_ORIGIN = normalizeOrigin(import.meta.env.VITE_API_URL);

/** API base path including /api suffix */
export const API_URL = `${API_ORIGIN}/api`;
