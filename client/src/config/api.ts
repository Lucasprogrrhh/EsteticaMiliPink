const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV) return 'http://localhost:3001/api';
  return 'https://estetica-mili-pink.vercel.app/api';
};

export const API_URL = getBaseUrl();
export const BASE_URL = API_URL.replace('/api', '');
