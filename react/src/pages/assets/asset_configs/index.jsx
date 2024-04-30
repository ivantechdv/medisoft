import React, { useEffect, useState, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Stepper from '../../../components/stepper/stepper';
import { show, postWithData, putWithData } from '../../../api';
import { FaFileUpload, FaEdit, FaExchangeAlt } from 'react-icons/fa';
import ToastNotify from '../../../components/toaster/toaster';
import Spinner from '../../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';

const AssetElements = () => {
  const initialValues = {
    name: '',
    asset_category_id: '',
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
  const [elements, setElements] = useState([]);
  const isDesktop = window.innerWidth > 768;
  const [categories, setCategories] = useState([]);
  const [checkboxValues, setCheckboxValues] = useState({});
  const id = useRef('');
  const getRows = async () => {
    try {
      const response = await show(
        `assets/getConfigs?page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
      );

      const { data, meta } = response;
      console.log('respónse', response);

      setRows(data);
      setOriginalRows(data);
      setTotalPages(meta.totalPages);

      const cat = await show(`assets/getAllCategories`);
      setCategories(cat);
      const ele = await show(`assets/getAllAssetElements`);
      const elementGroup = {};
      ele.forEach((element) => {
        const assetGroupName = element.asset_group_element.name;
        if (!elementGroup[assetGroupName]) {
          elementGroup[assetGroupName] = [];
        }
        elementGroup[assetGroupName].push(element);
      });

      setElements(elementGroup);
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

  const openModal = (row, sub) => {
    if (row == 'add') {
      setFormData(initialValues);
      setTitle('Registrar configuración de activos');
      setIsModalOpen(true);
      id.current = 0;
    } else {
      console.log('row', row);
      const selectedElements = row.asset_config_elements.map(
        (element) => `element_id_${element.asset_element_id}`,
      );
      console.log('selecteElement', selectedElements);
      const selectedElementsValues = {};
      selectedElements.forEach((elementId) => {
        selectedElementsValues[elementId] = true;
      });

      setCheckboxValues(selectedElementsValues);

      setFormData({
        ['name']: row.name,
        ['asset_category_id']: row.asset_category_id,
      });
      id.current = row.id;
      setTitle('Actualizar configuración de activos');
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
  const handleCheckboxChange = (event) => {
    const { id, checked } = event.target;
    setCheckboxValues((prevCheckboxValues) => ({
      ...prevCheckboxValues,
      [id]: checked,
    }));
  };
  const handleSubmit = async () => {
    const dataToSend = { ...formData };
    try {
      let response = '';
      let config_id = '';
      if (id.current == 0) {
        response = await postWithData('assets/config', dataToSend);
      } else {
        response = await putWithData('assets/config/' + id.current, dataToSend);
      }

      if (response && response.id) {
        config_id = response.id;
      } else {
        console.error('Error: No se recibió el ID de la configuración');
        return;
      }
      const selectedElementIds = Object.keys(checkboxValues).filter(
        (checkboxId) => checkboxValues[checkboxId],
      );

      if (selectedElementIds.length > 0) {
        const data = {
          config_id: config_id,
          elements_id: selectedElementIds,
        };

        const elementResponse = await postWithData(
          'assets/config-elements',
          data,
        );

        console.log('Respuesta de assets/config-elements:', elementResponse);
      }

      ToastNotify({
        message: response.message,
        position: 'top-right',
      });
      getRows();
      closeModal();
    } catch (error) {
      console.error('Error a registrar:', error);
    }
  };

  const handleChangeStatu = async (id, origin) => {
    const dataToSend = { ...formData };
    const response = await putWithData('assets/config/updateStatu/' + id);
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
          totalSteps={1}
          stepTexts={['Configuación de Activos']}
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
              className='bg-blue-700 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm '
              onClick={() => openModal('add')}
            >
              Nuevo
            </button>
          </div>
          <table className='w-full bg-white border border-gray-300 mt-2'>
            <thead>
              <tr className='bg-gray-800 text-gray-100'>
                <th className='border border-gray-300'>Categoría</th>
                <th className='border border-gray-300'>Nombre</th>
                <th className='border border-gray-300'>N# Campos</th>
                <th className='border border-gray-300'>¿Activo?</th>
                <th className='border border-gray-300'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className='bg-white hover:bg-slate-500 hover:text-white dark:hover:bg-gray-600'
                >
                  <td className='border border-gray-300 pl-2'>
                    {row.asset_category.name}
                  </td>
                  <td className='border border-gray-300 pl-2'>{row.name}</td>
                  <td className='border border-gray-300 pl-2'>
                    {row.elementCount}
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
                  <td className='border border-gray-300 pl-2 text-center justify-center item-center'>
                    <button
                      type='button'
                      onClick={() => openModal(row)}
                      className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded transition duration-300 ml-auto text-sm mr-2'
                    >
                      <FaEdit />
                    </button>
                  </td>
                  {/* Agrega más celdas según las propiedades de tus usuarios */}
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      </div>
      {isModalOpen && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center'>
          <div className='bg-white p-6 rounded shadow-lg sm:w-1/2 w-full'>
            <Stepper currentStep={1} totalSteps={1} stepTexts={[title]} />
            {/* Formulario para el nuevo elemento */}
            <form className='w-full max-w-full p-6 border'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                {/* Columna 1 */}
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Categoría
                  </label>
                  <select
                    id='asset_category_id'
                    name='asset_category_id'
                    className='mt-1 p-1 w-full border rounded-md'
                    onChange={handleChange}
                    value={formData.asset_category_id}
                  >
                    <option>Seleccione...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Nombre
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

              {Object.keys(elements).map((assetGroupName) => (
                <div key={assetGroupName}>
                  <div className='grid grid-cols-1 sm:grid-cols-1 gap-2 mt-3'>
                    <h2>{assetGroupName}</h2>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
                    {elements[assetGroupName].map((element) => (
                      <div
                        key={element.id}
                        className='grid grid-cols-1 sm:grid-cols-1 flex'
                      >
                        <input
                          className='mr-2'
                          type='checkbox'
                          id={'element_id_' + element.id}
                          name={'element_id_' + element.id}
                          checked={
                            checkboxValues['element_id_' + element.id] || false
                          }
                          onChange={handleCheckboxChange}
                        />
                        <label htmlFor={'element_id_' + element.id}>
                          {element.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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

export default AssetElements;
