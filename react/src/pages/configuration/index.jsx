import React, { useState } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs';
import General from './general';
import Caregivers from './caregivers';
import Clients from './clients';
import Appearance from './appearance';

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'clients', label: 'Clientes' },
  { id: 'caregivers', label: 'Cuidadores' },
  { id: 'appearance', label: 'Apariencia' },
];

const Configuration = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className='max-w-full mx-auto bg-white min-h-[calc(100vh-80px)]'>
      <div className='flex justify-between px-4 sm:px-6 pt-4'>
        <Breadcrumbs
          items={[
            { label: 'Inicio', route: '/' },
            { label: 'Configuración', route: '/configuration' },
          ]}
        />
      </div>

      <div className='mt-4 px-4 sm:px-6'>
        <div className='border-b border-gray-300 flex flex-wrap gap-2'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className='mt-6'>
          {activeTab === 'general' && <General />}
          {activeTab === 'clients' && <Clients />}
          {activeTab === 'caregivers' && <Caregivers />}
          {activeTab === 'appearance' && <Appearance />}
        </div>
      </div>
    </div>
  );
};

export default Configuration;
