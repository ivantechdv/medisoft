import { Link, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { show } from '../../../api';
import './index.css';
import ToastNotify from '../../../components/toaster/toaster';
import Stepper from '../../../components/stepper/stepper';
function AssetList() {
  const [AssetList, setAssetList] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchGetAssets() {
      const response = await show(
        `assets/getAssets?page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
      );

      const { data, meta } = response;
      console.log(response);
      setAssetList(data);
      // ...
    }
    fetchGetAssets();
  }, [currentPage, pageSize, searchTerm]);

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reiniciar a la primera página al cambiar el término de búsqueda
  };
  const renderPagination = () => {
    return (
      <div className='flex justify-center mt-4'>
        <button
          className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <HiChevronDoubleLeft />
        </button>
        <span className='mx-4'>{currentPage}</span>
        <button
          className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <HiChevronDoubleRight />
        </button>
      </div>
    );
  };
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  return (
    <>
      <div className='max-w-6xl mx-auto p-6'>
        <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
          <Stepper
            currentStep={1}
            totalSteps={1}
            stepTexts={['Lista de activos']}
          />
          <form className='w-full max-w-full p-6 border'>
            <div className='w-full max-w-full  overflow-auto'>
              {AssetList.map((asset) => (
                <Link to={`/assets/edit/${asset.id}`}>
                  <div
                    key={asset.id}
                    className='w-full max-w-full p-2 border mt-2 sm:rounded-lg'
                  >
                    {/* Primera fila */}
                    <div className='flex justify-between items-center gap-2 mt-2'>
                      <div className='flex'>
                        <label className='block text-sm font-medium text-gray-700'>
                          ID #{asset.id}
                        </label>
                      </div>
                      <div className='flex'>
                        <label className='block text-sm font-medium text-gray-700'>
                          Costo neto: {asset.cost_net || 0.0}
                        </label>
                      </div>
                      <div className='flex'>
                        <label className='block text-sm font-medium text-gray-700'>
                          Costo referencial: {asset.cost_reference || 0.0}
                        </label>
                      </div>
                      <div className='flex'>
                        <label className='block text-sm font-medium text-gray-700'>
                          Condición: {asset.condition}
                        </label>
                      </div>
                    </div>
                    <div className='h-0.5 bg-gradient-to-r to-cyan-500 from-blue-500'></div>
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2'>
                      <div>
                        <p className='font-bold'>Codigo</p>
                        <p>{asset.code}</p>
                      </div>
                      <div>
                        <p className='font-bold'>Nombre:</p>
                        <p>{asset.name}</p>
                      </div>
                      <div>
                        <p className='font-bold'>Serial</p>
                        <p>{asset.serial}</p>
                      </div>
                      <div>
                        <p className='font-bold'>Empresa Propietaria</p>
                        <p>{asset.company_owner.company}</p>
                      </div>
                      <div>
                        <p className='font-bold'>Linea de Servicio</p>
                        <p>{asset.service_line.name}</p>
                      </div>
                      <div>
                        <p className='font-bold'>Facilidad:</p>
                        <p>{asset.facility.name}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
export default AssetList;
