import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/login/Login';
import Layaout from './layaout';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <>
    {isAuthenticated ? <Layaout /> : <Login />}
    </>
  );
}

export default App;
