import { useEffect, useState } from 'react';
import { show } from '../../../api/index';
import dayjs from 'dayjs';

import {
  MdNumbers,
  MdOutlineEmail,
  MdOutlinePhonelinkRing,
  MdPhonelinkSetup,
} from 'react-icons/md';
import { IoBusinessOutline } from 'react-icons/io5';
import { FaRegAddressCard } from 'react-icons/fa';
import foto from '../../../img/user-bg.png';

function contact() {
  const [Users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [showme, setShowme] = useState(true);
  const [idUser, setIdUser] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  async function getUsers() {
    try {
      const response = await show(`users/getAllUsers`);
      const { data } = response;
      //setUsers(data);
      setOriginalUsers(data);
    } catch (error) {
      console.error('Error al obtener la lista de usuarios', error);
    }
  }

  const handleChange = (e) => {
    setSearchUser(e.target.value);
    if (e.target.value) setShowme(true);
    else if (!e.target.value) setShowme(false);
    let arreglo = [];
    arreglo = originalUsers.filter((data) =>
      data.first_name
        .toUpperCase()
        .includes(e.target.value.trim().toUpperCase()),
    );
    if (arreglo.length > 0) setUsers(arreglo);
  };

  const showResult = () => {
    if (Users.length && showme === true) {
      return (
        <div className='overflow-x-auto md:w-[50%] shadow-md sm:rounded-lg h-48 p-2'>
          <table className='md:w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mt-4'>
            <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'></thead>
            <tbody>
              {Users.map((data) => (
                <tr
                  key={data.id}
                  className='text-xs border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-slate-500 hover:text-white dark:hover:bg-gray-600'
                >
                  <td className=''>
                    {data.first_name} {data.last_name}
                  </td>
                  <td className=''>{data.email}</td>
                  <td>
                    <button
                      className='bottom-1'
                      onClick={() => showUser(data.id)}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={1.5}
                        stroke='currentColor'
                        className='w-4 h-4 hover:text-blue-800'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z'
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  const showUser = (id) => {
    setSearchUser(' ');
    setShowme(false);
    let arreglo = [];
    arreglo = originalUsers.filter((data) => data.id === id);
    if (arreglo.length > 0) setIdUser(arreglo);
  };

  return (
    <div className='ml-2 mr-2'>
      <div className='container mt-10 p-2'>
        <h1 className='md:text-1xl'>Busqueda de Colaboradores</h1>
        <div className='mt-2'>
          <input
            type='text'
            onChange={handleChange}
            value={searchUser}
            placeholder='Ingrese Nombre Colaborador'
            className='md:p-mt-1 block md:w-[40%] px-3 py-2 border rounded  bg-gray-200  text-sm shadow-sm placeholder-slate-40'
          />
        </div>
        <div className='h-0.5 bg-gradient-to-r to-cyan-500 from-blue-500'></div>
        {showResult()}
        <div hidden={showme ? true : false}>
          {idUser.map((data) => (
            <div className='container p-2 row-span-2 top-4' key={data.id}>
              <div className='md:grid md:grid-cols-3 gap-5'>
                <div className='md:col-span-2 shadow-md sm:rounded-lg p-2'>
                  <div className='rounded-full flex-1'>
                    <img
                      className='ml-10 h-24 w-24 rounded-full border-b-4 border-t-2 border-x-2 border-slate-500 justify-center'
                      src={data.image ? data.image : foto}
                      alt=''
                    />
                  </div>
                  <div className='flex-initial '>
                    <span className='md:ml-20 text-stone-950 text-2xl'>
                      {data.first_name}
                    </span>
                    <span className='ml-1  text-stone-950 text-2xl'>
                      {data.last_name}
                    </span>
                  </div>
                </div>
                <div className='md:col-span-1 shadow-md sm:rounded-lg p-2 '>
                  <div className=' bg-gray-200 text-center'>
                    Información Aplicación
                  </div>
                  <div className='p-2'>
                    <span className='mr-2 text-0'>Estado</span>
                    <span className=' text-blue-800 font-bold'>
                      {data.statu}
                    </span>
                  </div>
                  <div className='p-2'>
                    <span className='mr-2 text-0'>Perfil Creado:</span>
                    {dayjs(data.createdAt).format('DD/MM/YYYY')}
                  </div>
                </div>
                <div className='md:col-span-1 shadow-md sm:rounded-lg p-2 '>
                  <div className=' bg-gray-200 text-center'>
                    Información General
                  </div>
                  <div className='md:p-2 flex flex-row has-tooltip'>
                    <span className='text-xl'>
                      <MdNumbers />
                    </span>
                    <span className='ml-2 text-0'>{data.id}</span>
                  </div>
                  <div className='p-2 flex flex-row'>
                    <span className='text-xl'>
                      <MdOutlineEmail />
                    </span>
                    <span className='ml-2 text-0'>{data.email}</span>
                  </div>
                  <div className='p-2 flex flex-row'>
                    <span className='text-xl'>
                      <MdOutlinePhonelinkRing />
                    </span>
                    <span className='ml-2 text-0'>{data.phone_number}</span>
                  </div>
                  <div className='p-2 flex flex-row'>
                    <span className='text-xl'>
                      <MdPhonelinkSetup />
                    </span>
                    <span className='ml-2 text-0'>
                      {data.other_phone_number}
                    </span>
                  </div>
                </div>
                <div className='md:col-span-1 shadow-md sm:rounded-lg p-2'>
                  <div className=' bg-gray-200 text-center'>
                    Datos Corporativos
                  </div>
                  <div className='p-2 flex flex-row'>
                    <span className='text-0 font-bold'>Empresa:</span>
                    <span className='ml-2 text-0'>{data.company.acronym}</span>
                  </div>
                  <div className='p-2 flex flex-row'>
                    <span className='text-0 font-bold'>Departamento:</span>
                    <span className='ml-2 text-0'>
                      {data.department.department}
                    </span>
                  </div>
                  <div className='p-2 flex flex-row'>
                    <span className='text-0 font-bold'>Cargo:</span>
                    <span className='ml-2 text-0'>
                      {data.position.position}
                    </span>
                  </div>
                  <div className='p-2 flex flex-row'>
                    <span className='text-0 font-bold'>
                      Supervisor Directo:
                    </span>
                    <span className='ml-2 md:mr-2 md:text-0'>
                      {data.manager.first_name} {data.manager.last_name}
                    </span>
                  </div>
                  <div className='p-2 flex flex-row'>
                    <span className='text-0 font-bold'>
                      Supervisor Funcional
                    </span>
                    <span className='ml-2 text-0'>
                      {data.functional.first_name} {data.functional.last_name}
                    </span>
                  </div>
                </div>
                <div className='md:col-span-1 shadow-md md:rounded-lg p-2'>
                  <div className=' bg-gray-200 text-center'>Localización</div>
                  <div className='p-2 flex flex-row'>
                    <span className='text-xl'>
                      <IoBusinessOutline />
                    </span>
                    <span className='ml-2 text-0'>
                      {data.facility.code}-{data.facility.name}
                    </span>
                  </div>
                  <div className='p-2 flex flex-row'>
                    <span className='text-xl'>
                      <FaRegAddressCard />
                    </span>
                    <span className='ml-2 text-0'>{data.address}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default contact;
