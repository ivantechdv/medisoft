import React, { useState, useEffect, useRef } from 'react';
import {
  getData,
  postData,
  putData,
  postStorage,
  getStorage,
  deleteStorage,
} from '../../../api';
import { useNavigate } from 'react-router-dom';
import Select from '../../../components/Select';
import ToastNotify from '../../../components/toast/toast';
import { FaExpand } from 'react-icons/fa';
import Spinner from '../../../components/Spinner/Spinner';
const Form = ({ onHandleChangeCard, id, onAction, onFormData }) => {
  const [formData, setFormData] = useState({
    dni: '',
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
    recommendations: '',
  });
  const [oldData, setOldData] = useState({
    dni: '',
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
    recommendations: '',
  });
  const [images, setImages] = useState({
    photo: '',
    dniFront: '',
    dniBack: '',
  });
  const [loadingForm, setLoadingForm] = useState(true);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [loadingLanguage, setLoadingLanguage] = useState(true);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [loading, setLoading] = useState(true);
  const [expandImage, setExpandImage] = useState(false);
  const [dniFront, setDniFront] = useState('');
  const [dniBack, setDniBack] = useState('');
  const [codPosts, setCodPosts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [genders, setGenders] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [codPost, setCodPost] = useState('');
  const [selectedCodPost, setSelectedCodPost] = useState({
    cod_post: '',
    name: '',
    state: '',
  });
  const dniRef = useRef(null);
  const emailRef = useRef(null);
  const dni = useRef(null);
  const ref = useRef(null);
  const navigateTo = useNavigate();
  useEffect(() => {
    try {
      setLoadingForm(true);
      if (onFormData) {
        setFormData(onFormData);
        setOldData(onFormData);
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
        const responseCodPosts = await getData('cod_posts/all');
        setCodPosts(responseCodPosts);

        const responseGenders = await getData('genders/all');
        setGenders(responseGenders);

        const responseCountries = await getData('countries/all');
        setCountries(responseCountries);

        const responseLanguages = await getData('languages/all');

        if (responseLanguages) {
          const options = responseLanguages.map((item) => ({
            value: item.id,
            label: item.name,
          }));

          setLanguages(options);
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

  const handleChange = (event) => {
    const { id, value } = event.target;
    if (id === 'phone') {
      const newValue = value.replace(/\D/g, '');
      if (newValue.length <= 9) {
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
      setLoadingForm(true);
      setLoading(true);
      // Validar campos requeridos antes de enviar el formulario
      const isValid = validateRequiredFields();

      if (!isValid) {
        setLoadingForm(false);
        // Detener el envío del formulario si algún campo requerido está vacío
        return;
      }

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

      if (response) {
        ToastNotify({
          message: message,
          position: 'top-left',
          type: 'success',
        });
        navigateTo('/client/' + response.id);
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
  const handleSelectChange = (selected) => {
    setSelectedLanguages(selected);
  };
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  const validateField = async (field, value, ref) => {
    try {
      if (value != '') {
        let response = [];
        if (field === 'dni') {
          response = await getData(`clients/all?dni=${value}`);
        } else if (field === 'email') {
          response = await getData(`clients/all?email=${value}`);
        }
        console.log('response', response);
        if (response.length > 0) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            [field]: '',
          }));
          onHandleChangeCard(field, '');
          ToastNotify({
            message: `el ${field} esta registrado con el ID ${response[0].id}`,
            position: 'top-center',
            type: 'error',
            ref: ref,
          });
          if (ref && ref.current) {
            ref.current.focus(); // Mueve el cursor al campo correspondiente
          }
        } else if (field === 'email' && !validateEmail(value)) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            [field]: '',
          }));
          ToastNotify({
            message: `Ingrese un correo electrónico valido`,
            position: 'top-center',
            type: 'error',
            ref: ref,
          });
          if (ref && ref.current) {
            ref.current.focus(); // Mueve el cursor al campo correspondiente
          }
        }
      }
    } catch (error) {
      console.log('error en la consulta dni=> ', error);
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
  return (
    <form className=''>
      {loading && <Spinner />}
      <div className='rounded min-h-[calc(100vh-235px)]'>
        <div className='md:grid md:grid-cols-4 gap-2'>
          <div className='col-span-1'>
            <div className='col-span-1'>
              <div className='h-40 w-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex justify-center items-center '>
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
                      className='absolute -top-1 -right-4 cursor-pointer'
                      onClick={() => openImageModal(images.dniFront)}
                    >
                      <FaExpand size={20} />
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
                      className='absolute -top-1 -right-4 cursor-pointer'
                      onClick={() => openImageModal(images.dniBack)}
                    >
                      <FaExpand size={20} />
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
            <div className='col-span-1'>
              <label
                htmlFor='dni'
                className='block text-sm font-medium text-gray-700'
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
                htmlFor='first_name'
                className='block text-sm font-medium text-gray-700'
              >
                Nombres
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
                className='block text-sm font-medium text-gray-700'
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
                htmlFor='born_date'
                className='block text-sm font-medium text-gray-700'
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
                htmlFor='gender_id'
                className='block text-sm font-medium text-gray-700'
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
                {genders.length > 0 &&
                  genders.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className='col-span-1'>
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
                value={formData.email}
                onChange={handleChange}
                ref={emailRef}
                onBlur={() => validateField('email', formData.email, emailRef)}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
            <div className='col-span-1'>
              <label
                htmlFor='phone'
                className='block text-sm font-medium text-gray-700'
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
                  {countries.length > 0 &&
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
            <div className='col-span-1'>
              <label
                htmlFor='language_id'
                className='block text-sm font-medium text-gray-700'
              >
                Lenguaje
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
                htmlFor='asset'
                className='block text-sm font-medium text-gray-700'
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
                          <th className='border border-gray-300'>Nombre</th>
                          <th className='border border-gray-300'>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {codPosts.length > 0 &&
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
            </div>

            <div className='col-span-1'>
              <label
                htmlFor='cod_post_id'
                className='block text-sm font-medium text-gray-700 mt-2'
              >
                Codigo postal: {selectedCodPost.cod_post} <br />
                Nombre: {selectedCodPost.name}
                <br />
                Estado:{selectedCodPost.state}
              </label>
            </div>
            <div className='col-span-2'>
              <label
                htmlFor='address'
                className='block text-sm font-medium text-gray-700'
              >
                Dirección
              </label>
              <textarea
                id='address'
                name='address'
                rows='3'
                value={formData.address}
                onChange={handleChange}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      <div className='flex justify-end items-end'>
        <button
          type='button'
          className='bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={handleSubmit}
        >
          {onAction}
        </button>
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
