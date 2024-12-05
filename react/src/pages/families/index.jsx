import React, { useState, useEffect } from 'react';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../components/SweetAlert/SweetAlert';
import { postData, putData, deleteById } from '../../api/index';

const Families = ({
  isOpen,
  onClose,
  client_id,
  formDataFamily,
  getFamilies,
}) => {
  const [formData, setFormData] = useState({
    client_id: client_id,
    id: '',
    name: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState({});

  // Actualizar el estado si formDataFamily cambia
  useEffect(() => {
    if (formDataFamily) {
      setFormData((prev) => ({
        ...prev,
        id: formDataFamily.id || '',
        name: formDataFamily.name || '',
        phone: formDataFamily.phone || '',
        email: formDataFamily.email || '',
      }));
      setErrors({});
    }
  }, [formDataFamily]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'El nombre es obligatorio.';
    if (!formData.phone) {
      newErrors.phone = 'El teléfono es obligatorio.';
    }
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido.';
    }
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const dataToSend = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        client_id: client_id,
      };
      if (formData.id == '') {
        await postData('family', dataToSend);
      } else {
        await putData('family/' + formData.id, dataToSend);
      }

      InfoSweetAlert({
        title: 'Familiar registrado/actualizado',
        text: 'Los datos se han guardado exitosamente.',
        icon: 'success',
      });

      setFormData({ name: '', phone: '', email: '' });
      getFamilies();
      onClose();
    } catch (error) {
      InfoSweetAlert({
        title: 'Error',
        text: 'Hubo un problema al guardar los datos.',
        icon: 'error',
      });
    }
  };

  const deleteFamily = async () => {
    try {
      await deleteById('family/', formData.id);
      getFamilies();
      onClose();
    } catch (error) {
      InfoSweetAlert({
        title: 'Error',
        text: 'Hubo un problema al eliminar los datos.',
        icon: 'error',
      });
    }
  };

  return isOpen ? (
    <div className='fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-10'>
      <div className='bg-white rounded-lg w-96 p-6 shadow-lg'>
        <h2 className='text-lg font-bold mb-4'>Registrar Cliente</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Nombre
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm ${
                errors.name ? 'border-red-500' : ''
              }`}
            />
            {errors.name && (
              <p className='text-red-500 text-xs mt-1'>{errors.name}</p>
            )}
          </div>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Teléfono
            </label>
            <input
              type='text'
              name='phone'
              value={formData.phone}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md  border border-gray-300 shadow-sm ${
                errors.phone ? 'border-red-500' : ''
              }`}
            />
            {errors.phone && (
              <p className='text-red-500 text-xs mt-1'>{errors.phone}</p>
            )}
          </div>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Correo Electrónico
            </label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md  border border-gray-300 shadow-sm ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
            {errors.email && (
              <p className='text-red-500 text-xs mt-1'>{errors.email}</p>
            )}
          </div>
          <div className='flex justify-end'>
            {formData.id != '' && (
              <button
                type='button'
                onClick={deleteFamily}
                className='bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mr-2'
              >
                Borrar
              </button>
            )}
            <button
              type='button'
              onClick={onClose}
              className='bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded mr-2'
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='bg-primary hover:bg-blue-600 text-white py-2 px-4 rounded'
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default Families;
