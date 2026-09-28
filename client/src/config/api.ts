const getBaseUrl = () => {
  let url = 'https://estetica-mili-pink.vercel.app/api';
  if (import.meta.env.VITE_API_URL) {
    url = import.meta.env.VITE_API_URL;
  } else if (import.meta.env.DEV) {
    url = 'http://localhost:3001/api';
  }
  // Asegurar que termine en /api si no lo tiene
  if (!url.endsWith('/api') && !url.includes('localhost')) {
    url = url.replace(/\/$/, '') + '/api';
  }
  return url;
};

export const API_URL = getBaseUrl();
export const BASE_URL = API_URL.replace(/\/api$/, '');
