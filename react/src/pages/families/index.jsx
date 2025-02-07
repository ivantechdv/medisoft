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
    priority: '',
    send_invoice: false,
    send_comunication: false,
  });

  const [errors, setErrors] = useState({});

  // Actualizar el estado si formDataFamily cambia
  useEffect(() => {
    console.log('formDataFamily', formDataFamily);
    if (formDataFamily) {
      setFormData((prev) => ({
        ...prev,
        id: formDataFamily.id || '',
        name: formDataFamily.name || '',
        phone: formDataFamily.phone || '',
        email: formDataFamily.email || '',
        priority: formDataFamily.priority || '',
        send_invoice: formDataFamily.send_invoice || false,
        send_comunication: formDataFamily.send_comunication || false,
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
        priority: formData.priority,
        send_invoice: formData.send_invoice,
        send_comunication: formData.send_comunication,
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

      setFormData({
        name: '',
        phone: '',
        email: '',
        priority: '',
        send_invoice: false,
        send_comunication: false,
      });
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

  const toggleNotification = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      send_comunication: !prevFormData.send_comunication,
    }));
  };
  const toggleInvoice = async () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      send_invoice: !prevFormData.send_invoice,
    }));
  };
  return isOpen ? (
    <div className='fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-10'>
      <div className='bg-white rounded-lg w-96 p-6 shadow-lg'>
        <h2 className='text-lg font-bold mb-4 text-[#f88d4a]'>Alta Familiar</h2>
        <form onSubmit={handleSubmit}>
          <div class='mb-4 flex items-center'>
            <label class='block text-sm font-medium text-[#50a0ec] w-28'>
              Nombre
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              class={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm ${
                errors.name ? 'border-red-500' : ''
              }`}
            />
            {errors.name && (
              <p class='text-red-500 text-xs mt-1'>{errors.name}</p>
            )}
          </div>

          <div class='mb-4 flex items-center'>
            <label class='block text-sm font-medium text-[#50a0ec] w-28'>
              Teléfono
            </label>
            <input
              type='text'
              name='phone'
              value={formData.phone}
              onChange={handleInputChange}
              class={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm ${
                errors.phone ? 'border-red-500' : ''
              }`}
            />
            {errors.phone && (
              <p class='text-red-500 text-xs mt-1'>{errors.phone}</p>
            )}
          </div>

          <div class='mb-4 flex items-center'>
            <label class='block text-sm font-medium text-[#50a0ec] w-28'>
              Email
            </label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              class={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
            {errors.email && (
              <p class='text-red-500 text-xs mt-1'>{errors.email}</p>
            )}
          </div>
          <div class='mb-4 flex items-center justify-start'>
            <label class='block text-sm font-medium text-[#50a0ec] w-40'>
              Prioridad de contacto
            </label>
            <input
              type='number'
              min={1}
              max={10}
              name='priority'
              value={formData.priority}
              onChange={handleInputChange}
              class={`mt-1 block w-12  rounded-md border border-gray-300 shadow-sm ${
                errors.priority ? 'border-red-500' : ''
              }`}
            />
            {errors.priority && (
              <p class='text-red-500 text-xs mt-1'>{errors.priority}</p>
            )}
          </div>
          <div class='mb-4 flex items-center justify-start'>
            <label class='block text-sm font-medium text-[#50a0ec] w-40'>
              Notificaciones
            </label>
            <div className='flex flex-col space-y-2'>
              <div className='flex space-x-2'>
                <button
                  type='button'
                  className={`relative inline-flex items-center h-4 rounded-full w-8 mr-2  mt-1 ${
                    formData.send_comunication ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  onClick={toggleNotification}
                >
                  <span
                    className={`inline-block w-4 h-4 transform rounded-full bg-white shadow-md transition-transform ${
                      formData.send_comunication
                        ? 'translate-x-4'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
                <label className='ml-2 text-bold'>Comunicacion</label>
              </div>
              <div className='flex space-x-2'>
                <button
                  type='button'
                  className={`relative inline-flex items-center h-4 rounded-full w-8 mr-2  mt-1 ${
                    formData.send_invoice ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  onClick={toggleInvoice}
                >
                  <span
                    className={`inline-block w-4 h-4 transform rounded-full bg-white shadow-md transition-transform ${
                      formData.send_invoice ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <label className='ml-2 text-bold'>Facturacion</label>
              </div>
            </div>
          </div>

          <div class='flex justify-end'>
            {formData.id != '' && (
              <button
                type='button'
                onClick={deleteFamily}
                class='bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mr-2'
              >
                Borrar
              </button>
            )}
            <button
              type='button'
              onClick={onClose}
              class='bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded mr-2'
            >
              Cancelar
            </button>
            <button
              type='submit'
              class='bg-primary hover:bg-blue-600 text-white py-2 px-4 rounded'
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
