// Navigation.js
import React from 'react';
import { useUser } from './../../context/userContext'; // Importa el contexto
import {
  HomeIcon,
  BriefcaseIcon,
  CollectionIcon,
  ViewListIcon,
  PlusCircleIcon,
} from '@heroicons/react/outline';
import {
  FaCogs,
  FaThList,
  FaFileUpload,
  FaTools,
  FaWarehouse,
  FaUsers,
  FaObjectGroup,
} from 'react-icons/fa';
import { HiChartBar } from 'react-icons/hi';
function Navigation() {
  const { from } = useUser();
  const prefixesToCheck = ['/assets', '/purchase', '/legal', '/configs'];
  const currentPath = window.location.pathname;
  const routePrefix =
    prefixesToCheck.find((prefix) => currentPath.startsWith(prefix)) || '';

  let links = [];
  /********************EMPLEADOS */
  if (from === 'User') {
    const commonLinks = [
      {
        to: '/Home',
        label: 'Home',
        icon: <HomeIcon className='w-5 h-5' />,
      },
      {
        to: '/assets/dashboard',
        label: 'Activos',
        icon: <FaTools className='w-4 h-4' />,
      },
      {
        to: '/purchases/layout',
        label: 'Procura',
        icon: <FaWarehouse className='w-4 h-4' />,
      },
      {
        to: '/legal/dashboard',
        label: 'Legal',
        icon: <BriefcaseIcon className='w-4 h-4' />,
      },
      {
        to: '/configs/layout',
        label: 'Configuraciones',
        icon: <FaCogs className='w-4 h-4' />,
      },
    ];

    const assetsLinks = [
      {
        to: '/assets/dashboard',
        label: 'Dashboard',
        icon: <HomeIcon className='w-5 h-5' />,
      },
      {
        label: 'Configuración',
        icon: <FaCogs className='w-5 h-5' />,
        sublinks: [
          {
            to: '/assets/asset-categories',
            label: 'Categorías',
            icon: <CollectionIcon className='w-5 h-5' />,
          },
          {
            to: '/assets/group-elements',
            label: 'Grupos de Elementos',
            icon: <FaObjectGroup className='w-5 h-5' />,
          },
          {
            to: '/assets/asset-elements',
            label: 'Elementos',
            icon: <ViewListIcon className='w-5 h-5' />,
          },
          {
            to: '/assets/asset-configs',
            label: 'Activos',
            icon: <FaThList className='w-4 h-4' />,
          },
        ],
      },
      {
        label: 'Activos',
        icon: <BriefcaseIcon className='w-5 h-5' />,
        sublinks: [
          {
            to: '/assets/all',
            label: 'Lista',
            icon: <ViewListIcon className='w-5 h-5' />,
          },
          {
            to: '/assets/create',
            label: 'Nuevo',
            icon: <PlusCircleIcon className='w-5 h-5' />,
          },
        ],
      },
      { to: '/assets/insurances', label: 'Seguros' },
    ];

    const configsLinks = [
      {
        to: '/configs/layout',
        label: 'Dashboard',
        icon: <HomeIcon className='w-5 h-5' />,
      },
      {
        label: 'Entidades',
        icon: <BriefcaseIcon className='w-5 h-5' />,
        sublinks: [
          {
            to: '/configs/companies/CompaniesIndex',
            label: 'Lista',
            icon: <CollectionIcon className='w-5 h-5' />,
          },
          {
            to: '/configs/companies/CompaniesCreate',
            label: 'Nueva',
            icon: <ViewListIcon className='w-5 h-5' />,
          },
        ],
      },
      {
        to: '/configs/departments/DepartmentsIndex',
        label: 'Departamentos',
        icon: <BriefcaseIcon className='w-5 h-5' />,
      },
      {
        to: '/configs/positions/PositionsIndex',
        label: 'Posiciones',
        icon: <BriefcaseIcon className='w-5 h-5' />,
        /* sublinks: [
        {
          to: '/configs/positions/PositionsIndex',
          label: 'Lista',
          icon: <CollectionIcon className='w-5 h-5' />,
        },
      ], */
      },
      {
        label: 'Usuarios',
        icon: <BriefcaseIcon className='w-5 h-5' />,
        sublinks: [
          {
            to: '/configs/users/list',
            label: 'Lista',
            icon: <CollectionIcon className='w-5 h-5' />,
          },
          {
            to: '/configs/users/form',
            label: 'Nuevo',
            icon: <ViewListIcon className='w-5 h-5' />,
          },
        ],
      },
    ];

    const purchaseLinks = [
      {
        to: '/Home',
        label: 'Home',
        icon: <HomeIcon className='w-5 h-5' />,
      },
      {
        to: '/purchases/layout',
        label: 'DashBoard',
        icon: <HiChartBar className='w-5 h-5' />,
      },
      {
        label: 'Proveedores',
        icon: <FaUsers className='w-5 h-5' />,
        sublinks: [
          {
            to: '/purchases/provider-category',
            label: 'Categorías',
            icon: <FaThList className='w-4 h-4' />,
          },
          {
            to: '/purchases/provider',
            label: 'Proveedores',
            icon: <ViewListIcon className='w-5 h-5' />,
          },
        ],
      },
      {
        label: 'Solicitudes',
        icon: <BriefcaseIcon className='w-5 h-5' />,
        sublinks: [
          {
            to: '/purchases/solicitud/all',
            label: 'Lista',
            icon: <ViewListIcon className='w-5 h-5' />,
          },
          {
            to: '/purchases/solicitud/create',
            label: 'Nuevo',
            icon: <PlusCircleIcon className='w-5 h-5' />,
          },
        ],
      },
      {
        to: '/purchases/costCenter',
        label: 'Centro de Costos',
        icon: <HomeIcon className='w-5 h-5' />,
      },
      {
        to: '/purchases/aprobadores',
        label: 'Aprobadores',
        icon: <HomeIcon className='w-5 h-5' />,
      },
      {
        to: '/purchases/cuentaContable',
        label: 'Cuenta contable',
        icon: <HomeIcon className='w-5 h-5' />,
      },
      {
        to: '/purchases/pil-line',
        label: 'P&L Lines',
        icon: <HomeIcon className='w-5 h-5' />,
      },
    ];

    const legalLinks = [
      {
        to: '/Home',
        label: 'Home',
        icon: <HomeIcon className='w-5 h-5' />,
      },
      {
        to: '/legal/dashboard',
        label: 'Dashboard',
        icon: <HiChartBar className='w-5 h-5' />,
      },
      {
        label: 'Archivos',
        icon: <BriefcaseIcon className='w-5 h-5' />,
        sublinks: [
          {
            to: '/legal/storage',
            label: 'Registro',
            icon: <FaFileUpload className='w-4 h-4' />,
          },
          {
            to: '/legal/list',
            label: 'Lista',
            icon: <FaThList className='w-4 h-4' />,
          },
        ],
      },
      {
        label: 'Configuración',
        icon: <FaCogs className='w-5 h-5' />,
        sublinks: [
          {
            to: '/legal/category',
            label: 'Categorías',
            icon: <FaThList className='w-4 h-4' />,
          },
        ],
      },

      // {
      //   label: 'Solicitudes',
      //   icon: <BriefcaseIcon className='w-5 h-5' />,
      //   sublinks: [
      //     {
      //       to: '/purchases/solicitud/all',
      //       label: 'Lista',
      //       icon: <ViewListIcon className='w-5 h-5' />,
      //     },
      //     {
      //       to: '/purchases/solicitud/create',
      //       label: 'Nuevo',
      //       icon: <PlusCircleIcon className='w-5 h-5' />,
      //     },
      //   ],
      // },
    ];
    switch (routePrefix) {
      case '/assets':
        links = [...assetsLinks];
        break;
      case '/purchase':
        links = [...purchaseLinks];
        break;
      case '/legal':
        links = [...legalLinks];
        break;
      case '/configs':
        links = [...configsLinks];
        break;
      default:
        links = [...commonLinks];
    }
  }

  /********************EMPLEADOS */

  return links; // Devuelve directamente el array
}

export default Navigation;
