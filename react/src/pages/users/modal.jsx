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
    profile: '',
    is_active: true,
  };

  const [formData, setFormData] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (validationErrors[id]) {
      setValidationErrors((prev) => ({
        ...prev,
        [id]: '',
      }));
    }
  };

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateRequiredFields = () => {
    const errors = {};
    let isValid = true;

    const requiredFields = ['first_name', 'last_name', 'dni', 'email', 'profile'];

    requiredFields.forEach((key) => {
      const value = formData[key] ? String(formData[key]).trim() : '';

      if (!value) {
        errors[key] = 'Este campo es requerido.';
        isValid = false;
        return;
      }

      if (key === 'dni') {
        if (!validarDNI(value) && !validarNIE(value)) {
          errors.dni = 'DNI/NIE no válido.';
          isValid = false;
        }
      }

      if (key === 'email') {
        if (!isValidEmail(value)) {
          errors.email = 'Formato de email no válido.';
          isValid = false;
        }
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
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

      const dataToSend = {
        ...formData,
        full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
        dni: formData.dni.trim().toUpperCase(),
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        profile: formData.profile.trim(),
        is_active: formData.is_active,
      };

      let response;
      let message;

      if (!id) {
        response = await postData('users', dataToSend);
        message = 'Usuario registrado con éxito';
        // Enviar correo de invitación para establecer contraseña la primera vez.
        // Se envía el redirect_url para que el backend genere una URL con token completa.
        try {
          const emailPayload = {
            email: response.email || dataToSend.email,
            redirect_url: `${window.location.origin}/set-password`,
          };
          // Endpoint esperado en el backend: POST /users/:id/send-password-email
          await postData(`users/${response.id}/send-password-email`, emailPayload);
        } catch (err) {
          console.error('Error al enviar correo de invitación:', err);
          ToastNotify({
            message: 'Usuario creado, pero no se pudo enviar el correo de invitación.',
            position: 'top-left',
            type: 'warning',
          });
        }
      } else {
        response = await putData('users/' + id, dataToSend);
        message = 'Usuario actualizado con éxito';
      }

      if (response) {
        ToastNotify({
          message,
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
      if (isValid) {
        setFormData(initialValues);
        setValidationErrors({});
      }
    }
  };

  useEffect(() => {
    if (row) {
      setFormData(row);
    } else {
      setFormData(initialValues);
    }
    setValidationErrors({});
  }, [row, isOpen]);

  const toggleActive = () => {
    setFormData((prev) => ({
      ...prev,
      is_active: !prev.is_active,
    }));
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center ${
        isOpen ? '' : 'hidden'
      }`}
    >
      {isLoading && <Spinner />}

      <div
        className="bg-white p-6 shadow-2xl rounded-lg overflow-auto"
        style={{ width: 900, maxHeight: '90vh' }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-orange-500">Gestión de Usuarios</h2>

          <div className="flex items-center space-x-3">
            <span className="text-blue-600 font-semibold">Activo</span>

            <button
              type="button"
              onClick={toggleActive}
              aria-pressed={formData.is_active}
              className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-200 ${
                formData.is_active ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`transform transition-transform duration-200 bg-white w-4 h-4 rounded-full shadow-sm ${
                  formData.is_active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="col-span-1 flex flex-col items-center">
            <div className="text-center mb-4">
              <div className="text-blue-600 font-semibold text-lg">ID Usuario</div>
              <div className="text-4xl font-bold">{id || '---'}</div>
            </div>

            <div className="rounded-full border border-gray-300 overflow-hidden w-40 h-40 flex items-center justify-center">
              {formData.avatar ? (
                <img src={formData.avatar} className="w-full h-full object-cover" />
              ) : (
                <label
                  htmlFor="file-upload"
                  className="bg-gray-200 rounded-full w-40 h-40 flex items-center justify-center cursor-pointer"
                >
                  <input type="file" id="file-upload" className="hidden" />
                  <FaUserCircle size={140} className="text-gray-400" />
                </label>
              )}
            </div>

            <button className="mt-6 bg-gray-800 text-white px-4 py-2 rounded">
              Restablecer Password
            </button>
          </div>

          {/* RIGHT */}
          <div className="col-span-2">

            {/* Nombre */}
            <div className="mb-3">
              <label className="font-semibold">Nombre</label>
              <input
                type="text"
                id="first_name"
                value={formData.first_name || ''}
                onChange={handleChange}
                className={`border rounded px-3 py-2 w-full ${
                  validationErrors.first_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.first_name && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.first_name}</p>
              )}
            </div>

            {/* Apellidos */}
            <div className="mb-3">
              <label className="font-semibold">Apellidos</label>
              <input
                type="text"
                id="last_name"
                value={formData.last_name || ''}
                onChange={handleChange}
                className={`border rounded px-3 py-2 w-full ${
                  validationErrors.last_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.last_name && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.last_name}</p>
              )}
            </div>

            {/* DNI y Teléfono */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="font-semibold">DNI</label>
                <input
                  type="text"
                  id="dni"
                  value={formData.dni || ''}
                  onChange={handleChange}
                  className={`border rounded px-3 py-2 w-full ${
                    validationErrors.dni ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.dni && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.dni}</p>
                )}
              </div>

              <div>
                <label className="font-semibold">Teléfono</label>
                <input
                  type="text"
                  id="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="font-semibold">Email</label>
              <input
                type="text"
                id="email"
                value={formData.email || ''}
                onChange={handleChange}
                className={`border rounded px-3 py-2 w-full ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Perfil */}
            <div className="mb-3">
              <label className="font-semibold">Perfil</label>
              <select
                id="profile"
                value={formData.profile}
                onChange={handleChange}
                className={`border rounded px-3 py-2 w-full ${
                  validationErrors.profile ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione</option>
                <option>Admin</option>
                <option>Usuario</option>
              </select>
              {validationErrors.profile && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.profile}</p>
              )}
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={onClose}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
