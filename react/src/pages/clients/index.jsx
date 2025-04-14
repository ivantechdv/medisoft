import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { getData, postData, putData } from '../../api';
import { FaFilter, FaPlusCircle, FaMinusCircle } from 'react-icons/fa';
import Spinner from '../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import Breadcrumbs from '../../components/Breadcrumbs';
import Modal from './modal';
import { useNavigate } from 'react-router-dom';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../components/SweetAlert/SweetAlert';
import ToastNotify from '../../components/toast/toast';
import DataTable from 'react-data-table-component';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css'; // Importa los estilos de la librería
const MyDataTable = ({
  rows,
  onHandleRowClick,
  onRenderPagination,
  currentPage,
  pageSize,
  onHandleViewClient,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  useEffect(() => {
    const savedSelectedRows =
      JSON.parse(localStorage.getItem('selectedRows')) || [];
    setSelectedRows(savedSelectedRows);
  }, []);

  const dataTableKey = `${currentPage}-${selectedRowId}`;

  // Añadir efecto para sincronizar selección con paginación
  useEffect(() => {
    if (selectedRowId && !rows.some((row) => row.id === selectedRowId)) {
      setSelectedRowId(null);
    }
  }, [currentPage, rows, selectedRowId]);

  // Modificar los estilos condicionales
  const conditionalRowStyles = [
    {
      when: (row) => row.id === selectedRowId,
      style: {
        backgroundColor: '#dee0e2 !important',
        '&:hover': {
          backgroundColor: '#dee0e2 !important',
        },
      },
    },
    {
      when: (row) => row.id !== selectedRowId,
      style: {
        '&:hover': {
          backgroundColor: '#f3f4f6 !important',
        },
      },
    },
  ];

  useEffect(() => {
    localStorage.setItem('selectedRows', JSON.stringify(selectedRows));
  }, [selectedRows]);

  const handleRowSelected = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  const getColumnWidths = () => {
    const savedWidths = JSON.parse(localStorage.getItem('columnWidths')) || {};
    return {
      id: savedWidths.id || 80,
      dni: savedWidths.dni || 120,
      full_name: savedWidths.full_name || 200,
      email: savedWidths.email || 250,
      phone: savedWidths.phone || 150,
      family1: savedWidths.family1 || 180,
      family1_phone: savedWidths.family1_phone || 150,
      family2: savedWidths.family2 || 180,
      family2_phone: savedWidths.family2_phone || 150,
    };
  };

  const [columnWidths, setColumnWidths] = useState(getColumnWidths);

  useEffect(() => {
    localStorage.setItem('columnWidths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  const handleResizeStart = () => setIsResizing(true);
  const handleResizeStop = () => setIsResizing(false);

  const handleResize =
    (columnKey) =>
    (e, { size }) => {
      setColumnWidths((prev) => {
        const newWidths = { ...prev, [columnKey]: size.width };
        localStorage.setItem('columnWidths', JSON.stringify(newWidths));
        return newWidths;
      });
    };

  const resizableColumn = (name, key, selector) => ({
    name: (
      <Resizable
        width={columnWidths[key]}
        height={0}
        onResize={handleResize(key)}
        onResizeStart={handleResizeStart}
        onResizeStop={handleResizeStop}
        draggableOpts={{ enableUserSelectHack: false }}
      >
        <div>{name}</div>
      </Resizable>
    ),
    selector,
    sortable: !isResizing,
    width: `${columnWidths[key]}px`,
  });

  const columns = [
    resizableColumn('ID', 'id', (row) => row.id),
    resizableColumn('DNI', 'dni', (row) => row.dni),
    resizableColumn('Nombre completo', 'full_name', (row) => row.full_name),
    resizableColumn('Correo electrónico', 'email', (row) => row.email),
    resizableColumn('Teléfono', 'phone', (row) => row.phone),
    resizableColumn(
      'Familiar-1',
      'family1',
      (row) => row.families[0]?.name || '-',
    ),
    resizableColumn(
      'Teléfono',
      'family1_phone',
      (row) => row.families[0]?.phone || '-',
    ),
    resizableColumn(
      'Familiar-2',
      'family2',
      (row) => row.families[1]?.name || '-',
    ),
    resizableColumn(
      'Teléfono',
      'family2_phone',
      (row) => row.families[1]?.phone || '-',
    ),
  ];

  const handleRowClick = (row) => {
    console.log('row.', row.id);
    onHandleRowClick(row);
    setSelectedRowId((prev) => (prev === row.id ? null : row.id));
  };

  // Función para ver detalles del cliente
  const handleViewClient = (id) => {
    onHandleViewClient(id);
    console.log(`Ver detalles del cliente con ID: ${id}`);
    // Aquí puedes agregar la navegación o modal para ver detalles
  };
  return (
    <div>
      <DataTable
        key={currentPage}
        columns={columns}
        data={rows}
        fixedHeader
        keyField='id'
        fixedHeaderScrollHeight='calc(100vh - 130px)'
        selectableRows={true}
        onSelectedRowsChange={handleRowSelected}
        pagination={false}
        conditionalRowStyles={conditionalRowStyles}
        customStyles={{
          rows: {
            style: {
              minHeight: '32px',
              height: '32px',
              fontSize: '14px',
              padding: '4px 8px',
              cursor: 'pointer', // 🔥 Cambia el cursor a pointer
            },
          },
          headCells: {
            style: {
              position: 'sticky', // 🔥 Hace que los títulos queden fijos
              top: 0,
              backgroundColor: '#f8f9fa', // Color de fondo para diferenciarlos
              zIndex: 2, // Asegura que estén por encima del contenido
              fontSize: '14px',
              fontWeight: 'bold',
              padding: '6px 8px',
            },
          },
        }}
        onRowClicked={(row) => handleRowClick(row)}
        onRowDoubleClicked={(row) => handleViewClient(row.id)}
      />

      {onRenderPagination()}
    </div>
  );
};

const Clients = () => {
  const sweetAlert = ConfirmSweetAlert({
    title: 'Clientes',
    text: '¿Desea eliminar los clientes seleccionado?',
    icon: 'question',
  });

  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(() => {
    return Number(localStorage.getItem('pageSize')) || 10; // Carga desde localStorage o usa 10 por defecto
  });
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
  const [servicesActive, setServicesActive] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const navigateTo = useNavigate();

  useEffect(() => {
    const table = document.querySelector('.table-container'); // Clase de contenedor de la tabla
    if (table) {
      const rect = table.getBoundingClientRect();
      setTableTopPosition(rect.top);
    }
  }, []);

  const getRows = async () => {
    try {
      if (!searchTerm) {
        setIsLoading(true);
      }

      let response;
      if (pageSize == 0) {
        response = await getData(
          `clients?is_deleted=0&searchTerm=${searchTerm}`,
        );
      } else {
        response = await getData(
          `clients?page=${currentPage}&pageSize=${pageSize}&is_deleted=0&searchTerm=${searchTerm}`,
        );
      }

      console.log(response);
      const { data, meta } = response;

      const sortedRows = data.map((row) => {
        const sortedFamilies = [...row.families].sort((a, b) => {
          if (a.priority == null) return 1;
          if (b.priority == null) return -1;
          return a.priority - b.priority;
        });
        return { ...row, families: sortedFamilies };
      });
      setRows(sortedRows);
      setTotalPages(meta.totalPages || 1);
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
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
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

  const handleRowClick = async (rowData, event) => {
    setSelectedRow(rowData);
    setSelectedRowId(rowData.id);
    const queryParameters = new URLSearchParams();
    queryParameters.append('statu', 1);
    const order = 'service_alta-desc';
    const services = await getData(
      `client-service/all?client_id=${rowData.id}&${queryParameters}&order=${order}`,
    );
    if (services) {
      console.log('services', services);
      setServicesActive(services);
    } else {
      setServicesActive([]);
    }
  };

  const handleClosePanel = () => {
    setSelectedRow(false);
  };
  const handleViewClient = (clientId) => {
    navigateTo(`/client/${clientId}`);
  };

  const handleFormClient = () => {
    navigateTo('/client');
  };

  const handleSelectRow = async (rowId) => {
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
      localStorage.setItem('pageSize', 0); // Guardar en cache
    } else {
      setPageSize(Number(event.target.value)); // Actualiza el tamaño de la página
      localStorage.setItem('pageSize', Number(event.target.value)); // Guardar en cache
    }
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
    <div className='max-w-full mx-auto bg-white'>
      <div className='flex justify-between px-4 sm:px-6'>
        <Breadcrumbs
          items={[
            { label: 'Inicio', route: '/' },
            { label: 'Clientes', route: '/Clients' },
          ]}
        />

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
            onClick={handleFormClient}
          >
            <FaPlusCircle className='text-lg' />
          </button>
          <button
            className={`bg-red-500 hover:bg-red-700 text-sm text-white font-bold py-2 px-2 rounded h-8 ${
              selectedRows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={selectedRows.length === 0}
          >
            <FaMinusCircle className='text-lg' onClick={handleDelete} />
          </button>
          <button className='bg-secondary text-lg text-textWhite font-bold py-1 px-2 rounded h-8'>
            <FaFilter className='text-lg' />
          </button>
        </div>
      </div>
      <div className='max-w-full mx-auto bg-white shadow-md overflow-hidden sm:rounded-lg border-t-2 border-gray-400 grid  grid-cols-10 gap-2 '>
        <div className={`${selectedRow ? 'col-span-8' : 'col-span-10'}`}>
          <div className='border-t border-gray-200 overflow-x-auto table-responsive'>
            <div className='overflow-x-auto max-h-screen'>
              {/* Contenedor de la tabla con table-layout: fixed */}
              <MyDataTable
                rows={rows}
                onHandleRowClick={handleRowClick}
                onHandleViewClient={handleViewClient}
                onRenderPagination={renderPagination}
                currentPage={currentPage}
                pageSize={pageSize}
              />
            </div>
          </div>
        </div>

        {/* Modal */}
        {selectedRow && (
          <div
            className='col-span-2 bg-panel border-2 border-gray-300 shadow-lg  h-[calc(100vh-85px)]
overflow-auto'
          >
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
              className=' text-sm'
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
                <strong>Patologias</strong>
              </h2>
              {selectedRow.clients_patologies.length > 0 &&
                selectedRow.clients_patologies
                  .slice() // Clonamos el array para evitar modificar el original
                  .filter(
                    (patology) => patology.patology && patology.patology.name,
                  ) // Filtrar aquellos que tengan patología y nombre
                  .sort((a, b) =>
                    a.patology.name.localeCompare(b.patology.name),
                  ) // Ordenar por nombre de patología
                  .map((patology) => (
                    <li className='p-1 text-xs' key={patology.id}>
                      {patology.patology.name}
                    </li>
                  ))}
              <div className='border-2 border-gray-200 w-full mt-6'></div>
              <h2 className='text-center text-xs bg-topNav w-full py-1'>
                <strong>Servicios contratados</strong>
              </h2>
              {servicesActive.map((service) => (
                <>
                  <p className='text-xs font-bold'>{service.service?.name}</p>
                  <div className=' text-xs mb-2'>
                    <p>
                      {service.employee?.full_name}{' '}
                      {service.employee?.code_phone +
                        ' ' +
                        service.employee?.phone}
                    </p>
                    <p>{formatDate(service.service_alta)}</p>
                  </div>
                </>
              ))}
              <div className='border-2 border-gray-200 w-full mt-6'></div>
              <h2 className='text-center text-xs border bg-topNav w-full py-1'>
                <strong>Familiares </strong>
              </h2>
              {selectedRow.families.length > 0 &&
                selectedRow.families
                  .slice() // Clonamos el array para evitar modificar el original
                  .filter((family) => family.name) // Filtrar aquellos que tengan patología y nombre
                  .sort((a, b) => a.name.localeCompare(b.name)) // Ordenar por nombre de patología
                  .map((family) => (
                    <div className='flex justify-between text-xs mb-2 '>
                      <p>{family?.name}</p>
                      <p>{family.phone}</p>
                    </div>
                  ))}
              <div className='border-2 border-gray-200 w-full mt-6'></div>
              <h2 className='text-center text-xs bg-topNav w-full py-1'>
                <strong>Observaciones </strong>
              </h2>
              <div
                className='whitespace-pre-line'
                dangerouslySetInnerHTML={{
                  __html: selectedRow.observations?.replace(/\n/g, '<br>'),
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
      {isLoading && <Spinner />}
    </div>
  );
};

export default Clients;
