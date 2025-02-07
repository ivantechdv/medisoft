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
const Form = ({ onHandleChangeCard, id, onAction, onFormData }) => {
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
  const emailRef = useRef(null);
  const dni = useRef(null);
  const ref = useRef(null);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [postalCodes, setPostalCodes] = useState([]);

  const navigateTo = useNavigate();
  useEffect(() => {
    try {
      setLoadingForm(true);
      if (onFormData) {
        setFormData(onFormData);
        //calcula la edad
        const age = calculateAge(onFormData.born_date);
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
        setSelectedCodPost({
          cod_post: onFormData.cod_post?.code,
          name: onFormData.cod_post?.name,
          state: onFormData.cod_post?.state?.name,
        });
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
  }, [onFormData]);
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
          setPostalCodes(state.cod_posts);
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
      const age = calculateAge(value);
      setFormData((prevFormData) => ({
        ...prevFormData,
        ['age']: age,
      }));
    }
    if (id === 'phone') {
      const newValue = value.replace(/\D/g, '');
      if (newValue?.length <= 9) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [id]: newValue,
        }));
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
        }
        if (id === 'state_id') {
          const state = selectedCountry.states.find(
            (s) => s.id === parseInt(value),
          );
          setSelectedState(state);

          // Establecer los códigos postales según el estado seleccionado
          if (state) {
            setPostalCodes(state.cod_posts); // Asumiendo que state.cod_posts es un array de códigos postales
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
    { field: 'born_date', label: 'Fecha de nacimiento' },
    { field: 'gender_id', label: 'Género' },
    { field: 'email', label: 'Correo electrónico' },
    { field: 'phone', label: 'Teléfono' },
    { field: 'address', label: 'Dirección' },
    { field: 'cod_post_id', label: 'Codigo postal' },
  ];

  const validateRequiredFields = () => {
    let isValid = true;
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
          const fileUploadResponse = await await postStorage(value, 'client');
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
      const dataToSend = { ...formData };

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
        navigateTo('/client/' + response.id);
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
      setLoadingForm(false);
      onHandleChangeCard('address', formData.address);
      onHandleChangeCard('email', formData.email);
      onHandleChangeCard('phone', formData.phone);
      setOldData(formData);
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
    setSelectedLanguages(selected);
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
      if (value !== '') {
        let response = [];
        if (field === 'dni' && value !== oldData['dni']) {
          response = await getData(`clients/all?dni=${value}`);
        } else if (field === 'email' && value !== oldData['email']) {
          const { validEmails, invalidEmails } = validateEmails(value);
          for (let email of validEmails) {
            const emailResponse = await getData(`clients/all?email=${email}`);
            if (
              emailResponse?.length > 0 &&
              emailResponse[0].id !== oldData.id
            ) {
              response.push({ email, id: emailResponse[0].id });
            }
          }

          if (response?.length > 0 || invalidEmails?.length > 0) {
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
  return (
    <form className=''>
      {loading && <Spinner />}
      <div className='rounded min-h-[calc(100vh-235px)] mb-20'>
        <div className='justify-end items-end absolute bottom-5 right-6 z-50'>
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
        </div>
        <div className='md:grid md:grid-cols-4 gap-2'>
          <div className='col-span-1'>
            <div className='col-span-1'>
              <div className='relative h-40 w-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex justify-center items-center '>
                {images.photo != '' ? (
                  <>
                    <label htmlFor='photo' className='cursor-pointer'>
                      <img
                        src={images.photo}
                        alt='foto carnet'
                        className='h-40  w-full rounded-lg'
                        style={{ objectFit: 'contain' }}
                      />
                      <input
                        type='file'
                        id='photo'
                        name='photo'
                        accept='image/*'
                        className='hidden'
                        onChange={(event) => handleImagenChange(event, 'photo')}
                      />
                    </label>
                    <div
                      className='absolute -top-1 -right-3 cursor-pointer'
                      onClick={() => openImageModal(images.photo)}
                    >
                      <FaExpand size={24} />
                    </div>
                    <div
                      className='absolute -top-1 -left-3 cursor-pointer text-red-500'
                      title='Eliminar imagen'
                      onClick={() => deleteImage(images.photo, 'photo')}
                    >
                      <FaMinusCircle size={24} />
                    </div>
                  </>
                ) : (
                  <>
                    <label htmlFor='photo' className='cursor-pointer'>
                      Foto carnet
                      <input
                        type='file'
                        id='photo'
                        name='photo'
                        accept='image/*'
                        className='hidden'
                        onChange={(event) => handleImagenChange(event, 'photo')}
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
            <div className='col-span-1'>
              <div className='mt-2 h-20 w-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex justify-center items-center relative'>
                {images.dniFront != '' ? (
                  <>
                    <label htmlFor='dniFront' className='cursor-pointer'>
                      <img
                        src={images.dniFront}
                        alt='DNI Frontal'
                        className='h-20  w-full rounded-lg'
                        style={{ objectFit: 'contain' }}
                      />
                      <input
                        type='file'
                        id='dniFront'
                        name='dniFront'
                        accept='image/*'
                        className='hidden'
                        onChange={(event) =>
                          handleImagenChange(event, 'dniFront')
                        }
                      />
                    </label>
                    <div
                      className='absolute -top-1 -right-3 cursor-pointer'
                      onClick={() => openImageModal(images.dniFront)}
                    >
                      <FaExpand size={24} />
                    </div>
                    <div
                      className='absolute -top-1 -left-3 cursor-pointer text-red-500'
                      title='Eliminar imagen'
                      onClick={() => deleteImage(images.dniFront, 'dniFront')}
                    >
                      <FaMinusCircle size={24} />
                    </div>
                  </>
                ) : (
                  <>
                    <label htmlFor='dniFront' className='cursor-pointer'>
                      DNI Frontal
                      <input
                        type='file'
                        id='dniFront'
                        name='dniFront'
                        accept='image/*'
                        className='hidden'
                        onChange={(event) =>
                          handleImagenChange(event, 'dniFront')
                        }
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
            <div className='col-span-1'>
              <div className='mt-2 h-20 w-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex justify-center items-center relative'>
                {images.dniBack != '' ? (
                  <>
                    <label htmlFor='dniBack' className='cursor-pointer'>
                      <img
                        src={images.dniBack}
                        alt='DNI Back'
                        className='h-20  w-full rounded-lg'
                        style={{ objectFit: 'contain' }}
                      />
                      <input
                        type='file'
                        id='dniBack'
                        name='dniBack'
                        accept='image/*'
                        className='hidden'
                        onChange={(event) =>
                          handleImagenChange(event, 'dniBack')
                        }
                      />
                    </label>
                    <div
                      className='absolute -top-1 -right-3 cursor-pointer'
                      onClick={() => openImageModal(images.dniBack)}
                    >
                      <FaExpand size={24} />
                    </div>
                    <div
                      className='absolute -top-1 -left-3 cursor-pointer text-red-500'
                      title='Eliminar imagen'
                      onClick={() => deleteImage(images.dniBack, 'dniBack')}
                    >
                      <FaMinusCircle size={24} />
                    </div>
                  </>
                ) : (
                  <>
                    <label htmlFor='dniBack' className='cursor-pointer'>
                      DNI Posterior
                      <input
                        type='file'
                        id='dniBack'
                        name='dniBack'
                        accept='image/*'
                        className='hidden'
                        onChange={(event) =>
                          handleImagenChange(event, 'dniBack')
                        }
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className='col-span-3 md:grid md:grid-cols-2 gap-2'>
            <div className='col-span-2 md:grid md:grid-cols-3 gap-2'>
              <div className='col-span-1'>
                <label
                  htmlFor='is_active'
                  className='block text-sm font-medium text-blue-500'
                >
                  Estado
                </label>
                <select
                  className='w-full px-3 mt-1 p-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
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
              <div className='col-span-1'>
                <label
                  htmlFor='type'
                  className='block text-sm font-medium text-blue-500'
                >
                  Tipo
                </label>
                <select
                  className='w-full px-3 mt-1 p-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
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
              <div className='col-span-1'>
                <label
                  htmlFor='date_start'
                  className='block text-sm font-medium text-blue-500'
                >
                  Fecha de alta
                </label>
                <input
                  type='date'
                  id='start_date'
                  name='start_date'
                  value={formData.start_date}
                  onChange={handleChange}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
              <div className='col-span-1'>
                <label
                  htmlFor='dni'
                  className='block text-sm font-medium text-blue-500'
                >
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
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>

              <div className='col-span-1'>
                <label
                  htmlFor='born_date'
                  className='block text-sm font-medium text-blue-500'
                >
                  Fecha de nacimiento
                </label>
                <input
                  type='date'
                  id='born_date'
                  name='born_date'
                  value={formData.born_date}
                  onChange={handleChange}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>

              <div className='col-span-1'>
                <label
                  htmlFor='age'
                  className='block text-sm font-medium text-blue-500'
                >
                  Edad
                </label>
                <input
                  type='text'
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  id='age'
                  name='age'
                  readOnly
                  value={formData.age}
                />
              </div>
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='first_name'
                className='block text-sm font-medium text-blue-500'
              >
                Nombre
              </label>
              <input
                type='text'
                id='first_name'
                name='first_name'
                value={formData.first_name}
                onChange={handleChange}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='last_name'
                className='block text-sm font-medium text-blue-500'
              >
                Apellidos
              </label>
              <input
                type='text'
                id='last_name'
                name='last_name'
                value={formData.last_name}
                onChange={handleChange}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='gender_id'
                className='block text-sm font-medium text-blue-500'
              >
                Genero
              </label>
              <select
                className='w-full px-3 mt-1 p-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
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

            <div className='col-span-1'>
              <label
                htmlFor='phone'
                className='block text-sm font-medium text-blue-500'
              >
                Teléfono
              </label>
              <div className='flex mt-1'>
                <select
                  id='code_phone'
                  name='code_phone'
                  onChange={handleChange}
                  value={formData.code_phone}
                  className='px-3 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 w-1/3'
                >
                  <option value='' disabled>
                    Seleccione...
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
                  value={formData.phone}
                  className='flex px-3 p-1 ml-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 w-full'
                  placeholder='Número de teléfono'
                />
              </div>
            </div>
            <div className='col-span-2'>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-blue-500'
              >
                Correo(s) electrónico(s) separe con ;
              </label>
              <input
                type='text'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                ref={emailRef}
                onBlur={() => validateField('email', formData.email, emailRef)}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='language_id'
                className='block text-sm font-medium text-blue-500'
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
                onHandleLoadingSelect={handleLoadingSelect}
              />
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='country_current_id'
                className='block text-sm font-medium text-blue-500'
              >
                Pais de residencia
              </label>
              <select
                id='country_current_id'
                name='country_current_id'
                onChange={handleChange}
                value={formData.country_current_id}
                className='px-3 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 w-full'
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
            <div className='col-span-1'>
              <label
                htmlFor='state_id'
                className='block text-sm font-medium text-blue-500'
              >
                Estado
              </label>
              <select
                id='state_id'
                name='state_id'
                onChange={handleChange}
                value={formData.state_id}
                className='px-3 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 w-full'
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
            <div className='col-span-1'>
              <label
                htmlFor='cod_post_id'
                className='block text-sm font-medium text-blue-500'
              >
                Codigo Postal
              </label>
              <select
                id='cod_post_id'
                name='cod_post_id'
                onChange={handleChange}
                value={formData.cod_post_id}
                className='px-3 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 w-full'
              >
                <option>Seleccione...</option>
                {selectedState &&
                  postalCodes.map(
                    (
                      code, // Cambiado de codPosts a postalCodes
                    ) => (
                      <option key={code.id} value={code.id}>
                        {code.code + ' | ' + code.name}
                      </option>
                    ),
                  )}
              </select>
            </div>
            {/* <div className='col-span-1'>
              <label
                htmlFor='asset'
                className='block text-sm font-medium text-blue-500'
              >
                Código postal
              </label>
              <div ref={ref} style={{ position: 'relative' }}>
                <input
                  name='cod_post_id'
                  id='cod_post_id'
                  type='text'
                  value={codPost}
                  autoComplete='off' // Desactiva la función de autocompletar
                  onClick={handleOpenCodPost}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  onChange={handleSearchCodPost}
                />
                {isOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      zIndex: 100,
                      top: '100%',
                      maxHeight: '200px', // Altura máxima de la tabla
                      overflowY: 'auto', // Agrega un scroll vertical si es necesario
                      left: 0,
                      width: '100%',
                      backgroundColor: 'white',
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <table
                      border={1}
                      style={{ width: '100%' }}
                      className='border border-gray-300'
                    >
                      <thead className=''>
                        <tr>
                          <th className='border border-gray-300'>
                            Codigo Postal
                          </th>
                          <th className='border border-gray-300'>Poblacion</th>
                          <th className='border border-gray-300'>Provincia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {codPosts?.length > 0 &&
                          codPosts.map((option) => (
                            <tr
                              key={option.id}
                              onClick={() => handleSelectedCodPost(option)}
                              className='cursor-pointer hover:bg-gray-200'
                            >
                              <td className='border border-gray-300 px-2'>
                                {option.code}
                              </td>
                              <td className='border border-gray-300 px-2'>
                                {option.name}
                              </td>
                              <td className='border border-gray-300 px-2'>
                                {option.state?.name}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div> */}
            <div className='col-span-2'>
              <label
                htmlFor='address'
                className='block text-sm font-medium text-blue-500'
              >
                Dirección
              </label>
              <input
                type='text'
                id='address'
                name='address'
                maxLength={70} // Limitar a 70 caracteres
                value={formData.address}
                onChange={handleChange}
                className='w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div className='col-span-2'>
              <label
                htmlFor='observations'
                className='block text-sm font-medium text-blue-500'
              >
                Observaciones
              </label>
              <textarea
                id='observations'
                name='observations'
                rows={6}
                value={formData.observations}
                onChange={handleChange}
                className='w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
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
        <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center'>
          <div className='bg-white p-2 rounded shadow-lg w-3/4'>
            <button
              className='absolute top-0 right-2 text-white hover:text-blue-500 text-lg bg-gray-800'
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
  );
};

export default Form;
