import React, { useEffect, useState, useRef } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Stepper from '../../components/stepper/stepper';
import { show, postWithData, putWithData } from '../../api';
import { FaFileUpload, FaEdit, FaExchangeAlt } from 'react-icons/fa';
import ToastNotify from '../../components/toaster/toaster';
import Spinner from '../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';

const Users = () => {
  const navigateTo = useNavigate();
  const loadPermisology = useRef(false);


  const initialValues = {
    name: '',
    type: '',
  };
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [displayedElements, setDisplayedElements] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [elementsNow, setElementsNow] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialValues);
  const isDesktop = window.innerWidth > 768;
  const id = useRef('');
  const getRows = async () => {
    try {
      const response = await show(
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
    let bandera = false;
    if (row == 'add') {      
      setFormData(initialValues);
      setTitle('Registrar categoría');
      setIsModalOpen(true);
      id.current = 0;
    } else {     
      setFormData({
        ['name']: row.name,
        ['code']: row.code,
      });
      id.current = row.id;
      setTitle('Actualizar categoría');
      setIsModalOpen(true);
    }
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
        response = await postWithData('assets/category', dataToSend);
      } else {
        bandera = await verifyPermisology(
          'can_update_category',
          user,
          'No tiene permiso de actualizar categoría',
        );
        if (!bandera) {
          return;
        }
        response = await putWithData(
          'assets/category/' + id.current,
          dataToSend,
        );
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
    const response = await putWithData('assets/category/updateStatu/' + id);
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


  return (
    <div className='max-w-6xl mx-auto p-6'>
      <div className='bg-white border rounded shadow'>
        <Stepper
          currentStep={1}
          totalSteps={2}
          stepTexts={['Categorías de activo', 'prueba']}
        />
        <div className='mb-4 overflow-x-auto  bg-gray-50 p-2'>
          <div className='flex'>
            <input
              type='text'
              placeholder='Busqueda'
              value={searchTerm}
              onChange={handleSearchTermChange}
              className='mt-1 p-1 md:w-1/2 w-full border rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            />
            <button
              className='bg-gray-700 hover:bg-gray-900 text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm '
              onClick={() => openModal('add')}
            >
              Nuevo
            </button>
          </div>
          <div class="relative flex flex-col text-gray-700 bg-white shadow-md w-full rounded-xl bg-clip-border mt-2">
  <nav class="flex flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">
    <div class="flex items-center w-full p-2 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 md:flex-row">
      <div class="grid mr-4 place-items-center">
        <img alt="candice" src="https://docs.material-tailwind.com/img/face-1.jpg" class="relative inline-block h-12 w-12 !rounded-full object-cover object-center" />
      </div>
      <div class="flex-1 md:flex md:items-center">
        <div class="flex-1 mb-2 md:mb-0 md:mr-2">
          <h6 class="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
            Tania Andrew
          </h6>
          <p class="block font-sans text-sm antialiased font-normal leading-normal text-gray-700">
          ing.ivanrojas@gmail.com
        </p>
        </div>
        
        <div class="flex-1 mb-2 md:mb-0 md:mr-2">
          <h6 class="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
            18229563
          </h6>
        </div>
        
        <div class="flex-1 mb-2 md:mb-0">
          <h6 class="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
            04121809294
          </h6>
        </div>
      </div>
    </div>
  </nav>
</div>
<div class="relative flex flex-col text-gray-700 bg-white shadow-md w-full rounded-xl bg-clip-border mt-2">
  <nav class="flex flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">
    <div class="flex items-center w-full p-2 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 md:flex-row">
      <div class="grid mr-4 place-items-center">
        <img alt="candice" src="https://docs.material-tailwind.com/img/face-1.jpg" class="relative inline-block h-12 w-12 !rounded-full object-cover object-center" />
      </div>
      <div class="flex-1 md:flex md:items-center">
        <div class="flex-1 mb-2 md:mb-0 md:mr-2">
          <h6 class="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
           Ivan de Jesus Rojas Veliz
          </h6>
          <p class="block font-sans text-sm antialiased font-normal leading-normal text-gray-700">
          ing.ivanrojas@gmail.com
        </p>
        </div>
        
        <div class="flex-1 mb-2 md:mb-0 md:mr-2">
          <h6 class="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
            18229563
          </h6>
        </div>
        
        <div class="flex-1 mb-2 md:mb-0">
          <h6 class="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
            04121809294
          </h6>
        </div>
      </div>
      
    </div>
  </nav>
</div>



          {renderPagination()}
        </div>
      </div>
      {isModalOpen && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center'>
          <div className='bg-white p-6 rounded shadow-lg w-1/2'>
            <Stepper currentStep={1} totalSteps={1} stepTexts={[title]} />
            {/* Formulario para el nuevo elemento */}
            <form className='w-full max-w-full p-6 border'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                {/* Columna 1 */}
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Código
                  </label>
                  <input
                    type='text'
                    name='code'
                    id='code'
                    className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                    value={formData.code}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Categoría
                  </label>
                  <input
                    type='text'
                    name='name'
                    id='name'
                    className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className='flex justify-between mt-10'>
                <button
                  className='py-2 px-4 text-sm bg-gray-500 text-white cursor-pointer rounded'
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type='button'
                  className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                  onClick={handleSubmit}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
