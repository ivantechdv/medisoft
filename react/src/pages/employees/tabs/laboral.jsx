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
    employee_id: null,
    contact_ref1: '',
    date_start1: '',
    date_until1: '',
    contact_ref2: '',
    date_start2: '',
    date_until2: '',
    contact_ref3: '',
    date_start3: '',
    date_until3: '',
    services: [],
  };
  const [formData, setFormData] = useState(initialValues);
  const [employees, setEmployees] = useState([]);
  const [loadingCount, setLoadingCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState('client');
  const [services, setServices] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState([]);
  let loading = loadingCount > 0;
  const quillRef = useRef(null);
  const navigateTo = useNavigate();

  useEffect(() => {
    const fetchSelect = async () => {
      try {
        const order = 'name-asc';

        const option_services = await getData(`services/all?order=${order}`);
        setServices(option_services);
      } catch (error) {
        console.log('ERRR', error);
      } finally {
        setLoadingCount((prev) => prev - 1);
      }
    };
    fetchSelect();
  }, []);

  const getRows = async () => {
    const order = 'dateandtime-desc';
    const responseFollowUps = await getData(
      `employees/laboralAll?employee_id=${onFormData.id}`,
    );
    console.log('followUps', responseFollowUps);
    setFollowUps(responseFollowUps[0]);
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
  const handleServiceChange = (event) => {
    const { value, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      services: checked
        ? [...prevFormData.services, parseInt(value)]
        : prevFormData.services.filter((id) => id !== parseInt(value)),
    }));
  };
  return (
    <form className=''>
      {/* {(loading || isLoading) && <Spinner />} */}
      <div className='relative rounded min-h-[calc(100vh-235px)]'>
        <div className='flex justify-between'>
          <div className='border border-gray-800 p-1 mb-2'>
            Referencias personales
          </div>
        </div>
        <div className='col-span-1 md:grid md:grid-cols-4 gap-1'>
          <div className='col-span-2'>
            <label
              htmlFor='contact_ref1'
              className='block text-sm font-medium text-gray-700'
            >
              Contacto Referencia
            </label>
            <input
              type='text'
              id='contact_ref1'
              name='contact_ref1'
              value={formData.contact_ref1}
              onChange={handleChange}
              className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
            />
          </div>
          <div className='col-span-1'>
            <label
              htmlFor='date_start1'
              className='block text-sm font-medium text-gray-700'
            >
              Fecha desde
            </label>
            <input
              type='date'
              id='date_start1'
              name='date_start1'
              value={formData.date_start1}
              onChange={handleChange}
              className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
            />
          </div>
          <div className='col-span-1'>
            <label
              htmlFor='date_until1'
              className='block text-sm font-medium text-gray-700'
            >
              Fecha hasta
            </label>
            <input
              type='date'
              id='date_until1'
              name='date_until1'
              value={formData.date_until1}
              onChange={handleChange}
              className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
            />
          </div>

          <div className='col-span-2'>
            <label
              htmlFor='contact_ref2'
              className='block text-sm font-medium text-gray-700'
            >
              Contacto Referencia
            </label>
            <input
              type='text'
              id='contact_ref2'
              name='contact_ref2'
              value={formData.contact_ref2}
              onChange={handleChange}
              className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
            />
          </div>
          <div className='col-span-1'>
            <label
              htmlFor='date_start2'
              className='block text-sm font-medium text-gray-700'
            >
              Fecha desde
            </label>
            <input
              type='date'
              id='date_start2'
              name='date_start2'
              value={formData.date_start2}
              onChange={handleChange}
              className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
            />
          </div>
          <div className='col-span-1'>
            <label
              htmlFor='date_until2'
              className='block text-sm font-medium text-gray-700'
            >
              Fecha hasta
            </label>
            <input
              type='date'
              id='date_until2'
              name='date_until2'
              value={formData.date_until2}
              onChange={handleChange}
              className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
            />
          </div>

          <div className='col-span-2'>
            <label
              htmlFor='contact_ref3'
              className='block text-sm font-medium text-gray-700'
            >
              Contacto Referencia
            </label>
            <input
              type='text'
              id='contact_ref3'
              name='contact_ref3'
              value={formData.contact_ref3}
              onChange={handleChange}
              className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
            />
          </div>
          <div className='col-span-1'>
            <label
              htmlFor='date_start3'
              className='block text-sm font-medium text-gray-700'
            >
              Fecha desde
            </label>
            <input
              type='date'
              id='date_start3'
              name='date_start3'
              value={formData.date_start3}
              onChange={handleChange}
              className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
            />
          </div>
          <div className='col-span-1'>
            <label
              htmlFor='date_until3'
              className='block text-sm font-medium text-gray-700'
            >
              Fecha hasta
            </label>
            <input
              type='date'
              id='date_until3'
              name='date_until3'
              value={formData.date_until3}
              onChange={handleChange}
              className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
            />
          </div>
        </div>
        <div className='flex justify-between'>
          <div className='border border-gray-800 p-1 mb-2 mt-10'>
            Disponibilidad horaria
          </div>
        </div>
        <div className='grid grid-cols-2 md:grid md:grid-cols-3 gap-1'>
          {services.length > 0 &&
            services.map((service) => (
              <div key={service.id} className='flex items-center'>
                <input
                  type='checkbox'
                  id={`service-${service.id}`}
                  name='services'
                  value={service.id}
                  checked={formData.services?.includes(service.id)}
                  onChange={handleServiceChange}
                  className='mr-2'
                />
                <label
                  htmlFor={`service-${service.id}`}
                  className='font-medium text-gray-700'
                >
                  {service.name}
                </label>
              </div>
            ))}
        </div>
      </div>
    </form>
  );
};

export default Form;
