import './companies.css';
import { show } from '../../../api';
import { Link, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import ToastNotify from '../../../components/toaster/toaster';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi";
import { BiSolidShow } from "react-icons/bi";
import { MdOutlineEditNote } from "react-icons/md";

function CompaniesIndex() {
  const [companies, setCompanies] = useState([]);
  const [originalCompanies, setOriginalCompanies] = useState([]);
  const [loader, setLoader] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Número de usuarios por página
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchStatus, setSearchStatus] = useState('');

  useEffect(() => {
    async function getAllCompanies() {
      try {
        const response = await show(
          `companies/getAllCompanies?page=${currentPage}&pageSize=${pageSize}&company_name=${searchTerm}&company_status=${searchStatus}`,
        );
        if (response && response.data && response.meta) {
          const { data, meta } = response;
          setCompanies(data);
          setOriginalCompanies(data);
          setTotalPages(meta.totalPages);
          setLoader(false);
        } else {
          console.error(
            'La respuesta no tiene la estructura esperada:',
            response,
          );
          setLoader(false);
        }
      } catch (error) {
        console.error('Error al obtener la lista de entidades', error);
        setLoader(false);
      }
    }
    getAllCompanies();
  }, [currentPage, pageSize, searchTerm, searchStatus]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (event) => {
    setSearchStatus(event.target.value);
    setCurrentPage(1);
  };

  const renderPagination = () => {
    return (
      <div className='flex justify-center mt-4'>
        <button
          className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <HiChevronDoubleLeft />
        </button>
        <span className='mx-4'>{currentPage}</span>
        <button
          className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <HiChevronDoubleRight />
        </button>
      </div>
    );
  };

  const renderTable = () => {
    return (
      <>
        <div className='max-w-6xl p-4 mt-6 text-sm'>
          <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
            <div className='flex w-full mb-4 space-x-4'>
              <div className='flex-2'>
                <label className='block text-sm font-medium text-gray-600'>
                  Nombre de la empresa:
                </label>
                <input
                  type='text'
                  placeholder='Buscar por nombre'
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                  className='p-2 border rounded bg-gray-200 text-bold'
                />
              </div>

              <div className='flex-2'>
                <label className='block text-sm font-medium text-gray-600'>
                  Status:
                </label>
                <select
                  value={searchStatus}
                  onChange={handleStatusChange}
                  className='p-2 border rounded bg-gray-200 text-bold ml-2'
                >
                  <option value=''>Todos</option>
                  <option value='1'>Activa</option>
                  <option value='0'>Inactiva</option>
                </select>
              </div>
            </div>
            <div className='mb-4 overflow-x-auto  bg-gray-50 p-2 text-sm'>
              <table className='w-[98%] bg-white border border-gray-300 '>
                <thead>
                  <tr className='bg-gray-800 text-gray-100'>
                    <th className='border border-gray-300 p-2'>ID</th>
                    <th className='border border-gray-300 p-2'>Entidad</th>
                    <th className='border border-gray-300 p-2'>RIF</th>
                    <th className='border border-gray-300 p-2'>Estado</th>
                    <th className='border border-gray-300 p-2'>Sitio Web</th>
                    <th className='border border-gray-300 p-2'>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id} className='bg-white hover:bg-slate-500 hover:text-white dark:hover:bg-gray-600 text-sm'>
                      <td className='border border-gray-300 p-2 text-center'>
                        {company.id}
                      </td>
                      <td className='border border-gray-300 p-2 text-center'>
                        {company.company}
                      </td>
                      <td className='border border-gray-300 p-2 text-center'>
                        {company.rif}
                      </td>
                      <td className='border border-gray-300 p-2 text-center'>
                        {company.statu === 1
                          ? 'Activa'
                          : company.statu === 0
                          ? 'Inactiva'
                          : 'N/A'}
                      </td>
                      <td className='border border-gray-300 p-2 text-center'>
                        {company.website}
                      </td>
                      <td className='border border-gray-300 p-2 flex-center'>
                        <Link
                          to={`/configs/companies/CompaniesView/${company.id}`}
                        >
                          <button
                            type='button'
                            className=' hover:text-white text-black text-left text-lg'
                          >
                            <BiSolidShow />
                          </button>
                        </Link>
                        <Link
                          to={`/configs/companies/CompaniesUpdate/${company.id}`}
                        >
                          <button
                            type='button'
                            className='hover:text-white text-black  ml-4 text-lg'
                          >
                            <MdOutlineEditNote />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination()}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {loader ? (
        <div className='text-center'>
          <div className='loader mx-auto'></div>
        </div>
      ) : (
        renderTable()
      )}
    </>
  );
}

export default CompaniesIndex;
