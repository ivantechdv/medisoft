import React, { useState, useEffect, useRef } from 'react';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../components/SweetAlert/SweetAlert';
const Modal = ({ isOpen, onClose, onSave }) => {
  const [action, setAction] = useState('Guardar');
  const id = useRef('');
  const sweetAlert = ConfirmSweetAlert({
    title: action + ' Cliente',
    text: '¿Esta seguro que desea guardar los datos?',
    icon: 'question',
  });
  const initialValues = {
    dni: '',
    first_name: '',
    last_name: '',
    cod_post_id: '',
    gender_id: '',
    phone: '',
    email: '',
    start_date: '',
    final_date: '',
    address: '',
    born_date: '',
  };
  const [formData, setFormData] = useState(initialValues);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
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
    try {
      setIsLoading(true);
      const dataToSend = { ...formData, user_id: user?.id };

      let response = '';

      if (id.current != '' && action == 'Actualizar') {
        response = await putData('clients/' + id.current, dataToSend);
      } else {
        response = await postData('clients/', dataToSend);
      }
      setFormData(initialValues);
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
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 ${
        isOpen ? '' : 'hidden'
      }`}
    >
      <div
        className='absolute top-0 right-0 transform bg-white p-6 rounded-md h-full shadow-md overflow-auto'
        style={{ width: 500 }}
      >
        <form>
          <h2 className='text-lg font-semibold mb-4'>
            {action + ' '} Clientes
          </h2>
          <div className='mb-2'>
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
          <div className='mb-2'>
            <label htmlFor='first_name' className='block mb-1'>
              Nombres:
            </label>
            <input
              type='text'
              id='first_name'
              value={formData.first_name || ''}
              onChange={handleChange}
              className='border border-gray-300 rounded-md px-3 py-2 w-full'
            />
          </div>
          <div className='mb-2'>
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
          <div className='mb-2'>
            <label htmlFor='born_date' className='block mb-1'>
              Fecha de Nacimiento:
            </label>
            <input
              type='date'
              id='born_date'
              value={formData.born_date || ''}
              onChange={handleChange}
              className='border border-gray-300 rounded-md px-3 py-2 w-full'
            />
          </div>
          <div className='mb-2'>
            <label htmlFor='gender_id' className='block mb-1'>
              Genero:
            </label>
            <select
              className='border border-gray-300 rounded-md px-3 py-2 w-full'
              name='gender_id'
              id='gender_id'
            >
              <option>Seleccione</option>
            </select>
          </div>
          <div className='mb-2'>
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
          <div className='mb-2'>
            <label htmlFor='email' className='block mb-1'>
              Email:
            </label>
            <input
              type='email'
              id='email'
              value={formData.email || ''}
              onChange={handleChange}
              className='border border-gray-300 rounded-md px-3 py-2 w-full'
            />
          </div>
          <div className='mb-2'>
            <label htmlFor='start_date' className='block mb-1'>
              Fecha de inicio:
            </label>
            <input
              type='date'
              id='start_date'
              value={formData.start_date || ''}
              onChange={handleChange}
              className='border border-gray-300 rounded-md px-3 py-2 w-full'
            />
          </div>
          <div className='mb-2'>
            <label htmlFor='address' className='block mb-1'>
              Dirección:
            </label>
            <textarea
              name='address'
              id='address'
              rows={3}
              value={formData.address || ''}
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
              onClick={handleConfirm}
              className='px-4 py-2 bg-blue-500 text-white hover:bg-blue-700 rounded-md'
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
