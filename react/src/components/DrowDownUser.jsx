import React, { useState } from 'react';
import { useUser } from '../context/userContext'; // Importa el contexto
import { Link } from 'react-router-dom';

import {
  AiOutlineCaretDown,
  AiOutlineCaretUp,
  AiOutlineLogout,
} from 'react-icons/ai';
import { CgProfile } from 'react-icons/cg';
import foto from '../img/user-bg.png';

// profile menu component
const profileMenuItems = [
  {
    label: 'Mi Perfil',
    icon: <CgProfile />,
    to: '/configs/users/MyProfile',
  },

];

function DrowDownUser({ openMenu }) {
  const { user, logout, login } = useUser();
  const name = [user.first_name] + ' ' + [user.last_name];
  return (
    <>
      <div className='relative mr-2'>
        <div className='flex flex-1 justify-between'>
          <p className='text-gray-300 text-sm font-medium py-2 p-1'>{name}</p>
          <a
            type='button'
            className='relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'
            id='user-menu-button'
            aria-expanded='false'
            aria-haspopup='true'
          >
            <span className='absolute -inset-1.5'></span>
            <span className='sr-only'>Open user menu</span>
            <img className='h-8 w-8 rounded-full border border-x-2 border-blue-300' src={user.image ? user.image : foto} alt='' />
            {openMenu ? (
              <AiOutlineCaretDown className='h-8' style={{ color: 'white' }} />
            ) : (
              <AiOutlineCaretUp className='h-8' style={{ color: 'white' }} />
            )}
          </a>
          {openMenu && (
            <div className='top-10 w-auto h-auto bg-slate-200 text-sm absolute flex flex-col items-start rounded-lg p-2'>
              {profileMenuItems.map((item, i) => (
                <div
                  className='flex w-full text-sm justify-between p-2 bg-slate-200 hover:bg-slate-500 hover:text-white cursor-pointer border-l-transparent hover:border-l-blue-800 border-l-4 rounded-lg'
                  key={i}
                > <Link to={item.to} >
                    <h3 className='h-8'>{item.icon}</h3>
                    <h3 className='ml-1 text-sm'>{item.label}</h3>
                  </Link>
                  
                </div>
              ))}
                <div className='flex w-full text-sm justify-between p-2 bg-slate-200 hover:bg-slate-500 hover:text-white cursor-pointer border-l-transparent hover:border-l-blue-800 border-l-4 rounded-lg'>
                    <h3 className='h-8'><AiOutlineLogout /></h3>
                    <h3 className='ml-1 text-sm' onClick={logout}>Cerrar Sesión</h3>
                </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DrowDownUser;
