import React, { useState, useEffect, useRef } from 'react';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../components/SweetAlert/SweetAlert2';
import { postData, putData, deleteById, getData } from '../../api/index';

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
    phone2: '',
    email: '',
    priority: '',
    send_invoice: false,
    send_comunication: false,
    relation_id: 0,
    observations: '',
  });

  const [errors, setErrors] = useState({});
  const [relations, setRelations] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchRelaciones = async () => {
      const response = await getData('relations/all');
      console.log('RELATIONS', response);
      setRelations(response || []);
    };

    fetchRelaciones();
  }, []);

  // Actualizar el estado si formDataFamily cambia
  useEffect(() => {
    console.log('formDataFamily', formDataFamily);
    if (formDataFamily) {
      setFormData((prev) => ({
        ...prev,
        id: formDataFamily.id || '',
        name: formDataFamily.name || '',
        phone: formDataFamily.phone || '',
        phone2: formDataFamily.phone2 || '',
        email: formDataFamily.email || '',
        priority: formDataFamily.priority || '',
        send_invoice: formDataFamily.send_invoice || false,
        send_comunication: formDataFamily.send_comunication || false,
        relation_id: formDataFamily.relation_id || 0,
        observations: formDataFamily.observations || '',
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
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido.';
    }
    if (!formData.priority) {
      newErrors.priority = 'La prioridad es obligatoria.';
    } else if (
      isNaN(formData.priority) ||
      formData.priority <= 0 ||
      !Number.isInteger(Number(formData.priority))
    ) {
      newErrors.priority = 'La prioridad debe ser un número entero positivo.';
    }
    if (!formData.relation_id) {
      newErrors.relation_id = 'Seleccione la relacion familiar.';
    }
    return newErrors;
  };

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email); // Valida formato de email
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Solo dígitos
    let rawValue = value;
    if (name === 'phone' || name === 'phone2') {
      const rawValue = value.replace(/\D/g, '');
      const input = e.target;
      const prevFormatted = formatPhoneNumber(formData[name] || '');
      const newFormatted = formatPhoneNumber(rawValue);

      let cursorPosition = input.selectionStart;

      const addedSpaces =
        (newFormatted.match(/ /g) || []).length -
        (prevFormatted.match(/ /g) || []).length;
      cursorPosition += addedSpaces;

      if (rawValue.length <= 9) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: rawValue,
        }));

        requestAnimationFrame(() => {
          const newCursorPosition = Math.min(
            cursorPosition,
            newFormatted.length,
          );
          input.setSelectionRange(newCursorPosition, newCursorPosition);
        });
      }
    } else {
      setFormData({ ...formData, [name]: rawValue });
    }
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
        phone2: formData.phone2,
        email: formData.email,
        priority: formData.priority,
        send_invoice: formData.send_invoice,
        send_comunication: formData.send_comunication,
        client_id: client_id,
        relation_id: formData.relation_id,
        observations: formData.observations,
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
        phone2: '',
        email: '',
        priority: '',
        send_invoice: false,
        send_comunication: false,
        relation_id: 0,
        observations: '',
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
    ConfirmSweetAlert({
      title: 'Confirmar eliminación',
      text: '¿Estás seguro de eliminar este familiar?',
      onConfirm: async () => {
        try {
          await deleteById('family/', formData.id);
          InfoSweetAlert({
            title: 'Eliminado',
            text: 'Familiar eliminado exitosamente',
            icon: 'success',
          });
          getFamilies();
          onClose();
        } catch (error) {
          InfoSweetAlert({
            title: 'Error',
            text: 'Hubo un problema al eliminar los datos.',
            icon: 'error',
          });
        }
      },
    });
  };
  const toggleNotification = () => {
    if (isValidEmail(formData.email)) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        send_comunication: !prevFormData.send_comunication,
      }));
    }
  };

  const toggleInvoice = () => {
    if (isValidEmail(formData.email)) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        send_invoice: !prevFormData.send_invoice,
      }));
    }
  };
  const formatPhoneNumber = (phone) => {
    return phone.replace(/(\d{3})(?=\d)/g, '$1 ');
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
              Relación
            </label>
            <select
              name='relation_id'
              value={formData.relation_id}
              onChange={handleInputChange}
              className={`w-full px-3 mt-1 p-0.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 ${
                errors.relation_id ? 'border-red-500' : ''
              }`}
            >
              <option value=''>Seleccione</option>
              {relations &&
                relations.map((rel) => (
                  <option key={rel.id} value={rel.id}>
                    {rel.name}
                  </option>
                ))}
            </select>
            {errors.relation_id && (
              <p className='text-red-500 text-xs mt-1'>{errors.relation_id}</p>
            )}
          </div>

          <div class='mb-4 flex items-center'>
            <label class='block text-sm font-medium text-[#50a0ec] w-28'>
              Teléfono
            </label>
            <input
              type='text'
              ref={inputRef} // Asigna la referencia
              name='phone'
              value={formatPhoneNumber(formData.phone)}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm ${
                errors.phone ? 'border-red-500' : ''
              }`}
            />
            {errors.phone && (
              <p class='text-red-500 text-xs mt-1'>{errors.phone}</p>
            )}
          </div>
          <div class='mb-4 flex items-center'>
            <label class='block text-sm font-medium text-[#50a0ec] w-28'>
              Teléfono 2 (Opcional)
            </label>
            <input
              type='text'
              name='phone2'
              value={formatPhoneNumber(formData.phone2)}
              onChange={handleInputChange}
              class={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm`}
            />
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
                  }${
                    !isValidEmail(formData.email)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  onClick={toggleNotification}
                  disabled={!isValidEmail(formData.email)}
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
                  }${
                    !isValidEmail(formData.email)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  onClick={toggleInvoice}
                  disabled={!isValidEmail(formData.email)}
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
          <div className='mb-4'>
            <label
              htmlFor='notas'
              className='block text-sm font-medium text-[#50a0ec] w-28'
            >
              Notas
            </label>
            <textarea
              id='observations'
              name='observations'
              rows={4}
              value={formData.observations || ''}
              onChange={handleInputChange}
              className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              placeholder='Agrega notas adicionales aquí'
            />
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
