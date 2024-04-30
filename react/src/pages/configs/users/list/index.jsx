import './index.css';
import { show, putWithData } from '../../../../api';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { ChartBar } from '../../../../components/Grafic/grafic';
import ToastNotify from '../../../../components/toaster/toaster';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { BiSolidShow } from 'react-icons/bi';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import { FaRegCircleXmark } from 'react-icons/fa6';
import Stepper from '../../../../components/stepper/stepper';
import foto from '../../../../img/user-bg.png';
import { RiUserStarLine, RiUserUnfollowLine } from 'react-icons/ri';
import { LiaUsersCogSolid } from "react-icons/lia";

const isDesktop = window.innerWidth > 768;

function UserList() {
  const [Users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [UsersChart, setUsersCharts] = useState([]);
  const [UsersInactivo, setUsersInactivo] = useState([]);
  const [selectCompany, setSelectCompany] = useState({
    id: ' ',
  });
  const [companies, setCompanies] = useState([]);
  const [updateStatus, setUpdateStatus] = useState([]);
  const [loader, setLoader] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Número de usuarios por página
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getUsersChart();
    getCompanys();
  }, [currentPage, pageSize, searchTerm]);

  async function getUsers() {
    try {
      const response = await show(
        `users/getUsers?page=${currentPage}&pageSize=${pageSize}&email=${searchTerm}&company=${selectCompany.id}`,
      );

      const { data, meta } = response;
      setUsers(data);
      setOriginalUsers(data);
      setTotalPages(meta.totalPages);
      setLoader(false);
    } catch (error) {
      console.error('Error al obtener la lista de usuarios', error);
      setLoader(false);
    }
  }

  async function getUsersChart() {
    const company_id = selectCompany.id;
    try {
      const response = await show('users/getChartAllUsers/' + company_id);
      /*  const response = await show(
      `users/getUsers?page=${currentPage}&pageSize=${pageSize}&email=${searchTerm}`,
    ); */
      setUsersCharts({
        labels: response.chartData.ActivoCompany,
        data: response.chartData.ActivoQtyCompany,
        background: response.chartData.ActivobackgroundCompany,
        Qactivos: response.chartData.ActivoQtyCompany.reduce(
          (previousValue, currentValue) => previousValue + currentValue,
          0,
        ),
      });
      setUsersInactivo({
        labels: response.chartData.InactivoCompany,
        data: response.chartData.InactivoQtyCompany,
        background: response.chartData.InactivobackgroundCompany,
        inactivo: response.chartData.InactivoQtyCompany.reduce(
          (previousValue, currentValue) => previousValue + currentValue,
          0,
        ),
      });
      getUsers();
    } catch (error) {
      console.error('Error al obtener la lista de usuarios', error);
    }
  }

  async function getCompanys() {
    const response = await show('companies/getCompanies');
    setCompanies(response);
  }
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleUpdate = async (id, status) => {
    var nstatus;
    if (status === 'Activo') nstatus = 'Inactivo';
    else nstatus = 'Activo';
    setUpdateStatus({
      id: id,
      statu: nstatus,
    });
    let dataToSend = { ...updateStatus };
    let response = '';
    try {
      response = await putWithData(
        'Users/putUser/' + dataToSend.id,
        dataToSend,
      );
      ToastNotify({
        message: response.message,
        position: 'top-right',
      });
      getUsers();
    } catch (error) {
      ToastNotify({
        message: response.message,
        position: 'top-right',
      });
    }
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reiniciar a la primera página al cambiar el término de búsqueda
  };

  const renderPagination = () => {
    return (
      <div className='flex justify-center mt-4'>
        <button
          className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <HiChevronDoubleLeft />
        </button>
        <span className='mx-4'>{currentPage}</span>
        <button
          className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <HiChevronDoubleRight />
        </button>
      </div>
    );
  };

  const handleChange = async (e) => {
    if (e.target.value === 'Seleccione...') selectCompany.id = ' ';
    else selectCompany.id = e.target.value;
    await getUsersChart();
  };
  const renderTable = () => {
    return (
      <div className='container row-span-2 mt-10 p-2'>
        <div className='md:grid md:grid-cols-6 gap-5 mt-4'>
          <div className='md:col-span-1 shadow-md sm:rounded-lg p-2 justify-center'>
            <h4 className='text-lg font-semibold mb-2'>Total Activos</h4>
            <div className='flex items-center justify-center '>
              <div className='flex items-center justify-center bg-teal-800 text-white rounded-full w-16 h-16'>
                <RiUserStarLine size={18} />
                <span className='text-2xl ml-2 flex justify-center items-center'>
                  {UsersChart.Qactivos}
                </span>
              </div>
            </div>
          </div>
          <div className='md:col-span-1 shadow-md sm:rounded-lg p-2 justify-center'>
            <h4 className='text-lg font-semibold mb-2'>Total Inactivos</h4>
            <div className='flex items-center justify-center '>
              <div className='flex items-center justify-center bg-slate-600 text-white rounded-full w-16 h-16'>
                <RiUserUnfollowLine size={18} />
                <span className='text-2xl ml-2 flex justify-center items-center'>
                  {UsersInactivo.inactivo}
                </span>
              </div>
            </div>
          </div>
          <div className='md:col-span-1 shadow-md sm:rounded-lg p-2 justify-center'>
            <h4 className='text-lg font-semibold mb-2'>Total</h4>
            <div className='flex items-center justify-center '>
              <div className='flex items-center justify-center bg-sky-950 text-white rounded-full w-16 h-16'>
                <LiaUsersCogSolid size={24}/>
                <span className='text-2xl ml-2 flex justify-center items-center'>
                  {UsersChart
                    ? UsersChart.Qactivos + UsersInactivo.inactivo
                    : 0}
                </span>
              </div>
            </div>
          </div>
          <div className='md:col-span-2 shadow-md sm:rounded-lg p-2 justify-center'>
            <h4 className='text-lg font-semibold mb-2'>Seleccione Empresa</h4>
            <div className='flex items-center justify-center'>
              <select
                id='company_id'
                name='company_id'
                className='mt-1 p-1 w-full border rounded-md'
                onChange={handleChange}
                //value={selectCompany}
              >
                <option>Seleccione...</option>
                {companies.length > 0 &&
                  companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.company}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
        <div className='md:grid md:grid-cols-6 gap-5'>
          <div className='md:col-span-3 shadow-md sm:rounded-lg p-2 justify-center h-80 mb-4'>
            <h1 className='md:text-1xl'>Colaboradores Activos</h1>
            <div className='h-0.5 bg-gradient-to-r to-cyan-500 from-blue-500'></div>
            <ChartBar
              labels={UsersChart.labels}
              data={UsersChart.data}
              background={UsersChart.background}
            />
          </div>
          <div className='md:col-span-3 shadow-md sm:rounded-lg p-2 justify-center h-80'>
            <h1 className='md:text-1xl'>Colaboradores Inactivos</h1>
            <div className='h-0.5 bg-gradient-to-r to-cyan-500 from-blue-500'></div>
            <ChartBar
              labels={UsersInactivo.labels}
              data={UsersInactivo.data}
              background={UsersInactivo.background}
            />
          </div>
        </div>
        <div className='md:w-full text-sm mt-4'>
          <div className='overflow-x-auto md:w-[100%] shadow-md sm:rounded-lg'>
            <Stepper
              currentStep={1}
              totalSteps={1}
              stepTexts={['Lista de Colaboradores']}
            />
            <div>
              <input
                type='text'
                placeholder='Buscar por Nombre'
                value={searchTerm}
                onChange={handleSearchTermChange}
                className={`mt-1 p-1 ${
                  isDesktop ? 'w-1/2' : 'w-full'
                } border rounded-md focus:outline-none focus:border-blue-500 transition duration-300 mt-2 ml-2`}
              />
            </div>

            <div className='mb-4 overflow-x-auto  bg-gray-50 p-2 text-sm'>
              <table className='w-full bg-white border border-gray-300 '>
                <thead>
                  <tr className='bg-gray-800 text-gray-100'>
                    <th className='border border-gray-300 p-2'>ID</th>
                    <th className='border border-gray-300 p-2'>FOTO</th>
                    <th className='border border-gray-300 p-2'>
                      Nombre Completo
                    </th>
                    <th className='border border-gray-300 p-2'>Email</th>
                    <th className='border border-gray-300 p-2'>Empresa</th>
                    <th className='border border-gray-300 p-2'>Departamento</th>
                    <th className='border border-gray-300 p-2'>Cargo</th>
                    <th className='border border-gray-300 p-2'>Estado</th>
                    <th className='border border-gray-300 p-2'>Acción</th>
                    {/* Agrega más columnas según las propiedades de tus usuarios */}
                  </tr>
                </thead>
                <tbody>
                  {Users.map((user) => (
                    <tr
                      key={user.id}
                      className='bg-white hover:bg-slate-500 hover:text-white dark:hover:bg-gray-600 text-sm'
                    >
                      <td className='border border-gray-300  text-center'>
                        {user.id}
                      </td>
                      <td className='border border-gray-300 text-center'>
                        <img
                          className='ml-4 h-8 w-8 rounded-full '
                          src={user.image ? user.image : foto}
                          alt=''
                        />
                      </td>
                      <td className='border border-gray-300 text-center'>
                        {user.first_name} {user.last_name}{' '}
                      </td>
                      <td className='border border-gray-300 text-center'>
                        {user.email}
                      </td>
                      <td className='border border-gray-300 text-center'>
                        {user.company.acronym}
                      </td>
                      <td className='border border-gray-300 text-center'>
                        { user.department.department ? user.department.department : '-' }
                      </td>
                      <td className='border border-gray-300 text-center'>
                        {user.position.position}
                      </td>
                      <td className='border border-gray-300  text-center'>
                        <button
                          type='button'
                          className={
                            user.statu === 'Activo'
                              ? 'hover:text-white ml-4 text-xl text-lime-600 text-center'
                              : 'hover:text-white  ml-4 text-xl text-red-500 text-center'
                          }
                          onClick={() => handleUpdate(user.id, user.statu)}
                        >
                          {user.statu === 'Activo' ? (
                            <IoShieldCheckmarkOutline />
                          ) : (
                            <FaRegCircleXmark />
                          )}
                        </button>
                      </td>
                      <td className='border border-gray-300 p-2 flex-center'>
                        <Link to={`/configs/users/${user.id}`}>
                          <button
                            type='button'
                            className='hover:text-white text-black  text-lg'
                          >
                            <BiSolidShow />
                          </button>
                        </Link>
                      </td>
                      {/* Agrega más celdas según las propiedades de tus usuarios */}
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {loader ? (
        <div className='text-center'>
          <div className='loader mx-auto'></div>
        </div>
      ) : (
        renderTable()
      )}
    </>
  );
}

export default UserList;
