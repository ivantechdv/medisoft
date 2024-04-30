import React, { useEffect, useState } from 'react';
import { ChartBar } from '../../../components/Grafic/grafic';
import { show } from '../../../api';
import { FaDatabase, FaUsers, FaTags, FaClock } from 'react-icons/fa';
import Spinner from '../../../components/Spinner/Spinner';
import { useUser } from '../../../context/userContext';
import ListStorage from './ListStorage';
import ListStorageExpirated from './ListStorageExpirated';
const Dashboard = () => {
  const [dataCategory, setDataCategory] = useState([]);
  const [dataCompany, setDataCompany] = useState([]);
  const [dataCompanyCategory, setDataCompanyCategory] = useState([]);
  const [totalStorage, setTotalStorage] = useState(0);
  const [usersTotal, setUsersTotal] = useState(0);
  const [storageToExpire, setStorageToExpire] = useState(0);
  const [categoryTotal, setCategoryTotal] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalStorage, setIsModalStorage] = useState(false);
  const { user } = useUser();

  const getGraficCategory = async () => {
    setIsLoading(true);

    try {
      let company_id = '';
      if (user != null) {
        if (user.Permisology_legal) {
          if (!user.Permisology_legal.can_access_list_all_companys) {
            company_id = user.company_id;
          }
        }
      }
      const responseCategory = await show(
        'legal/getStoragesGraficByCategory/' + company_id,
      );
      setDataCategory({
        labels: responseCategory.labels,
        data: responseCategory.data,
        background: [],
      });
      const responseCompany = await show(
        'legal/getStoragesGraficByCompany/' + company_id,
      );
      setTotalStorage(
        responseCompany.data.reduce(
          (total, currentValue) => total + currentValue,
          0,
        ),
      );
      setUsersTotal(responseCompany.usersTotal);
      setCategoryTotal(responseCompany.categoriesTotal);
      setStorageToExpire(responseCompany.storageToExpire[0]?.qty || 0);

      setDataCompany({
        labels: responseCompany.labels,
        data: responseCompany.data,
        background: responseCompany.background,
      });

      //panel lateral derecho
      const responseCompanyCategory = await show(
        'legal/getStoragesByCompany/' + company_id,
      );
      setDataCompanyCategory(responseCompanyCategory);
    } catch (error) {
      console.error('Error ', error);
    } finally {
      setTimeout(() => {
        setIsLoading(false); // Establece loading a false después de ejecutar la segunda función
      }, 600);
    }
  };

  useEffect(() => {
    if (user != null) getGraficCategory();
  }, [user]);

  const handleCompanySelected = async (company) => {
    setIsLoading(true);
    try {
      setSelectedCompany(company);
      if (company === 0) {
        getGraficCategory();
        return;
      }

      const responseCompany = await show(
        'legal/getStoragesGraficByCompany/' + company,
      );
      setTotalStorage(
        responseCompany.data.reduce(
          (total, currentValue) => total + currentValue,
          0,
        ),
      );
      setUsersTotal(responseCompany.usersTotal);
      setCategoryTotal(responseCompany.categoriesTotal);
      setStorageToExpire(responseCompany.storageToExpire[0]?.qty || 0);

      setDataCompany({
        labels: responseCompany.labels,
        data: responseCompany.data,
        background: responseCompany.background,
      });
      ////////////////----------------------------------------////////////////////
      // aqui se convierte el objeto dataCompanyCategory en array,  el que dibuja la grafica por categorias, se filtra por compañia y luego retornamos los array de key y value de categories.
      const arrayDataCompanyCategory = Object.entries(dataCompanyCategory);
      const filteredArray = arrayDataCompanyCategory.filter(
        ([key, value]) => value.company_id === company,
      );
      const labels = filteredArray
        .map(([key, value]) => Object.keys(value.categories))
        .flat();
      const data = filteredArray
        .map(([key, value]) => Object.values(value.categories))
        .flat();

      setDataCategory({
        labels: labels,
        data: data,
        background: [],
      });
    } catch (error) {
      console.error('error', error);
    } finally {
      setTimeout(() => {
        setIsLoading(false); // Establece loading a false después de ejecutar la segunda función
      }, 600);
    }
  };
  const modalStorageView = async () => {
    setIsModalStorage(true);
  };
  const modalStorageClose = async () => {
    setIsModalStorage(false);
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Dashboard</h1>
      <div className='h-0.5 bg-gradient-to-r to-cyan-500 from-blue-500'></div>
      <div className='md:grid md:grid-cols-4 gap-2'>
        <div className='md:col-span-3'>
          <div className='md:grid md:grid-cols-4 gap-2'>
            <div className='md:col-span-1 bg-white shadow-md sm:rounded-lg p-2 justify-center'>
              <h4 className='text-lg font-semibold mb-2'>Total Archivos</h4>
              <div className='flex items-center justify-center '>
                <div className='flex items-center justify-center bg-blue-500 text-white rounded-full w-16 h-16'>
                  <FaDatabase size={18} />
                  <span className='text-2xl ml-2 flex justify-center items-center'>
                    {totalStorage}
                  </span>
                </div>
              </div>
            </div>

            <div className='md:col-span-1 bg-white shadow-md sm:rounded-lg p-2 justify-center'>
              <h4 className='text-lg font-semibold mb-2'>Total * Categorías</h4>
              <div className='flex items-center justify-center '>
                <div className='flex items-center justify-center bg-cyan-500 text-white rounded-full w-16 h-16'>
                  <FaTags size={18} />
                  <span className='text-2xl ml-2 flex justify-center items-center'>
                    {categoryTotal}
                  </span>
                </div>
              </div>
            </div>

            <div className='md:col-span-1 bg-white shadow-md sm:rounded-lg p-2 justify-center'>
              <h4 className='text-lg font-semibold mb-2'>Total * Usuarios</h4>
              <div className='flex items-center justify-center '>
                <div className='flex items-center justify-center bg-green-500 text-white rounded-full w-16 h-16'>
                  <FaUsers size={18} />
                  <span className='text-2xl ml-2 flex justify-center items-center'>
                    {usersTotal}
                  </span>
                </div>
              </div>
            </div>
            <div
              className='md:col-span-1 bg-white shadow-md sm:rounded-lg p-2 justify-center cursor-pointer'
              onClick={modalStorageView}
            >
              <h4 className='text-lg font-semibold mb-2'>Por Expirar</h4>
              <div className='flex items-center justify-center '>
                <div className='flex items-center justify-center bg-red-500 text-white rounded-full w-16 h-16'>
                  <FaClock size={18} />
                  <span className='text-2xl ml-2 flex justify-center items-center'>
                    {storageToExpire}
                  </span>
                </div>
              </div>
            </div>
            <div className='md:col-span-4'>
              <div className='md:grid md:grid-cols-4 gap-2'>
                <div className='md:col-span-2 bg-white shadow-md sm:rounded-lg p-2 justify-center h-auto'>
                  <h2 className='text-lg font-semibold mb-2'>
                    Archivos por Categoría
                  </h2>
                  <ChartBar
                    labels={dataCategory.labels}
                    data={dataCategory.data}
                  />
                </div>

                <div className='md:col-span-2 bg-white shadow-md sm:rounded-lg p-2 justify-center'>
                  <h2 className='text-lg font-semibold mb-2'>
                    Archivos por Empresa
                  </h2>
                  <ChartBar
                    labels={dataCompany.labels}
                    data={dataCompany.data}
                    background={dataCompany.background}
                  />
                </div>
              </div>
            </div>
            <div className='md:col-span-4'>
              <div className='md:grid md:grid-cols-1 gap-2'>
                <div className='w-full bg-white shadow-md sm:rounded-lg p-2 justify-center h-auto'>
                  <h2 className='text-lg font-semibold mb-2'>Lista de Archivos</h2>
                  <ListStorage company_id={selectedCompany} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Información de archivos subidos por categorías */}
        <div className='md:col-span-1'>
          <div
            className='mb-4 border-2 pb-2 p-1 rounded-md shadow-md cursor-pointer'
            onClick={() => handleCompanySelected(0)}
          >
            <div className='flex items-center bg-gradient-to-r to-cyan-500 from-blue-500 p-2 rounded-md'>
              <div className='h-2 w-2 mr-2 rounded-full bg-white'></div>
              <p className='text-sm font-semibold text-white'>
                Resumen General
              </p>
            </div>
          </div>
          {/* Información de la empresa */}
          {Object.keys(dataCompanyCategory).map((company) => (
            <div
              key={company}
              className='mb-4 border-2 pb-2 p-1 rounded-md shadow-md cursor-pointer'
              onClick={() =>
                handleCompanySelected(dataCompanyCategory[company].company_id)
              }
            >
              <div
                className='flex items-center bg-gray-100 p-2 rounded-md'
                style={{
                  backgroundColor: `#${dataCompanyCategory[company].color_corporate}`,
                }}
              >
                <div className='h-2 w-2 mr-2 rounded-full bg-white'></div>
                <p className='text-sm font-semibold text-white'>{company}</p>
              </div>
              <ul className='list-disc list-inside mt-2'>
                {Object.keys(dataCompanyCategory[company].categories).map(
                  (category) => (
                    <li
                      key={category}
                      className='flex justify-between text-sm font-semibold mb-2'
                    >
                      {category}
                      <span>
                        {dataCompanyCategory[company].categories[category]}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {isLoading ? <Spinner /> : ''}
      {isModalStorage && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center '>
          <div className='bg-white p-6 rounded shadow-lg w-1/2'>
            <div className='top-0 right-0'>
              <button
                onClick={modalStorageClose}
                className='text-gray-600 hover:text-gray-800 focus:outline-none'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
            <div className='md:col-span-4'>
              <div className='md:grid md:grid-cols-1 gap-2'>
                <div className='w-full bg-white shadow-md sm:rounded-lg p-2 justify-center h-auto'>
                  <h2 className='text-lg font-semibold mb-2'>
                    Lista Storages por expirar
                  </h2>
                  <ListStorageExpirated company_id={selectedCompany} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
