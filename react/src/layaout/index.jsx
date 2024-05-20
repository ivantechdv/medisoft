import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import RoutesApp from './routes';
import { BrowserRouter } from 'react-router-dom';

function Layaout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    <>
      <BrowserRouter>
        <div className='flex h-screen bg-body'>
          {/* Sidebar */}
          <Sidebar isSidebarOpen={isSidebarOpen} />

          {/* Main Content */}
          <main className='flex flex-col flex-1 overflow-y-auto'>
            {/* Top Navigation */}
            <nav className='bg-topNav p-4 text-black'>
              <div className='flex items-center justify-between'>
                {/* Menu Button (Visible on small screens) */}
                <button
                  onClick={toggleSidebar}
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
                <h1 className='flex-1 text-lg text-sm text-right'>
                  Ivantechdv{' '}
                </h1>
              </div>
            </nav>

            {/* Main Content */}
            <div className='p-1'>
              <RoutesApp />
            </div>
          </main>
        </div>
      </BrowserRouter>
    </>
  );
}
export default Layaout;
