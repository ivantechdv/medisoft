import Navigation from './../components/navigation/navigation';

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';
import icono from '/icono.png';

const SidebarItem = ({ item, index, expanded, toggleMenu }) => {
  const isActive = useLocation().pathname === item.to;

  return (
    <div>
      {item.sublinks ? (
        <>
          <div
            className={`font-medium text-sm items-center rounded-lg px-4 py-2 flex transition-all duration-300 hover:bg-slate-500 hover:text-white group cursor-pointer ${
              isActive ? 'bg-slate-500 text-white' : 'text-white'
            }`}
            onClick={() => toggleMenu(index)}
          >
            <span className='mr-1'>{item.icon}</span>
            <span>{item.label}</span>
            <span className='ml-auto'>
              {expanded ? (
                <ChevronUpIcon className='w-4 h-4' />
              ) : (
                <ChevronDownIcon className='w-4 h-4' />
              )}
            </span>
          </div>
          {expanded && (
            <div className='pl-8'>
              {item.sublinks.map((sublink, subIndex) => (
                <NavLink
                  key={subIndex}
                  to={sublink.to}
                  className='font-medium text-sm items-center rounded-lg text-white flex py-1 transition-all duration-300 hover:bg-gray-200 group cursor-pointer'
                >
                  <span className='mr-2'>{sublink.icon}</span>
                  <span>{sublink.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </>
      ) : (
        <NavLink
          to={item.to}
          className={`font-medium text-sm items-center rounded-lg px-4 py-2 flex transition-all duration-300 group cursor-pointer hover:bg-slate-500 hover:text-white ${
            isActive ? 'bg-slate-500 text-white' : 'text-white'
          }`}
        >
          <span className='mr-1'>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      )}
    </div>
  );
};

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const [expandedMenus, setExpandedMenus] = useState({});
  const location = useLocation();
  const navigationItems = Navigation();

  const toggleMenu = (index) => {
    setExpandedMenus((prevExpandedMenus) => ({
      ...prevExpandedMenus,
      [index]: !prevExpandedMenus[index],
    }));
  };

  useEffect(() => {
    const activeItemIndex = navigationItems.findIndex((item) => {
      const isPathInItem = item.to === location.pathname;
      const isPathInSublinks =
        item.sublinks &&
        item.sublinks.some((sublink) => sublink.to === location.pathname);
      return isPathInItem || isPathInSublinks;
    });

    const newExpandedMenus = {};
    if (activeItemIndex !== -1) {
      newExpandedMenus[activeItemIndex] = true;
    }

    setExpandedMenus(newExpandedMenus);
  }, [location.pathname]);

  return (
    <aside
      className={`bg-sidebar text-sidebarText h-screen w-48 pt-2 ${
        isSidebarOpen ? 'block' : 'hidden'
      } lg:block`}
    >
      <div className='flex flex-col pt-1 overflow-y-auto'>
        <div className='flex justify-center items-center mb-2'>
          <div className='bg-content rounded-full p-2'>
            <img src={icono} className='w-24 h-24 rounded-full' />
          </div>
        </div>
        <div className='border-2 border-gray-100 w-full mb-4 mt-2'></div>
        {navigationItems.map((item, index) => (
          <SidebarItem
            key={index}
            item={item}
            index={index}
            expanded={expandedMenus[index]}
            toggleMenu={toggleMenu}
          />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
