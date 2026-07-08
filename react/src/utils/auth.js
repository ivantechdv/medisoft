import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

let redirecting = false;

export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;

  const payload = parseJwt(token);
  if (!payload?.exp) return true;

  return Date.now() >= payload.exp * 1000;
};

export const isPublicRoute = (pathname = window.location.pathname) =>
  pathname === '/login' ||
  pathname === '/login/password' ||
  pathname.startsWith('/set-password');

export const clearSession = () => {
  Cookies.remove('authToken');
  Cookies.remove('user');
  Cookies.remove('token');
  Cookies.remove('email');
  Cookies.remove('from');
};

export const handleSessionExpired = (
  message = 'Su sesión ha expirado. Inicie sesión nuevamente.',
) => {
  if (redirecting || isPublicRoute()) return;

  redirecting = true;
  clearSession();

  if (message) {
    toast.error(message, { duration: 4000 });
  }

  window.setTimeout(() => {
    window.location.href = '/login';
  }, 150);
};

export const isAuthError = (error) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || '';

  if (status === 401) return true;
  if (status === 403 && /token|session/i.test(message)) return true;

  return false;
};

export const hasValidSession = () => {
  const token = Cookies.get('authToken');
  return !!token && !isTokenExpired(token);
};
