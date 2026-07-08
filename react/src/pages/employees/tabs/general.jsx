import React, { useState, useEffect, useRef } from 'react';
import {
  getData,
  getCachedData,
  postData,
  putData,
  postStorage,
  getStorage,
  deleteStorage,
} from '../../../api';
import { json, useNavigate } from 'react-router-dom';
import Select from '../../../components/Select';
import ToastNotify from '../../../components/toast/toast';
import { FaExpand, FaMinusCircle, FaEye, FaUser, FaIdCard, FaCamera } from 'react-icons/fa';
import { FaRotate } from 'react-icons/fa6';

import Spinner from '../../../components/Spinner/Spinner';
import ChangeLogger from '../../../components/changeLogger';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../../components/SweetAlert/SweetAlert';
import FileInput from '../../../components/fileInput';
import { tipo_config, estado_config } from '../../../utils/config';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Estilos por defecto
import ColorSelect from '../../../components/ColorSelect/colorSelect';
import { validarDNI, validarDocumento, validarNSS, formatPhoneNumber } from '../../../utils/customFormat';

const ImageUploadSlot = ({
  id,
  label,
  aspectClass,
  image,
  emptyIcon: EmptyIcon,
  onUpload,
  onExpand,
  onDelete,
}) => (
  <div className='w-full'>
    <span className='block text-xs font-medium text-gray-600 mb-1.5'>{label}</span>
    <div
      className={`group relative w-full ${aspectClass} rounded-xl border-2 border-dashed border-gray-300 bg-white overflow-hidden transition-all hover:border-blue-400 hover:shadow-sm`}
    >
      {image ? (
        <>
          <label htmlFor={id} className='block w-full h-full cursor-pointer bg-gray-50'>
            <img
              src={image}
              alt={label}
              className='w-full h-full object-contain p-1'
            />
            <input
              type='file'
              id={id}
              name={id}
              accept='image/*'
              className='hidden'
              onChange={onUpload}
            />
          </label>
          <div className='absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-2 py-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity'>
            <button
              type='button'
              onClick={(e) => {
                e.preventDefault();
                onExpand();
              }}
              className='p-1.5 rounded-full bg-white/95 text-gray-700 hover:bg-white shadow-sm'
              title='Ampliar'
            >
              <FaExpand size={13} />
            </button>
            <button
              type='button'
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
              className='p-1.5 rounded-full bg-white/95 text-red-600 hover:bg-white shadow-sm'
              title='Eliminar'
            >
              <FaMinusCircle size={13} />
            </button>
          </div>
        </>
      ) : (
        <label
          htmlFor={id}
          className='flex flex-col items-center justify-center w-full h-full cursor-pointer text-gray-400 hover:text-blue-500 hover:bg-blue-50/40 transition-colors p-3 text-center'
        >
          {EmptyIcon && <EmptyIcon className='text-2xl mb-1.5 opacity-60' />}
          <FaCamera className='text-sm mb-1 opacity-50' />
          <span className='text-[11px] font-medium text-gray-500 leading-tight'>
            Clic para subir
          </span>
          <input
            type='file'
            id={id}
            name={id}
            accept='image/*'
            className='hidden'
            onChange={onUpload}
          />
        </label>
      )}
    </div>
  </div>
);

