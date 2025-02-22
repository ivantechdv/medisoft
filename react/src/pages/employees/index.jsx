import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { getData, postData, putData } from '../../api';
import { FaFilter, FaPlusCircle, FaMinusCircle } from 'react-icons/fa';
import Spinner from '../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import Breadcrumbs from '../../components/Breadcrumbs';
import Modal from './modal';
import { useNavigate } from 'react-router-dom';
import Filter from './filter';
const Clients = () => {
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [title, setTitle] = useState('');
  const id = useRef('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null); //seleccion del registro unico
  const [tableTopPosition, setTableTopPosition] = useState(0);
  const [photo, setPhoto] = useState('');
  const [selectedRows, setSelectedRows] = useState([]); //los checkbox
  const [isLoading, setIsLoading] = useState(true);
  const [isFilter, setIsFilter] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const [dictionaries, setDictionaries] = useState({
    patologies: {},
    tasks: {},
    experiences: {},
    services: {},
  });
  const [selectedData, setSelectedData] = useState({
    patologies: [],
    tasks: [],
    experiences: [],
    services: [],
  });

  const [servicesActive, setServicesActive] = useState([]);
  const [preselections, setPreselections] = useState([]);
  const navigateTo = useNavigate();

  useEffect(() => {
    const table = document.querySelector('.table-container'); // Clase de contenedor de la tabla
    if (table) {
      const rect = table.getBoundingClientRect();
      setTableTopPosition(rect.top);
    }
  }, []);

  useEffect(() => {
    const fetchSelect = async () => {
      try {
        const order = 'name-asc';

        const patologies = await getData(`patologies/all?order=${order}`);
        const tasks = await getData(`employees/task/all?order=${order}`);
        const experiences = await getData(
          `employees/gain-experience/all?order=${order}`,
        );
        const services = await getData(`services/all?order=${order}`);

        // Crear diccionarios
        setDictionaries({
          patologies: mapToDictionary(patologies),
          tasks: mapToDictionary(tasks),
          experiences: mapToDictionary(experiences),
          services: mapToDictionary(services),
        });
      } catch (error) {
        console.log('ERRR', error);
      } finally {
      }
    };
    fetchSelect();
  }, []);

  // Convierte array en diccionario
  const mapToDictionary = (array) => {
    return array.reduce((acc, item) => {
      acc[item.id] = item.name;
      return acc;
    }, {});
  };

  // Convierte IDs en nombres
  const mapIdsToNames = (idsString, dictionary) => {
    console.log('idstring', idsString);
    console.log('dictionary', dictionary);
    if (!idsString) return [];
    const ids = idsString.replace(/^\s+|\s+$/gm, '').split(',');
    console.log('ids', ids);
    return ids.map((id) => dictionary[id] || '');
  };

  const getRows = async () => {
    try {
      if (!searchTerm) {
        setIsLoading(true);
      }
      let response;
      if (pageSize == 0) {
        response = await getData(
          `employees?is_deleted=0&searchTerm=${searchTerm}`,
        );
      } else {
        response = await getData(
          `employees?page=${currentPage}&pageSize=${pageSize}&is_deleted=0&searchTerm=${searchTerm}`,
        );
      }
      console.log(response);
      const { data, meta } = response;

      setRows(data);
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error('Error ', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      getRows();
    } catch (error) {
      console.log('error =>', error);
    } finally {
    }
  }, [currentPage, pageSize, searchTerm]);

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reiniciar a la primera página al cambiar el término de búsqueda
  };

  const handleChange = (event) => {
    const { id, value, type, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };
  const handleSubmit = async () => {
    const dataToSend = { ...formData };
    try {
      let response = '';
      let bandera = false;

      if (id.current == 0) {
        bandera = await verifyPermisology(
          'can_create_category',
          user,
          'No tiene permiso de crear categoría',
        );
        if (!bandera) {
          return;
        }
        response = await postData('assets/category', dataToSend);
      } else {
        bandera = await verifyPermisology(
          'can_update_category',
          user,
          'No tiene permiso de actualizar categoría',
        );
        if (!bandera) {
          return;
        }
        response = await putData('assets/category/' + id.current, dataToSend);
      }
      getRows();
      closeModal();
    } catch (error) {
      console.error('Error a registrar:', error);
    }
  };

  const renderPagination = () => {
    return (
      <div className='flex justify-center mt-4'>
        <button
          className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <HiChevronDoubleLeft />
        </button>
        <span className='mx-4'>{currentPage}</span>
        <button
          className='bg-gray-800 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <HiChevronDoubleRight />
        </button>
      </div>
    );
  };
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowClick = async (row, event) => {
    console.log('row', row);
    setSelectedRow(row);
    setSelectedRowId(rowData.id);
    const preselection = await getData(
      `client-service-preselection/all?employee_id=${row.id}&status=Pendiente`,
    );
    const filteredPreselection = preselection.filter((item) => {
      const isStatusValid = item.clients_service?.statu == 1;
      const isEmployeeValid =
        !item.clients_service?.employee || item.clients_service?.employee === 0;

      // Devuelve el resultado de las condiciones
      return isStatusValid && isEmployeeValid;
    });

    setPreselections(filteredPreselection);

    const queryParameters = new URLSearchParams();
    queryParameters.append('statu', 1);
    const order = 'service_alta-desc';
    const servicesActive = await getData(
      `client-service/all?employee_id=${row.id}&${queryParameters}&order=${order}`,
    );
    if (servicesActive) {
      console.log('services', servicesActive);
      setServicesActive(servicesActive);
    } else {
      setServicesActive([]);
    }

    const { patologies, tasks, experiences, services } = dictionaries;

    const selectedPatologies = mapIdsToNames(
      row?.employee_specific?.patologies || '',
      patologies,
    );
    const selectedTasks = mapIdsToNames(
      row?.employee_specific?.tasks || '',
      tasks,
    );
    const selectedExperiences = mapIdsToNames(
      row?.employee_specific?.experiences || '',
      experiences,
    );

    const selectedServices = mapIdsToNames(
      row?.employee_specific?.services || '',
      services,
    );
    console.log('selectedservices', selectedServices);
    // Actualiza los datos seleccionados
    setSelectedData({
      patologies: selectedPatologies,
      tasks: selectedTasks,
      experiences: selectedExperiences,
      services: selectedServices,
    });
  };

  const handleClosePanel = () => {
    setSelectedRow(false);
  };
  const handleViewClient = (clientId) => {
    navigateTo(`/employee/${clientId}`);
  };

  const handleFormEmployee = () => {
    navigateTo('/employee');
  };

  const handleSelectRow = (rowId) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(rowId)) {
        return prevSelectedRows.filter((id) => id !== rowId);
      } else {
        return [...prevSelectedRows, rowId];
      }
    });
  };
  const handlePageSizeChange = (event) => {
    if (event.target.value == 'todos') {
      setPageSize(0);
    } else {
      setPageSize(Number(event.target.value)); // Actualiza el tamaño de la página
    }
    setCurrentPage(1); // Reinicia a la primera página
  };
  const handleFilter = () => {
    setIsFilter(!isFilter);
  };

  const [filters, setFilters] = useState([
    { field: '', condition: '', value: '', logic: 'AND', logicShow: 'AND' },
  ]);
  const [applyFilters, setApplyFilters] = useState('');

  const eraseFilter = () => {
    setIsFilter(!isFilter);
    setFilters([
      { field: '', condition: '', value: '', logic: 'AND', logicShow: 'AND' },
    ]);
    getRows();
  };

  // Construcción de parámetros de consulta
  const applyFilter = (rowsFilter) => {
    setRows(rowsFilter);
    setPageSize(10); // Actualiza el tamaño de la página
    setCurrentPage(1); // Reinicia a la primera página
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleDelete = async () => {
    try {
      const result = await sweetAlert.showSweetAlert();
      const isConfirmed = result !== null && result;

      if (!isConfirmed) {
        ToastNotify({
          message: 'Acción cancelada por el usuario',
          position: 'top-right',
        });
        return;
      }

      for (const row of selectedRows) {
        const id = row; // Asumiendo que cada fila tiene una propiedad 'id'
        const dataToSend = {
          is_deleted: 1,
        };

        try {
          await putData(`clients/${id}`, dataToSend);
          // Manejar la respuesta según sea necesario
        } catch (error) {
          console.error(`Error al actualizar el cliente con ID ${id}:`, error);
          // Manejar el error según sea necesario
        }
      }

      getRows();
      ToastNotify({
        message: 'clientes eliminados correctamente.',
        position: 'top-left',
        type: 'success',
      });
    } catch (error) {
      console.error('Error al eliminar:', error);
      // Maneja el error según sea necesario
    }
  };
  return (
    <div className='max-w-full mx-auto'>
      <Breadcrumbs
        items={[
          { label: 'Inicio', route: '/' },
          { label: 'Cuidadores', route: '/employees' },
        ]}
      />
      <div className='max-w-full mx-auto bg-content shadow-md overflow-hidden sm:rounded-lg border-t-2 border-gray-400 grid  grid-cols-10 gap-2'>
        <div
          className={`h-[calc(100vh-85px)] ${
            selectedRow ? 'col-span-8' : 'col-span-10'
          } overflow-auto`}
        >
          <div className='flex justify-between px-4 py-5 sm:px-6'>
            <div>
              <h3 className='text-lg font-semibold leading-6 text-gray-900'>
                Lista de Cuidadores
              </h3>
              <p className='mt-1 max-w-2xl text-sm text-gray-500'>
                Gestion de cuidadores.
              </p>
            </div>
            <div className='flex space-x-2'>
              <div className='relative'>
                <input
                  type='text'
                  className='w-[250px] border border-gray-600 h-8 px-2 rounded text-xs pr-7' // Añadido pr-7 para padding derecho
                  placeholder='Campo de busqueda'
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                />
                {searchTerm && (
                  <button
                    type='button'
                    className='absolute right-2  translate-y-1/2 text-gray-500 hover:text-gray-700'
                    onClick={() => setSearchTerm('')}
                    aria-label='Limpiar busqueda'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4'
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
                )}
              </div>
              <select
                className='border border-gray-600 rounded h-8 px-2'
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={0}>Todos</option>
              </select>
              <button
                className='bg-primary text-lg text-textWhite font-bold py-2 px-2 rounded h-8'
                onClick={handleFormEmployee}
              >
                <FaPlusCircle className='text-lg' />
              </button>
              <button
                className={`bg-red-500 hover:bg-red-700 text-sm text-white font-bold py-2 px-2 rounded h-8 ${
                  selectedRows.length === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                disabled={selectedRows.length === 0}
              >
                <FaMinusCircle className='text-lg' />
              </button>
              <button
                className='bg-secondary text-lg text-textWhite font-bold py-2 px-2 rounded h-8'
                onClick={handleFilter}
              >
                <FaFilter className='text-lg' />
              </button>
            </div>
          </div>
          <div className='border-t border-gray-200 overflow-x-auto table-responsive'>
            <table className='w-full divide-y divide-tableHeader mb-4 table-container2 text-xs'>
              <thead className='bg-tableHeader'>
                <tr>
                  <th></th>
                  <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                    ID
                  </th>
                  <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                    DNI
                  </th>
                  <th className='px-2 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                    Nombre completo
                  </th>
                  <th className='px-2 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                    Correo electrónico
                  </th>
                  <th className='px-2 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                    Teléfono
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 &&
                  rows.map((row) => (
                    <tr
                      onMouseEnter={(e) => {
                        if (row.id !== selectedRowId) {
                          e.currentTarget.style.backgroundColor = '#F3F4F6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (row.id !== selectedRowId) {
                          e.currentTarget.style.backgroundColor = 'inherit';
                        }
                      }}
                      onClick={(e) => handleRowClick(row, e)}
                      onDoubleClick={() => handleViewClient(row.id)}
                      style={{
                        cursor: 'pointer',
                        borderBottom: '1px solid #ccc', // Define el borde inferior aquí
                        backgroundColor:
                          row.id === selectedRowId ? '#dee0e2' : 'inherit',
                      }}
                    >
                      <td
                        className='text-center py-1'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type='checkbox'
                          id='selectrow'
                          name='selectrow'
                          checked={selectedRows.includes(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                        />
                      </td>
                      <td className='px-3'>
                        <label className='text-primary'>{row.id}</label>
                      </td>
                      <td className='px-3'>
                        <label className='text-primary'>{row.dni}</label>
                      </td>
                      <td className='max-w-xs truncate px-2'>
                        {row.full_name}
                      </td>
                      <td className='max-w-xs truncate px-2'>{row.email}</td>
                      <td className='max-w-xs truncate px-2'>
                        {row.code_phone + ' ' + row.phone}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {renderPagination()}
          </div>
        </div>

        {/* Modal */}
        {selectedRow && (
          <div className='col-span-2 bg-panel border-2 border-gray-300 shadow-lg h-[calc(100vh-85px)] overflow-auto'>
            <div className='bg-primary  p-2 flex justify-between'>
              <label className='text-white pt-2 '>
                {selectedRow.full_name}
              </label>
              <button
                className='right-0 text-white hover:text-gray-700'
                onClick={handleClosePanel}
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
            </div>

            <div className='border-2 border-white w-full'></div>
            <div
              className='overflow-y-auto'
              style={{
                top: `${tableTopPosition}px`,
                right: 0,
                maxHeight: `calc(100vh - ${tableTopPosition + 50}px)`,
              }}
            >
              <h2 className='text-center text-xs bg-topNav w-full py-1'>
                <strong>Datos Personales</strong>
              </h2>
              <p className='text-xs p-1'>
                <strong>DNI:</strong> {selectedRow.dni}
              </p>
              <p className='text-xs p-1'>
                <strong>Fecha N: </strong> {selectedRow.born_date}{' '}
                <strong>Edad: </strong> {calculateAge(selectedRow.born_date)}
              </p>
              <p className='text-xs p-1'>
                <strong>Genero:</strong> {selectedRow.gender?.name}
              </p>
              <p className='text-xs p-1'>
                <strong>Teléfono:</strong> {selectedRow.phone}
              </p>
              <p className='text-xs p-1'>
                <strong>Email:</strong> {selectedRow.email}
              </p>
              <div className='border-2 border-gray-200 w-full mt-6'></div>
              <h2 className='text-center text-xs bg-topNav w-full py-1'>
                <strong>Dirección</strong>
              </h2>
              <p className='text-sm p-1 text-xs'>
                <strong>Codigo postal:</strong> <br></br>
                {selectedRow.cod_post?.code +
                  ' ' +
                  selectedRow.cod_post?.name +
                  ' ' +
                  selectedRow.cod_post?.state?.name}
              </p>
              <p className='text-xs p-1'>
                <strong>Estado:</strong> {selectedRow.cod_post?.state?.name}
              </p>
              <p className='text-xs p-1'>
                <strong>Pais:</strong>{' '}
                {selectedRow.cod_post?.state?.country?.name}
              </p>
              <div className='border-2 border-gray-200 w-full mt-6'></div>
              <h2 className='text-center text-xs bg-topNav w-full py-1'>
                <strong>Especifico</strong>
              </h2>
              <p className='text-sm p-1 text-xs'>
                <strong>Disponibilidad horaria:</strong> <br />
              </p>
              <ul>
                {selectedData.services.map((row, index) => (
                  <li key={index} className='text-sm p-1'>
                    {row}
                  </li>
                ))}
              </ul>

              <h2 className='text-center text-xs bg-topNav w-full py-1'>
                <strong>Servicios Activos</strong>
              </h2>
              <div className='p-0'>
                {servicesActive.map((service) => (
                  <>
                    <a href={`client/${service.client?.id}?tabs=servicios`}>
                      <p className='text-xs font-bold'>
                        {service.service?.name}
                      </p>
                      <div className=' text-xs mb-2'>
                        <p className='p-1'>{service.client?.full_name}</p>
                        <p>{formatDate(service.service_alta)}</p>
                      </div>
                    </a>
                  </>
                ))}
              </div>
              <h2 className='text-center text-xs bg-topNav w-full py-1'>
                <strong>En proceso de seleccion</strong>
              </h2>
              {preselections.map((pre) => (
                <>
                  <p className='text-xs font-bold'>{pre.service?.name}</p>
                  <div className=' text-xs mb-2'>
                    <p className='p-1'>{pre.client?.full_name}</p>
                    <p>{formatDate(pre.clients_service.service_alta)}</p>
                  </div>
                </>
              ))}
            </div>
          </div>
        )}
        {isFilter && (
          <Filter
            filters={filters}
            setFilters={setFilters} // Pasar función para actualizar filtros
            onCloseFilter={() => setIsFilter(false)} // Cierra el panel
            onEraseFilter={eraseFilter} // Cierra el panel
            onApplyFilter={applyFilter}
          />
        )}
      </div>
      {isLoading && <Spinner />}
    </div>
  );
};

export default Clients;
