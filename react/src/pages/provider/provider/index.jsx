import React, { useEffect, useState, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Stepper from '../../../components/stepper/stepper';
import { show, postWithData, putWithData } from '../../../api';
import { FaFileUpload, FaEdit, FaExchangeAlt } from 'react-icons/fa';
import ToastNotify from '../../../components/toaster/toaster';
import Spinner from '../../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { useUser } from '../../../context/userContext';
import Form from './form';
import ModalStatu from './modalStatu';
import ModalDoc from './modalDoc';
const Providers = () => {
  const [rows, setRows] = useState([]);
  const [rowCurrent, setRowCurrent] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [displayedElements, setDisplayedElements] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [elementsNow, setElementsNow] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [title, setTitle] = useState('');
  const [isModalOpenStatu, setIsModalOpenStatu] = useState(false);
  const [isModalDoc, setIsModalDoc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useUser();
  const [enabledViewList, setEnabledViewList] = useState(false);
  const [enabledBtnNew, setEnabledBtnNew] = useState(false);
  const [enabledBtnEdit, setEnabledBtnEdit] = useState(false);
  const [enabledBtnApprovalStatus, setEnabledBtnApprovalStatus] =
    useState(false);
  const [enabledBtnUploadDocument, setEnabledBtnUploadDocument] =
    useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [stage, setStage] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null); // Estado para almacenar la fila seleccionada para editar
  const getRows = async () => {
    try {
      const response = await show(
        `providers?page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
      );

      // console.log('response', response);

      const { data, meta } = response;

      setRows(data);
      setOriginalRows(data);
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error('Error al obtener la lista de proveedores', error);
    }
  };

  useEffect(() => {
    getRows();
  }, [currentPage, pageSize, searchTerm]);

  const getUserRole = async () => {
    console.log(user);
    if (user.permisology_provider) {
      if (user.permisology_provider.can_view_list_provider) {
        setEnabledViewList(true);
      }
      if (user.permisology_provider.can_create_provider) {
        setEnabledBtnNew(true);
      }
      if (user.permisology_provider.can_update_provider) {
        setEnabledBtnEdit(true);
      }
      if (user.permisology_provider.can_change_statu_provider) {
        setEnabledBtnApprovalStatus(true);
      }
      if (user.permisology_provider.can_upload_document_provider) {
        setEnabledBtnUploadDocument(true);
      }
      if (user.permisology_provider.can_enabled_disabled_provider) {
      }
    }
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
    const response = await putWithData('providers/updateStatu/' + id);
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

  const handleStepClick = (step) => {
    setSelectedRow(null);
    setStage(step - 1);
  };

  const handleEdit = (row) => {
    setStage(1);
    setSelectedRow(row);
  };
  const handleUpdate = () => {
    getRows();
  };
  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
  };

  const handleChangeStatuApproval = (row) => {
    setRowCurrent(row);
    setIsModalOpenStatu(true);
  };
  const handleCloseStatuApproval = (row) => {
    getRows();
    setIsModalOpenStatu(false);
  };
  const handleOpenDocument = (row) => {
    setRowCurrent(row);
    setIsModalDoc(true);
  };
  const handleCloseDocument = (row) => {
    getRows();
    setIsModalDoc(false);
  };
  return (
    <div className='max-w-6xl mx-auto p-6 mt-6 text-sm'>
      <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
        <Stepper
          currentStep={stage}
          totalSteps={enabledBtnNew ? 2 : 1}
          onStepClick={handleStepClick}
          stepTexts={[
            'Lista de proveedores',
            enabledBtnNew ? 'Formulario proveedor' : '',
          ]}
        />
        {stage == 0 ? (
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
                    ? 'bg-blue-700 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm cursor-pointer'
                    : 'text-gray-500 bg-gray-200 cursor-not-allowed  text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm'
                }
                onClick={() => handleStepClick(2)}
              >
                Nuevo
              </button>
            </div>
            {enabledViewList && (
              <table className='w-full bg-white border border-gray-300 mt-2'>
                <thead>
                  <tr className='bg-gray-800 text-gray-100'>
                    <th className='border border-gray-300 '>Creado por</th>
                    <th className='border border-gray-300 '>Datos proveedor</th>
                    <th className='border border-gray-300 '>Comunicación</th>
                    <th className='border border-gray-300 '>Estado actual</th>
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
                        <td className='border border-gray-300 pl-2'>
                          {row.user.first_name + ' ' + row.user.last_name}
                          <br />
                          Fecha: {formatDate(row.createdAt)}
                        </td>
                        <td className='border border-gray-300 pl-2'>
                          {row.rif} <br />
                          {row.name} <br />
                          Contacto: {row.person_contact}
                        </td>
                        <td className='border border-gray-300 pl-2'>
                          Correo(s): {row.email}
                          <br />
                          Teléfono(s): {row.phone}
                        </td>
                        <td className='border border-gray-300 text-center'>
                          <span
                            className={`inline-block px-2 py-1 font-semibold rounded-full ${
                              row.approval_status === 'Pendiente'
                                ? 'bg-yellow-400 text-white'
                                : row.approval_status === 'Aprobado'
                                ? 'bg-green-400 text-white'
                                : 'bg-red-400 text-white'
                            }`}
                          >
                            {row.approval_status}
                          </span>
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
                              enabledBtnEdit
                                ? 'bg-gray-800 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded transition duration-300 ml-auto text-sm mr-2'
                                : 'text-gray-500 bg-gray-200 cursor-not-allowed  text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm mr-2'
                            }
                            title='Editar'
                            onClick={() => handleEdit(row, [])}
                          >
                            <FaEdit />
                          </button>
                          <button
                            type='button'
                            disabled={!enabledBtnApprovalStatus}
                            className={
                              enabledBtnApprovalStatus
                                ? 'bg-gray-800 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded transition duration-300 ml-auto text-sm mr-2'
                                : 'text-gray-500 bg-gray-200 cursor-not-allowed  text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm mr-2'
                            }
                            title='Cambiar Estatus'
                            onClick={() => handleChangeStatuApproval(row)}
                          >
                            <FaExchangeAlt />
                          </button>
                          <button
                            type='button'
                            disabled={!enabledBtnUploadDocument}
                            className={
                              enabledBtnUploadDocument
                                ? 'bg-gray-800 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded transition duration-300 ml-auto text-sm mr-2'
                                : 'text-gray-500 bg-gray-200 cursor-not-allowed  text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm mr-2'
                            }
                            title='Cargar documentos'
                            onClick={() => handleOpenDocument(row)}
                          >
                            <FaFileUpload />
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
            {enabledViewList && renderPagination()}
          </div>
        ) : (
          <Form selectedRow={selectedRow} handleUpdate={handleUpdate} />
        )}
      </div>
      {isModalOpenStatu && (
        <ModalStatu
          rowCurrent={rowCurrent}
          handleCloseStatuApproval={handleCloseStatuApproval}
        />
      )}
      {isModalDoc && (
        <ModalDoc
          rowCurrent={rowCurrent}
          handleCloseStatuApproval={handleCloseStatuApproval}
          handleCloseDocument={handleCloseDocument}
        />
      )}
      {isLoading ? <Spinner /> : ''}
    </div>
  );
};

export default Providers;
