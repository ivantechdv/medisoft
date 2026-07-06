import { useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  handleSessionExpired,
  isPublicRoute,
  isTokenExpired,
} from '../utils/auth';

const SessionWatcher = () => {
  useEffect(() => {
    const verifySession = () => {
      if (isPublicRoute()) return;

      const token = Cookies.get('authToken');
      if (!token || isTokenExpired(token)) {
        handleSessionExpired();
      }
    };

    verifySession();

    const intervalId = window.setInterval(verifySession, 60 * 1000);

    const onFocus = () => verifySession();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        verifySession();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return null;
};

export default SessionWatcher;
