import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/login/Login';

import Sidebar from './components/sidebar/sidebar';
import TopNavComponent from './components/topNav';

import toast, { Toaster } from 'react-hot-toast';

// home
import Home from './pages/home';

// companies
import CompaniesIndex from './pages/configs/companies/CompaniesIndex';
import CompaniesCreate from './pages/configs/companies/CompaniesCreate';
import CompaniesView from './pages/configs/companies/CompaniesView';

// purchases
import SolicitudForm from './pages/purchases/solicitud';
import SolicitudList from './pages/purchases/solicitud-list';
import PurchasesLayout from './pages/purchases/layout';
import PurchaseAprobador from './pages/purchases/aprobadores';
import PurchasesCostCenter from './pages/purchases/cost-center';
import PurchasesPiLine from './pages/purchases/pil-line';

// configs
import ConfigsIndex from './pages/configs/layout';
import CompaniesUpdate from './pages/configs/companies/CompaniesUpdate';
import DepartmentsIndex from './pages/configs/departments/DepartmentsIndex';
import PositionsIndex from './pages/configs/positions/PositionsIndex';
import UserList from './pages/configs/users/list';
import UserForm from './pages/configs/users/form';
import MyProfile from './pages/configs/users/MyProfile/MyProfile';

// contacts
import Contacts from './pages/users/contacts/contact';

// legal
import LegalDashboard from './pages/legal/dashboard/dashboard';
import LegalCategory from './pages/legal/category';
import LegalStorageForm from './pages/legal/storage';
import LegalStorageList from './pages/legal/list';

/************PROVEEDORES************/
import ProviderCategory from './pages/provider/category';
import Provider from './pages/provider/provider';
/************PROVEEDORES************/

/************ACTIVOS */
import FormAssets from './pages/assets/assets';
import AssetElements from './pages/assets/asset_elements';
import AssetCategories from './pages/assets/asset_categories';
import AssetConfigs from './pages/assets/asset_configs';
import AssetList from './pages/assets/asset_list/index';
import AssetGroup from './pages/assets/asset_group_elements';

import PurchaseCuentaContable from './pages/purchases/cuenta_contable';
import { show } from './api';
import { VerifyPermisology } from './components/VerifyPermisology';

/************ACTIVOS */

/*****NotiTips */
import NotiTips from './pages/notitips/index';
/*****NotiTips */

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Login></Login>
      <div className='flex h-screen bg-gray-100'>
        {/* Sidebar */}
        <aside
          className={`bg-gray-900 text-white h-screen w-64 pt-4 ${
            isSidebarOpen ? 'block' : 'hidden'
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
          <div className='p-4 text-black'></div>
        </main>
      </div>
      <BrowserRouter></BrowserRouter>
    </>
  );
}

export default App;
