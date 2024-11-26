import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { getData, postData, putData } from '../../api';
import { FaFilter, FaPlusCircle, FaMinusCircle } from 'react-icons/fa';
import Spinner from '../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import Breadcrumbs from '../../components/Breadcrumbs';
import Modal from './modal';
import { useNavigate } from 'react-router-dom';
const Clients = () => {
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [title, setTitle] = useState('');
  const id = useRef('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null); //seleccion del registro unico
  const [tableTopPosition, setTableTopPosition] = useState(0);
  const [photo, setPhoto] = useState('');
  const [selectedRows, setSelectedRows] = useState([]); //los checkbox
  const [isLoading, setIsLoading] = useState(true);

  const navigateTo = useNavigate();

  useEffect(() => {
    const table = document.querySelector('.table-container'); // Clase de contenedor de la tabla
    if (table) {
      const rect = table.getBoundingClientRect();
      setTableTopPosition(rect.top);
    }
  }, []);

  const getRows = async () => {
    try {
      setIsLoading(true);
      const response = await getData(
        `clients?page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
      );
      console.log(response);
      const { data, meta } = response;

      setRows(data);
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error('Error ', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      getRows();
    } catch (error) {
      console.log('error =>', error);
    } finally {
    }
  }, [currentPage, pageSize, searchTerm]);

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reiniciar a la primera página al cambiar el término de búsqueda
  };

  const handleChange = (event) => {
    const { id, value, type, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };
  const handleSubmit = async () => {
    const dataToSend = { ...formData };
    try {
      let response = '';
      let bandera = false;

      if (id.current == 0) {
        bandera = await verifyPermisology(
          'can_create_category',
          user,
          'No tiene permiso de crear categoría',
        );
        if (!bandera) {
          return;
        }
        response = await postData('assets/category', dataToSend);
      } else {
        bandera = await verifyPermisology(
          'can_update_category',
          user,
          'No tiene permiso de actualizar categoría',
        );
        if (!bandera) {
          return;
        }
        response = await putData('assets/category/' + id.current, dataToSend);
      }
      getRows();
      closeModal();
    } catch (error) {
      console.error('Error a registrar:', error);
    }
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

  const handleRowClick = (rowData, event) => {
    setSelectedRow(rowData);
  };

  const handleClosePanel = () => {
    setSelectedRow(false);
  };
  const handleViewClient = (clientId) => {
    navigateTo(`/client/${clientId}`);
  };

  const handleFormClient = () => {
    navigateTo('/client');
  };

  const handleSelectRow = (rowId) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(rowId)) {
        return prevSelectedRows.filter((id) => id !== rowId);
      } else {
        return [...prevSelectedRows, rowId];
      }
    });
  };
  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value)); // Actualiza el tamaño de la página
    setCurrentPage(1); // Reinicia a la primera página
  };
  return (
    <div className='max-w-full mx-auto'>
      <Breadcrumbs
        items={[
          { label: 'Inicio', route: '/' },
          { label: 'Clientes', route: '/Clients' },
        ]}
      />
      <div className='max-w-full mx-auto bg-content shadow-md overflow-hidden sm:rounded-lg border-t-2 border-gray-400'>
        <div className='flex justify-between px-4 py-5 sm:px-6'>
          <div>
            <h3 className='text-lg font-semibold leading-6 text-gray-900'>
              Lista de Clientes
            </h3>
            <p className='mt-1 max-w-2xl text-sm text-gray-500'>
              Gestion de clientes.
            </p>
          </div>
          <div className='flex space-x-2'>
            <select
              className='border rounded h-10 px-2'
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <button
              className='bg-primary text-lg text-textWhite font-bold py-2 px-3 rounded h-10'
              onClick={handleFormClient}
            >
              <FaPlusCircle className='text-lg' />
            </button>
            <button
              className={`bg-red-500 hover:bg-red-700 text-sm text-white font-bold py-2 px-3 rounded h-10 ${
                selectedRows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={selectedRows.length === 0}
            >
              <FaMinusCircle className='text-lg' />
            </button>
            <button className='bg-secondary text-lg text-textWhite font-bold py-1 px-3 rounded h-10'>
              <FaFilter className='text-lg' />
            </button>
          </div>
        </div>
        <div className='border-t border-gray-200 overflow-x-auto table-responsive'>
          <table className='w-full divide-y divide-tableHeader mb-4 table-container2'>
            <thead className='bg-tableHeader'>
              <tr>
                <th></th>
                <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                  ID
                </th>
                <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                  DNI
                </th>
                <th className='px-2 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                  Nombre completo
                </th>
                <th className='px-2 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                  Correo electrónico
                </th>
                <th className='px-2 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                  Teléfono
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 &&
                rows.map((row) => (
                  <tr
                    onMouseEnter={(e) =>
                      (e.target.parentNode.style.backgroundColor = '#F3F4F6')
                    }
                    onMouseLeave={(e) =>
                      (e.target.parentNode.style.backgroundColor = 'inherit')
                    }
                    onClick={(e) => handleRowClick(row, e)}
                    onDoubleClick={() => handleViewClient(row.id)}
                    style={{
                      cursor: 'pointer',
                      borderBottom: '1px solid #ccc',
                    }}
                  >
                    <td className='text-center'>
                      <input
                        type='checkbox'
                        id='selectrow'
                        name='selectrow'
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                      />
                    </td>
                    <td className='px-3'>
                      <label className='text-primary'>{row.id}</label>
                    </td>
                    <td className='px-3'>
                      <label className='text-primary'>{row.dni}</label>
                    </td>
                    <td className='max-w-xs truncate px-2'>{row.full_name}</td>
                    <td className='max-w-xs truncate px-2'>{row.email}</td>
                    <td className='max-w-xs truncate px-2'>{row.phone}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      </div>
      {/* Modal */}
      {selectedRow && (
        <div
          className='fixed bg-panel border-2 border-gray-300 shadow-lg w-96 mb-6'
          style={{
            top: `${tableTopPosition}px`,
            right: 0,
          }}
        >
          <div className='bg-primary w-full h-full p-2'>
            <label className='text-white pt-2'>{selectedRow.full_name}</label>
            <button
              className='absolute top-2 right-2 text-white hover:text-gray-700'
              onClick={handleClosePanel}
            >
              <svg
                className='w-6 h-6'
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

          <div className='border-2 border-white w-full'></div>
          <div
            className='overflow-y-auto'
            style={{
              top: `${tableTopPosition}px`,
              right: 0,
              maxHeight: `calc(100vh - ${tableTopPosition + 50}px)`,
            }}
          >
            <h2 className='text-center'>
              <strong>Datos Personales</strong>
            </h2>
            <p className='text-sm p-1'>
              <strong>DNI:</strong> {selectedRow.dni}
            </p>
            <p className='text-sm p-1'>
              <strong>Email:</strong> {selectedRow.email}
            </p>
            <p className='text-sm p-1'>
              <strong>Teléfono:</strong> {selectedRow.phone}
            </p>
            <div className='border-2 border-gray-200 w-full mt-6'></div>
            <h2 className='text-center'>
              <strong>Dirección</strong>
            </h2>
            <p className='text-sm p-1'>
              <strong>Codigo postal:</strong> {selectedRow.cod_post?.name}
            </p>
            <p className='text-sm p-1'>
              <strong>Estado:</strong> {selectedRow.cod_post?.state?.name}
            </p>
            <p className='text-sm p-1'>
              <strong>Pais:</strong>{' '}
              {selectedRow.cod_post?.state?.country?.name}
            </p>
            <div className='border-2 border-gray-200 w-full mt-6'></div>
            <h2 className='text-center'>
              <strong>Patologias</strong>
            </h2>

            {selectedRow.clients_patologies.length > 0 &&
              selectedRow.clients_patologies
                .slice() // Clonamos el array para evitar modificar el original
                .filter(
                  (patology) => patology.patology && patology.patology.name,
                ) // Filtrar aquellos que tengan patología y nombre
                .sort((a, b) => a.patology.name.localeCompare(b.patology.name)) // Ordenar por nombre de patología
                .map((patology) => (
                  <li className='p-1' key={patology.id}>
                    {patology.patology.name}
                  </li>
                ))}
            <div className='border-2 border-gray-200 w-full mt-6'></div>
            <h2 className='text-center'>
              <strong>Recomendaciones </strong>
            </h2>
            <p className='text-sm p-1'>
              <div
                dangerouslySetInnerHTML={{
                  __html: selectedRow.recommendations,
                }}
              />
            </p>
          </div>
        </div>
      )}
      {isLoading && <Spinner />}
    </div>
  );
};

export default Clients;
