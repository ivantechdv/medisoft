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
const PilLines = () => {
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
        `purchases/getPurchasePilLines?page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
      );

      const { data, meta } = response;

      setRows(data);
      setOriginalRows(data);
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error('Error al obtener la lista de pil-lines', error);
    }
  };

  useEffect(() => {
    getRows();
  }, [currentPage, pageSize, searchTerm]);

  const getUserRole = async () => {
    // console.log(user);
    // if (user.permisology_provider) {
    //   if (user.permisology_provider.can_view_list_provider) {
    //     setEnabledViewList(true);
    //   }
    //   if (user.permisology_provider.can_create_provider) {
    //     setEnabledBtnNew(true);
    //   }
    //   if (user.permisology_provider.can_update_provider) {
    //     setEnabledBtnEdit(true);
    //   }
    //   if (user.permisology_provider.can_change_statu_provider) {
    //     setEnabledBtnApprovalStatus(true);
    //   }
    //   if (user.permisology_provider.can_upload_document_provider) {
    //     setEnabledBtnUploadDocument(true);
    //   }
    //   if (user.permisology_provider.can_enabled_disabled_provider) {
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

  const handleChangeStatu = async (id) => {
    const response = await putWithData('purchases/updateStatuPilLine/' + id);
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
    getRows();
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

  return (
    <div className='max-w-6xl mx-auto p-6 mt-6 text-sm'>
      <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
        <Stepper
          currentStep={stage}
          totalSteps={!enabledBtnNew ? 2 : 1}
          onStepClick={handleStepClick}
          stepTexts={[
            'Lista de P&L Line',
            !enabledBtnNew ? 'Formulario P&L Line' : '',
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
                disabled={enabledBtnNew}
                className={
                  !enabledBtnNew
                    ? 'bg-blue-700 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm cursor-pointer'
                    : 'text-gray-500 bg-gray-200 cursor-not-allowed  text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm'
                }
                onClick={() => handleStepClick(2)}
              >
                Nuevo
              </button>
            </div>
            {!enabledViewList && (
              <table className='w-full bg-white border border-gray-300 mt-2'>
                <thead>
                  <tr className='bg-gray-800 text-gray-100'>
                    <th className='border border-gray-300 '>Creado por</th>
                    <th className='border border-gray-300 '>Codigo</th>
                    <th className='border border-gray-300 '>Nombre</th>
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
                          {row.creator_name}
                        </td>
                        <td className='border border-gray-300 pl-2'>
                          {row.code}
                        </td>
                        <td className='border border-gray-300 pl-2'>
                          {row.name}
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
                            disabled={enabledBtnEdit}
                            className={
                              !enabledBtnEdit
                                ? 'bg-gray-800 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded transition duration-300 ml-auto text-sm mr-2'
                                : 'text-gray-500 bg-gray-200 cursor-not-allowed  text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm mr-2'
                            }
                            title='Editar'
                            onClick={() => handleEdit(row, [])}
                          >
                            <FaEdit />
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
      {isLoading ? <Spinner /> : ''}
    </div>
  );
};

export default PilLines;
