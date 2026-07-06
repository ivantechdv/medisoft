import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { hasValidSession } from '../utils/auth';
import SessionWatcher from './SessionWatcher';

const ProtectedRoute = () => {
  if (!hasValidSession()) {
    return <Navigate to='/login' replace />;
  }

  return (
    <>
      <SessionWatcher />
      <Outlet />
    </>
  );
};

export default ProtectedRoute;
