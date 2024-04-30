'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Home({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white h-screen w-64 pt-4 ${
          isSidebarOpen ? 'block' : 'hidden'
        } lg:block`}
      >
        <ul>
          <li>
            <Link href='/'>
              <label className='block px-4 py-2 text-gray-200 hover:bg-gray-800'>
                Dashboard
              </label>
            </Link>
          </li>
          <li>
            <Link href='/users'>
              <label className='block px-4 py-2 text-gray-200 hover:bg-gray-800'>
                Usuarios
              </label>
            </Link>
          </li>
          <li>
            <Link href='/settings'>
              <label className='block px-4 py-2 text-gray-200 hover:bg-gray-800'>
                Settings
              </label>
            </Link>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className='flex flex-col flex-1 overflow-y-auto'>
        {/* Top Navigation */}
        <nav className='bg-gray-800 p-4 text-white'>
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
            <h1 className='ml-3 text-lg font-semibold'>Logo</h1>
          </div>
        </nav>

        {/* Main Content */}
        <div className='p-4 text-black'>{children}</div>
      </main>
    </div>
  );
}
