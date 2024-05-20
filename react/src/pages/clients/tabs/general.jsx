import React, { useState, useEffect } from 'react';
import {
  getData,
  postData,
  putData,
  postStorage,
  getStorage,
} from '../../../api';
import { useNavigate } from 'react-router-dom';

const Form = ({ onHandleChangeCard, id, onAction, onFormData }) => {
  const [formData, setFormData] = useState({
    dni: '',
    name: '',
    phone: '',
    email: '',
    born_date: '',
    cod_post_id: 0,
    address: '',
    photo: '',
  });
  const [photo, setPhoto] = useState('');
  const [codPosts, setCodPosts] = useState([]);
  const navigateTo = useNavigate();

  useEffect(() => {
    console.log('onFormData', onFormData);
    if (onFormData) {
      setFormData(onFormData);
      setPhoto(getStorage(onFormData.photo));
    }
  }, [onFormData]);
  useEffect(() => {
    const fetchSelect = async () => {
      const codposts = await getData('cod_posts/all');
      setCodPosts(codposts);
    };

    fetchSelect();
  }, []);

  const handleChange = (event) => {
    const { id, value } = event.target;

    if (id === 'name' || id === 'dni') {
      onHandleChangeCard(id, value);
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = { ...formData };

      let response = false;

      if (formData.photo != '') {
        response = await postStorage(formData.photo, 'client');
        if (response) {
          console.log(response);
          dataToSend.photo = response.path;
        }
      }
      if (!id) {
        response = await postData('clients', dataToSend);
      } else {
        response = await putData('clients/' + id, dataToSend);
      }

      if (response) {
        navigateTo('/client/' + response.id);
      }
    } catch (error) {
      console.log('error', error);
    }
  };
  const handleImagenChange = (event, key) => {
    const file = event.target.files[0];
    console.log(file);
    setPhoto(URL.createObjectURL(file));

    onHandleChangeCard(key, URL.createObjectURL(file));

    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: file,
    }));
  };
  return (
    <form className=''>
      <div className='rounded min-h-[calc(100vh-235px)]'>
        <div className='md:grid md:grid-cols-4 gap-2'>
          <div className='col-span-1'>
            <div className='col-span-1'>
              <div className='h-40 w-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex justify-center items-center'>
                {photo ? (
                  <>
                    <label htmlFor='photo' className='cursor-pointer'>
                      <img
                        src={photo}
                        alt='foto carnet'
                        className='h-full  w-full rounded-lg'
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
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
            <div className='col-span-1'>
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
                value={formData.name}
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
              <input
                type='text'
                id='phone'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>

            <div className='col-span-1'>
              <label
                htmlFor='cod_post_id'
                className='block text-sm font-medium text-gray-700'
              >
                Codigo postal
              </label>
              <select
                name='cod_post_id'
                id='cod_post_id'
                onChange={handleChange}
                value={formData.cod_post_id}
                className='w-full px-3 mt-1 p-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              >
                <option>Seleccione</option>
                {codPosts.length > 0 &&
                  codPosts.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.code}
                    </option>
                  ))}
              </select>
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
    </form>
  );
};

export default Form;
