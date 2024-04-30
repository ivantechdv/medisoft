import React, { useEffect, useState, useRef } from 'react';
import { show, postWithData, putWithData } from '../../../api';
import ToastNotify from '../../../components/toaster/toaster';
import Spinner from '../../../components/Spinner/Spinner';
import Select from '../../../components/Select';
import { formatRif } from '../../../components/InputFormat';
import { useUser } from '../../../context/userContext';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../../components/SweetAlert/SweetAlert';
const Form = ({ selectedRow, handleUpdate }) => {
  const [action, setAction] = useState('Guardar');
  const sweetAlert = ConfirmSweetAlert({
    title: action,
    text: '¿Esta seguro que desea procesar proveedor?',
    icon: 'question',
  });
  const initialValues = {
    user_id: '',
    rif: '',
    name: '',
    facility_id: '',
    provider_category_id: '',
    provider_type: '',
    person_contact: '',
    phone: '',
    email: '',
    is_full_doc: false,
    is_tyc: false,
    is_audited: false,
    description: '',
    observation: '',
  };
  const { user } = useUser();
  const [formData, setFormData] = useState(initialValues);
  const [facilities, setFacilities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const id = useRef('');
  useEffect(() => {
    const fetchSelect = async () => {
      const fa = await show('facilities/getAll');
      setFacilities(fa);
      const cat = await show('providers/allCategories');
      if (cat) {
        const options = cat.map((item) => ({
          value: item.id,
          label: item.name,
        }));

        setCategories(options);
      }
    };

    fetchSelect();
  }, []);

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
    if (id === 'rif') {
      newValue = formatRif(value);
    } else {
      newValue = type === 'checkbox' ? checked : value;
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: newValue,
    }));
  };
  const handleChangeSelect = (selectedOption) => {
    const newValue = selectedOption.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      provider_category_id: newValue,
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
    const dataToSend = { ...formData, user_id: user?.id };
    try {
      let response = '';

      if (id.current != '' && action == 'Actualizar') {
        response = await putWithData('providers/' + id.current, dataToSend);
        if (response) {
          handleUpdate();
          document.getElementById('rif').focus();
        }
      } else {
        response = await postWithData('providers', dataToSend);
        if (response) {
          setFormData(initialValues);
          document.getElementById('rif').focus();
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
      setIsLoading(false);
    }
  };
  return (
    <div className='bg-white p-6 rounded shadow-lg w-full'>
      <form className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        {/* RIF */}
        <div className='col-span-1 sm:col-span-1'>
          <label
            htmlFor='rif'
            className='block text-sm font-medium text-gray-700'
          >
            RIF
          </label>
          <input
            type='text'
            id='rif'
            name='rif'
            onChange={handleChange}
            value={formData.rif}
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

        <div className='col-span-1 sm:col-span-1'>
          <label
            htmlFor='facility_id'
            className='block text-sm font-medium text-gray-700'
          >
            Facilidad/Locación
          </label>
          <select
            id='facility_id'
            name='facility_id'
            className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
            onChange={handleChange}
            value={formData.facility_id}
          >
            <option>Seleccione...</option>
            {facilities.length > 0 &&
              facilities.map((state) => (
                <optgroup key={state.id} label={state.state}>
                  {state.facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>
        </div>

        <div className='col-span-1 sm:col-span-1'>
          <label
            htmlFor='provider_category_id'
            className='block text-sm font-medium text-gray-700'
          >
            Categoría
          </label>
          <Select
            id='provider_category_id'
            name='provider_category_id'
            options={categories}
            onChange={handleChangeSelect}
            defaultValue={formData.provider_category_id}
          />
          {/* <select
            id='provider_category_id'
            name='provider_category_id'
            className='mt-1 p-1 w-full border rounded-md'
            onChange={handleChange}
            value={formData.provider_category_id}
          >
            <option value='0'>Seleccione...</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select> */}
        </div>

        {/* Provider Type */}
        <div className='col-span-1 sm:col-span-1'>
          <label
            htmlFor='provider_type'
            className='block text-sm font-medium text-gray-700'
          >
            Tipo de proveedor
          </label>
          <select
            id='provider_type'
            name='provider_type'
            onChange={handleChange}
            value={formData.provider_type}
            className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
          >
            <option value='0'>Seleccione...</option>
            <option value='Regular'>Regular</option>
            <option value='Critico'>Critico</option>
          </select>
        </div>

        {/* Person Contact */}
        <div className='col-span-1 sm:col-span-1'>
          <label
            htmlFor='person_contact'
            className='block text-sm font-medium text-gray-700'
          >
            Persona de contacto
          </label>
          <input
            type='text'
            id='person_contact'
            name='person_contact'
            onChange={handleChange}
            value={formData.person_contact}
            className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
          />
        </div>

        {/* Phone */}
        <div className='col-span-1 sm:col-span-1'>
          <label
            htmlFor='phone'
            className='block text-sm font-medium text-gray-700'
          >
            Teléfono
          </label>
          <input
            type='text'
            id='phone'
            name='phone'
            onChange={handleChange}
            value={formData.phone}
            className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
          />
        </div>

        {/* Email */}
        <div className='col-span-1 sm:col-span-1'>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700'
          >
            Correo electrónico
          </label>
          <input
            type='email'
            id='email'
            name='email'
            onChange={handleChange}
            value={formData.email}
            className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
          />
        </div>

        {/* Is Full Doc */}
        <div className='col-span-1 sm:col-span-1'>
          <label
            htmlFor='is_full_doc'
            className='block text-sm font-medium text-gray-700'
          >
            ¿Documentos completos?
          </label>
          <input
            type='checkbox'
            id='is_full_doc'
            name='is_full_doc'
            checked={formData.is_full_doc}
            onChange={handleChange}
            className='mt-1 block focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded'
          />
        </div>

        {/* Is TYC */}
        <div className='col-span-1 sm:col-span-1'>
          <label
            htmlFor='is_tyc'
            className='block text-sm font-medium text-gray-700'
          >
            ¿Cuenta con T&C?
          </label>
          <input
            type='checkbox'
            id='is_tyc'
            name='is_tyc'
            checked={formData.is_tyc}
            onChange={handleChange}
            className='mt-1 block focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded'
          />
        </div>

        {/* Is Audited */}
        <div className='col-span-1 sm:col-span-1'>
          <label
            htmlFor='is_audited'
            className='block text-sm font-medium text-gray-700'
          >
            ¿Esta Auditado?
          </label>
          <input
            type='checkbox'
            id='is_audited'
            name='is_audited'
            checked={formData.is_audited}
            onChange={handleChange}
            className='mt-1 block focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded'
          />
        </div>

        {/* Description */}
        <div className='col-span-1 sm:col-span-3'>
          <label
            htmlFor='description'
            className='block text-sm font-medium text-gray-700'
          >
            Descripción
          </label>
          <textarea
            id='description'
            name='description'
            rows='3'
            value={formData.description}
            onChange={handleChange}
            className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
          ></textarea>
        </div>

        {/* Observation */}
        <div className='col-span-1 sm:col-span-3'>
          <label
            htmlFor='observation'
            className='block text-sm font-medium text-gray-700'
          >
            Observación
          </label>
          <textarea
            id='observation'
            name='observation'
            rows='3'
            value={formData.observation}
            onChange={handleChange}
            className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
          ></textarea>
        </div>
        <div className='col-span-1 sm:col-span-3 text-center'>
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
