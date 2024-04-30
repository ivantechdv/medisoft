// Sidebar.js
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Navigation from '../navigation/navigation';
import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';

function Sidebar() {
  const navigationItems = Navigation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const location = useLocation();

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
      const activeItem = navigationItems[activeItemIndex];
    }

    setExpandedMenus(newExpandedMenus);
  }, [location.pathname]);

  return (
    <div>
      <div className='bg-white w-[100%] min-h-[94vh]'>
        <div className='flex-col flex'>
          <div className='w-full border-b-2 border-gray-200'></div>
          <div className='flex bg-gray-100 overflow-x-hidden  min-h-[91vh]'>
            <div className='bg-white lg:flex md:w-64 md:flex-col hidden '>
              <div className='flex-col pt-5 flex overflow-y-auto '>
                <div className='h-full flex-col justify-between px-4 flex'>
                  {navigationItems.length > 0 &&
                    navigationItems.map((item, index) => (
                      <div key={index}>
                        {item.sublinks ? (
                          <>
                            <div
                              className='font-medium text-sm items-center rounded-lg text-gray-900 px-2 py-1 flex
                            transition-all hover:bg-slate-500  hover:text-white group cursor-pointer hover:ml-1 duration-300 active:text-red-700'
                              onClick={() => toggleMenu(index)}
                            >
                              <span className='items-center justify-center flex mr-1'>
                                {item.icon}
                              </span>
                              <span className='mt-1'>{item.label}</span>
                              <span className='ml-auto'>
                                {expandedMenus[index] ? (
                                  <ChevronUpIcon className='w-4 h-4' />
                                ) : (
                                  <ChevronDownIcon className='w-4 h-4' />
                                )}
                              </span>
                            </div>
                            {expandedMenus[index] && (
                              <div className='pl-8'>
                                {item.sublinks.map((sublink, subIndex) => (
                                  <NavLink
                                    key={subIndex}
                                    to={sublink.to}
                                    className='font-medium text-sm items-center rounded-lg text-gray-900 flex py-1
                                  transition-all hover:bg-gray-200 group cursor-pointer hover:ml-1 duration-300 active:text-red-700'
                                  >
                                    <span className='items-center justify-center flex mr-2'>
                                      {sublink.icon}
                                    </span>
                                    <span className='mt-1'>
                                      {sublink.label}
                                    </span>
                                  </NavLink>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <NavLink
                            to={item.to}
                            className='font-medium text-sm items-center rounded-lg text-gray-900 px-2 py-2 flex
                          transition-all  hover:bg-slate-500 cursor-pointer hover:text-white hover:ml-1 duration-300 active:text-red-700'
                          >
                            <span className='items-center justify-center flex mr-1'>
                              {item.icon}
                            </span>
                            <span className='mt-1'>{item.label}</span>
                          </NavLink>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
