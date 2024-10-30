import React, { useEffect, useState, useRef } from 'react';
import { getData, postData, putData } from '../../api';
import { FaFilter, FaPlusCircle, FaMinusCircle } from 'react-icons/fa';
import Spinner from '../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import Breadcrumbs from '../../components/Breadcrumbs';
import Modal from './modal';
import { useParams, useLocation } from 'react-router-dom';

const Patologies = () => {
  const initialValues = {
    name: '',
  };
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [title, setTitle] = useState('');
  const [formData, setFormData] = useState(initialValues);
  const { id } = useParams();
  const [selectedRows, setSelectedRows] = useState([]); //los checkbox

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [tableTopPosition, setTableTopPosition] = useState(0);
  const [loading, setLoading] = useState(false);

  const idRef = useRef('');
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
        `patologies?page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
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
    getRows();
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
    idRef.current = '';
    setFormData(initialValues);
  };

  const closeModal = (update = null) => {
    setIsModalOpen(false);
    setFormData(initialValues);
    if (update) {
      getRows();
    }
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
  const handleEdit = (rowData, event) => {
    console.log('data', rowData);
    idRef.current = rowData.id;
    setFormData(rowData);
    setIsModalOpen(true);
  };

  const handleClosePanel = () => {
    setSelectedRow(false);
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

  const toggleSwitch = async (id) => {
    try {
      const rowToUpdate = rows.find((row) => row.id === id);
      const updatedRow = { ...rowToUpdate, is_active: !rowToUpdate.is_active };

      // Llamada a la API para actualizar el estado
      await putData(`patologies/${id}`, { is_active: updatedRow.is_active });

      // Actualiza el estado local con el nuevo valor
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === id ? updatedRow : row)),
      );
    } catch (error) {
      console.error('Error al actualizar estado: ', error);
    }
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
          { label: 'Usuarios', route: '/users' },
        ]}
      />
      <div className='max-w-full mx-auto bg-white shadow-md overflow-hidden sm:rounded-lg border-t-2 border-gray-400'>
        <div className='flex justify-between px-4 py-5 sm:px-6'>
          <div>
            <h3 className='text-lg font-semibold leading-6 text-gray-900'>
              Lista de Patologias
            </h3>
            <p className='mt-1 max-w-2xl text-sm text-gray-500'>
              Gestiones sus patologias
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
              className='bg-primary hover:bg-blue-700 text-sm text-white font-bold py-1 px-3 rounded h-10'
              onClick={openModal}
            >
              <FaPlusCircle />
            </button>
            <button
              className={`bg-red-500 hover:bg-red-700 text-sm text-white font-bold py-2 px-3 rounded h-10 ${
                selectedRows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={selectedRows.length === 0}
            >
              <FaMinusCircle className='text-lg' />
            </button>
            <button className='bg-gray-500 hover:bg-gray-700 text-sm text-white font-bold py-1 px-3 rounded h-10'>
              <FaFilter />
            </button>
          </div>
        </div>
        <div className='border-t border-gray-200 overflow-x-auto table-responsive'>
          <table
            className='w-full divide-y divide-gray-200 mb-4 table-container2'
            style={{ tableLayout: 'fixed' }}
          >
            <thead className='bg-gray-50'>
              <tr>
                <th className='w-1/6'></th>
                <th className='w-2/4 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  ID
                </th>
                <th className='w-2/4 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Nombre
                </th>
                <th className='w-2/4 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 &&
                rows.map((row) => (
                  <tr
                    key={row.id}
                    onMouseEnter={(e) =>
                      (e.target.parentNode.style.backgroundColor = '#F3F4F6')
                    }
                    onMouseLeave={(e) =>
                      (e.target.parentNode.style.backgroundColor = 'inherit')
                    }
                    onDoubleClick={(e) => handleEdit(row, e)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className='text-center w-1/4'>
                      <div onClick={(e) => e.stopPropagation()}>
                        <input
                          type='checkbox'
                          id={`selectrow-${row.id}`}
                          name='selectrow'
                          checked={selectedRows.includes(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                        />
                      </div>
                    </td>
                    <td className='px-3 w-1/4'>{row.id}</td>
                    <td className='max-w-xs truncate px-2 w-1/4'>{row.name}</td>
                    <td>
                      <button
                        type='button'
                        className={`relative inline-flex items-center h-6 rounded-full w-12 mr-2 z-20 ${
                          row.is_active ? 'bg-primary' : 'bg-gray-300'
                        }`}
                        onClick={() => toggleSwitch(row.id)}
                      >
                        <span
                          className={`inline-block w-6 h-6 transform rounded-full bg-white shadow-md transition-transform ${
                            row.is_active ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <label className='ml-2'>
                        {row.is_active ? 'Activo' : 'Inactivo'}
                      </label>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      </div>
      {/* Modal */}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        id={idRef.current}
        row={formData}
      />
      {loading && <Spinner />}
    </div>
  );
};

export default Patologies;
