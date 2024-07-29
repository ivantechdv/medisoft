import React, { useState, useEffect, useRef } from 'react';
import {
  getData,
  postData,
  putData,
  postStorage,
  getStorage,
  deleteStorage,
} from '../../../api';
import { json, useNavigate } from 'react-router-dom';
import Select from '../../../components/Select';
import ToastNotify from '../../../components/toast/toast';
import { FaExpand, FaMinusCircle } from 'react-icons/fa';
import Spinner from '../../../components/Spinner/Spinner';
import ChangeLogger from '../../../components/changeLogger';
const Form = ({ onHandleChangeCard, employee_id, onAction, onFormData }) => {
  const [formData, setFormData] = useState({
    id: '',
    driving_license: true,
    own_vehicle: true,
    educational_level_id: '',
    time_experience_id: '',
    cook_id: '',
    consent_contact: false,
    date_consent: '',
    accept_conditions: false,
    date_condition: '',
    observations: '',
  });
  const [oldData, setOldData] = useState({
    id: '',
    driving_license: true,
    own_vehicle: true,
    educational_level_id: '',
    time_experience_id: '',
    cook_id: '',
    consent_contact: false,
    date_consent: '',
    accept_conditions: false,
    date_condition: '',
    observations: '',
  });

  const [loading, setLoading] = useState(true);
  const [expandImage, setExpandImage] = useState(false);
  const [isOpenModalReason, setIsOpenModalReason] = useState(false);
  const [cooks, setCooks] = useState([]);
  const [educationalLevels, setEducationalLevels] = useState([]);
  const [timeExperiences, setTimeExperiences] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [currentLanguages, setCurrentLanguages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [codPost, setCodPost] = useState('');
  const [selectedCodPost, setSelectedCodPost] = useState({
    cod_post: '',
    name: '',
    state: '',
  });
  const [modalActions, setModalActions] = useState({
    handleContinue: () => {},
    handleCancel: () => {},
  });
  const dniRef = useRef(null);
  const emailRef = useRef(null);
  const dni = useRef(null);
  const ref = useRef(null);

  const navigateTo = useNavigate();

  useEffect(() => {
    try {
      const fetchSelect = async () => {
        const order = 'name-asc';

        const cooks = await getData('cooks/all');
        setCooks(cooks);

        const el = await getData('educational-levels/all');
        setEducationalLevels(el);

        const te = await getData('time-experiences/all');
        setTimeExperiences(te);

        const responseLanguages = await getData('languages/all');

        if (responseLanguages) {
          const options = responseLanguages.map((item, index) => ({
            value: item.id,
            label: item.name,
            key: item.id ?? `default-key-${index}`,
          }));

          setLanguages(options);
        }
        if (employee_id) {
          // Asegúrate de que `id` esté definido
          await getRecordById(employee_id);
        }
      };

      fetchSelect();
    } catch (error) {
      console.log('error=>', error);
    } finally {
    }
  }, [employee_id]);

  useEffect(() => {
    try {
      const languageIds = formData.language_id
        .split(',')
        .map((id) => parseInt(id));
      console.log('languageIds', languageIds);
      const selectedLanguages = languages.filter((language) =>
        languageIds.includes(language.value),
      );
      console.log('selectedLanguages', selectedLanguages);
      setSelectedLanguages(selectedLanguages);
    } catch (error) {
      console.log('error=>', error);
    } finally {
    }
  }, [formData]);
  const getRecordById = async (employee_id) => {
    try {
      //setIsLoading(true);
      const response = await getData(
        'employees/complementary/all?employee_id=' + employee_id,
      );
      if (response.length > 0) {
        setFormData(response[0]);
      }
    } catch (error) {
      console.error('Error al obtener el registro por id:', error);
    } finally {
      // setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const { id, value, type } = event.target;

    let updatedValue = value;
    if (type === 'radio') {
      updatedValue = value === 'true';
    }

    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [id]: updatedValue,
      };
      return updatedFormData;
    });
  };
  const validateRequiredFields = () => {
    const requiredFields = [
      { field: 'dni', label: 'DNI' },
      { field: 'first_name', label: 'nombres' },
      { field: 'last_name', label: 'apellidos' },
      { field: 'born_date', label: 'fecha de nacimiento' },
      { field: 'gender_id', label: 'género' },
      { field: 'email', label: 'correo electrónico' },
      { field: 'phone', label: 'teléfono' },
      { field: 'address', label: 'dirección' },
    ];
    let isValid = true;

    requiredFields.forEach((required) => {
      if (
        formData[required.field] === undefined ||
        formData[required.field] === ''
      ) {
        // Si el campo requerido está vacío, mostrar mensaje de error y marcar como no válido
        ToastNotify({
          message: `El campo ${required.label} es requerido.`,
          position: 'top-left',
          type: 'error',
        });
        isValid = false;
      }
    });

    if (!isValid) {
      // Detener el envío del formulario si algún campo requerido está vacío
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      // const isValid = validateRequiredFields();

      // if (!isValid) {
      // Detener el envío del formulario si algún campo requerido está vacío
      // return;
      // }
      // Validar campos requeridos antes de enviar el formulario

      let response = false;
      const dataToSend = { ...formData };
      const languageIds = selectedLanguages.map((language) => language.value);
      dataToSend.language_id = languageIds.join(',');
      dataToSend.employee_id = employee_id;

      let message = '';
      if (formData.id == '') {
        response = await postData('employees/complementary', dataToSend);
        message = 'Informacion complementaria registrado con exito';
      } else {
        response = await putData(
          'employees/complementary/' + formData.id,
          dataToSend,
        );
        message = 'Informacion complementaria actualizado con exito';
      }

      //changelogs
      if (response) {
        ToastNotify({
          message: message,
          position: 'top-left',
          type: 'success',
        });
        //navigateTo('/employee/' + response.id);
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
      getRecordById(employee_id);
    }
  };

  const handleSelectChange = (selected) => {
    setSelectedLanguages(selected);
  };

  return (
    <form className=''>
      <div className='rounded min-h-[calc(100vh-235px)]'>
        <div className='justify-end items-end absolute bottom-5 right-6 z-50'>
          <button
            type='button'
            className='bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            onClick={handleSubmit}
          >
            Guardar
          </button>
        </div>
        <div className='md:grid md:grid-cols-3 gap-2'>
          <div className='col-span-3 md:grid md:grid-cols-2 gap-2 p-6'>
            <div className='col-span-2 md:grid md:grid-cols-2 gap-2 '>
              <div className='col-span-1'>
                <label className='block text-sm font-medium text-gray-700'>
                  ¿Tiene licencia de conducir?
                </label>
                <div className='mt-1'>
                  <label className='inline-flex items-center'>
                    <input
                      type='radio'
                      name='driving_license'
                      id='driving_license'
                      value='true'
                      checked={formData.driving_license === true}
                      onChange={handleChange}
                      className='form-radio text-indigo-600'
                    />
                    <span className='ml-2'>Sí</span>
                  </label>
                  <label className='inline-flex items-center ml-6'>
                    <input
                      type='radio'
                      name='driving_license'
                      id='driving_license'
                      value='false'
                      checked={formData.driving_license === false}
                      onChange={handleChange}
                      className='form-radio text-indigo-600'
                    />
                    <span className='ml-2'>No</span>
                  </label>
                </div>
              </div>
              <div className='col-span-1'>
                <label className='block text-sm font-medium text-gray-700'>
                  ¿Dispones de vehículo propio?
                </label>
                <div className='mt-1'>
                  <label className='inline-flex items-center'>
                    <input
                      type='radio'
                      name='own_vehicle'
                      id='own_vehicle'
                      value='true'
                      checked={formData.own_vehicle === true}
                      onChange={handleChange}
                      className='form-radio text-indigo-600'
                    />
                    <span className='ml-2'>Sí</span>
                  </label>
                  <label className='inline-flex items-center ml-6'>
                    <input
                      type='radio'
                      name='own_vehicle'
                      id='own_vehicle'
                      value='false'
                      checked={formData.own_vehicle === false}
                      onChange={handleChange}
                      className='form-radio text-indigo-600'
                    />
                    <span className='ml-2'>No</span>
                  </label>
                </div>
              </div>
              <div className='col-span-1'>
                <label
                  htmlFor='language_id'
                  className='block text-sm font-medium text-gray-700'
                >
                  Idiomas
                </label>
                <Select
                  id='language_id'
                  name='language_id'
                  options={languages}
                  onChange={handleSelectChange}
                  defaultValue={selectedLanguages}
                  isMulti={true} // Enable multi-selection
                />
              </div>
              <div className='col-span-1'>
                <label
                  htmlFor='educational_level_id'
                  className='block text-sm font-medium text-gray-700'
                >
                  Nivel educativo
                </label>
                <select
                  className='w-full px-3 mt-1 p-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  name='educational_level_id'
                  id='educational_level_id'
                  onChange={handleChange}
                  value={formData.educational_level_id}
                >
                  <option value=''>Seleccione</option>
                  {educationalLevels.length > 0 &&
                    educationalLevels.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className='col-span-1'>
                <label
                  htmlFor='time_experience_id'
                  className='block text-sm font-medium text-gray-700'
                >
                  Años de experiencia
                </label>
                <select
                  className='w-full px-3 mt-1 p-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  name='time_experience_id'
                  id='time_experience_id'
                  onChange={handleChange}
                  value={formData.time_experience_id}
                >
                  <option value=''>Seleccione</option>
                  {timeExperiences.length > 0 &&
                    timeExperiences.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className='col-span-1'>
                <label
                  htmlFor='gender_id'
                  className='block text-sm font-medium text-gray-700'
                >
                  ¿Sabe cocinar?
                </label>
                <select
                  className='w-full px-3 mt-1 p-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  name='cook_id'
                  id='cook_id'
                  onChange={handleChange}
                  value={formData.cook_id}
                >
                  <option value=''>Seleccione</option>
                  {cooks.length > 0 &&
                    cooks.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className='col-span-1'>
                <label className='block text-sm font-medium text-gray-700'>
                  ¿Consentimiento de contacto?
                </label>
                <div className='mt-1'>
                  <label className='inline-flex items-center'>
                    <input
                      type='radio'
                      name='consent_contact'
                      id='consent_contact'
                      value='true'
                      checked={formData.consent_contact === true}
                      onChange={handleChange}
                      className='form-radio text-indigo-600'
                    />
                    <span className='ml-2'>Sí</span>
                  </label>
                  <label className='inline-flex items-center ml-6'>
                    <input
                      type='radio'
                      name='consent_contact'
                      id='consent_contact'
                      value='false'
                      checked={formData.consent_contact === false}
                      onChange={handleChange}
                      className='form-radio text-indigo-600'
                    />
                    <span className='ml-2'>No</span>
                  </label>
                </div>
              </div>
              <div className='col-span-1'>
                <label
                  htmlFor='date_consent'
                  className='block text-sm font-medium text-gray-700'
                >
                  Fecha de consentimiento
                </label>
                <input
                  type='date'
                  id='date_consent'
                  name='date_consent'
                  value={formData.date_consent}
                  onChange={handleChange}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
              <div className='col-span-1'>
                <label className='block text-sm font-medium text-gray-700'>
                  ¿Acepta las condiciones?
                </label>
                <div className='mt-1'>
                  <label className='inline-flex items-center'>
                    <input
                      type='radio'
                      name='accept_conditions'
                      id='accept_conditions'
                      value='true'
                      checked={formData.accept_conditions === true}
                      onChange={handleChange}
                      className='form-radio text-indigo-600'
                    />
                    <span className='ml-2'>Sí</span>
                  </label>
                  <label className='inline-flex items-center ml-6'>
                    <input
                      type='radio'
                      name='accept_conditions'
                      id='accept_conditions'
                      value='false'
                      checked={formData.accept_conditions === false}
                      onChange={handleChange}
                      className='form-radio text-indigo-600'
                    />
                    <span className='ml-2'>No</span>
                  </label>
                </div>
              </div>
              <div className='col-span-1'>
                <label
                  htmlFor='date_condition'
                  className='block text-sm font-medium text-gray-700'
                >
                  Fecha de aceptacion
                </label>
                <input
                  type='date'
                  id='date_condition'
                  name='date_condition'
                  value={formData.date_condition}
                  onChange={handleChange}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
              <div className='col-span-2'>
                <div className='mb-2'>
                  <label
                    htmlFor='observations'
                    className='block text-sm font-medium text-secondary'
                  >
                    Observaciones
                  </label>
                  <textarea
                    type='textarea'
                    rows={4}
                    id='observations'
                    value={formData.observations}
                    onChange={handleChange}
                    className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {expandImage && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center'>
          <div className='bg-white p-2 rounded shadow-lg w-3/4'>
            <button
              className='absolute top-0 right-2 text-white hover:text-gray-700 text-lg bg-gray-800'
              onClick={closeExpandImage}
            >
              <svg
                className='w-6 h-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>

            <img alt='imagen' src={dni.current} className='w-full' />
          </div>
        </div>
      )}
    </form>
  );
};

export default Form;
