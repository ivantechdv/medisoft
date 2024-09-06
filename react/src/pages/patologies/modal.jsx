import React, { useState, useEffect } from 'react';
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
const Modal = ({ isOpen, onClose, id, row }) => {
  const initialValues = {
    name: '',
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

      const dataToSend = {
        ...formData,
      };

      let message = '';
      if (!id) {
        response = await postData('patologies', dataToSend);
        message = 'Patologia registrado con exito';
      } else {
        response = await putData('patologies/' + id, dataToSend);
        message = 'Patologia actualizado con exito';
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
        onClose('update');
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

  useEffect(() => {
    if (row) {
      setFormData(row);
    }
  }, [row]);

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
        <h2 className='text-lg font-semibold mb-4'>Gestion de Patologias</h2>

        <div className='mb-4'>
          <label htmlFor='name' className='block mb-1'>
            Nombre:
          </label>
          <input
            type='text'
            id='name'
            value={formData.name || ''}
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
