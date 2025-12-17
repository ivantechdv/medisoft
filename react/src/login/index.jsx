import React, { useState, useRef } from 'react'; // Añadimos useRef
import { AiOutlineTwitter } from 'react-icons/ai';
import { BiLogoFacebook } from 'react-icons/bi';
import logo from './../../public/logo2.png';
import backgroundImage from './../../public/background.jpeg';
import { postData } from './../api/index';
import Cookies from 'js-cookie';
import ToastNotify from '../components/toast/toast';
// 1. Importar el componente
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 2. Estado para el token del captcha
  const [captchaValue, setCaptchaValue] = useState(null);
  const recaptchaRef = useRef();
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Asignar la clave correspondiente
const recaptchaSiteKey = isLocalhost 
  ? "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Clave de prueba de Google para localhost
  : "6LdRnSIsAAAAAFf__BQZqgY0Pt6afF8knB94g7Yj"; // Tu clave de producción

  const handleLogin = async (e) => {
    e.preventDefault();

    // 3. Validar si el usuario marcó el captcha
    if (!captchaValue) {
      ToastNotify({
        message: "Por favor, verifica que no eres un robot",
        position: 'top-center',
        type: 'error',
      });
      return;
    }

    try {
      // 4. Enviamos el captchaValue al backend para que ellos lo validen con la Clave Secreta
      const response = await postData('users/login', { 
        email, 
        password,
        captchaToken: captchaValue // Enviarlo al backend
      });

      if (response.statusCode == 500) {
        ToastNotify({
          message: response.message,
          position: 'top-center',
          type: 'error',
        });
        // Opcional: Reiniciar captcha si el login falla
        recaptchaRef.current.reset();
        setCaptchaValue(null);
      } else {
        if (response.token) {
          Cookies.set('authToken', response.token, { expires: 1 });
          Cookies.set('user', JSON.stringify(response.user), { expires: 1 });
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Error login:', error.message);
    }
  };

  const onCaptchaChange = (value) => {
    setCaptchaValue(value);
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className='text-sm w-full px-4 py-2 border border-solid border-gray-300 rounded mt-4'
            type='password'
            placeholder='Contraseña'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* 5. Insertar el componente reCAPTCHA */}
          <div className='mt-4 flex justify-center'>
           <ReCAPTCHA
  ref={recaptchaRef}
  sitekey={recaptchaSiteKey}
  onChange={onCaptchaChange}
/>
          </div>

          <div className='mt-4 flex justify-between font-semibold text-sm'>
            <a className='text-blue-600 hover:text-blue-700 hover:underline' href='#'>
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