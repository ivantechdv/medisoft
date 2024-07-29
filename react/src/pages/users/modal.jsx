import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import Spinner from '../../components/Spinner/Spinner';

import ToastNotify from '../../components/toast/toast';
import {
  getData,
  postData,
  putData,
  postStorage,
  getStorage,
  deleteStorage,
} from '../../api';
const Modal = ({ isOpen, onClose, id }) => {
  const initialValues = {
    dni: '',
    first_name: '',
    last_name: '',
    full_name: '',
    email: '',
    phone: '',
    direction: '',
    avatar: '',
  };
  const [formData, setFormData] = useState(initialValues); // Aquí puedes inicializar los datos del formulario si es necesario
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // const isValid = validateRequiredFields();

      // if (!isValid) {
      //   setLoadingForm(false);
      //   return;
      // }
      setIsLoading(true);
      // Validar campos requeridos antes de enviar el formulario

      let response = false;

      const dataToSend = { ...formData };

      let message = '';
      if (!id) {
        response = await postData('users', dataToSend);
        message = 'Usuario registrado con exito';
      } else {
        response = await putData('users/' + id, dataToSend);
        message = 'Usuario actualizado con exito';
      }
      //changelogs
      // console.log('changelogs => ', changelogs);
      // const currentData = changeValueSelect(changelogs);
      // console.log('oldchangeLogs => ', oldChangelogs);
      // console.log('currentData => ', currentData);
      // await ChangeLogger({
      //   oldData: oldChangelogs,
      //   newData: currentData,
      //   user: null,
      //   module: 'clients',
      //   module_id: response.id,
      // });
      //changelogs
      if (response) {
        ToastNotify({
          message: message,
          position: 'top-left',
          type: 'success',
        });
        onClose();
        //window.location.href = '/client/' + response.id;
      }
    } catch (error) {
      console.log('error', error);
      ToastNotify({
        message: 'Error al procesar el formulario',
        position: 'top-left',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
      setFormData(initialValues);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 ${
        isOpen ? '' : 'hidden'
      }`}
    >
      {isLoading && <Spinner />}
      <div
        className='absolute top-0 right-0 transform bg-white p-6 rounded-md h-full shadow-md overflow-auto'
        style={{ width: 400 }}
      >
        <h2 className='text-lg font-semibold mb-4'>Formulario de Usuarios</h2>
        <div className='flex justify-center items-center '>
          <div className='rounded-full border border-blue-500 overflow-hidden w-32 h-32 flex items-center justify-center'>
            {formData.avatar != '' ? (
              <img
                src={formData.avatar || ''}
                alt=''
                className='w-full h-full object-cover'
              />
            ) : (
              <label
                htmlFor='file-upload'
                className='bg-gray-200 text-white rounded-full text-2xl w-32 h-32 flex justify-center items-center'
              >
                <input
                  type='file'
                  onChange={''}
                  className='hidden'
                  id='file-upload'
                />
                <FaUserCircle className='' size={102} />
              </label>
            )}
          </div>
        </div>
        <div className='mb-4'>
          <label htmlFor='dni' className='block mb-1'>
            DNI:
          </label>
          <input
            type='text'
            id='dni'
            value={formData.dni || ''}
            onChange={handleChange}
            className='border border-gray-300 rounded-md px-3 py-2 w-full'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='first_name' className='block mb-1'>
            Nombre:
          </label>
          <input
            type='text'
            id='first_name'
            value={formData.first_name || ''}
            onChange={handleChange}
            className='border border-gray-300 rounded-md px-3 py-2 w-full'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='last_name' className='block mb-1'>
            Apellidos:
          </label>
          <input
            type='text'
            id='last_name'
            value={formData.last_name || ''}
            onChange={handleChange}
            className='border border-gray-300 rounded-md px-3 py-2 w-full'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='email' className='block mb-1'>
            Email:
          </label>
          <input
            type='text'
            id='email'
            value={formData.email || ''}
            onChange={handleChange}
            className='border border-gray-300 rounded-md px-3 py-2 w-full'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='phone' className='block mb-1'>
            Teléfono:
          </label>
          <input
            type='text'
            id='phone'
            value={formData.phone || ''}
            onChange={handleChange}
            className='border border-gray-300 rounded-md px-3 py-2 w-full'
          />
        </div>
        {/* Agrega más campos de formulario según tus necesidades */}
        <div className='flex justify-between'>
          <button
            onClick={onClose}
            className='mr-2 px-4 py-2 text-white bg-red-500 rounded-md'
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className='px-4 py-2 bg-blue-500 text-white hover:bg-blue-700 rounded-md'
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
