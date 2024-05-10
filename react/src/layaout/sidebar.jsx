import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
//import Navigation from '../navigation/navigation';
import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';

function Sidebar() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

    return (
        <aside
            className={`bg-gray-900 text-white h-screen w-64 pt-4 ${isSidebarOpen ? 'block' : 'hidden'
                } lg:block`}
        >
            <ul>
                <li>
                    <label className='block px-4 py-2 text-gray-200 hover:bg-gray-800'>
                        Dashboard
                    </label>
                </li>
                <li>
                    <label className='block px-4 py-2 text-gray-200 hover:bg-gray-800'>
                        Profile
                    </label>
                </li>
                <li>
                    <label className='block px-4 py-2 text-gray-200 hover:bg-gray-800'>
                        Settings
                    </label>
                </li>
            </ul>
        </aside>
    );
}
export default Sidebar;