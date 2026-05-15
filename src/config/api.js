const DEFAULT_API_ORIGIN = 'https://seekonbackend-production-da47.up.railway.app';

const normalizeOrigin = (url) =>
  (url || DEFAULT_API_ORIGIN).replace(/\/api\/?$/, '').replace(/\/$/, '');

/** Backend origin without trailing /api (e.g. https://seekonbackend-production-da47.up.railway.app) */
export const API_ORIGIN = normalizeOrigin(import.meta.env.VITE_API_URL);

/** API base path including /api suffix */
export const API_URL = `${API_ORIGIN}/api`;
