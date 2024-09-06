import React, { useState } from 'react'; // Importa useState
import { AiOutlineTwitter } from 'react-icons/ai';
import { BiLogoFacebook } from 'react-icons/bi';
import logo from './../../public/logo2.png';
import backgroundImage from './../../public/background.jpeg'; // Asegúrate de tener la ruta correcta a tu imagen
import { postData } from './../api/index';
import Cookies from 'js-cookie';
import ToastNotify from '../components/toast/toast';

const Login = () => {
  const [email, setEmail] = useState(''); // Mueve useState dentro del componente
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Llamada al backend para autenticar al usuario
      const response = await postData('users/login', { email, password });
      if (response.statusCode == 500) {
        ToastNotify({
          message: response.message,
          position: 'top-center',
          type: 'error',
        });
      } else {
        if (response.token) {
          // Guardar el token en una cookie
          Cookies.set('authToken', response.token, { expires: 1 });
          Cookies.set('user', JSON.stringify(response.user), { expires: 1 });
          // Redirigir al usuario a la página principal o a otra página
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Error login:', error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <section
        className='h-screen flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-16 items-center my-2 mx-5 md:mx-0 md:my-0'
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='md:w-1/3 max-w-sm'>
          <img src={logo} alt='SusSalut' />
        </div>
        <div className='md:w-1/3 max-w-sm bg-white p-5 rounded-lg shadow-lg'>
          <div className='my-5 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300'>
            <p className='mx-4 mb-0 text-center font-semibold text-slate-500'>
              Iniciar sesión
            </p>
          </div>
          <input
            className='text-sm w-full px-4 py-2 border border-solid border-gray-300 rounded'
            type='text'
            placeholder='Correo electrónico'
            name='email'
            id='email'
            value={email} // Establece el valor del input a partir del estado
            onChange={(e) => setEmail(e.target.value)} // Maneja el cambio de estado
          />
          <input
            className='text-sm w-full px-4 py-2 border border-solid border-gray-300 rounded mt-4'
            type='password'
            placeholder='Contraseña'
            name='password'
            id='password'
            value={password} // Establece el valor del input a partir del estado
            onChange={(e) => setPassword(e.target.value)} // Maneja el cambio de estado
          />
          <div className='mt-4 flex justify-between font-semibold text-sm'>
            <a
              className='text-blue-600 hover:text-blue-700 hover:underline hover:underline-offset-4'
              href='#'
            >
              Olvidé mi contraseña?
            </a>
          </div>
          <div className='text-center md:text-left'>
            <button
              className='mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white uppercase rounded text-xs tracking-wider'
              type='submit'
            >
              Entrar
            </button>
          </div>
        </div>
      </section>
    </form>
  );
};

export default Login;
