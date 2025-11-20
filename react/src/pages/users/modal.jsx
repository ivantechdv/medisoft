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
import { validarDNI, validarNIE } from '../../utils/customFormat';

// Asume que estas funciones están en '../../utils/validations.js'

const Modal = ({ isOpen, onClose, id, row }) => {
  const initialValues = {
    dni: '',
    first_name: '',
    last_name: '',
    full_name: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
  };
  const [formData, setFormData] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({}); // Estado para errores de validación

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
    // Limpiar el error de validación para el campo modificado
    if (validationErrors[id]) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        [id]: '',
      }));
    }
  };

  /**
   * Función para validar el formato de email.
   * @param {string} email
   * @returns {boolean}
   */
  const isValidEmail = (email) => {
    // Regex simple para email (podría ser más complejo si es necesario)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Función para validar todos los campos del formulario.
   * @returns {boolean} - true si es válido, false si hay errores.
   */
  const validateRequiredFields = () => {
    const errors = {};
    let isValid = true;

    // 1. Validar campos requeridos y que no dejen espacios en blanco
    for (const key in initialValues) {
      if (key !== 'full_name' && key !== 'avatar' && key !== 'address' && key !== 'phone') { // Campos que considerás requeridos para el envío
        const value = formData[key] ? String(formData[key]).trim() : '';

        if (!value) {
          errors[key] = 'Este campo es requerido.';
          isValid = false;
        } else if (key === 'dni') {
          // 2. Validar DNI/NIE
          if (!validarDNI(value) && !validarNIE(value)) {
            errors[key] = 'DNI/NIE no válido.';
            isValid = false;
          }
        } else if (key === 'email') {
          // 3. Validar Email
          if (!isValidEmail(value)) {
            errors[key] = 'Formato de email no válido.';
            isValid = false;
          }
        }
      }
    }
    
    // Validar teléfono y dirección si también los consideras requeridos
    if (!formData.phone || String(formData.phone).trim() === '') {
        errors.phone = 'El teléfono es requerido.';
        isValid = false;
    }
    if (!formData.address || String(formData.address).trim() === '') {
        errors.address = 'La dirección es requerida.';
        isValid = false;
    }


    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    // 1. Validar el formulario
    const isValid = validateRequiredFields();

    if (!isValid) {
      ToastNotify({
        message: 'Por favor, corrige los errores del formulario.',
        position: 'top-left',
        type: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);

      let response = false;
      const dataToSend = {
        ...formData,
        full_name: formData.first_name.trim() + ' ' + formData.last_name.trim(), // Asegurar que full_name se construye limpio
        dni: formData.dni.trim().toUpperCase(), // Normalizar DNI/NIE
        email: formData.email.trim(), // Limpiar email
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      let message = '';
      if (!id) {
        // Creación
        response = await postData('users', dataToSend);
        message = 'Usuario registrado con éxito';
      } else {
        // Edición
        response = await putData('users/' + id, dataToSend);
        message = 'Usuario actualizado con éxito';
      }

      if (response) {
        ToastNotify({
          message: message,
          position: 'top-left',
          type: 'success',
        });
        onClose('update');
      }
    } catch (error) {
      console.error('error', error);
      ToastNotify({
        message: 'Error al procesar el formulario',
        position: 'top-left',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
      // Solo resetear si fue una operación exitosa (o decidir si resetear siempre)
      if (isValid) { 
        setFormData(initialValues);
        setValidationErrors({});
      }
    }
  };

  useEffect(() => {
    if (row) {
      setFormData(row);
      setValidationErrors({}); // Limpiar errores al cargar datos para edición
    } else {
      setFormData(initialValues);
      setValidationErrors({}); // Limpiar errores al abrir para creación
    }
  }, [row, isOpen]); // Asegúrate de reaccionar al cambio de `row` e `isOpen`

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
        {/* ... (Parte del Avatar omitida para brevedad, es la misma que tenías) */}
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

        {/* --- Campos del Formulario --- */}
        <div className='mb-4'>
          <label htmlFor='dni' className='block mb-1 font-medium'>
            DNI/NIE <span className='text-red-500'>*</span>:
          </label>
          <input
            type='text'
            id='dni'
            value={formData.dni || ''}
            onChange={handleChange}
            className={`border rounded-md px-3 py-2 w-full ${
              validationErrors.dni ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.dni && (
            <p className='text-red-500 text-sm mt-1'>{validationErrors.dni}</p>
          )}
        </div>
        <div className='mb-4'>
          <label htmlFor='first_name' className='block mb-1 font-medium'>
            Nombre <span className='text-red-500'>*</span>:
          </label>
          <input
            type='text'
            id='first_name'
            value={formData.first_name || ''}
            onChange={handleChange}
            className={`border rounded-md px-3 py-2 w-full ${
              validationErrors.first_name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.first_name && (
            <p className='text-red-500 text-sm mt-1'>
              {validationErrors.first_name}
            </p>
          )}
        </div>
        <div className='mb-4'>
          <label htmlFor='last_name' className='block mb-1 font-medium'>
            Apellidos <span className='text-red-500'>*</span>:
          </label>
          <input
            type='text'
            id='last_name'
            value={formData.last_name || ''}
            onChange={handleChange}
            className={`border rounded-md px-3 py-2 w-full ${
              validationErrors.last_name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.last_name && (
            <p className='text-red-500 text-sm mt-1'>
              {validationErrors.last_name}
            </p>
          )}
        </div>
        <div className='mb-4'>
          <label htmlFor='email' className='block mb-1 font-medium'>
            Email <span className='text-red-500'>*</span>:
          </label>
          <input
            type='text'
            id='email'
            value={formData.email || ''}
            onChange={handleChange}
            className={`border rounded-md px-3 py-2 w-full ${
              validationErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.email && (
            <p className='text-red-500 text-sm mt-1'>{validationErrors.email}</p>
          )}
        </div>
        <div className='mb-4'>
          <label htmlFor='phone' className='block mb-1 font-medium'>
            Teléfono <span className='text-red-500'>*</span>:
          </label>
          <input
            type='text'
            id='phone'
            value={formData.phone || ''}
            onChange={handleChange}
            className={`border rounded-md px-3 py-2 w-full ${
              validationErrors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.phone && (
            <p className='text-red-500 text-sm mt-1'>{validationErrors.phone}</p>
          )}
        </div>
        <div className='mb-4'>
          <label htmlFor='address' className='block mb-1 font-medium'>
            Dirección <span className='text-red-500'>*</span>:
          </label>
          <input
            type='text'
            id='address'
            value={formData.address || ''}
            onChange={handleChange}
            className={`border rounded-md px-3 py-2 w-full ${
              validationErrors.address ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.address && (
            <p className='text-red-500 text-sm mt-1'>{validationErrors.address}</p>
          )}
        </div>
        
        {/* --- Botones --- */}
        <div className='flex justify-between'>
          <button
            onClick={() => {
              onClose();
              setValidationErrors({}); // Limpia errores al cancelar
              setFormData(initialValues); // Opcional: limpiar el formulario
            }}
            className='mr-2 px-4 py-2 text-white bg-red-500 rounded-md'
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className='px-4 py-2 bg-blue-500 text-white hover:bg-blue-700 rounded-md disabled:opacity-50'
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;