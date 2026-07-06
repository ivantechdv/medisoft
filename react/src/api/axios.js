import axios from 'axios';
import { handleSessionExpired, isAuthError } from '../utils/auth';

const instance = axios.create({
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAuthError(error)) {
      handleSessionExpired();
    }

    return Promise.reject(error);
  },
);

export default instance;