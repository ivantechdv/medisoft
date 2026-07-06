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
import { FaExpand, FaMinusCircle, FaUser, FaIdCard, FaCamera } from 'react-icons/fa';
import Spinner from '../../../components/Spinner/Spinner';
import ChangeLogger from '../../../components/changeLogger';
import {
  formatPhoneNumber,
  formatISOToDate,
  validarDocumento,
} from '../../../utils/customFormat';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  onGetRecordById,
}) => {
  const inputRef = useRef(null);
  const [formData, setFormData] = useState({
    dni: '',
    start_date: '',
    first_name: '',
    last_name: '',
    full_name: '',
    code_phone: '',
    phone: '',
    email: '',
    born_date: '',
    cod_post_id: 0,
    address: '',
    photo: '',
    dniFront: '',
    dniBack: '',
    is_active: true,
    state_id: '',
    country_current_id: '',
    type: 'Cliente',
    recommendations: '',
    age: '',
    observations: '',
    createdAt: '',
  });
  const [oldData, setOldData] = useState({
    dni: '',
    start_date: '',
    first_name: '',
    last_name: '',
    full_name: '',
    code_phone: '',
    phone: '',
    email: '',
    born_date: '',
    cod_post_id: 0,
    address: '',
    photo: '',
    dniFront: '',
    dniBack: '',
    is_active: true,
    state_id: '',
    type: 'Cliente',
    country_current_id: '',
    recommendations: '',
    age: '',
    observations: '',
    createdAt: '',
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
  const [loadingLanguage, setLoadingLanguage] = useState(true);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [loading, setLoading] = useState(true);
  const [expandImage, setExpandImage] = useState(false);
  const [isOpenModalReason, setIsOpenModalReason] = useState(false);
  const [dniFront, setDniFront] = useState('');
  const [dniBack, setDniBack] = useState('');
  const [codPosts, setCodPosts] = useState([]);
  const [countries, setCountries] = useState([]);
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
  const [modalActions, setModalActions] = useState({
    handleContinue: () => {},
    handleCancel: () => {},
  });
  const dniRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const dni = useRef(null);
  const ref = useRef(null);
  const [isObservationsFullScreen, setIsObservationsFullScreen] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [postalCodes, setPostalCodes] = useState([]);
  const [currentPhoneMask, setCurrentPhoneMask] = useState('999 99 99 99');

  const configDefaultsRef = useRef({ type: null, languages: [], country_id: null, state_id: null });
  const hasLoadedClientDefaults = useRef(false);
  const hasAppliedLanguageDefaults = useRef(false);
  const hasAppliedCountryStateDefaults = useRef(false);
  const userModifiedLanguageSelection = useRef(false);

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
        const maskResponse = await getData('configs/phone-mask');
        setCurrentPhoneMask(maskResponse?.phoneMask || '999 99 99 99');
      }
    } catch (error) {
      console.error('Error al obtener máscara del país:', error);
      setCurrentPhoneMask('999 99 99 99');
    }
  };

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
  useEffect(() => {
    const initForm = async () => {
      try {
        setLoadingForm(true);
        if (onFormData) {
          setFormData(onFormData);
          //calcula la edad
          const age = onFormData.born_date
            ? calculateAge(onFormData.born_date)
            : '0';
          setFormData((prevFormData) => ({
            ...prevFormData,
            ['age']: age,
          }));
          //guarda data original
          setOldData(onFormData);
          //setea el codigo postal
          setCodPost(
            onFormData.cod_post.code +
              '/' +
              onFormData.cod_post.name +
              '/' +
              onFormData.cod_post.state?.name,
          );

          await updateImages(onFormData);

          setSelectedCodPost({
            cod_post: onFormData.cod_post?.code,
            name: onFormData.cod_post?.name,
            state: onFormData.cod_post?.state?.name,
          });

          // Obtener máscara de teléfono según el país del cliente
          if (onFormData.cod_post?.state?.country_id) {
            getPhoneMaskByCountry(onFormData.cod_post.state.country_id);
          }

          if (onFormData && onFormData.language_id) {
            const languageIds = onFormData.language_id
              .split(',')
              .map((id) => parseInt(id));
            const selectedLanguages = languages.filter((language) =>
              languageIds.includes(language.value),
            );
            setSelectedLanguages(selectedLanguages);
          }

          if (
            !onFormData.final_date || // Verifica si está vacía o indefinida
            onFormData.final_date === '0000-00-00' || // Fecha específica no válida
            isNaN(new Date(onFormData.final_date).getTime()) // Verifica si no es una fecha válida
          ) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              final_date: null, // Establece la fecha como null
            }));
          }
        }
      } catch (error) {
        console.log('error=>', error);
      } finally {
        setLoadingForm(false);
      }
    };
    initForm();
  }, [onFormData]);

  useEffect(() => {
    const loadClientDefaults = async () => {
      if (id || hasLoadedClientDefaults.current) return;

      try {
        const configResponse = await getData('configs/active');
        const clientConfig = configResponse?.client_config || {};

        const resolveDefaultType = () => {
          const rawType =
            clientConfig.type || clientConfig.default_type || clientConfig?.defaultType;

          if (typeof rawType !== 'string') return null;

          const trimmed = rawType.trim();
          if (!trimmed) return null;

          const knownTypes = ['Cliente', 'Posible Cliente'];
          const normalized = knownTypes.find(
            (type) => type.toLowerCase() === trimmed.toLowerCase(),
          );

          return normalized || trimmed;
        };

        const resolveDefaultLanguages = () => {
          if (Array.isArray(clientConfig.default_languages)) {
            return clientConfig.default_languages
              .map((value) => Number(value))
              .filter((value) => !Number.isNaN(value));
          }

          if (Array.isArray(clientConfig.languages)) {
            return clientConfig.languages
              .map((value) => Number(value))
              .filter((value) => !Number.isNaN(value));
          }

          const languageCSV =
            clientConfig.language || clientConfig.default_language || clientConfig?.defaultLanguages;

          if (typeof languageCSV !== 'string') return [];

          return languageCSV
            .split(',')
            .map((value) => Number(value.trim()))
            .filter((value) => !Number.isNaN(value));
        };

        const defaultType = resolveDefaultType();
        const defaultLanguages = resolveDefaultLanguages();
        const defaultCountryId = configResponse?.default_country_id || null;
        const defaultStateId = clientConfig?.default_state_id || null;
        const defaultCountryCode = clientConfig?.default_country_code || configResponse?.defaultCountry?.code_phone || '';

        configDefaultsRef.current = {
          type: defaultType,
          languages: defaultLanguages,
          country_id: defaultCountryId,
          state_id: defaultStateId,
          country_code: defaultCountryCode,
        };

        if (defaultType) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            type: defaultType,
          }));
        }

        if (!defaultLanguages.length) {
          hasAppliedLanguageDefaults.current = true;
        }

        hasLoadedClientDefaults.current = true;
      } catch (error) {
        console.error(
          'Error cargando configuración por defecto de clientes:',
          error,
        );
      }
    };

    loadClientDefaults();
  }, [id]);
  useEffect(() => {
    try {
      setLoadingLanguage(true);
      if (onFormData) {
        if (onFormData && onFormData.language_id) {
          const languageIds = onFormData.language_id
            .split(',')
            .map((id) => parseInt(id));
          const selectedLanguages = languages.filter((language) =>
            languageIds.includes(language.value),
          );
          setSelectedLanguages(selectedLanguages);
        }
      }
    } catch (error) {
      console.log('error =>', error);
    } finally {
      setLoadingLanguage(false);
    }
  }, [languages]);

  useEffect(() => {
    if (id) return;
    if (!hasLoadedClientDefaults.current) return;
    if (hasAppliedLanguageDefaults.current) return;

    const defaultLanguages = configDefaultsRef.current.languages;

    if (!Array.isArray(defaultLanguages) || !defaultLanguages.length) return;
    if (!languages || !languages.length) return;
    if (userModifiedLanguageSelection.current) return;

    const selected = languages.filter((language) =>
      defaultLanguages.includes(language.value),
    );

    setSelectedLanguages(selected);
    setFormData((prevFormData) => ({
      ...prevFormData,
      language_id: selected.map((language) => language.value).join(','),
    }));

    hasAppliedLanguageDefaults.current = true;
  }, [languages, id]);

  useEffect(() => {
    if (id) return;
    if (!hasLoadedClientDefaults.current) return;
    if (hasAppliedCountryStateDefaults.current) return;
    if (!countries || !countries.length) return;

    const defaultCountryId = configDefaultsRef.current.country_id;
    const defaultStateId = configDefaultsRef.current.state_id;
    const defaultCountryCode = configDefaultsRef.current.country_code;

    if (defaultCountryId) {
      const country = countries.find((c) => c.id === Number(defaultCountryId));
      if (country) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          country_current_id: defaultCountryId,
          code_phone: country.code_phone || defaultCountryCode,
          code_phone2: country.code_phone || defaultCountryCode,
        }));

        setSelectedCountry(country);
        setSelectedState(country.states);

        // Actualizar máscara de teléfono según el país por defecto
        getPhoneMaskByCountry(defaultCountryId);

        if (defaultStateId) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            state_id: defaultStateId,
          }));

          const state = country.states.find((s) => s.id === Number(defaultStateId));
          if (state) {
            const options = state?.cod_posts.map((item, index) => ({
              value: item.id,
              label: item.code + '|' + item.name,
              key: item.id ?? `default-key-${index}`,
            }));
            setPostalCodes(options);
          }
        }
      }
    }

    hasAppliedCountryStateDefaults.current = true;
  }, [countries, id]);

  useEffect(() => {
    try {
      setLoadingFetch(true);
      const fetchSelect = async () => {
        const order = 'name-asc';

        const responseCodPosts = await getData('cod_posts/all');
        setCodPosts(responseCodPosts);

        const responseGenders = await getData('genders/all');
        setGenders(responseGenders);

        const responseCountries = await getData('countries/all');
        setCountries(responseCountries);

        const responseLanguages = await getData('languages/all');

        if (responseLanguages) {
          const options = responseLanguages.map((item, index) => ({
            value: item.id,
            label: item.name,
            key: item.id ?? `default-key-${index}`,
          }));

          setLanguages(options);
        }
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
    const fetchSelect = async () => {
      const queryParameters = new URLSearchParams();
      if (codPost) {
        queryParameters.append('name', `%${codPost}%`);
        queryParameters.append('code', `%${codPost}%`);
        queryParameters.append('$state.name$', `%${codPost}%`);
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

  useEffect(() => {
    if (onFormData.cod_post?.state?.country) {
      const country = countries.find(
        (c) => c.id === parseInt(onFormData.cod_post.state.country_id),
      );

      setSelectedCountry(country);
      if (country) {
        setSelectedState(country.states);

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
          ['country_current_id']: onFormData.cod_post.state.country_id,
        }));
      }
    }
  }, [countries, onFormData]);

  useEffect(() => {
    if (
      loadingForm == false &&
      loadingFetch == false &&
      loadingLanguage == false &&
      loadingSelect == false
    ) {
      setTimeout(() => setLoading(false), 1600);
    }
  }, [loadingForm, loadingFetch, loadingLanguage, loadingSelect]);

  const handleLoadingSelect = () => {
    setTimeout(() => setLoadingSelect(false), 400);
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
    const { id, value } = event.target;
    if (id === 'born_date') {
      const age = value != '' ? calculateAge(value) : '0';
      setFormData((prevFormData) => ({
        ...prevFormData,
        ['age']: age,
      }));
    }
    if (id === 'phone') {
      const input = event.target;
      const rawValue = value.replace(/\D/g, ''); // Remueve caracteres no numéricos
      const prevFormatted = formatPhoneNumber(formData[id] || '', currentPhoneMask); // Formato anterior con máscara actual
      const newFormatted = formatPhoneNumber(rawValue, currentPhoneMask); // Nuevo formato con máscara actual

      // Obtener la posición previa del cursor antes de actualizar el estado
      let cursorPosition = input.selectionStart;

      // Ajustar la posición del cursor según la cantidad de espacios añadidos
      const addedSpaces =
        (newFormatted.match(/ /g) || []).length -
        (prevFormatted.match(/ /g) || []).length;
      cursorPosition += addedSpaces;

      if (rawValue.length <= 9) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [id]: rawValue,
        }));

        requestAnimationFrame(() => {
          if (phoneRef.current) {
            const newCursorPosition = Math.min(
              cursorPosition,
              newFormatted.length,
            );
            phoneRef.current.setSelectionRange(
              newCursorPosition,
              newCursorPosition,
            );
          }
        });
      }
    } else {
      setFormData((prevFormData) => {
        const updatedFormData = {
          ...prevFormData,
          [id]: value,
        };

        // Si el id es first_name o last_name, actualizar full_name
        if (id === 'first_name' || id === 'last_name') {
          const firstName =
            id === 'first_name' ? value : prevFormData.first_name || '';
          const lastName =
            id === 'last_name' ? value : prevFormData.last_name || '';
          updatedFormData.full_name = `${firstName} ${lastName}`.trim();
        }

        if (id === 'country_current_id') {
          const country = countries.find((c) => c.id === parseInt(value));
          setSelectedCountry(country);
          setSelectedState(null); // Resetear el estado
          setPostalCodes([]);
          // NO actualizar código de teléfono cuando cambia el país
        }

        if (id === 'code_phone' || id === 'code_phone2') {
          // Cuando cambia el código de teléfono, actualizar la máscara pero NO el país
          const country = countries.find((c) => c.code_phone === value);
          if (country) {
            getPhoneMaskByCountry(country.id);
          }
        }
        if (id === 'state_id') {
          const state = selectedCountry.states.find(
            (s) => s.id === parseInt(value),
          );
          setSelectedState(state);

          // Establecer los códigos postales según el estado seleccionado
          if (state) {
            const options = state?.cod_posts.map((item, index) => ({
              value: item.id,
              label: item.code + '|' + item.name,
              key: item.id ?? `default-key-${index}`,
            }));
            setPostalCodes(options);
          } else {
            setPostalCodes([]); // Resetear si no se encuentra el estado
          }
        }
        return updatedFormData;
      });

      if (id === 'first_name' || id === 'last_name') {
        const firstName = id === 'first_name' ? value : formData.first_name;
        const lastName = id === 'last_name' ? value : formData.last_name;
        const fullName = `${firstName} ${lastName}`.trim();
        onHandleChangeCard('full_name', fullName);
      }
      if (id === 'dni') {
        onHandleChangeCard(id, value);
      }
    }
  };

  const requiredFields = [
    { field: 'dni', label: 'DNI' },
    { field: 'start_date', label: 'Fecha de alta' },
    { field: 'first_name', label: 'Nombres' },
    { field: 'last_name', label: 'Apellidos' },
    { field: 'gender_id', label: 'Género' },
    { field: 'email', label: 'Correo electrónico' },
    { field: 'phone', label: 'Teléfono' },
    { field: 'address', label: 'Dirección' },
    { field: 'cod_post_id', label: 'Codigo postal' },
  ];

  const validateRequiredFields = () => {
    let isValid = true;

    if (formData.type == 'Posible Cliente') {
      if (formData.is_active === undefined || formData.is_active === '') {
        ToastNotify({
          message: `El campo estado es requerido.`,
          position: 'top-left',
          type: 'error',
        });
        return false;
      }
    } else {
      requiredFields.forEach((required) => {
        const value = formData[required.field];

        // Validar campos vacíos
        if (value === undefined || value === '') {
          ToastNotify({
            message: `El campo ${required.label} es requerido.`,
            position: 'top-left',
            type: 'error',
          });
          isValid = false;
        }
        if (required.field === 'born_date') {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Formato: YYYY-MM-DD
          if (!dateRegex.test(value) || isNaN(new Date(value).getTime())) {
            ToastNotify({
              message: `El campo ${required.label} debe ser una fecha válida`,
              position: 'top-left',
              type: 'error',
            });
            isValid = false;
          }
        }
      });

      if (!isValid) {
        // Detener el envío del formulario si algún campo requerido está vacío
        return false;
      }
    }
    return true;
  };
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
        return;
      }

      setLoadingForm(true);
      setLoading(true);

      let response = false;

      for (const [key, value] of Object.entries(formData)) {
        const isFile = value instanceof File;
        console.log('value ' + key, value);
        if (isFile) {
          const fileUploadResponse = await postStorage(value, 'client');
          formData[key] = fileUploadResponse.path;
          if (
            oldData[key] !== null &&
            oldData[key] !== undefined &&
            oldData[key] !== ''
          ) {
            const filename = oldData[key].split('/').pop();
            await deleteStorage(filename, 'client');
          }
        }
      }
      const dataToSend = {
        ...formData,
        born_date: formData.born_date ? new Date(formData.born_date) : null,
      };
      
      // Limpiar formato de teléfono antes de enviar
      const cleanPhone = (phone) => {
        if (!phone || typeof phone !== 'string') return phone;
        return phone.replace(/\D/g, '');
      };
      
      dataToSend.phone = cleanPhone(dataToSend.phone);

      const languageIds = selectedLanguages.map((language) => language.value);
      dataToSend.language_id = languageIds.join(',');
      let message = '';
      if (!id) {
        response = await postData('clients', dataToSend);
        message = 'Cliente registrado con exito';
      } else {
        response = await putData('clients/' + id, dataToSend);
        message = 'Cliente actualizado con exito';
      }
      //changelogs
      console.log('changelogs => ', changelogs);
      const currentData = changeValueSelect(changelogs);
      console.log('oldchangeLogs => ', oldChangelogs);
      console.log('currentData => ', currentData);
      await ChangeLogger({
        oldData: oldChangelogs,
        newData: currentData,
        user: null,
        module: 'clients',
        module_id: response.id,
      });
      //changelogs
      if (response) {
        ToastNotify({
          message: message,
          position: 'top-left',
          type: 'success',
        });

        setTimeout(
          () => (window.location.href = '/client/' + response.id),
          1000,
        );
      }
      await updateImages(formData);
      setLoadingForm(false);
      onHandleChangeCard('address', formData.address);
      onHandleChangeCard('email', formData.email);
      onHandleChangeCard('phone', formData.phone);
      setOldData(formData);
      onGetRecordById(id);
    } catch (error) {
      console.log('error', error);
      ToastNotify({
        message: 'Error al procesar el formulario',
        position: 'top-left',
        type: 'error',
      });
    } finally {
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
      await deleteStorage(filename, 'client');

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
      const response = await putData('clients/' + id, dataToSend);
      let message = 'Imagen eliminada con exito';
      if (response) {
        ToastNotify({
          message: message,
          position: 'top-left',
          type: 'success',
        });
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
  const handleSelect = (selected) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ['cod_post_id']: selected.value,
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

  const validateField = async (field, value, ref) => {
    try {
      const trimmedValue = value?.trim();
      console.log(`Validando campo ${field}:`, { value: trimmedValue, oldValue: oldData[field], oldDataId: oldData.id });
      
      if (!trimmedValue || trimmedValue === oldData[field]) {
        console.log(`Validación cancelada - campo vacío o igual al anterior`);
        return;
      }

      let response = [];
      let invalidValues = [];

      // Validación especial para correos (puede separar múltiples con ;)
      if (field === 'email') {
        const { validEmails, invalidEmails } = validateEmails(trimmedValue);
        invalidValues = invalidEmails;

        for (let email of validEmails) {
          const emailResponse = await getData(`clients/all?email=${email}`);
          if (emailResponse?.length > 0 && emailResponse[0].id !== oldData.id) {
            response.push({ value: email, id: emailResponse[0].id });
          }
        }

        // Filtrar solo los válidos que no están duplicados
        const newValidEmails = validEmails.filter(
          (e) => !response.some((r) => r.value === e),
        );

        setFormData((prevFormData) => ({
          ...prevFormData,
          [field]: newValidEmails.join(';'),
        }));
        onHandleChangeCard(field, newValidEmails.join(';'));
      } else {
        // Validación especial para DNI: verificar formato antes de consultar duplicados
        if (field === 'dni') {
          if (!validarDocumento(trimmedValue)) {
            ToastNotify({
              message: "Formato inválido: introduce un DNI o NIE válido",
              position: 'top-center',
              type: 'error',
              ref,
            });
            setFormData((prevFormData) => ({
              ...prevFormData,
              [field]: '',
            }));
            onHandleChangeCard(field, '');
            if (ref?.current) ref.current.focus();
            return;
          }
        }

        // Para campos únicos simples: dni, phone, full_name, etc.
        console.log(`Consultando backend: clients/all?${field}=${trimmedValue}`);
        const res = await getData(`clients/all?${field}=${trimmedValue}`);
        console.log('Respuesta del backend:', res);
        
        if (res?.length > 0) {
          // Si estamos editando, verificar que no sea el mismo registro
          const isDuplicate = oldData.id ? res[0].id !== oldData.id : true;
          console.log('¿Es duplicado?:', isDuplicate, { resId: res[0].id, oldDataId: oldData.id });
          
          if (isDuplicate) {
            response.push({ value: trimmedValue, id: res[0].id });

            // Limpiar campo si está duplicado
            setFormData((prevFormData) => ({
              ...prevFormData,
              [field]: '',
            }));
            onHandleChangeCard(field, '');
          }
        }
      }

      if (response.length > 0 || invalidValues.length > 0) {
        const errorMessage = [
          ...response.map(
            (r) => `El valor "${r.value}" ya está registrado con el ID ${r.id}`,
          ),
          ...invalidValues.map((v) => `El valor "${v}" no es válido`),
        ].join(', ');

        console.log('Mostrando error:', errorMessage);
        ToastNotify({
          message: errorMessage,
          position: 'top-center',
          type: 'error',
          ref,
        });

        if (ref?.current) ref.current.focus();
      } else {
        console.log('Validación OK - no hay duplicados');
      }
    } catch (error) {
      console.error('Error en la validación del campo:', error);
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
        const handleCancel = () => {
     setTimeout(() => {
       window.location.href = '/clients';
        }, 500);
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
      {loading && <Spinner />}
      <div className='rounded min-h-[calc(100vh-235px)]'>
        {/* <div className='justify-end items-end absolute bottom-5 right-6 z-50'>
          <button
            type='button'
            className='bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            onClick={
              formData.is_active == 'false' &&
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
                label='Foto carnet'
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
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-w-0'>
            <h3 className={sectionTitleClass}>Estado y fechas</h3>
            <div className='col-span-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
              <div>
                <label htmlFor='is_active' className={formLabelClass}>
                  Estado
                </label>
                <select
                  className={formSelectClass}
                  name='is_active'
                  id='is_active'
                  onChange={handleChange}
                  value={
                    formData.is_active !== undefined ? formData.is_active : true
                  }
                >
                  <option value='' disabled>
                    Seleccione...
                  </option>
                  {[
                    { value: true, label: 'Activo', key: 'activo' },
                    { value: false, label: 'Inactivo', key: 'inactivo' },
                  ].map((option) => (
                    <option key={option.key} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor='type' className={formLabelClass}>
                  Tipo
                </label>
                <select
                  className={formSelectClass}
                  name='type'
                  id='type'
                  onChange={handleChange}
                  value={formData.type}
                >
                  <option value='' disabled>
                    Seleccione...
                  </option>
                  <option value='Cliente' key={'1'}>
                    Cliente
                  </option>
                  <option value='Posible Cliente' key={'2'}>
                    Posible Cliente
                  </option>
                </select>
              </div>
              <div>
                <label htmlFor='createdAt' className={formLabelClass}>
                  Fecha de creacion
                </label>
                <input
                  type='date'
                  id='createdAt'
                  name='createdAt'
                  value={formatISOToDate(formData.createdAt)}
                  onChange={handleChange}
                  className={formInputClass}
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
            </div>

            <h3 className={sectionTitleClass}>Identificación</h3>
            <div className='col-span-full grid grid-cols-1 sm:grid-cols-3 gap-4'>
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
            <div className='col-span-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
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
              <div className='sm:col-span-2 xl:col-span-1'>
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
                  {genders?.length > 0 &&
                    genders.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <h3 className={sectionTitleClass}>Contacto</h3>
            <div className='col-span-full sm:col-span-2 xl:col-span-2'>
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
                    Cód País
                  </option>
                  {countries?.length > 0 &&
                    countries.map((option) => (
                      <option key={option.code_phone} value={option.code_phone}>
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
                  ref={phoneRef}
                  onBlur={() =>
                    validateField('phone', formData.phone, phoneRef)
                  }
                  className={formInputClass}
                  placeholder='Número de teléfono'
                />
              </div>
            </div>
            <div className='col-span-full'>
              <label htmlFor='email' className={formLabelClass}>
                Correo(s)
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
                placeholder='email1@ejemplo.com; email2@ejemplo.com'
              />
            </div>
            <div className='col-span-full'>
              <label htmlFor='language_id' className={formLabelClass}>
                Idiomas
              </label>
              <Select
                id='language_id'
                name='language_id'
                options={languages}
                onChange={handleSelectChange}
                defaultValue={selectedLanguages}
                isMulti={true}
                onHandleLoadingSelect={handleLoadingSelect}
              />
            </div>

            <h3 className={sectionTitleClass}>Ubicación</h3>
            <div className='col-span-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
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
                  <option value='' disabled>
                    Seleccione...
                  </option>
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
              <div className='sm:col-span-2 xl:col-span-1'>
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
            <div className='col-span-full'>
              <label htmlFor='address' className={formLabelClass}>
                Dirección
              </label>
              <input
                type='text'
                id='address'
                name='address'
                maxLength={70}
                value={formData.address}
                onChange={handleChange}
                className={formInputClass}
              />
            </div>

            <h3 className={sectionTitleClass}>Notas</h3>
            <div className='col-span-full'>
              <label htmlFor='observations' className={formLabelClass}>
                Observaciones
              </label>
              <div
                className={
                  isObservationsFullScreen
                    ? 'fixed inset-0 z-50 bg-white flex flex-col'
                    : 'relative'
                }
              >
                <button
                  type='button'
                  className={`absolute top-2 right-2 ${
                    isObservationsFullScreen ? 'z-50' : 'z-10'
                  } bg-gray-200 px-2 py-1 rounded text-xs`}
                  onClick={() =>
                    setIsObservationsFullScreen((prev) => !prev)
                  }
                >
                  {isObservationsFullScreen ? '⤢ Minimizar' : '⤢ Maximizar'}
                </button>
                <ReactQuill
                  theme='snow'
                  value={formData.observations || ''}
                  placeholder='Escribe observaciones aquí'
                  className='bg-white'
                  style={{ height: isObservationsFullScreen ? '100vh' : '200px' }}
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
      {/* <div className='flex justify-end items-end mt-10'>
        <button
          type='button'
          className='bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={
            formData.is_active == 'false' &&
            (oldData.is_active === true || oldData.is_active === 'true')
              ? handleOpenReason
              : handleSubmit
          }
        >
          {onAction}
        </button>
      </div> */}
      {expandImage && (
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center z-50'>
          <div className='bg-white p-2 rounded shadow-lg max-w-[90vw] max-h-[90vh] relative'>
            <button
              className='absolute -top-3 -right-3 text-white hover:text-blue-500 text-lg bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center'
              onClick={closeExpandImage}
            >
              <svg
                className='w-5 h-5'
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
              className='max-w-[85vw] max-h-[85vh] object-contain'
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
                    className='block text-sm font-medium text-secondary'
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
                    className='block text-sm font-medium text-secondary'
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
                    className='block text-sm font-medium text-secondary'
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
                className='bg-gray-500 text-white font-bold py-2 px-4 text-sm rounded mr-2'
                onClick={closeModalReason}
              >
                Cancelar
              </button>
              <button
                type='button'
                className={`font-bold py-2 px-4 text-sm rounded mr-2 ${
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
          formData.is_active == 'false' &&
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
