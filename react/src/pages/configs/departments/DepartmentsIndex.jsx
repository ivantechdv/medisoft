import { show, postWithData, putWithData } from '../../../api';
import React, { useState, useEffect } from 'react';
import ToastNotify from '../../../components/toaster/toaster';
import Stepper from '../../../components/stepper/stepper';
import Spinner from '../../../components/Spinner/Spinner';

import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { MdOutlineEditNote } from 'react-icons/md';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import { FaRegCircleXmark } from 'react-icons/fa6';

const isDesktop = window.innerWidth > 768;
let current;

function DepartmentsIndex() {
  const initialValues = {
    department: '',
    description: '',
    id: 0,
  };

  const [formData, setFormData] = useState(initialValues);
  const [departments, setDepartments] = useState();
  const [updateStatus, setUpdateStatus] = useState([]);

  const [original, setOriginalDepartments] = useState([]);
  const [loader, setLoader] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Número de registros por página
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [enabledBtnNew, setEnabledBtnNew] = useState(true);
  const [enabledBtnEdit, setEnabledBtnEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getAllDepartments();
  }, [currentPage, pageSize, searchTerm, searchStatus]);

  async function getAllDepartments() {
    try {
      const response = await show(
        `departments/getAllDepartments?page=${currentPage}&pageSize=${pageSize}&department_name=${searchTerm}&department_status=${searchStatus}`,
      );
      if (response && response.data && response.meta) {
        const { data, meta } = response;
        setDepartments(data);
        setOriginalDepartments(data);
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
      console.error('Error al obtener la lista de departamentos', error);
      setLoader(false);
    }
  }

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

  const handleUpdate = async (id, department, status) => {
    var nstatus;
    if (status === 1) nstatus = 0;
    else nstatus = 1;

    setUpdateStatus({
      id: id,
      department: department,
      statu: nstatus,
    });
    handleSubmit(0);
  };

  const openModal = (row) => {
    if (row == 'add') {
      setFormData(initialValues);
      setTitle('Nuevo Departamento');
      setIsModalOpen(true);
      current = 0;
    } else {
      let department = row.department;
      let description = row.description;
      let id = row.id;

      setFormData({
        ['department']: department,
        ['description']: description,
        ['id']: id,
      });
      current = id;
      setTitle('Actualizar Departamento');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const handleSubmit = async (valor = undefined) => {
    setIsLoading(true);
    let response = '';
    let dataToSend = {};
    if (valor === 0) {
      dataToSend = { ...updateStatus };
    } else {
      dataToSend = { ...formData };
    }
    if (dataToSend.id != 0) {
      try {
        if (current == 0) {
          response = await postWithData(
            'departments/createDepartment',
            dataToSend,
          );
        } else {
          response = await putWithData(
            'departments/updateDepartment/' + dataToSend.id,
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
        getAllDepartments();
        setIsLoading(false);
      }
    }
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
      <div className=' ml-2 mr-2'>
        <div className='mt-2  w-[98%]  border-gray-300'>
          <div className='mb-4 overflow-x-auto  bg-gray-50 p-2'>
            <div className='flex'>
              <input
                type='text'
                placeholder='Buscar por Departamento'
                value={searchTerm}
                onChange={handleSearchTermChange}
                className={`mt-1 p-1 ${
                  isDesktop ? 'w-1/2' : 'w-full'
                } border rounded-md focus:outline-none focus:border-blue-500 transition duration-300`}
              />
              <select
                value={searchStatus}
                onChange={handleStatusChange}
                className='p-2 border rounded bg-gray-200 text-bold ml-2'
              >
                <option value=''>Todos</option>
                <option value='1'>Activo</option>
                <option value='0'>Inactivo</option>
              </select>
              <button
                disabled={!enabledBtnNew}
                className={
                  enabledBtnNew
                    ? 'bg-blue-700 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm '
                    : 'text-gray-500 bg-gray-200 cursor-not-allowed  font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm'
                }
                onClick={() => openModal('add')}
              >
                {' '}
                Nuevo
              </button>
            </div>
          </div>
          <table className='w-full bg-white border border-gray-300 mt-2'>
            <thead>
              <tr className='bg-gray-800 text-gray-100'>
                <th className='border border-gray-300'>ID</th>
                <th className='border border-gray-300'>Departamento</th>
                <th className='border border-gray-300'>Descripción</th>
                <th className='border border-gray-300'>Estado</th>
                <th className='border border-gray-300'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr
                  key={department.id}
                  className='bg-white hover:bg-slate-500 hover:text-white dark:hover:bg-gray-600 text-sm'
                >
                  <td className='border border-gray-300 text-center'>
                    {department.id}
                  </td>
                  <td className='border border-gray-300 text-center'>
                    {department.department}
                  </td>
                  <td className='border border-gray-300 text-center'>
                    {department.description}
                  </td>
                  <td className='border border-gray-300 text-center'>
                    <button
                      type='button'
                      className={
                        department.statu === 1
                          ? 'hover:text-white ml-4 text-xl text-lime-600'
                          : 'hover:text-white  ml-4 text-xl text-red-500'
                      }
                      onClick={() =>
                        handleUpdate(
                          department.id,
                          department.department,
                          department.statu,
                        )
                      }
                    >
                      {department.statu === 1 ? (
                        <IoShieldCheckmarkOutline />
                      ) : (
                        <FaRegCircleXmark />
                      )}
                    </button>
                  </td>
                  <td className='border border-gray-300 text-center'>
                    <button
                      type='button'
                      className='hover:text-white text-black ml-4 text-xl'
                      onClick={() => openModal(department, [])}
                    >
                      <MdOutlineEditNote />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      </div>
    );
  };

  return (
    <div className='max-w-6xl p-4 mt-6 text-sm'>
      <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
        <Stepper
          currentStep={1}
          totalSteps={1}
          stepTexts={['Lista de Departamentos']}
        />
        {loader ? (
          <div className='text-center'>
            <div className='loader mx-auto'></div>
          </div>
        ) : (
          renderTable()
        )}
      </div>
      {isModalOpen && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center '>
          <div className='bg-white p-6 rounded shadow-lg w-1/2'>
            <Stepper currentStep={1} totalSteps={1} stepTexts={[title]} />
            {/* Formulario para el nuevo elemento */}
            <form className='w-full max-w-full p-6 border'>
              <div className='flex items-center mb-4'>
                <div className='w-1/3 text-right mr-2'>
                  <label htmlFor='titulo' className='text-gray-700'>
                    Nombre Departamento:
                  </label>
                </div>
                <div className='w-2/4'>
                  <input
                    type='text'
                    id='department'
                    name='deparment'
                    value={formData.department}
                    onChange={handleChange}
                    className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  />
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/3 text-right mr-2'>
                  <label htmlFor='titulo' className='text-gray-700'>
                    Breve Descripción:
                  </label>
                </div>
                <div className='w-3/4'>
                  <input
                    type='text'
                    id='description'
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  />
                </div>
              </div>

              <div className='flex justify-end mt-10'>
                <button
                  type='button'
                  disabled={!enabledBtnNew && !enabledBtnEdit}
                  className={
                    enabledBtnNew || enabledBtnEdit
                      ? 'bg-gray-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded'
                      : 'text-gray-500 bg-gray-200 cursor-not-allowed  font-bold py-1 px-2 rounded '
                  }
                  onClick={handleSubmit}
                >
                  Guardar
                </button>
                <button
                  className='py-2 px-4 text-sm bg-gray-500 text-white cursor-pointer font-bold rounded ml-4 hover:bg-blue-900'
                  onClick={closeModal}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isLoading ? <Spinner /> : ''}
    </div>
  );
}

export default DepartmentsIndex;
