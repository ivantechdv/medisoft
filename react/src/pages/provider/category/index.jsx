import React, { useEffect, useState, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Stepper from '../../../components/stepper/stepper';
import { show, postWithData, putWithData } from '../../../api';
import { FaPlusCircle, FaEdit, FaMinusCircle } from 'react-icons/fa';
import ToastNotify from '../../../components/toaster/toaster';
import Spinner from '../../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { useUser } from '../../../context/userContext';
const Categories = () => {
  const initialValues = {
    name: '',
    code: '',
    offer: '',
    description: '',
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
  const [isLoading, setIsLoading] = useState(false);
  const id = useRef('');
  const { user } = useUser();
  const [enabledBtnNew, setEnabledBtnNew] = useState(true);
  const [enabledBtnEdit, setEnabledBtnEdit] = useState(true);
  const getRows = async () => {
    try {
      const response = await show(
        `providers/categories?page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
      );

      const { data, meta } = response;

      setRows(data);
      setOriginalRows(data);
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error('Error al obtener la lista de categorias', error);
    }
  };

  useEffect(() => {
    getRows();
  }, [currentPage, pageSize, searchTerm]);

  const getUserRole = async () => {
    // if (user.Permisology_legal) {
    //   if (user.Permisology_legal.can_category_create) {
    //     setEnabledBtnNew(true);
    //   }
    //   if (user.Permisology_legal.can_category_update) {
    //     setEnabledBtnEdit(true);
    //   }
    //   if (!user.Permisology_legal.can_access_category) {
    //     window.location.href = '/legal/dashboard';
    //   }
    // }
  };

  useEffect(() => {
    if (user != null) {
      getUserRole();
    }
  }, [user]);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reiniciar a la primera página al cambiar el término de búsqueda
  };

  const openModal = (row, sub) => {
    if (row == 'add') {
      setFormData(initialValues);
      setTitle('Nueva categoría');
      setIsModalOpen(true);
      id.current = 0;
    } else {
      setFormData({
        ['code']: row.code,
        ['name']: row.name,
        ['offer']: row.offer,
        ['description']: row.description,
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
    setIsLoading(true);
    const dataToSend = { ...formData };
    try {
      let response = '';
      if (id.current == 0) {
        response = await postWithData('providers/category', dataToSend);
      } else {
        response = await putWithData(
          'providers/category/' + id.current,
          dataToSend,
        );
      }
      ToastNotify({
        message: response.message,
        position: 'top-right',
      });
      closeModal();
    } catch (error) {
      ToastNotify({
        message: response.message,
        position: 'top-right',
      });
      console.error('Error a registrar:', error);
    } finally {
      setFormData(initialValues);
      getRows();
      setIsLoading(false);
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

  const handleChangeStatu = async (id, origin) => {
    const dataToSend = { ...formData };
    const response = await putWithData('providers/category/updateStatu/' + id);
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

  return (
    <div className='max-w-6xl mx-auto p-6 mt-6 text-sm'>
      <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
        <Stepper
          currentStep={1}
          totalSteps={1}
          stepTexts={['Lista de Categorías']}
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
              disabled={!enabledBtnNew}
              className={
                enabledBtnNew
                  ? 'bg-blue-700 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm '
                  : 'text-gray-500 bg-gray-200 cursor-not-allowed  text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm'
              }
              onClick={() => openModal('add')}
            >
              Nuevo
            </button>
          </div>
          <table className='w-full bg-white border border-gray-300 mt-2'>
            <thead>
              <tr className='bg-gray-800 text-gray-100'>
                <th className='border border-gray-300 '>Código</th>
                <th className='border border-gray-300 '>Nombre</th>
                <th className='border border-gray-300 '>Producto/Servicio</th>
                <th className='border border-gray-300 '>Descripción</th>
                <th className='border border-gray-300'>¿Activo?</th>
                <th className='border border-gray-300'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  <tr
                    key={row.id}
                    className='bg-white hover:bg-slate-500 hover:text-white dark:hover:bg-gray-600'
                  >
                    <td className='border border-gray-300 pl-2'>{row.code}</td>
                    <td className='border border-gray-300 pl-2'>{row.name}</td>
                    <td className='border border-gray-300 pl-2'>{row.offer}</td>
                    <td className='border border-gray-300 pl-2'>
                      {row.description}
                    </td>
                    <td className='border border-gray-300 text-center'>
                      <div>
                        <input
                          type='checkbox'
                          checked={row.statu}
                          onChange={() => handleChangeStatu(row.id)}
                          name='statu'
                          id='statu'
                        />
                      </div>
                    </td>
                    <td className='border border-gray-300 text-center items-center justify-center'>
                      <button
                        type='button'
                        disabled={!enabledBtnEdit}
                        className={
                          enabledBtnNew
                            ? 'bg-gray-800 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded transition duration-300 ml-auto text-sm'
                            : 'text-gray-500 bg-gray-200 cursor-not-allowed  text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm'
                        }
                        title='Editar'
                        onClick={() => openModal(row, [])}
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      </div>
      {isModalOpen && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center'>
          <div className='bg-white p-6 rounded shadow-lg w-full sm:w-1/2'>
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
                {/* Columna 2 */}
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Oferta
                  </label>
                  <textarea
                    name='offer'
                    id='offer'
                    rows='3'
                    className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                    value={formData.offer}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Descripción
                  </label>
                  <textarea
                    name='description'
                    id='description'
                    rows='3'
                    className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
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
                  disabled={!enabledBtnNew && !enabledBtnEdit}
                  className={
                    enabledBtnNew || enabledBtnEdit
                      ? 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                      : 'text-gray-500 bg-gray-200 cursor-not-allowed  text-white font-bold py-1 px-2 rounded '
                  }
                  onClick={handleSubmit}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? <Spinner /> : ''}
    </div>
  );
};

export default Categories;
