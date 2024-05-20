import React, { useState, useEffect } from 'react';
import { postData } from './../../api/index';
const Login = () => {
  const initialValues = {
    email: '',
    password: '',
  };
  const [credentials, setCredentials] = useState(initialValues);
  const handleChange = (event) => {
    const { id, value, type, checked } = event.target;
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [id]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await postData('auth/login', credentials);
    console.log(response);
  };
  return (
    <div className='flex justify-center items-center h-screen bg-white bg-opacity-50'>
      <div className='bg-white p-8 rounded-lg shadow-lg'>
        <h2 className='text-2xl font-semibold mb-4'>Inicio de sesión</h2>
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <label htmlFor='email' className='block text-gray-600'>
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              className='w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:border-blue-500 text-gray-600'
              onChange={handleChange}
              value={credentials.email}
            />
          </div>
          <div>
            <label htmlFor='password' className='block text-gray-600'>
              Contraseña
            </label>
            <input
              type='password'
              id='password'
              name='password'
              className='w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:border-blue-500 text-gray-600'
              onChange={handleChange}
              value={credentials.password}
            />
          </div>
          <div>
            <button
              type='submit'
              className='w-full bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600'
            >
              Aceptar
            </button>
          </div>
          <div className='text-center'>
            <a href='#' className='text-blue-500 hover:underline'>
              Olvidé mi contraseña
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