const Form = ({
  onHandleChangeCard,
  id,
  onAction,
  onFormData,
  onHandleHasChange,
  onGetRecordById,
}) => {
  console.log('onformdata en form', onFormData);
  const sweetAlert = ConfirmSweetAlert({
    title: 'Información',
    text: '¿Esta seguro que desea enviar los datos?',
    icon: 'question',
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState({
    dni: '',
    dni_date_expiration: '',
    start_date: '',
    first_name: '',
    last_name: '',
    full_name: '',
    code_phone: '',
    phone: '',
    code_phone2: '',
    phone2: '',
    email: '',
    born_date: null,
    cod_post_id: 0,
    num_social_security: '',
    address: '',
    address_num: '',
    address_flat: '',
    photo: '',
    dniFront: '',
    dniBack: '',
    attach_reference: '',
    attach_curriculum: '',
    is_active: true,
    country_id: 0,
    type: '1',
    recommendations: '',
    statu_id: '',
    level_id: '',
    state_id: '',
    observations: '',
    antique: '',
  });
  const [oldData, setOldData] = useState({
    dni: '',
    dni_date_expiration: '',
    start_date: '',
    first_name: '',
    last_name: '',
    full_name: '',
    code_phone: '',
    phone: '',
    code_phone2: '',
    phone2: '',
    email: '',
    born_date: null,
    cod_post_id: 0,
    num_social_security: '',
    address: '',
    address_num: '',
    address_flat: '',
    photo: '',
    dniFront: '',
    dniBack: '',
    attach_reference: '',
    attach_curriculum: '',
    is_active: true,
    country_id: 0,
    type: '1',
    recommendations: '',
    statu_id: '',
    level_id: '',
    state_id: '',
    observations: '',
    antique: '',
  });
  const [images, setImages] = useState({
    photo: '',
    dniFront: '',
    dniBack: '',
  });
  const [changelogs, setChangelogs] = useState({
    date: '',
    client_statu_reason_id: '',
    reason: '',
    observation: '',
  });
  const [oldChangelogs, setOldChangelogs] = useState({
    date: '',
    client_statu_reason_id: '',
    reason: '',
    observation: '',
  });
  const [loadingForm, setLoadingForm] = useState(true);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [loading, setLoading] = useState(true);
  const [expandImage, setExpandImage] = useState(false);
  const [isOpenModalReason, setIsOpenModalReason] = useState(false);
  const [dniFront, setDniFront] = useState('');
  const [dniBack, setDniBack] = useState('');
  const [codPosts, setCodPosts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [levels, setLevels] = useState([]);
  const [status, setStatus] = useState([]);
  const [genders, setGenders] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [clientReason, setClientReason] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [codPost, setCodPost] = useState('');
  const [selectedCodPost, setSelectedCodPost] = useState({
    cod_post: '',
    name: '',
    state: '',
  });
  const [selectCodePost, setSelectCodePost] = useState(null);
  const [modalActions, setModalActions] = useState({
    handleContinue: () => {},
    handleCancel: () => {},
  });
  const dniRef = useRef(null);
  const nssRef = useRef(null);
  const emailRef = useRef(null);
  const dni = useRef(null);
  const ref = useRef(null);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [postalCodes, setPostalCodes] = useState([]);
  const [currentPhoneMask, setCurrentPhoneMask] = useState('999 99 99 99');

  const configDefaultsRef = useRef({ type: null, level_id: null, languages: [], country_id: null, state_id: null, country_code: null });
  const hasLoadedEmployeeDefaults = useRef(false);
  const hasAppliedLanguageDefaults = useRef(false);
  const hasAppliedCountryStateDefaults = useRef(false);
  const userModifiedLanguageSelection = useRef(false);

  const [isFullScreen, setIsFullScreen] = useState(false);

  const updateImages = async (onFormData) => {
    console.log('onformdata', onFormData);
    if (onFormData.photo) {
      setImages((prevImages) => ({
        ...prevImages,
        photo: getStorage(onFormData.photo),
      }));
    }
    if (onFormData.dniFront) {
      setImages((prevImages) => ({
        ...prevImages,
        dniFront: getStorage(onFormData.dniFront),
      }));
    }
    if (onFormData.dniBack) {
      setImages((prevImages) => ({
        ...prevImages,
        dniBack: getStorage(onFormData.dniBack),
      }));
    }
  };
  const calculateSeniority = (startDate) => {
    const start = new Date(startDate);
    const today = new Date();

    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();
    let days = today.getDate() - start.getDate();

    // Ajustar días
    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    // Ajustar meses
    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} años ${months} meses ${days} días`;
  };
  const navigateTo = useNavigate();

  // Función para obtener máscara de teléfono del país
  const getPhoneMaskByCountry = async (countryId) => {
    if (!countryId) {
      setCurrentPhoneMask('999 99 99 99');
      return;
    }

    try {
      const response = await getData(`configs/countries/phone-configs`);
      const countryConfig = response?.find(c => c.id === Number(countryId));
      if (countryConfig && countryConfig.phone_mask) {
        setCurrentPhoneMask(countryConfig.phone_mask);
      } else {
        // Fallback a máscara global
        const maskResponse = await getCachedData('configs/phone-mask', 10 * 60 * 1000);
        setCurrentPhoneMask(maskResponse?.phoneMask || '999 99 99 99');
      }
    } catch (error) {
      console.error('Error al obtener máscara del país:', error);
      setCurrentPhoneMask('999 99 99 99');
    }
  };

  useEffect(() => {
    const initForm = async () => {
      try {
        setLoadingForm(true);
        if (onFormData) {
          setFormData(onFormData);
          setOldData(onFormData);

          //calcula la edad
          if (onFormData.born_date != null && onFormData.born_date != '') {
            const age = calculateAge(onFormData.born_date);
            setFormData((prevFormData) => ({
              ...prevFormData,
              ['age']: age,
            }));
            setOldData((prevFormData) => ({
              ...prevFormData,
              ['age']: age,
            }));
          }

          if (onFormData.start_date != null && onFormData.start_date != '') {
            setFormData((prevFormData) => ({
              ...prevFormData,
              ['antique']: calculateSeniority(onFormData.start_date),
            }));
            setOldData((prevFormData) => ({
              ...prevFormData,
              ['antique']: calculateSeniority(onFormData.start_date),
            }));
          }

          await updateImages(onFormData);
          setCodPost(
            onFormData.cod_post.code +
              '/' +
              onFormData.cod_post.name +
              '/' +
              onFormData.cod_post.state?.name,
          );
          setSelectedCodPost({
            cod_post: onFormData.cod_post?.code,
            name: onFormData.cod_post?.name,
            state: onFormData.cod_post?.state?.name,
          });

          if (
            onFormData.cod_post?.state?.country_id != '' &&
            onFormData.cod_post?.state?.country_id != 0
          ) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              ['country_current_id']: onFormData.cod_post?.state?.country_id,
            }));
            setOldData((prevFormData) => ({
              ...prevFormData,
              ['country_current_id']: onFormData.cod_post?.state?.country_id,
            }));
          }
        }
      } catch (error) {
        console.log('error=>', error);
      } finally {
        //setLoadingForm(false);
        setLoadingForm(false);
      }
    };
    initForm();
  }, [onFormData]);

  useEffect(() => {
    const loadEmployeeDefaults = async () => {
      if (id || hasLoadedEmployeeDefaults.current) return;

      try {
        const configResponse = await getCachedData('configs/active', 10 * 60 * 1000);
        console.log('EMPLOYEE Config response:', configResponse);
        const employeeConfig = configResponse?.employee_config || {};

        const defaultType = employeeConfig.default_type || null;
        const defaultLevelId = employeeConfig.default_level_id || null;
        const defaultLanguages = Array.isArray(employeeConfig.default_languages)
          ? employeeConfig.default_languages
          : [];
        const defaultCountryId = configResponse?.default_country_id || null;
        const defaultStateId = configResponse?.default_state_id || null;
        const defaultCountryCode = configResponse?.default_country_code || configResponse?.defaultCountry?.code_phone || '';

        console.log('EMPLOYEE Loaded defaults - country_id:', defaultCountryId, 'state_id:', defaultStateId, 'country_code:', defaultCountryCode);

        configDefaultsRef.current = {
          type: defaultType,
          level_id: defaultLevelId,
          languages: defaultLanguages,
          country_id: defaultCountryId,
          state_id: defaultStateId,
          country_code: defaultCountryCode,
        };

        setFormData((prevFormData) => ({
          ...prevFormData,
          type: defaultType ?? prevFormData.type,
          level_id: defaultLevelId ?? prevFormData.level_id,
        }));

        if (!defaultLanguages.length) {
          hasAppliedLanguageDefaults.current = true;
        }

        hasLoadedEmployeeDefaults.current = true;
      } catch (error) {
        console.error(
          'Error cargando configuración por defecto de cuidadores:',
          error,
        );
      }
    };

    loadEmployeeDefaults();
  }, [id]);

  useEffect(() => {
    if (onFormData.cod_post?.state?.country) {
      const country = countries.find(
        (c) => c.id === parseInt(onFormData.cod_post.state.country_id),
      );

      setSelectedCountry(country);
      if (country) {
        setSelectedState(country.states);

        // Obtener máscara de teléfono según el país del empleado
        getPhoneMaskByCountry(onFormData.cod_post.state.country_id);

        const state = country.states.find(
          (c) => c.id === parseInt(onFormData.cod_post.state_id),
        );

        if (state) {
          const options = state?.cod_posts.map((item, index) => ({
            value: item.id,
            label: item.code + '|' + item.name,
            key: item.id ?? `default-key-${index}`,
          }));
          setPostalCodes(options);
        } else {
          setPostalCodes([]);
        }

        console.log('states', state);
        setFormData((prevFormData) => ({
          ...prevFormData,
          ['state_id']: onFormData.cod_post.state_id,
          ['cod_post_id']: onFormData.cod_post.id,
        }));
        setOldData((prevOldData) => ({
          ...prevOldData,
          ['state_id']: onFormData.cod_post.state_id,
          ['cod_post_id']: onFormData.cod_post.id,
        }));
      }
    }
  }, [countries, onFormData]);

  useEffect(() => {
    try {
      setLoadingFetch(true);
      const fetchSelect = async () => {
        const order = 'name-asc';

        const responseLevels = await getCachedData('employees/level/all');
        setLevels(responseLevels);
        const responseStatus = await getCachedData('employees/status/all');
        setStatus(responseStatus);

        const responseCodPosts = await getCachedData('cod_posts/all');

        setCodPosts(responseCodPosts);

        const responseGenders = await getCachedData('genders/all');
        setGenders(responseGenders);

        const responseLanguages = await getCachedData('languages/all');

        if (responseLanguages) {
          const options = responseLanguages.map((item, index) => ({
            value: item.id,
            label: item.name,
            key: item.id ?? `default-key-${index}`,
          }));

          setLanguages(options);
        }

        const responseCountries = await getCachedData('countries/all');
        setCountries(responseCountries);

        const responseReason = await getData(
          `client-statu-reason/all?order=${order}`,
        );

        if (responseReason) {
          const options = responseReason.map((item, index) => ({
            value: item.id,
            label: item.name,
            key: item.id ?? `default-key-${index}`,
          }));

          setClientReason(options);
        }
      };

      fetchSelect();
    } catch (error) {
      console.log('error=>', error);
    } finally {
      setLoadingFetch(false);
    }
  }, []);

  useEffect(() => {
    if (id) return;
    if (!hasLoadedEmployeeDefaults.current) return;
    if (hasAppliedLanguageDefaults.current) return;

    const defaultLanguages = configDefaultsRef.current.languages;

    if (!Array.isArray(defaultLanguages) || !defaultLanguages.length) return;
    if (!languages || !languages.length) return;
    if (userModifiedLanguageSelection.current) return;

    const selected = languages.filter((language) =>
      defaultLanguages.includes(language.value),
    );

    if (!selected.length) {
      hasAppliedLanguageDefaults.current = true;
      return;
    }

    setSelectedLanguages(selected);
    setFormData((prevFormData) => ({
      ...prevFormData,
      language_id: selected.map((language) => language.value).join(','),
    }));

    hasAppliedLanguageDefaults.current = true;
  }, [languages, id]);

  useEffect(() => {
    console.log('EMPLOYEE Country/State defaults useEffect - id:', id, 'hasLoadedEmployeeDefaults:', hasLoadedEmployeeDefaults.current, 'hasAppliedCountryStateDefaults:', hasAppliedCountryStateDefaults.current, 'countries:', countries?.length);
    if (id) return;
    if (!hasLoadedEmployeeDefaults.current) return;
    if (!countries || !countries.length) return;

    const defaultCountryId = configDefaultsRef.current.country_id;
    const defaultStateId = configDefaultsRef.current.state_id;
    const defaultCountryCode = configDefaultsRef.current.country_code;

    console.log('EMPLOYEE Defaults from config - country_id:', defaultCountryId, 'state_id:', defaultStateId, 'country_code:', defaultCountryCode);

    if (defaultCountryId) {
      const country = countries.find((c) => c.id === Number(defaultCountryId));
      console.log('EMPLOYEE Country found:', country ? { id: country.id, name: country.name } : 'Not found');
      if (country) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          country_id: defaultCountryId,
          country_current_id: defaultCountryId,
          code_phone: country.code_phone || defaultCountryCode,
          code_phone2: country.code_phone || defaultCountryCode,
        }));

        setSelectedCountry(country);
        setSelectedState(country.states);

        // Actualizar máscara de teléfono según el país por defecto
        getPhoneMaskByCountry(defaultCountryId);

        console.log('EMPLOYEE After setFormData - country_id and country_current_id set to:', defaultCountryId);

        if (defaultStateId) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            state_id: defaultStateId,
          }));

          const state = country.states.find((s) => s.id === Number(defaultStateId));
          console.log('EMPLOYEE State found:', state ? { id: state.id, name: state.name } : 'Not found');
          if (state) {
            const options = state?.cod_posts.map((item, index) => ({
              value: item.id,
              label: item.code + '|' + item.name,
              key: item.id ?? `default-key-${index}`,
            }));
            setPostalCodes(options);
          }
        } else {
          console.log('EMPLOYEE No default state_id in config');
        }
      }
    }

    hasAppliedCountryStateDefaults.current = true;
  }, [countries, id]);

  useEffect(() => {
    const fetchSelect = async () => {
      const normalizedSearch = codPost?.trim();
      if (!normalizedSearch) return;

      const queryParameters = new URLSearchParams();
      if (normalizedSearch) {
        queryParameters.append('name', `%${normalizedSearch}%`);
        queryParameters.append('code', `%${normalizedSearch}%`);
        queryParameters.append('$state.name$', `%${normalizedSearch}%`);
        queryParameters.append('useLike', 'true'); // Paramentro adicional para indicar uso de LIKE
      }

      const responseCodPosts = await getData(
        `cod_posts/all?${queryParameters}`,
      );
      console.log(responseCodPosts);
      setCodPosts(responseCodPosts);
    };
    fetchSelect();
  }, [codPost]);

  const handleLoadingSelect = () => {
    setLoadingSelect(false);
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDifference = today.getMonth() - birthDateObj.getMonth();

    // Si el mes de hoy es menor al mes de nacimiento o si es el mismo mes pero el día es menor, restar un año
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }
    return age;
  };

 const handleChange = (event) => {
  const { id, value, type } = event.target;

  // Evitar trimming en textarea
  const cleanValue = type === "textarea" ? value : value.trim();

  if (id === 'born_date') {
    const age = calculateAge(cleanValue);
    setFormData((prevFormData) => ({
      ...prevFormData,
      ['age']: age,
    }));
  }

  if (id === 'phone' || id === 'phone2') {
    const newValue = cleanValue.replace(/\D/g, '');
    // Usar formatPhoneNumber con currentPhoneMask en lugar de formateo hardcoded
    const formattedValue = formatPhoneNumber(newValue, currentPhoneMask);
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: formattedValue,
    }));
  } else {
    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [id]: id === "dni" ? cleanValue.toUpperCase() : cleanValue,
      };

      // Actualizar full_name si cambia nombre o apellido
      if (id === 'first_name' || id === 'last_name') {
        const firstName =
          id === 'first_name' ? cleanValue : prevFormData.first_name || '';
        const lastName =
          id === 'last_name' ? cleanValue : prevFormData.last_name || '';
        updatedFormData.full_name = `${firstName} ${lastName}`.trim();
      }

      return updatedFormData;
    });

    if (id === 'first_name' || id === 'last_name') {
      const firstName = id === 'first_name' ? cleanValue : formData.first_name;
      const lastName = id === 'last_name' ? cleanValue : formData.last_name;
      const fullName = `${firstName} ${lastName}`.trim();
      onHandleChangeCard('full_name', fullName);
    }

    if (id === 'dni') {
      onHandleChangeCard(id, cleanValue);
    }

    if (id === 'country_current_id') {
      const country = countries.find((c) => c.id === parseInt(cleanValue));
      setSelectedCountry(country);
      setSelectedState(null);
      setPostalCodes([]);
      // NO actualizar código de teléfono cuando cambia el país
    }

    if (id === 'code_phone' || id === 'code_phone2') {
      // Cuando cambia el código de teléfono, actualizar la máscara pero NO el país
      const country = countries.find((c) => c.code_phone === cleanValue);
      if (country) {
        getPhoneMaskByCountry(country.id);
      }
    }

    if (id === 'state_id') {
      const state = selectedCountry.states.find(
        (s) => s.id === parseInt(cleanValue),
      );
      setSelectedState(state);
      setPostalCodes(
        state
          ? state.cod_posts.map((item, index) => ({
              value: item.id,
              label: item.code + '|' + item.name,
              key: item.id ?? `default-key-${index}`,
            }))
          : [],
      );
    }
  }
};

  const handleSelect = (selected) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ['cod_post_id']: selected.value,
    }));
  };

  const requiredFields = [
    { field: 'dni', label: 'DNI' },
    { field: 'dni_date_expiration', label: 'Fecha de vencimiento DNI' },
    { field: 'start_date', label: 'fecha de inicio' },
    { field: 'first_name', label: 'nombres' },
    { field: 'last_name', label: 'apellidos' },
    { field: 'phone', label: 'teléfono' },
    { field: 'email', label: 'correo electrónico' },
    { field: 'born_date', label: 'fecha de nacimiento' },
    { field: 'cod_post_id', label: 'código postal' },
    { field: 'num_social_security', label: 'número de seguridad social' },
    { field: 'address', label: 'dirección' },
    { field: 'address_num', label: 'número de dirección' },
    { field: 'address_flat', label: 'piso de dirección' },
    { field: 'country_id', label: 'país' },
    { field: 'type', label: 'tipo' },
    { field: 'statu_id', label: 'situacion' },
    { field: 'level_id', label: 'nivel' },
    { field: 'state_id', label: 'estado o provincia' },
  ];
  const minimalFields = [
    { field: 'first_name', label: 'nombres' },
    { field: 'last_name', label: 'apellidos' },
    { field: 'dni', label: 'DNI' },
    { field: 'phone', label: 'teléfono' },
  ];
  const validateRequiredFields = () => {
    let isValid = true;

    const fieldsToValidate =
      formData.type == 2 ? minimalFields : requiredFields;
    fieldsToValidate.forEach((required) => {
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

  useEffect(() => {
    let isValid = true;
    requiredFields.forEach((required) => {
      if (
        formData[required.field] === undefined ||
        formData[required.field] === ''
      ) {
        isValid = false;
      }
    });
    if (isValid) {
      setIsFormValid(isValid);
    }
  }, [formData]);
  function changeValueSelect(data) {
    const newData = { ...data };
    for (const key in data) {
      if (key == 'client_statu_reason_id') {
        const matchedOption = clientReason.find(
          (option) => option.value === data[key],
        );
        if (matchedOption) {
          newData['reason'] = matchedOption.label;
          newData[key] = data[key];
        }
      } else {
        const selectField = document.getElementById(key);
        if (selectField && selectField.tagName.toLowerCase() === 'select') {
          const matchedOption = Array.from(selectField.options).find(
            (option) => option.value == data[key],
          );
          if (matchedOption) {
            newData[key] = matchedOption.text;
          }
        }
      }
    }
    return newData;
  }
  const handleSubmit = async () => {
    console.log('form data ', formData);
    console.log('oldata ', oldData);
    try {
      const isValid = validateRequiredFields();

      if (!isValid) {
        setLoadingForm(false);
        // Detener el envío del formulario si algún campo requerido está vacío
        return;
      }

      await sweetAlert.showSweetAlert().then((result) => {
        const isConfirmed = result !== null && result;
        if (!isConfirmed) {
          ToastNotify({
            message: 'Acción cancelada por el usuario',
            position: 'top-right',
          });
          return;
        } else {
          handleSend();
        }
      });
      await updateImages(formData);
      setOldData(formData);
      onHandleChangeCard('address', formData.address);
      onHandleChangeCard('email', formData.email);
      onHandleChangeCard('phone', formData.phone);
    } catch (error) {
      console.log('error', error);
      ToastNotify({
        message: 'Error al procesar el formulario',
        position: 'top-left',
        type: 'error',
      });
    } finally {
      setTimeout(() => setLoadingForm(false), 800);
    }
  };

  const normalizePayload = (data) => {
    const payload = { ...data };

    // Normalizar fechas
    ['born_date', 'start_date'].forEach((field) => {
      if (!payload[field]) {
        payload[field] = null; // <- en vez de ""
      } else {
        const d = new Date(payload[field]);
        payload[field] = isNaN(d.getTime())
          ? null
          : d.toISOString().split('T')[0]; // YYYY-MM-DD
      }
    });

    // Normalizar enteros
    ['country_id', 'cod_post_id', 'statu_id', 'level_id', 'state_id'].forEach(
      (field) => {
        if (!payload[field] && payload[field] !== 0) payload[field] = null;
        else payload[field] = parseInt(payload[field], 10);
      },
    );

    // Opcional: normalizar strings vacíos a NULL si quieres
    [
      'email',
      'address',
      'num_social_security',
      'photo',
      'dniFront',
      'dniBack',
      'recommendations',
    ].forEach((field) => {
      if (payload[field] === '') payload[field] = null;
    });

    return payload;
  };

  const handleSend = async () => {
    try {
      setLoadingForm(true);
      // Validar campos requeridos antes de enviar el formulario

      let response = false;

      for (const [key, value] of Object.entries(formData)) {
        const isFile = value instanceof File;
        console.log('value ' + key, value);
        if (isFile) {
          const fileUploadResponse = await postStorage(value, 'employee');
          formData[key] = fileUploadResponse.path;
          console.log('oldatakey', oldData[key]);
          if (
            oldData[key] !== null &&
            oldData[key] !== undefined &&
            oldData[key] !== ''
          ) {
            const filename = oldData[key].split('/').pop();
            await deleteStorage(filename, 'employee');
          }
        }
      }
      const dataToSend = { ...formData };
      
      // Limpiar formato de teléfono antes de enviar
      const cleanPhone = (phone) => {
        if (!phone || typeof phone !== 'string') return phone;
        return phone.replace(/\D/g, '');
      };
      
      dataToSend.phone = cleanPhone(dataToSend.phone);
      dataToSend.phone2 = cleanPhone(dataToSend.phone2);
      
      console.log('data enviada', dataToSend);

      let message = '';
      if (!id) {
        response = await postData('employees', dataToSend);
        message = 'Empleado registrado con exito';
      } else {
        response = await putData('employees/' + id, dataToSend);
        message = 'Empleado actualizado con exito';
      }
      //changelogs
      console.log('response => ', response);
      const currentData = changeValueSelect(changelogs);
      console.log('oldchangeLogs => ', oldChangelogs);
      console.log('currentData => ', currentData);
      await ChangeLogger({
        oldData: oldChangelogs,
        newData: currentData,
        user: null,
        module: 'employees',
        module_id: response.id,
      });
      //changelogs
      if (response) {
        ToastNotify({
          message: message,
          position: 'top-left',
          type: 'success',
        });

        await updateImages(formData);
        //onGetRecordById(response.id);
        setTimeout(
          () => (window.location.href = '/employee/' + response.id),
          1000,
        );
      }
    } catch (error) {
      console.error('Error en handleSend', error);

      // Si viene error 409 desde Axios
      if (error.response?.status === 409 && error.response?.data?.errors) {
        const errorMsg = error.response.data.errors.join('\n');
        ToastNotify({
          message: errorMsg,
          position: 'top-left',
          type: 'error',
        });
      } else {
        ToastNotify({
          message: 'Error al procesar el formulario',
          position: 'top-left',
          type: 'error',
        });
      }
    } finally {
      setTimeout(() => setLoadingForm(false), 800);
    }
  };
  const handleImagenChange = (event, key) => {
    const file = event.target.files[0];
    if (file) {
      setImages((prevImages) => ({
        ...prevImages,
        [key]: URL.createObjectURL(file),
      }));

      if (key === 'photo') {
        onHandleChangeCard(key, URL.createObjectURL(file));
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        [key]: file,
      }));
    }
  };

  const deleteImage = async (image, key) => {
    const confirmDelete = window.confirm(
      '¿Está seguro de que desea eliminar esta imagen?',
    );

    if (!confirmDelete) return;
    try {
      const filename = image.split('/').pop();
      await deleteStorage(filename, 'employee');

      setImages((prevImages) => ({
        ...prevImages,
        [key]: '',
      }));

      if (key === 'photo') {
        onHandleChangeCard(key, '');
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        [key]: '',
      }));
      const dataToSend = {
        [key]: '',
      };
      const response = await putData('employees/' + id, dataToSend);
      let message = 'Imagen eliminada con exito';
      if (response) {
        ToastNotify({
          message: message,
          position: 'top-left',
          type: 'success',
        });
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.log('error =>', error);
    }
  };

  const handleSelectChange = (selected) => {
    userModifiedLanguageSelection.current = true;
    setSelectedLanguages(selected);
    setFormData((prevFormData) => ({
      ...prevFormData,
      language_id: (selected || [])
        .map((language) => language.value)
        .join(','),
    }));
  };
  const validateEmails = (emails) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailArray = emails.split(';').map((e) => e.trim().toLowerCase());
    const validEmails = [];
    const invalidEmails = [];

    emailArray.forEach((email) => {
      if (re.test(email)) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    });

    return { validEmails, invalidEmails };
  };
 const [errors, setErrors] = useState({});
  const validateField = async (field, value, ref) => {
    try {
      if (value !== '') {
          if (field === "num_social_security" && value !== oldData["num_social_security"]) {
      if (!validarNSS(value)) {
        ToastNotify({
              message: "NSS Invalido",
              position: 'top-center',
              type: 'error',
              ref: ref,
            });
        // focus tras breve delay (espera al alert cerrar)
        setTimeout(() => ref.current?.focus(), 100);
        return;
      }
    }

        let response = [];
        if (field === 'dni' && value !== oldData['dni']) {
           if (!validarDocumento(value)) {
        ToastNotify({
              message: "Formato inválido: introduce un DNI o NIE válido",
              position: 'top-center',
              type: 'error',
              ref: ref,
            });
        // focus tras breve delay (espera al alert cerrar)
        setTimeout(() => ref.current?.focus(), 100);
      } 
          response = await getData(`clients/all?dni=${value}`);
        } else if (field === 'email' && value !== oldData['email']) {
          const { validEmails, invalidEmails } = validateEmails(value);
          for (let email of validEmails) {
            const emailResponse = await getData(`clients/all?email=${email}`);
            if (
              emailResponse.length > 0 &&
              emailResponse[0].id !== oldData.id
            ) {
              response.push({ email, id: emailResponse[0].id });
            }
          }

          if (response.length > 0 || invalidEmails.length > 0) {
            let newEmails = validEmails.filter(
              (e) => !response.some((r) => r.email === e),
            );
            setFormData((prevFormData) => ({
              ...prevFormData,
              [field]: newEmails.join(';'),
            }));
            onHandleChangeCard(field, newEmails.join(';'));

            const errorMessage = [
              ...response.map(
                (res) =>
                  `El correo ${res.email} está registrado con el ID ${res.id}`,
              ),
              ...invalidEmails.map(
                (email) => `El correo ${email} no es válido`,
              ),
            ].join(', ');

            ToastNotify({
              message: errorMessage,
              position: 'top-center',
              type: 'error',
              ref: ref,
            });

            if (ref && ref.current) {
              ref.current.focus();
            }
          }
        }
      }
    } catch (error) {
      console.log('Error en la consulta:', error);
    }
  };
  const handleOpenCodPost = () => {
    setIsOpen(!isOpen);
  };
  const handleSearchCodPost = (event) => {
    const { id, value, checked, type } = event.target;
    setCodPost(value);
  };
  const handleSelectedCodPost = (option) => {
    setSelectedCodPost({
      name: option.name,
      cod_post: option.code,
      state: option.state?.name || '',
    });
    setFormData((prevFormData) => ({
      ...prevFormData,
      ['cod_post_id']: option.id,
    }));
    setCodPost(option.code + '/' + option.name + '/' + option.state?.name);
    setIsOpen(!isOpen);
  };
  const openImageModal = (image) => {
    setExpandImage(true);
    dni.current = image;
  };
  const closeExpandImage = () => {
    setExpandImage(false);
    dni.current = null;
  };

  const handleChangeLogs = (event) => {
    const { id, value } = event.target;
    setChangelogs((prevChangeLogs) => ({
      ...prevChangeLogs,
      [id]: value,
    }));
  };
  const handleChangeLogsSelect = (event, field) => {
    const newValue = event.value;
    setChangelogs((prevChangeLogs) => ({
      ...prevChangeLogs,
      [field]: newValue,
    }));
  };

  const handleOpenReason = () => {
    setIsOpenModalReason(true);
  };
  const closeModalReason = () => {
    setIsOpenModalReason(false);
  };
  const handleContinueChange = () => {
    setIsOpenModalReason(false);
    handleSubmit();
  };

  const findDifferences = (obj1, obj2) => {
    const differences = {};

    for (const key in obj1) {
      if (obj1[key] !== obj2[key]) {
        differences[key] = { oldValue: obj2[key], newValue: obj1[key] };
      }
    }

    for (const key in obj2) {
      if (obj1[key] !== obj2[key] && !differences[key]) {
        differences[key] = { oldValue: obj2[key], newValue: obj1[key] };
      }
    }

    return differences;
  };

  const hasChanges = () => {
    const differences = findDifferences(formData, oldData);
    console.log('Diferencias detectadas:', differences);
    return Object.keys(differences).length > 0;
  };

  useEffect(() => {
    if (hasChanges()) {
      onHandleHasChange(true);
    } else {
      onHandleHasChange(false);
    }
  }, [formData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [e.target.name]: file });
    }
  };

  // Manejador para abrir el PDF en una nueva pestaña
  const handleViewFile = (file) => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank'); // Abre el PDF en una nueva pestaña
    }
  };
  const handleCancel = () => {
    setTimeout(() => {
      window.location.href = '/employees';
    }, 500);
  };
 const handleAlias = async () => {
  const response = await getData('employees/specific/all?employee_id=' + onFormData.id);
  let alias = '';
  if (response.length === 0) return;

  const data = response[0];
  const order = 'name-asc';

  const toArray = (v) => (v ? v.split(',').map(Number) : []);

  const servicesArray = toArray(data.services);
  const patologiesArray = toArray(data.patologies);
  const tasksArray = toArray(data.tasks);
  const experiencesArray = toArray(data.experiences);

  // --- SERVICES ---
  if (servicesArray.length > 0) {
    const option_services = await getData(`services/all?order=${order}`);
    // Ordena por "position"
    const sorted = option_services
      .filter((s) => servicesArray.includes(s.id))
      .sort((a, b) => a.position - b.position);
    const employeeAliases = sorted.map((s) => s.alias).join(' ');
    alias += employeeAliases + ' ';
  }

  alias += onFormData.full_name + ' ';

  // --- TASKS ---
  if (tasksArray.length > 0) {
    const tasks = await getData(`employees/task/all?order=${order}`);
    const sorted = tasks
      .filter((t) => tasksArray.includes(t.id))
      .sort((a, b) => a.position - b.position);
    const taskAliases = sorted
      .map((t) => t.alias)
      .filter(Boolean)
      .join(' ');
    alias += taskAliases + ' ';
  }

  // --- PATOLOGIES ---
  if (patologiesArray.length > 0) {
    const patologies = await getData(`patologies/all?order=${order}`);
    const sorted = patologies
      .filter((p) => patologiesArray.includes(p.id))
      .sort((a, b) => a.position - b.position);
    const patologyAliases = sorted
      .map((p) => p.alias)
      .filter(Boolean)
      .join(' ');
    alias += patologyAliases + ' ';
  }

  alias += onFormData.cod_post?.alias || '';

  setFormData({ ...formData, alias });

  // --- SYNC CONTACT ---
  try {
      const API = "https://api.sussalut.com";
    const datos = { name: alias, phone: onFormData.phone,email: onFormData.email, website:"https://app.sussalut.com/employee/"+ onFormData.id  };
    const sync = await fetch(API+'/auth/contacts/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });

    const res = await sync.json();
    if (res.error === 'NO_REFRESH_TOKEN') {
      window.location.href = API+'/auth/google';
      return;
    }

    console.log('Contacto sincronizado:', data);
  } catch (err) {
    console.error('Error sincronizando contacto con Google:', err);
  }
};

  const formLabelClass = 'block text-sm font-medium text-blue-500 mb-1';
  const formInputClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const formSelectClass =
    'w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const sectionTitleClass =
    'col-span-full text-sm font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200 pb-2 mb-1 mt-1';

  return (
    <>
      <form className='pb-4'>
        {loadingForm && <Spinner />}
        <div className='rounded min-h-[calc(100vh-600px)]'>
          {/* <div className='justify-end items-end absolute bottom-5 right-8 z-50'>
          <button
            type='button'
            className={`bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}
            onClick={
              formData.is_active === 'false' &&
              (oldData.is_active === true || oldData.is_active === 'true')
                ? handleOpenReason
                : handleSubmit
            }
          >
            Guardar
          </button>
        </div> */}
          <div className='grid grid-cols-1 lg:grid-cols-[minmax(200px,220px)_1fr] gap-4 lg:gap-6'>
            <div className='w-full lg:max-w-[220px] mx-auto lg:mx-0'>
              <div className='rounded-xl border border-gray-200 bg-gray-50/80 p-4 shadow-sm'>
                <h4 className='text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 pb-2 border-b border-gray-200'>
                  Documentación
                </h4>
                <ImageUploadSlot
                  id='photo'
                  label='Foto principal'
                  aspectClass='aspect-[3/4]'
                  image={images.photo}
                  emptyIcon={FaUser}
                  onUpload={(event) => handleImagenChange(event, 'photo')}
                  onExpand={() => openImageModal(images.photo)}
                  onDelete={() => deleteImage(images.photo, 'photo')}
                />
                <div className='grid grid-cols-2 gap-2 mt-3'>
                  <ImageUploadSlot
                    id='dniFront'
                    label='DNI frontal'
                    aspectClass='aspect-[1.58/1]'
                    image={images.dniFront}
                    emptyIcon={FaIdCard}
                    onUpload={(event) => handleImagenChange(event, 'dniFront')}
                    onExpand={() => openImageModal(images.dniFront)}
                    onDelete={() => deleteImage(images.dniFront, 'dniFront')}
                  />
                  <ImageUploadSlot
                    id='dniBack'
                    label='DNI posterior'
                    aspectClass='aspect-[1.58/1]'
                    image={images.dniBack}
                    emptyIcon={FaIdCard}
                    onUpload={(event) => handleImagenChange(event, 'dniBack')}
                    onExpand={() => openImageModal(images.dniBack)}
                    onDelete={() => deleteImage(images.dniBack, 'dniBack')}
                  />
                </div>
                <div className='mt-3'>
                  <FileInput
                    label='Curriculum'
                    name='attach_curriculum'
                    accept='.pdf'
                    onFileChange={(file) =>
                      handleFileChange(file, 'attach_curriculum')
                    }
                    fileUrl={
                      oldData.attach_curriculum &&
                      getStorage(oldData.attach_curriculum)
                    }
                    onDeleteImage={() =>
                      deleteImage(oldData.attach_curriculum, 'attach_curriculum')
                    }
                  />
                </div>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-w-0'>
              <h3 className={sectionTitleClass}>Estado y fechas</h3>
              <div className='col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4'>
                {/* <div className='col-span-1'>
                  <label
                    htmlFor='is_active'
                    className='block text-[12px] font-medium text-blue-500'
                  >
                    Estado
                  </label>
                  <select
                    className='w-full px-3 mt-1 p-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                    name='is_active'
                    id='is_active'
                    onChange={handleChange}
                    value={formData.is_active}
                  >
                    <option value='' disabled>
                      Seleccione...
                    </option>
                    {Object.entries(estado_config).map(([value, option]) => (
                      <option key={value} value={value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div> */}
                <div>
                  <label htmlFor='type' className={formLabelClass}>
                    Tipo
                  </label>
                  <ColorSelect
                    value={formData.type}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, type: val }))
                    }
                    optionsConfig={tipo_config}
                  />
                </div>
                <div>
                  <label htmlFor='level_id' className={formLabelClass}>
                    Nivel
                  </label>
                  <ColorSelect
                    value={String(formData.level_id)}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        level_id: Number(val),
                      }))
                    }
                    optionsConfig={levels.reduce((acc, level) => {
                      const rgb = `rgb(${level.color})`;
                      acc[String(level.id)] = {
                        label: level.name,
                        color: rgb,
                      };
                      return acc;
                    }, {})}
                  />
                </div>
                <div>
                  <label htmlFor='statu_id' className={formLabelClass}>
                    Situacion
                  </label>
                  <ColorSelect
                    value={String(formData.statu_id)}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        statu_id: Number(val),
                      }))
                    }
                    optionsConfig={status.reduce((acc, statu) => {
                      const rgb = `rgb(${statu.color})`;
                      acc[String(statu.id)] = {
                        label: statu.name,
                        color: rgb,
                      };
                      return acc;
                    }, {})}
                  />
                </div>
                <div>
                  <label htmlFor='start_date' className={formLabelClass}>
                    Fecha de alta
                  </label>
                  <input
                    type='date'
                    id='start_date'
                    name='start_date'
                    value={formData.start_date}
                    onChange={handleChange}
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label htmlFor='antique' className={formLabelClass}>
                    Antiguedad
                  </label>
                  <input
                    type='text'
                    id='antique'
                    name='antique'
                    value={formData.antique}
                    disabled={true}
                    className={formInputClass}
                  />
                </div>
              </div>

              <h3 className={sectionTitleClass}>Identificación</h3>
              <div className='col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4'>
                <div>
                  <label htmlFor='gender_id' className={formLabelClass}>
                    Genero
                  </label>
                  <select
                    className={formSelectClass}
                    name='gender_id'
                    id='gender_id'
                    onChange={handleChange}
                    value={formData.gender_id}
                  >
                    <option value=''>Seleccione</option>
                    {genders.length > 0 &&
                      genders.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label htmlFor='first_name' className={formLabelClass}>
                    Nombre
                  </label>
                  <input
                    type='text'
                    id='first_name'
                    name='first_name'
                    value={formData.first_name}
                    onChange={handleChange}
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label htmlFor='last_name' className={formLabelClass}>
                    Apellidos
                  </label>
                  <input
                    type='text'
                    id='last_name'
                    name='last_name'
                    value={formData.last_name}
                    onChange={handleChange}
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label htmlFor='born_date' className={formLabelClass}>
                    F.Nacimiento
                  </label>
                  <input
                    type='date'
                    id='born_date'
                    name='born_date'
                    value={formData.born_date}
                    onChange={handleChange}
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label htmlFor='age' className={formLabelClass}>
                    Edad
                  </label>
                  <input
                    type='text'
                    className={formInputClass}
                    id='age'
                    name='age'
                    readOnly
                    value={formData.age}
                  />
                </div>
              </div>

              <h3 className={sectionTitleClass}>Documentación personal</h3>
              <div className='col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-4'>
                <div>
                  <label htmlFor='dni' className={formLabelClass}>
                    DNI
                  </label>
                  <input
                    type='text'
                    id='dni'
                    name='dni'
                    value={formData.dni}
                    onChange={handleChange}
                    ref={dniRef}
                    onBlur={() => validateField('dni', formData.dni, dniRef)}
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label htmlFor='dni_date_expiration' className={formLabelClass}>
                    F. Vto. DNI
                  </label>
                  <input
                    type='date'
                    id='dni_date_expiration'
                    name='dni_date_expiration'
                    value={formData.dni_date_expiration}
                    onChange={handleChange}
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label htmlFor='num_social_security' className={formLabelClass}>
                    Número SS
                  </label>
                  <input
                    type='text'
                    id='num_social_security'
                    name='num_social_security'
                    value={formData.num_social_security}
                    ref={nssRef}
                    onChange={handleChange}
                    onBlur={() =>
                      validateField(
                        'num_social_security',
                        formData.num_social_security,
                        nssRef,
                      )
                    }
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label htmlFor='country_id' className={formLabelClass}>
                    Pais de nacimiento
                  </label>
                  <select
                    id='country_id'
                    name='country_id'
                    onChange={handleChange}
                    value={formData.country_id}
                    className={formSelectClass}
                  >
                    <option value=''>Seleccione...</option>
                    {countries.length > 0 &&
                      countries.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <h3 className={sectionTitleClass}>Contacto</h3>
              <div className='col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label htmlFor='phone' className={formLabelClass}>
                    Teléfono
                  </label>
                  <div className='flex flex-col sm:flex-row gap-2'>
                    <select
                      id='code_phone'
                      name='code_phone'
                      onChange={handleChange}
                      value={formData.code_phone}
                      className={`${formSelectClass} w-full sm:w-[135px] sm:min-w-[135px] shrink-0`}
                    >
                      <option value='' disabled>
                        Seleccione...
                      </option>
                      {countries.length > 0 &&
                        countries.map((option) => (
                          <option key={option.id} value={option.code_phone}>
                            {option.code_phone}
                          </option>
                        ))}
                    </select>
                    <input
                      type='text'
                      id='phone'
                      name='phone'
                      onChange={handleChange}
                      value={formatPhoneNumber(formData.phone, currentPhoneMask)}
                      className={formInputClass}
                      placeholder='Número de teléfono'
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor='phone2' className={formLabelClass}>
                    Teléfono [opcional]
                  </label>
                  <div className='flex flex-col sm:flex-row gap-2'>
                    <select
                      id='code_phone2'
                      name='code_phone2'
                      onChange={handleChange}
                      value={formData.code_phone2}
                      className={`${formSelectClass} w-full sm:w-[135px] sm:min-w-[135px] shrink-0`}
                    >
                      <option value='' disabled>
                        Seleccione...
                      </option>
                      {countries.length > 0 &&
                        countries.map((option) => (
                          <option key={option.id} value={option.code_phone}>
                            {option.code_phone}
                          </option>
                        ))}
                    </select>
                    <input
                      type='text'
                      id='phone2'
                      name='phone'
                      onChange={handleChange}
                      value={formatPhoneNumber(formData.phone2, currentPhoneMask)}
                      className={formInputClass}
                      placeholder='Número de teléfono'
                    />
                  </div>
                </div>
              </div>
              <div className='col-span-full'>
                <label htmlFor='email' className={formLabelClass}>
                  Correo electrónico
                </label>
                <input
                  type='text'
                  id='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  ref={emailRef}
                  onBlur={() => validateField('email', formData.email, emailRef)}
                  className={formInputClass}
                  placeholder='email@ejemplo.com'
                />
              </div>

              <h3 className={sectionTitleClass}>Ubicación</h3>
              <div className='col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                <div>
                  <label htmlFor='country_current_id' className={formLabelClass}>
                    Pais de residencia
                  </label>
                  <select
                    id='country_current_id'
                    name='country_current_id'
                    onChange={handleChange}
                    value={formData.country_current_id}
                    className={formSelectClass}
                  >
                    <option value=''>Seleccione...</option>
                    {countries.length > 0 &&
                      countries.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label htmlFor='state_id' className={formLabelClass}>
                    Provincia
                  </label>
                  <select
                    id='state_id'
                    name='state_id'
                    onChange={handleChange}
                    value={formData.state_id}
                    className={formSelectClass}
                  >
                    <option>Seleccione...</option>
                    {selectedCountry &&
                      selectedCountry.states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className='sm:col-span-2 lg:col-span-1 xl:col-span-1'>
                  <label htmlFor='cod_post_id' className={formLabelClass}>
                    Codigo Postal
                  </label>
                  <Select
                    id='cod_post_id'
                    name='cod_post_id'
                    options={postalCodes}
                    onChange={handleSelect}
                    defaultValue={formData.cod_post_id}
                    isMulti={false}
                  />
                </div>
              </div>
              <div className='col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4'>
                <div className='sm:col-span-2 lg:col-span-2 2xl:col-span-3'>
                  <label htmlFor='address' className={formLabelClass}>
                    Calle
                  </label>
                  <input
                    id='address'
                    name='address'
                    value={formData.address}
                    onChange={handleChange}
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label htmlFor='address_num' className={formLabelClass}>
                    Numero
                  </label>
                  <input
                    type='text'
                    id='address_num'
                    name='address_num'
                    value={formData.address_num}
                    onChange={handleChange}
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label htmlFor='address_flat' className={formLabelClass}>
                    Piso
                  </label>
                  <input
                    type='text'
                    id='address_flat'
                    name='address_flat'
                    value={formData.address_flat}
                    onChange={handleChange}
                    className={formInputClass}
                  />
                </div>
              </div>

              <h3 className={sectionTitleClass}>Otros</h3>
              <div className='col-span-full'>
                <label htmlFor='alias' className={formLabelClass}>
                  Alias
                </label>
                <div className='flex flex-row gap-2'>
                  <input
                    id='alias'
                    name='alias'
                    value={formData.alias}
                    onChange={handleChange}
                    className={formInputClass}
                  />
                  <button
                    className='btn px-4 py-2 shrink-0'
                    type='button'
                    onClick={handleAlias}
                  >
                    <FaRotate />
                  </button>
                </div>
              </div>
              <div className='col-span-full'>
                <label htmlFor='observations' className={formLabelClass}>
                  Observaciones
                </label>
                <div
                  className={`${
                    isFullScreen
                      ? 'fixed inset-0 z-50 bg-white flex flex-col'
                      : 'relative'
                  }`}
                >
                  <button
                    type='button'
                    className='absolute top-2 right-2 z-50 bg-gray-200 px-2 py-1 rounded text-xs'
                    onClick={() => setIsFullScreen(!isFullScreen)}
                  >
                    {isFullScreen ? '⤢ Minimizar' : '⤢ Maximizar'}
                  </button>
                  <ReactQuill
                    theme='snow'
                    value={formData.observations}
                    placeholder='Escribe aquí...'
                    className='bg-white'
                    style={{ height: isFullScreen ? '100vh' : '200px' }}
                    onChange={(content) =>
                      setFormData((prev) => ({
                        ...prev,
                        observations: content,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {expandImage && (
          <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center z-50'>
            <div className='bg-white p-2 rounded shadow-lg w-3/4 h-[90%]'>
              <button
                className='absolute top-2 right-2 text-white hover:text-blue-500 text-lg bg-gray-800'
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

              <img
                alt='imagen'
                src={dni.current}
                className='w-auto h-full mx-auto'
              />
            </div>
          </div>
        )}
        {isOpenModalReason && (
          <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center'>
            <div
              className={`relative bg-white p-2 rounded shadow-lg min-h-60 w-4/5 lg:w-3/5`}
            >
              <button
                className='absolute top-0 right-0 text-gray-800 text-lg'
                onClick={closeModalReason}
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
              <div className={`col-span-1 md:grid md:grid-cols-2 gap-2 p-2`}>
                <div className='col-span-1'>
                  <div className='mb-2'>
                    <label
                      htmlFor='date'
                      className='block text-[12px] font-medium text-secondary'
                    >
                      Fecha
                    </label>
                    <input
                      type='date'
                      rows={15}
                      id='date'
                      value={changelogs.date}
                      onChange={handleChangeLogs}
                      className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                    />
                  </div>
                </div>
                <div className='col-span-1'>
                  <div className='mb-2'>
                    <label
                      htmlFor='reason'
                      className='block text-[12px] font-medium text-secondary'
                    >
                      Motivo
                    </label>
                    <Select
                      id='client_statu_reason_id'
                      options={clientReason}
                      placeholder='Seleccione Motivo'
                      defaultValue={changelogs.client_statu_reason_id}
                      onChange={(event) =>
                        handleChangeLogsSelect(event, 'client_statu_reason_id')
                      }
                      isSearchable
                    />
                  </div>
                </div>
                <div className='col-span-2'>
                  <div className='mb-2'>
                    <label
                      htmlFor='observation'
                      className='block text-[12px] font-medium text-secondary'
                    >
                      Observaciones
                    </label>
                    <textarea
                      type='textarea'
                      rows={7}
                      id='observation'
                      value={changelogs.observation}
                      onChange={handleChangeLogs}
                      className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                    />
                  </div>
                </div>
              </div>
              <div className='flex justify-end p-4'>
                <button
                  type='button'
                  className='bg-gray-500 text-white font-bold py-2 px-4 text-[12px] rounded mr-2'
                  onClick={closeModalReason}
                >
                  Cancelar
                </button>
                <button
                  type='button'
                  className={`font-bold py-2 px-4 text-[12px] rounded mr-2 ${
                    changelogs.client_statu_reason_id === '' ||
                    changelogs.observation === '' ||
                    changelogs.date === ''
                      ? 'bg-gray-500 opacity-50 cursor-not-allowed'
                      : 'bg-green-500 text-white'
                  }`}
                  onClick={handleContinueChange}
                  disabled={
                    changelogs.client_statu_reason_id == '' ||
                    changelogs.observation == '' ||
                    changelogs.date == ''
                  }
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
      <div className='sticky bottom-0 -mx-2 mt-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 py-3 px-4 flex flex-col-reverse sm:flex-row justify-end gap-3 z-30'>
        <button
          type='button'
          className='w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded'
          onClick={handleCancel}
        >
          Cancelar
        </button>
        <button
          type='button'
          className='w-full sm:w-auto bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={
            formData.is_active === 'false' &&
            (oldData.is_active === true || oldData.is_active === 'true')
              ? handleOpenReason
              : handleSubmit
          }
        >
          Guardar
        </button>
      </div>
    </>
  );
};

export default Form;
