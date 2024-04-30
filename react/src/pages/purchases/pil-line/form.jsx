import React, { useEffect, useState, useRef } from 'react';
import { show, postWithData, putWithData } from '../../../api';
import ToastNotify from '../../../components/toaster/toaster';
import Spinner from '../../../components/Spinner/Spinner';
import Select from '../../../components/Select';
import { formatRif } from '../../../components/InputFormat';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../../components/SweetAlert/SweetAlert';
import { useUser } from '../../../context/userContext';
const Form = ({ selectedRow, handleUpdate }) => {
  const { user } = useUser();
  const [action, setAction] = useState('Guardar');
  const sweetAlert = ConfirmSweetAlert({
    title: action,
    text: '¿Esta seguro que desea procesar los datos?',
    icon: 'question',
  });
  const initialValues = {
    code: '',
    name: '',
  };
  const [formData, setFormData] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const id = useRef('');

  useEffect(() => {
    console.log('row', selectedRow);
    if (selectedRow != null) {
      id.current = selectedRow.id;
      setFormData(selectedRow);
      setAction('Actualizar');
    } else {
      id.current = '';
      setFormData(initialValues);
      setAction('Guardar');
    }
  }, [selectedRow]);

  const handleChange = (event) => {
    let newValue = '';
    const { id, value, checked, type } = event.target;

    newValue = type === 'checkbox' ? checked : value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: newValue,
    }));
  };

  const handleConfirm = async () => {
    // if (
    //   !formData.title ||
    //   !formData.legal_category_id ||
    //   !formData.company_id ||
    //   (action === 'Guardar' && !formData.url)
    // ) {
    //   ToastNotify({
    //     message: 'Por favor complete todos los campos obligatorios.',
    //     position: 'top-right',
    //   });
    //   return; // Salir de la función si algún campo obligatorio está vacío
    // }

    await sweetAlert.showSweetAlert().then((result) => {
      const isConfirmed = result !== null && result;

      // Lógica basada en el resultado
      if (isConfirmed) {
        handleSubmit();
      } else {
        ToastNotify({
          message: 'Acción cancelada por el usuario',
          position: 'top-right',
        });
      }
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const dataToSend = {
      ...formData,
      creator_id: user.id,
      creator_name: user.first_name + ' ' + user.last_name,
      creator_username: user.email,
    };

    console.log('data', dataToSend);
    try {
      let response = '';

      if (id.current != '' && action == 'Actualizar') {
        response = await putWithData(
          'purchases/updatePurchasePilLine/' + id.current,
          dataToSend,
        );
        if (response) {
          handleUpdate();
          document.getElementById('code').focus();
        }
      } else {
        response = await postWithData(
          'purchases/createPurchasePilLine',
          dataToSend,
        );
        if (response) {
          setFormData(initialValues);
          document.getElementById('code').focus();
        }
      }
      ToastNotify({
        message: response.message,
      });
    } catch (error) {
      ToastNotify({
        message: 'Ocurrio un error al procesar el registro.',
        position: 'top-right',
      });
      console.error('Error a registrar:', error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 600);
    }
  };
  return (
    <div className='bg-white p-6 rounded shadow-lg w-full'>
      <form className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <div className='col-span-3 sm:col-span-3'>
          <div className='col-span-3 sm:col-span-3'>
            <label
              htmlFor='rif'
              className='block text-sm font-medium text-gray-700'
            >
              Creado por
            </label>
            <input
              type='text'
              id='code'
              name='code'
              disabled={true}
              value={user?.first_name + ' ' + user?.last_name}
              className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
            />
          </div>
        </div>
        {/* RIF */}
        <div className='col-span-1 sm:col-span-1'>
          <label
            htmlFor='rif'
            className='block text-sm font-medium text-gray-700'
          >
            Codigo
          </label>
          <input
            type='text'
            id='code'
            name='code'
            onChange={handleChange}
            value={formData.code}
            className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
          />
        </div>

        {/* Name */}
        <div className='col-span-1 sm:col-span-2'>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700'
          >
            Nombre
          </label>
          <input
            type='text'
            id='name'
            name='name'
            onChange={handleChange}
            value={formData.name}
            className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
          />
        </div>
        <div className='col-span-3 sm:col-span-3'>
          <div className='border w-full'> </div>
        </div>

        <div className='col-span-1 sm:col-span-3 text-center mt-5'>
          <button
            type='button'
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            onClick={handleConfirm}
          >
            {action}
          </button>
        </div>
      </form>
      {isLoading ? <Spinner /> : ''}
    </div>
  );
};

export default Form;
