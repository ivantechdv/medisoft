import React, { useEffect, useState, useRef } from 'react';
import { getData, postData, putData } from '../../api';
import { FaFilter, FaPlusCircle } from 'react-icons/fa';
import ToastNotify from '../../components/toaster/toaster';
import Spinner from '../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import Breadcrumbs from '../../components/Breadcrumbs';
import Modal from './modal';
import General from './tabs/general';
import Specific from './tabs/specific';
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
  const [selectedRow, setSelectedRow] = useState(null);
  const [tableTopPosition, setTableTopPosition] = useState(0);
  const [activeTab, setActiveTab] = useState('general');
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
      ToastNotify({
        message: response.message,
        position: 'top-center',
      });
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

      ToastNotify({
        message: response.message,
        position: 'top-right',
      });
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
    <div className='max-w-full mx-auto '>
      <Breadcrumbs
        items={[
          { label: 'Inicio', route: '/' },
          { label: 'Clientes', route: '/Clients' },
          { label: 'Ivan Rojas', route: '/Client/1' },
        ]}
      />
      <div className='max-w-full mx-auto bg-content shadow-md  sm:rounded-lg border-t-2 border-gray-400 flex h-screen h-auto'>
        <div className='w-64 border-r-2 border-gray-200 p-4'>
          {/* Contenido del lado izquierdo */}
          izquierdo
        </div>
        <div className='flex-1'>
          {/* Contenido del lado derecho */}
          <div className='flex justify-between'>
            <div className='flex-1'>
              {/* Contenido del lado derecho */}
              <div className='mb-4 border-b-2 border-gray-400 p-2'>
                {/* Pestañas */}
                <button
                  className={`tab ml-4 mr-4 pr-4 border-r-2 ${
                    activeTab === 'general' ? 'text-primary' : ''
                  }`}
                  onClick={() => setActiveTab('general')}
                >
                  General
                </button>
                <button
                  className={`tab mr-4 pr-4  border-r-2 ${
                    activeTab === 'especifico' ? 'text-primary' : ''
                  }`}
                  onClick={() => setActiveTab('especifico')}
                >
                  Especifico
                </button>
                <button
                  className={`tab mr-4 pr-4 border-r-2 ${
                    activeTab === 'servicios' ? 'text-primary' : ''
                  }`}
                  onClick={() => setActiveTab('servicios')}
                >
                  Servicios
                </button>
                <button
                  className={`tab ${
                    activeTab === 'seguimientos' ? 'text-primary' : ''
                  }`}
                  onClick={() => setActiveTab('seguimientos')}
                >
                  Seguimientos
                </button>
              </div>
              <div className='p-2 ml-4'>
                {/* Contenido de la pestaña seleccionada */}
                {activeTab === 'general' && (
                  <div>
                    {/* Contenido de la pestaña General */}
                    <General />
                  </div>
                )}
                {activeTab === 'especifico' && (
                  <div>
                    {/* Contenido de la pestaña Especifico */}
                    <Specific />
                  </div>
                )}
                {activeTab === 'servicios' && (
                  <div>
                    {/* Contenido de la pestaña Servicios */}
                    Servicios
                  </div>
                )}
                {activeTab === 'seguimientos' && (
                  <div>
                    {/* Contenido de la pestaña Seguimientos */}
                    Seguimientos
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;
