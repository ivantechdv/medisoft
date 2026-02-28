import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './login';
import Layaout from './layaout';
import toast, { Toaster } from 'react-hot-toast';
import 'react-tooltip/dist/react-tooltip.css';
import Cookies from 'js-cookie';
import { loadPhoneMask } from './utils/customFormat';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    // Revisa si el token de autenticación está presente en las cookies
    const authToken = Cookies.get('jwt');

    setIsAuthenticated(!!authToken); // Actualiza el estado de autenticación
    
    // Cargar la máscara de teléfono configurada
    loadPhoneMask();
  }, []);

  return (
    <>
      <Layaout />
      <Toaster />
    </>
  );
}

export default App;
