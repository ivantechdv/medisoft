import React, { useEffect, useState, useRef } from 'react';
import { getData, postData, putData } from '../../api';
import { FaFilter, FaPlusCircle } from 'react-icons/fa';
import Spinner from '../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import Breadcrumbs from '../../components/Breadcrumbs';
import Modal from './modal';
const Users = () => {
  const initialValues = {
    name: '',
    type: '',
  };
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [title, setTitle] = useState('');
  const [formData, setFormData] = useState(initialValues);
  const id = useRef('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [tableTopPosition, setTableTopPosition] = useState(0);

  useEffect(() => {
    const table = document.querySelector('.table-container'); // Clase de contenedor de la tabla
    if (table) {
      const rect = table.getBoundingClientRect();
      setTableTopPosition(rect.top);
    }
  }, []);

  const getRows = async () => {
    try {
      const response = await getData(
        `assets/getCategories?page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
      );

      const { data, meta } = response;

      setRows(data);
      setOriginalRows(data);
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error('Error ', error);
    }
  };

  useEffect(() => {
    //getRows();
  }, [currentPage, pageSize, searchTerm]);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reiniciar a la primera página al cambiar el término de búsqueda
  };

  const openModal = async (row, sub) => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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

  const handleChangeStatu = async (id, origin) => {
    const bandera = await verifyPermisology(
      'can_change_statu_category',
      user,
      'No tiene permiso de cambiar el estatus',
    );
    if (!bandera) {
      return;
    }
    const dataToSend = { ...formData };
    const response = await putData('assets/category/updateStatu/' + id);
    if (response) {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, statu: !row.statu } : row,
        ),
      );
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
  return (
    <div className='max-w-full mx-auto'>
      <Breadcrumbs
        items={[
          { label: 'Inicio', route: '/' },
          { label: 'Usuarios', route: '/users' },
        ]}
      />
      <div className='max-w-full mx-auto bg-white shadow-md overflow-hidden sm:rounded-lg border-t-2 border-gray-400'>
        <div className='flex justify-between px-4 py-5 sm:px-6'>
          <div>
            <h3 className='text-lg font-semibold leading-6 text-gray-900'>
              Lista de Usuarios
            </h3>
            <p className='mt-1 max-w-2xl text-sm text-gray-500'>
              Gestion de usuarios.
            </p>
          </div>
          <div className='flex space-x-2'>
            <button
              className='bg-blue-500 hover:bg-blue-700 text-sm text-white font-bold py-1 px-3 rounded h-10'
              onClick={openModal}
            >
              <FaPlusCircle />
            </button>
            {/* <button className="bg-green-500 hover:bg-green-700 text-sm text-white font-bold py-1 px-3 rounded h-10">
            <FaRegEdit />
          </button> */}
            <button className='bg-gray-500 hover:bg-gray-700 text-sm text-white font-bold py-1 px-3 rounded h-10'>
              <FaFilter />
            </button>
          </div>
        </div>
        <div className='border-t border-gray-200 overflow-x-auto table-responsive'>
          <table className='w-full divide-y divide-gray-200 mb-4 table-container'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  DNI
                </th>
                <th className='px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Nombre completo
                </th>
                <th className='px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Correo electrónico
                </th>
                <th className='px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Teléfono
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                onMouseEnter={(e) =>
                  (e.target.parentNode.style.backgroundColor = '#F3F4F6')
                }
                onMouseLeave={(e) =>
                  (e.target.parentNode.style.backgroundColor = 'inherit')
                }
                onClick={(e) =>
                  handleRowClick(
                    {
                      dni: '18.229.563',
                      fullName: 'Ivan de Jesus Rojas Veliz',
                      email: 'ing.ivanrojas@gmail.com',
                      phone: '+58 4121809294',
                    },
                    e,
                  )
                }
                onDoubleClick={handleClosePanel}
                style={{ cursor: 'pointer' }}
              >
                <td className='px-3'>18.229.563</td>
                <td className='max-w-xs truncate px-2'>
                  Ivan de Jesus Rojas Veliz
                </td>
                <td className='max-w-xs truncate px-2'>
                  ing.ivanrojas@gmail.com
                </td>
                <td className='max-w-xs truncate px-2'>+58 4121809294</td>
              </tr>
            </tbody>
            <tbody className='bg-white divide-y divide-gray-200'>
              {/* Aquí irían tus filas de la tabla */}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal */}
      {selectedRow && (
        <div
          className='fixed bg-white border-2 border-gray-300 overflow-y-auto p-4 shadow-lg'
          style={{ top: `${tableTopPosition}px`, right: 0, height: '100vh' }}
        >
          <button
            className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
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
          <div className='border-2 border-gray-200 w-full mt-6'></div>
          <h2>Detalles del Registro</h2>
          <p>
            <strong>DNI:</strong> {selectedRow.dni}
          </p>
          <p>
            <strong>Nombre completo:</strong> {selectedRow.fullName}
          </p>
          <p>
            <strong>Correo electrónico:</strong> {selectedRow.email}
          </p>
          <p>
            <strong>Teléfono:</strong> {selectedRow.phone}
          </p>
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default Users;
