import React, { useState, useEffect, useRef } from 'react';
import {
  getData,
  postData,
  putData,
  postStorage,
  getStorage,
} from '../../../api';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Select from '../../../components/Select';
import Spinner from '../../../components/Spinner/Spinner';
import ToastNotify from '../../../components/toast/toast';
import {
  FaPlusCircle,
  FaSearch,
  FaEdit,
  FaMinusCircle,
  FaEye,
} from 'react-icons/fa';
import { decode } from 'html-entities';
import { Tooltip } from 'react-tooltip';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../../components/SweetAlert/SweetAlert';
const Form = ({ id, onFormData, onGetRecordById, setUnsavedChanges }) => {
  const sweetAlert = ConfirmSweetAlert({
    title: 'Seguimientos',
    text: '¿Esta seguro que desea procesar el seguimiento?',
    icon: 'question',
  });

  const formatDateTime = () => {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Cambia al timezone correspondiente
    };

    const formattedDateTime = new Intl.DateTimeFormat('es-ES', options).format(
      new Date(),
    );

    const formattedDate = formattedDateTime.replace(
      /(\d+)\/(\d+)\/(\d+),\s+(\d+):(\d+):(\d+)/,
      '$3-$2-$1T$4:$5',
    );

    console.log('formattedDateTime:', formattedDateTime);
    console.log('formattedDate:', formattedDate);
    return formattedDate;
  };
  const initialValues = {
    title: '',
    date: formatDateTime(),
    client_id: '',
    employee_id: null,
    text: '',
  };
  const [formData, setFormData] = useState(initialValues);
  const [employees, setEmployees] = useState([]);
  const [loadingCount, setLoadingCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState('client');
  const [followUps, setFollowUps] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState([]);
  let loading = loadingCount > 0;
  const quillRef = useRef(null);
  const navigateTo = useNavigate();

  const getRows = async () => {
    const order = 'dateandtime-desc';
    const responseFollowUps = await getData(
      `client-follow-ups/all?client_id=${onFormData.id}&order=${order}`,
    );
    console.log('followUps', responseFollowUps);
    setFollowUps(responseFollowUps);
  };
  useEffect(() => {
    const fetchSelect = async () => {
      try {
        const queryParameters = new URLSearchParams();
        queryParameters.append('statu', 1);
        queryParameters.append('client_id', onFormData.id);
        queryParameters.append('service_start', 'true');
        const order = 'id-desc';

        const services = await getData(`client-service/all?${queryParameters}`);
        console.log('client-service =>', services);
        if (services) {
          const options = services.map((item) => ({
            value: item.employee?.id,
            label: item.employee?.name,
          }));
          setEmployees(options);
        }
      } catch (error) {
        console.log('ERRR', error);
      } finally {
        setLoadingCount((prev) => prev - 1);
      }
    };

    fetchSelect();
    getRows();
  }, []);

  useEffect(() => {
    if (onFormData) {
      setTimeout(() => setLoadingCount((prev) => prev - 1), 500);
    }
  }, [onFormData]);

  const stripHTML = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };
  const handleChangeSelect = (event, field) => {
    const newValue = event.value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: newValue,
    }));
  };

  const isQuillContentEmpty = (content) => {
    // Eliminar todas las etiquetas HTML del contenido y comprobar si el resultado está vacío
    const strippedContent = content.replace(/<\/?[^>]+(>|$)/g, '');
    return strippedContent.trim() === '';
  };
  const handleQuill = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ['text']: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { date, title, text, employee_id } = formData;

    if (
      !date ||
      !title ||
      isQuillContentEmpty(text) ||
      (selectedOption === 'employee' && !employee_id)
    ) {
      ToastNotify({
        message: 'Por favor, complete todos los campos requeridos',
        position: 'top-right',
        type: 'error',
      });
      return;
    }
    await sweetAlert.showSweetAlert().then((result) => {
      const isConfirmed = result !== null && result;
      if (!isConfirmed) {
        ToastNotify({
          message: 'Acción cancelada por el usuario',
          position: 'top-right',
        });
        return;
      } else {
        const datetime = new Date(date);
        const formattedDate = datetime.toISOString().slice(0, 10); // Formato YYYY-MM-DD
        const formattedTime = datetime.toTimeString().slice(0, 8); // Formato HH:mm:ss

        console.log('formattedDate', formattedDate);
        console.log('formattedTime', formattedTime);
        //return;

        const dataToSend = {
          date: formattedDate,
          time: formattedTime,
          title,
          text,
          employee_id,
          client_id: onFormData.id,
        };
        handleSend(dataToSend);
      }
    });
  };
  const handleSend = async (dataToSend) => {
    setIsLoading(true);
    try {
      let message = '';

      let response = false;
      response = await postData('client-follow-ups', dataToSend);
      if (response) {
        ToastNotify({
          message: 'Seguimiento registrado con exito!',
          position: 'top',
        });
      }
    } catch (error) {
      console.log('error =>', error);
    } finally {
      getRows();

      setIsLoading(false);
      closeModal();
    }
  };
  const openModal = (row = false) => {
    setFormData(initialValues);
    setIsReadOnly(false);
    setSelectedOption('client');
    console.log('row => ', row);
    if (row) {
      if (row.employee_id >= 1) {
        setSelectedOption('employee');
      }
      const formattedDateTime = `${row.date}T${row.time}`;
      setFormData(row);
      setFormData((prevFormData) => ({
        ...prevFormData,
        date: formattedDateTime,
      }));
      setIsReadOnly(true);
    }
    setIsOpenModal(true);
  };
  const closeModal = () => {
    setFormData(initialValues);
    setIsOpenModal(false);
  };
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };
  const truncateText = (text, maxLength) => {
    // Eliminar etiquetas HTML y espacios innecesarios
    console.log('decode', decode(text).split('</p>'));
    const cleanText = decode(text).split('</p>');

    // Truncar el texto si excede maxLength
    if (cleanText[0].length > maxLength) {
      return cleanText[0].substring(0, maxLength) + '...';
    }
    return cleanText[0].replace('<p>', '');
  };
  return (
    <form className=''>
      {(loading || isLoading) && <Spinner />}
      <div className='relative rounded min-h-[calc(100vh-235px)]'>
        <div className='flex justify-between'>
          <div className='border border-gray-800 p-2 mb-2'>
            Lista de seguimientos
          </div>
          <div className='flex space-x-2'>
            <button
              type='button'
              className='bg-primary text-lg text-white font-bold py-2 px-2 rounded h-8'
              onClick={() => openModal(false)}
            >
              <FaPlusCircle className='text-lg' />
            </button>
          </div>
        </div>
        <div className='col-span-2 md:grid md:grid-cols-2 gap-1'>
          {followUps.length > 0 &&
            followUps.map((row) => (
              <>
                <div
                  className='flex justify-between items-center bg-white rounded-lg p-2 shadow-sm border border-gray-300 col-span-2 cursor-pointer'
                  onClick={() => openModal(row)}
                >
                  <div className='flex items-center w-full'>
                    <div className='w-10 h-10 rounded-full mr-4 border border-blue-500 flex justify-center items-center'>
                      {row.id}
                    </div>
                    <div className='w-full'>
                      <div className='flex justify-between items-center w-full'>
                        <h4 className='text-lg font-semibold flex-grow'>
                          {row.employee_id != 0 && row.employee_id != null
                            ? 'Empleado ' + row.employee.name + '=> '
                            : ''}
                          {row.title}
                        </h4>
                        <span className='text-sm text-gray-600'>
                          {row.date}
                          {' ' + row.time}
                        </span>
                      </div>
                      <div className='flex justify-between items-center w-full'>
                        <p
                          className='text-sm'
                          dangerouslySetInnerHTML={{
                            __html: decode(truncateText(row.text, 100)),
                          }}
                        ></p>
                        <span className='text-sm text-gray-600'>
                          <button
                            type='button'
                            data-tooltip-id='tooltip'
                            data-tooltip-html={decode(row.text)}
                          >
                            <FaEye className='text-lg' />
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <button className='bg-transparent border-none text-gray-500 hover:text-red-500'>
                      <i className='fas fa-trash'></i>
                    </button>
                    <button className='ml-4 bg-transparent border-none text-gray-500 hover:text-orange-500'>
                      <i className='fas fa-ellipsis-v'></i>
                    </button>
                  </div>
                </div>
                <Tooltip id='tooltip' />
              </>
            ))}
        </div>
      </div>
      {isOpenModal && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center z-40'>
          <div
            className={`relative bg-white p-2 rounded shadow-lg min-h-80 w-4/5 lg:w-1/2 max-h-screen overflow-y-auto`}
          >
            <button
              className='absolute top-0 right-0 text-gray-800 text-lg'
              onClick={closeModal}
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
            <div className={`col-span-1 md:grid md:grid-cols-1 gap-2 p-2`}>
              <div className='col-span-1'>
                <h3 className='text-lg font-semibold mb-4'>
                  Seguimiento sobre
                </h3>

                <div className='flex items-center mb-4'>
                  <label className='mr-4'>
                    <input
                      type='radio'
                      value='client'
                      checked={selectedOption === 'client'}
                      onChange={handleOptionChange}
                      className='mr-2'
                      disabled={isReadOnly}
                    />
                    Cliente
                  </label>
                  <label>
                    <input
                      type='radio'
                      value='employee'
                      checked={selectedOption === 'employee'}
                      onChange={handleOptionChange}
                      className='mr-2'
                      disabled={isReadOnly}
                    />
                    Trabajador
                  </label>
                </div>
              </div>
              {selectedOption === 'employee' && (
                <div className='mb-4'>
                  <label
                    htmlFor='employee_id'
                    className='block text-sm font-medium text-secondary'
                  >
                    Trabajador
                  </label>
                  <Select
                    id='employee_id'
                    options={employees}
                    placeholder='Seleccione...'
                    defaultValue={formData.employee_id}
                    onChange={(event) =>
                      handleChangeSelect(event, 'employee_id')
                    }
                    isSearchable
                    isDisabled={isReadOnly}
                  />
                </div>
              )}
              <div className='col-span-1'>
                <div className='mb-2'>
                  <label
                    htmlFor='service_start'
                    className='block text-sm font-medium text-secondary'
                  >
                    Fecha
                  </label>
                  <input
                    type='datetime-local'
                    id='date'
                    value={formData.date == null ? '' : formData.date}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  />
                </div>
                <div className='mb-1'>
                  <label
                    htmlFor='title'
                    className='block text-sm font-medium text-secondary'
                  >
                    Titulo
                  </label>
                  <input
                    type='text'
                    id='title'
                    value={formData.title}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  />
                </div>
                <div className='mb-1'>
                  <label
                    htmlFor='text'
                    className='block text-sm font-medium text-secondary'
                  >
                    Texto
                  </label>
                  <ReactQuill
                    ref={quillRef}
                    value={formData.text}
                    onChange={handleQuill}
                    readOnly={isReadOnly}
                    style={{ minHeight: '200px', height: '200px' }}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'link'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        [{ align: [] }],
                        ['blockquote'],
                        ['image', 'video'], // Agregar herramientas de imagen y video
                      ],
                    }}
                  />
                </div>
              </div>
            </div>
            <div className='flex justify-end p-4 mt-12'>
              <div className='flex'>
                <button
                  type='button'
                  className='bg-gray-500 text-white font-bold py-2 px-2 text-sm rounded mr-2'
                  onClick={closeModal}
                >
                  Cerrar
                </button>
                <button
                  type='button'
                  className={`py-2 px-2 text-sm rounded font-bold bg-primary text-white hover:bg-primary-dark ${
                    isReadOnly ? 'bg-blue-300 cursor-not-allowed' : ''
                  }`}
                  onClick={handleSubmit}
                  disabled={isReadOnly}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default Form;
