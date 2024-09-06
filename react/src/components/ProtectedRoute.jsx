import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = () => {
  const authToken = Cookies.get('authToken'); // Obtén el token de las cookies
  const isAuthenticated = !!authToken; // Verifica si el token existe

  // Redirige al usuario a la página de inicio de sesión si no está autenticado
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' replace />;
};

export default ProtectedRoute;
