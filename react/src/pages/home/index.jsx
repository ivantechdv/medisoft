import { Link } from 'react-router-dom';
import { select, show } from '../../api';
import { useEffect } from 'react';
import { BiLike, BiDislike } from 'react-icons/bi';
import { FaRegComment } from 'react-icons/fa';
import imagen1 from '../../img/AlertaEpidemiologica.webp'; 
import imagen2 from '../../img/Icono Info-tips-11.webp';
import imagen3 from '../../img/Infografía sobre hipertensión arterial.webp';

function Home() {
  // useEffect( () => {
  //   async function getUsers () {
  //     const response = await show('users/getUsers')
  //     console.log('response => ', response)
  //   }
  //   getUsers()
  // }, []);

  return (
    <div className=' container p-2 row-span-2 mt-10'>
      <div className='md:grid md:grid-cols-3 gap-3'>
        <div className='md:col-span-2 shadow-md sm:rounded-lg p-2 justify-center'>
          <div className='md:grid md:grid-cols-3'>
            <div className='overflow-hidden shadow-lg transition duration-500 ease-in-out transform hover:-translate-y-5 hover:shadow-2xl rounded-lg h-85 w-70 md:w-70 cursor-pointer m-auto ml-2'>
              <a href='#' className='w-full block h-full'>
                <img
                  alt='blog photo'
                  src={imagen1}
                  className='max-h-40 w-full object-cover'
                />
                <div className='bg-white w-full p-4'>
                  <p className='text-2xl font-medium text-slate-800'>
                    Alerta Epidemiológica SARS-COV2 y Otros Virus Respiratorios.
                  </p>
                  <div className='flex flex-wrap justify-starts items-center py-3 border-b-2 text-sm font-semibold'>
                    <span className='m-1 px-2 py-1 rounded'>
                      <BiLike />
                    </span>
                    <span className='m-1 px-2 py-1 rounded'>
                      <BiDislike />
                    </span>
                    <span className='m-1 px-2 py-1 rounded'>
                      <FaRegComment />
                    </span>
                  </div>
                </div>
              </a>
            </div>

            <div className='overflow-hidden shadow-lg transition duration-500 ease-in-out transform hover:-translate-y-5 hover:shadow-2xl rounded-lg h-85 w-70 md:w-70 cursor-pointer m-auto ml-2'>
              <a href='#' className='w-full block h-full'>
                <img
                  alt='blog photo'
                  src={imagen2}
                  className='max-h-40 w-full object-cover'
                />
                <div className='bg-white w-full p-4'>
                  <p className='text-2xl font-medium text-slate-800'>
                    Educación Ambiental Proceso Dinámico y Participativo Creando Conciencia  
                  </p>
                  <div className='flex flex-wrap justify-starts items-center py-3 border-b-2 text-sm font-semibold'>
                    <span className='m-1 px-2 py-1 rounded'>
                      <BiLike />
                    </span>
                    <span className='m-1 px-2 py-1 rounded'>
                      <BiDislike />
                    </span>
                    <span className='m-1 px-2 py-1 rounded'>
                      <FaRegComment />
                    </span>
                  </div>
                </div>
              </a>
            </div>

            <div className='overflow-hidden shadow-lg transition duration-500 ease-in-out transform hover:-translate-y-5 hover:shadow-2xl rounded-lg h-85 w-70 md:w-70 cursor-pointer m-auto ml-2'>
              <a href='#' className='w-full block h-full'>
                <img
                  alt='blog photo'
                  src={imagen3}
                  className='max-h-40 w-full object-cover'
                />
                <div className='bg-white w-full p-4'>
                  <p className='text-2xl font-medium text-slate-800'>
                    Hipertensión cuando la presión de la sangre es demasiado alta
                  </p>
                  <div className='flex flex-wrap justify-starts items-center py-3 border-b-2 text-sm font-semibold'>
                    <span className='m-1 px-2 py-1 rounded'>
                      <BiLike />
                    </span>
                    <span className='m-1 px-2 py-1 rounded'>
                      <BiDislike />
                    </span>
                    <span className='m-1 px-2 py-1 rounded'>
                      <FaRegComment />
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div className='md:col-span-1 shadow-md sm:rounded-lg p-2 '>
          <div className=' bg-gray-200 text-center'>
            Estadística Corporativa
          </div>
          <div className='p-2'>
            <span className='mr-2 text-0'>Dias Sin Accidentes</span>
            --
          </div>
          <div className='p-2'>
            <span className='mr-2 text-0'>Incidentes HS</span>
            --
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
