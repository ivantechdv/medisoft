import icono from '../img/unixfyone.png';
import { Link } from 'react-router-dom';
import DrowDownUser from './DrowDownUser';
import { RiMenu3Line } from 'react-icons/ri';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { useState } from 'react';

const menu = [
  {
    name: 'Contactos',
    Link: '/users/contacts/contact',
  },
  {
    name: 'IT Support',
    Link: '/assets/dashboard',
  },
  {
    name: 'Info Tips',
    Link: '/notitips/index',
  },
];

export default function topNav() {
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className='h-20'>
      <nav className='shadow-md w-full fixed top-0 left-0'>
        <div className='md:flex items-center justify-between bg-gray-800  py-4 md:px-10 px-7'>
          <div className='font-bold text-2xl cursor-pointer flex items-center text-gray-800'>
            <span className='text-3x1 text-indigo-600 mr-1 ml-0'>
              <Link to='/Home'>
                <img className='object-fill h-14 w-auto hover:h-16 duration-100' src={icono} alt='UnixFyOne' />
              </Link>
            </span>
          </div>
          <div
            onClick={() => setOpen(!open)}
            className='text-3xl absolute right-8 top-6 cursor-pointer md:hidden'
          >
            {open ? (
              <IoMdCloseCircleOutline style={{ color: 'white' }} />
            ) : (
              <RiMenu3Line style={{ color: 'white' }} />
            )}
          </div>
          <div className='md:flex items-center justify-between'>
            <ul
              className={`md:flex md:items-center md:pb-0 pb-12 absolute md:static bg-gray-800 md:z-auto z-[-1] left-0 w-full md:w-auto md:pl-0 pl-9 transition-all duration-500 ease-in ${
                open ? ' top-32 opacity-100' : 'top-[-490px]'
              } md:opacity-100 opacity-0`}
            >
              {menu.map((data, i) => (
                <li key={i} className='md:ml-8 text-sm md:my-0 my-7'>
                  <Link
                    to={data.Link}
                    className='text-white hover:bg-gray-700 hover:text-white rounded-md hover:px-2 py-2 duration-500 md:flex'
                  >
                    {data.name}
                  </Link>
                </li>
              ))}
            </ul>
            <button type="button" className={` ${ open ? 'ml-60 duration-500' : 'duration-500 ml-10'}`} onClick={()=> setOpenMenu(!openMenu)}>
              <DrowDownUser openMenu={openMenu}/>
            </button>
         </div>
        </div>
      </nav>
    </div>
  );
}
