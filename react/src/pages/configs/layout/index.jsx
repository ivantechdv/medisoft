import { useState, useEffect } from 'react';
import { ChartBar } from '../../../components/Grafic/grafic';
import { show } from '../../../api';
import { RiUserStarLine } from 'react-icons/ri';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { VscOrganization } from "react-icons/vsc";
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import { FaRegCircleXmark } from 'react-icons/fa6';
import foto from '../../../img/user-bg.png';

const isDesktop = window.innerWidth > 768;

function ConfigsIndex() {
  const [Users, setUsers] = useState([]);

  const [UsersChart, setUsersCharts] = useState([]);
  const [UsersDepart, setUsersDepart] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectCompany, setSelectCompany] = useState({
    id: ' ',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Número de usuarios por página
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getUsers();
    getCompanys();
    //getListUsers();
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    getUsers();
  }, []);

  async function getCompanys() {
    const response = await show('companies/getCompanies');
    setCompanies(response);
  }

  async function getUsers() {
    const company_id = selectCompany.id;
    try {
      const response = await show('users/getChartAllUsers/' + company_id);
      const dataDepart = await show(
        'users/getChartAllUsersDepartment/' + company_id,
      );
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
      setUsersDepart({
        labels: dataDepart.chartData.namedepart,
        data: dataDepart.chartData.qtyDepart,
        qtydepart: dataDepart.chartData.qty,
      });
      getListUsers();
    } catch (error) {
      console.error('Error al obtener la lista de usuarios', error);
    }
  }

  async function getListUsers() {
    try {
      const response = await show(
        `users/getUsers?page=${currentPage}&pageSize=${pageSize}&email=${searchTerm}&company=${selectCompany.id}`,
      );
      let arreglo = [];
      const { data, meta } = response;
      data.map((data) => {
        if (data.statu === 'Activo') arreglo.push({ ...data, data });
      });
      setUsers(arreglo);
      setTotalPages(meta.totalPages);
      // setLoader(false);
    } catch (error) {
      console.error('Error al obtener la lista de usuarios', error);
      //setLoader(false);
    }
  }
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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
    await getUsers();
  };

  return (
    <div className='container row-span-2 mt-10 p-2'>
      <h1 className='md:text-2xl'>DashBoard de Colaboradores</h1>
      <div className='h-0.5 bg-gradient-to-r to-cyan-500 from-blue-500'></div>
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
          <h4 className='text-lg font-semibold mb-2'>Total Depart.</h4>
          <div className='flex items-center justify-center '>
            <div className='flex items-center justify-center bg-slate-600 text-white rounded-full w-16 h-16'>
              <VscOrganization size={18} />
              <span className='text-2xl ml-2 flex justify-center items-center'>
                {UsersDepart.qtydepart}
              </span>
            </div>
          </div>
        </div>
        <div className='md:col-span-1  sm:rounded-lg p-2 justify-center'>
          <h4 className='text-lg font-semibold mb-2'></h4>
          <div className='flex items-center justify-center '>
            <div className='flex items-center justify-center w-16 h-16'>
              {/* <RiUserUnfollowLine size={18} /> */}
              <span className='text-2xl ml-2 flex justify-center items-center'>
                {/*  {UsersChart ? UsersChart.Qactivos + UsersInactivo.inactivo : 0} */}
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
              {companies.map((company) => (
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
          <h1 className='md:text-1xl'>Colaboradores * Empresa</h1>
          <div className='h-0.5 w-auto bg-gradient-to-r to-cyan-500 from-blue-500'></div>
          <ChartBar
            labels={UsersChart.labels}
            data={UsersChart.data}
            background={UsersChart.background}
          />
        </div>
        <div className='md:col-span-3 shadow-md sm:rounded-lg p-2 justify-center h-80'>
          <h1 className='md:text-1xl'>Colaboradores * Departamento</h1>
          <div className='h-0.5 bg-gradient-to-r to-cyan-500 from-blue-500'></div>
          <ChartBar
            labels={UsersDepart.labels}
            data={UsersDepart.data}
            /* background={UsersInactivo.background} */
          />
        </div>
      </div>

      <div className='md:grid md:grid-cols-12 gap-5'>
        <div className='md:col-span-12 shadow-md sm:rounded-lg p-2 justify-center mt-4'>
          <h4 className='text-lg font-semibold mb-2'>Lista</h4>
          <input
            type='text'
            placeholder='Buscar por Nombre'
            value={searchTerm}
            onChange={handleSearchTermChange}
            className={`mt-1 p-1 ${
              isDesktop ? 'w-1/2' : 'w-full'
            } border rounded-md focus:outline-none focus:border-blue-500 transition duration-300 mt-2 ml-2`}
          />

          <div className='mb-4 overflow-x-auto  bg-gray-50 p-2 text-sm'>
            <table className='w-[98%] bg-white border border-gray-300 '>
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
                      {user.department.department
                        ? user.department.department
                        : '-'}
                    </td>
                    <td className='border border-gray-300 text-center'>
                      {user.position.position}
                    </td>
                    <td className='border border-gray-300  text-center'>
                      <p
                        className={
                          user.statu === 'Activo'
                            ? 'hover:text-white ml-4 text-xl text-lime-600 text-center'
                            : 'hover:text-white  ml-4 text-xl text-red-500 text-center'
                        }
                      >
                        {user.statu === 'Activo' ? (
                          <IoShieldCheckmarkOutline />
                        ) : (
                          <FaRegCircleXmark />
                        )}
                      </p>
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
}

export default ConfigsIndex;
