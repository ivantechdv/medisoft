import React, { createContext, useContext, useEffect, useState } from 'react';
import { cakeLogout, verifyToken } from '../api';
import Cookies from 'js-cookie';

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
    const response = await cakeLogout();
    if (response.status == 200) {
      setUser(null);
      Cookies.set('user', null, { expires: 1 });

      // Verifica si la ruta actual no es /login antes de redirigir
      if (location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  };

  useEffect(() => {
    function redirect() {
      if (location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    async function fetchData(userDataCookie, token) {
      let response = await verifyToken({ token });

      if (response.success) {
        setUser(userDataCookie);

        setIsAuthenticated(true);
      } else {
        redirect();
      }
    }

    const cookies = Cookies.get();
    const user = Cookies.get('user');
    const email = Cookies.get('email');
    const from = Cookies.get('from');
    setEmail(Cookies.get('email'));
    setFrom(from);

    if (location.pathname === '/login/password' && email == '') {
      redirect();
    } else if (location.pathname === '/login/password' && email != '') {
    } else {
      if (user) {
        const userDataCookie = JSON.parse(user);
        if (userDataCookie) {
          //ya tenemos el token y el usuario
          // ahora debemos verificar el token que sea valido
          if (cookies.token) {
            fetchData(userDataCookie, cookies.token);
          } else {
            redirect();
          }
        } else {
          redirect();
        }
      } else {
        redirect();
      }
    }
  }, []);

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
