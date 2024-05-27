// Navigation.js
import React from 'react';
import {
  HomeIcon,
  BriefcaseIcon,
  CollectionIcon,
} from '@heroicons/react/outline';
import { FaCogs, FaWarehouse, FaObjectGroup } from 'react-icons/fa';
function Navigation() {
  const prefixesToCheck = ['/assets', '/purchase', '/legal', '/configs'];
  const currentPath = window.location.pathname;
  const routePrefix =
    prefixesToCheck.find((prefix) => currentPath.startsWith(prefix)) || '';

  let links = [];
  /********************EMPLEADOS */

  const commonLinks = [
    {
      to: '/Home',
      label: 'Inicio',
      icon: <HomeIcon className='w-5 h-5' />,
    },
    {
      label: 'Configuración',
      icon: <FaCogs className='w-5 h-5' />,
      sublinks: [
        {
          to: '/',
          label: 'General',
          icon: <CollectionIcon className='w-5 h-5' />,
        },
        {
          to: '/',
          label: 'Usuarios',
          icon: <FaObjectGroup className='w-5 h-5' />,
        },
        {
          to: '/',
          label: 'Patologias',
          icon: <CollectionIcon className='w-5 h-5' />,
        },
        {
          to: '/',
          label: 'Servicios',
          icon: <FaObjectGroup className='w-5 h-5' />,
        },
      ],
    },
    {
      to: '/clients',
      label: 'Clientes',
      icon: <FaWarehouse className='w-4 h-4' />,
    },
    {
      to: '/',
      label: 'Familias',
      icon: <BriefcaseIcon className='w-4 h-4' />,
    },
    {
      to: '/',
      label: 'Empleados',
      icon: <FaCogs className='w-4 h-4' />,
    },
  ];
  switch (routePrefix) {
    default:
      links = [...commonLinks];
  }

  /********************EMPLEADOS */

  return links; // Devuelve directamente el array
}

export default Navigation;
