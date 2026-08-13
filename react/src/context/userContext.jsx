import React, { createContext, useContext, useEffect, useState } from 'react';
import { cakeLogout, verifyToken } from '../api';
import Cookies from 'js-cookie';
import { clearSession, isPublicRoute, isTokenExpired } from '../utils/auth';
import { loadUiThemeForUser } from '../utils/uiTheme';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [from, setFrom] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // por ahora se hace asi pero la idea es
  // cuando el componete api y el JWT exista hacer aca la llamada a la API
  // y set el token en el localstorage aqui

  const verifyEmail = (email, from) => {
    setEmail(email);
    setFrom(from);
    Cookies.set('email', email, { expires: 1 });
    Cookies.set('from', from, { expires: 1 });
  };

  const verifyPassword = (response) => {
    setUser(response.user);
    const userDataJSON = JSON.stringify(response.user);
    const tokenJson = JSON.stringify(response.token);
    Cookies.set('user', userDataJSON, { expires: 1 }); // expiración de 1 día
    Cookies.set('token', response.token, { expires: 1 }); // expiración de 1 día
    setIsAuthenticated(true);
    Cookies.remove('email');
  };

  const login = (userData) => {
    setUser(userData);
    const userDataJSON = JSON.stringify(userData);
    Cookies.set(userDataJSON, { expires: 1 }); // expiración de 1 día
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await cakeLogout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
      clearSession();

      if (!isPublicRoute()) {
        window.location.href = '/login';
      }
    }
  };

  useEffect(() => {
    setEmail(Cookies.get('email') || '');
    setFrom(Cookies.get('from') || '');

    function redirect() {
      if (!isPublicRoute()) {
        window.location.href = '/login';
      }
    }

    async function fetchData(userDataCookie, token) {
      const response = await verifyToken({ token });

      if (response.success) {
        setUser(userDataCookie);
        setIsAuthenticated(true);
      } else {
        clearSession();
        redirect();
      }
    }

    if (isPublicRoute()) {
      return;
    }

    const userCookie = Cookies.get('user');
    const authToken = Cookies.get('authToken');

    if (userCookie && authToken && !isTokenExpired(authToken)) {
      const userDataCookie = JSON.parse(userCookie);
      fetchData(userDataCookie, authToken);
      return;
    }

    clearSession();
    redirect();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadUiThemeForUser(user.id);
    }
  }, [user?.id]);

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        verifyEmail,
        email,
        from,
        verifyPassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
