import React, { useState } from 'react';
import Sidebar from './sidebar';
import RoutesApp from './routes';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Login from './../login/index';
import ProtectedRoute from './../components/ProtectedRoute';

function Layaout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública para el inicio de sesión */}
        <Route path='/login' element={<Login />} />

        {/* Ruta protegida */}
        <Route element={<ProtectedRoute />}>
          <Route
            path='/*'
            element={
              <div className='flex h-screen bg-body'>
                {/* Sidebar */}
                <Sidebar
                  isSidebarOpen={isSidebarOpen}
                  isSidebarExpanded={isSidebarExpanded}
                />
                {/* Main Content */}
                <main className='flex flex-col flex-1 overflow-y-auto'>
                  <nav className='bg-topNav p-4 text-black'>
                    <div className='flex items-center justify-between'>
                      <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className='block lg:hidden focus:outline-none'
                      >
                        <svg
                          className='w-6 h-6'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M4 6h16M4 12h16m-7 6h7'
                          ></path>
                        </svg>
                      </button>
                      {/* <h1 className='flex-1 text-lg text-sm text-right'>
                        Ivantechdv
                      </h1>
                      <button
                        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                        className='hidden lg:block focus:outline-none'
                      >
                        {isSidebarExpanded ? (
                          <svg
                            className='w-6 h-6'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M6 18L18 6M6 6l12 12'
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className='w-6 h-6'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M4 6h16M4 12h16m-7 6h7'
                            ></path>
                          </svg>
                        )}
                      </button> */}
                    </div>
                  </nav>
                  <div className='p-1'>
                    <RoutesApp />
                  </div>
                </main>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Layaout;
