import React, { useEffect, useState, useRef } from 'react';
import { show, postWithData, putWithData, postAttachment } from '../../../api';
import ToastNotify from '../../../components/toaster/toaster';
import Spinner from '../../../components/Spinner/Spinner';
import Stepper from '../../../components/stepper/stepper';
import { useUser } from '../../../context/userContext';
import { FaTimesCircle, FaRegFilePdf } from 'react-icons/fa';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../../components/SweetAlert/SweetAlert';
import PdfViewer from '../../../components/PdfViewer/PdfViewer';
const modalStatu = ({
  rowCurrent,
  handleCloseStatuApproval,
  handleCloseDocument,
}) => {
  const { user } = useUser();
  const initialValues = {
    provider_id: '',
    user_id: '',
    title: '',
    attach: '',
  };
  const [formData, setFormData] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [isModalPdf, setIsModalPdf] = useState(false);
  const urlAzureRef = useRef('');
  const getRows = async () => {
    try {
      const response = await show(
        `providers/documents?page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
      );

      console.log('response', response);

      const { data, meta } = response;

      setRows(data);
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error('Error al obtener la lista de proveedores', error);
    }
  };

  useEffect(() => {
    getRows();
  }, [currentPage, pageSize, searchTerm]);

  const handleChange = (event) => {
    const { id, value, checked, type } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: newValue,
    }));
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      attach: file, // Guardar la referencia al archivo en el estado
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const dataToSend = {
      ...formData,
      provider_id: rowCurrent.id,
      user_id: user.id,
      company_id: user.company_id,
      position_id: user.position_id,
    };
    try {
      if (rowCurrent.approval_status === dataToSend.approval_status) {
        InfoSweetAlert({
          title: 'error',
          text: 'Ocurrió un error, seleccione otro estatus para actualizarlo',
          icon: 'error',
        }).infoSweetAlert();
        return;
      }
      let response = '';
      response = await postWithData('providers/historic', dataToSend);
      if (response) {
        const dataProvider = {
          approval_status: dataToSend.approval_status,
        };
        const response2 = await putWithData(
          'providers/' + rowCurrent.id,
          dataProvider,
        );

        ToastNotify({
          message: response.message,
        });
        setFormData(initialValues);
        handleCloseStatuApproval();
      }
    } catch (error) {
      ToastNotify({
        message: 'Ocurrio un error al procesar el registro.',
        position: 'top-right',
      });
      console.error('Error a registrar:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAdd = async () => {
    try {
      setIsLoading(true);
      const fileUploadResponse = await postAttachment(
        formData.attach,
        'provider',
      );
      const attach = fileUploadResponse.data.STORAGE_ROUTE;

      const dataToSend = {
        ...formData,
        user_id: user.id,
        provider_id: rowCurrent.id,
        attach: attach,
      };

      const response = await postWithData('providers/document', dataToSend);
      if (response) {
        setFormData(initialValues);
        document.getElementById('attach').value = '';
        document.getElementById('title').focus();
        ToastNotify({
          message: response.message,
        });
        getRows();
      }
    } catch (error) {
      ToastNotify({
        message: 'Ocurrio un error al procesar el registro.',
        position: 'top-right',
      });
      console.error('Error a registrar:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleViewFile = (url) => {
    const fileExtension = url.split('.').pop().toLowerCase();
    urlAzureRef.current = url;
    if (fileExtension == 'pdf') {
      setIsModalPdf(true);
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

  const handleDelete = async (row) => {
    try {
      const data = {
        soft_delete: true,
      };
      const response = await putWithData('providers/document/' + row.id, data);
      getRows();
      ToastNotify({
        message: response.message,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleCloseModal = () => {
    handleCloseDocument();
  };
  return (
    <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center '>
      <div className='bg-white p-2 rounded shadow-lg w-1/2'>
        <div className='top-0 right-0'>
          <button
            onClick={handleCloseModal}
            className='text-gray-600 hover:text-gray-800 focus:outline-none'
          >
            <FaTimesCircle className='w-5 h-5' />
          </button>
        </div>
        <Stepper
          currentStep={1}
          totalSteps={1}
          stepTexts={['Documento del proveedor']}
        />
        {/* Formulario para el nuevo elemento */}
        <form className='grid grid-cols-1 gap-4 sm:grid-cols-4 p-6 border'>
          <div className='col-span-3 sm:col-span-3'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='col-span-2 sm:col-span-1'>
                <label
                  htmlFor='title'
                  className='block text-sm font-medium text-gray-700'
                >
                  Título
                </label>
                <input
                  type='text'
                  id='title'
                  name='title'
                  onChange={handleChange}
                  value={formData.title}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
              <div className='col-span-2 sm:col-span-1'>
                <label
                  htmlFor='attach'
                  className='block text-sm font-medium text-gray-700'
                >
                  Adjunto [PDF]
                </label>
                <input
                  type='file'
                  id='attach'
                  name='attach'
                  onChange={handleFileChange}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
            </div>
          </div>
          <div className='col-span-1 sm:col-span-1 flex justify-end'>
            {/* Aquí puedes colocar tu botón */}
            <button
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'
              type='button'
              onClick={handleAdd}
            >
              Agregar
            </button>
          </div>
          <table className='w-full bg-white border border-gray-300 mt-2 col-span-4'>
            <thead>
              <tr className='bg-gray-800 text-gray-100'>
                <th className='border border-gray-300 '>Cargado por</th>
                <th className='border border-gray-300 '>Título</th>
                <th className='border border-gray-300 '>Adjunto</th>
                <th className='border border-gray-300 '>Acción</th>
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
                    </td>
                    <td className='border border-gray-300 pl-2'>{row.title}</td>
                    <td className='border border-gray-300 text-center items-center'>
                      <button
                        type='button'
                        className='bg-blue-500 text-white px-2 py-1 rounded-md ml-auto'
                        onClick={() => handleViewFile(row.attach)}
                      >
                        <FaRegFilePdf />
                      </button>
                    </td>
                    <td className='border border-gray-300 text-center items-center justify-center'>
                      <button
                        type='button'
                        className='text-red-500 bg-red-200 text-white font-bold py-1 px-2 rounded ml-auto transition duration-300 text-sm mr-2'
                        title='Eliminar'
                        onClick={() => handleDelete(row, [])}
                      >
                        <FaTimesCircle />
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </form>
        <div className='text-center items-center'>{renderPagination()}</div>
      </div>

      {isModalPdf && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center '>
          <PdfViewer
            url={urlAzureRef.current}
            onClose={() => setIsModalPdf(false)}
          />
        </div>
      )}
    </div>
  );
};
export default modalStatu;
