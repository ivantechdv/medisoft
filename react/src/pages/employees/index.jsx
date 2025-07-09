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
import DataTable from 'react-data-table-component';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css'; // Importa los estilos de la librería
import { tipo_config, estado_config } from '../../utils/config';
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
    const savedSelectedRows = JSON.parse(localStorage.getItem("selectedRows")) || [];
    setSelectedRows(savedSelectedRows);
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedRows", JSON.stringify(selectedRows));
  }, [selectedRows]);

  useEffect(() => {
    if (selectedRowId && !rows.some((row) => row.id === selectedRowId)) {
      setSelectedRowId(null);
    }
  }, [currentPage, rows, selectedRowId]);

  const getColumnWidths = () => {
    const savedWidths = JSON.parse(localStorage.getItem("columnWidths")) || {};
    return {
      id: savedWidths.id || 60,
      dni: savedWidths.dni || 120,
      full_name: savedWidths.full_name || 300,
      email: savedWidths.email || 300,
      phone: savedWidths.phone || 150,
    };
  };

  const [columnWidths, setColumnWidths] = useState(getColumnWidths);

  useEffect(() => {
    localStorage.setItem("columnWidths", JSON.stringify(columnWidths));
  }, [columnWidths]);

  const handleResizeStart = () => setIsResizing(true);
  const handleResizeStop = () => setIsResizing(false);

  const handleResize = (columnKey) => (e, { size }) => {
    setColumnWidths((prev) => {
      const newWidths = { ...prev, [columnKey]: size.width };
      localStorage.setItem("columnWidths", JSON.stringify(newWidths));
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
      style={{ display: 'inline-block' }}
    >
      <div style={{ padding: '4px 8px', cursor: 'col-resize' }}>{name}</div>
    </Resizable>
  ),
  selector,
  sortable: !isResizing,
  width: `${columnWidths[key]}px`,
  cell: (row) => (
    <div
      onClick={() => handleRowClick(row)}
      style={{
         backgroundColor: key === 'id' ? 'transparent' : getColor('e', row),
        height: '100%',
        width: '100%',
        padding: '4px 8px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {selector(row)}
    </div>
  ),
});
  const getColor = (key, row) => {
    switch (key) {
      case "e":
        const hasClientServices = row.clients_services?.length > 0;
        if (row.is_active === true) {
          return estado_config[1].color;
        } else if (hasClientServices) {
          return estado_config[2].color;
        } else {
          return estado_config[0].color;
        }
      case "t":
        return tipo_config[row.type]?.color || "gray";
        case "n":
         return row?.level?.color ? `rgb(${row.level.color})` : "gray";
           case "s":
         return row?.statu?.color ? `rgb(${row.statu.color})` : "gray";
      default:
        return "gray";
    }
  };
const columns = [
  resizableColumn('ID', 'id', (row) => row.id),
  {
    name: (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0 8px',
          userSelect: 'none',
        }}
      >
        {['T', 'N', 'S'].map((letter) => (
          <div key={letter} style={{ width: 20, textAlign: 'center' }}>
            {letter}
          </div>
        ))}
      </div>
    ),
    selector: (row) => row,
    sortable: false,
    width: '160px',
    cell: (row) => (
      <div
        style={{
          display: 'flex',
          gap: 4,
          justifyContent: 'space-between',
          width: '100%',
          userSelect: 'none',
        }}
      >
        {['t', 'n', 's'].map((key) => (
          <div
            key={key}
            title={key.toUpperCase()}
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              backgroundColor: getColor(key, row),
              border: '1px solid #000',
              pointerEvents: 'none', // evita que bloqueen clicks o drags
            }}
          />
        ))}
      </div>
    ),
  },
  resizableColumn('DNI', 'dni', (row) => row.dni),
  resizableColumn('Nombre completo', 'full_name', (row) => row.full_name),
  resizableColumn('Correo electrónico', 'email', (row) => row.email),
  resizableColumn('Teléfono', 'phone', (row) => row.phone),
];


  const handleRowClick = (row) => {
    onHandleRowClick(row);
    setSelectedRowId((prev) => (prev === row.id ? null : row.id));
  };

  const handleViewClient = (id) => {
    onHandleViewClient(id);
  };

  const conditionalRowStyles = [
    {
      when: (row) => true,
      style: (row) => ({
        backgroundColor: getColor("e", row),
        '&:hover': {
          backgroundColor: getColor("e", row),
        },
      }),
    },
    {
      when: (row) => row.id === selectedRowId,
      style: {
        outline: "2px solid #000",
      },
    },
  ];

  return (
    <div>
      <DataTable
        key={currentPage}
        columns={columns}
        data={rows}
        fixedHeader
        keyField="id"
        fixedHeaderScrollHeight="calc(100vh - 130px)"
        selectableRows
        onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
        pagination={false}
        conditionalRowStyles={''}
        customStyles={{
          rows: {
            style: {
              minHeight: "32px",
              height: "32px",
              fontSize: "14px",
              cursor: "pointer",
               paddingLeft: '0px',  // quitar padding izquierdo
        paddingRight: '0px', // quitar padding derecho
            },
            
          },
          cells: {
    style: {
      paddingLeft: '0px',  // Aquí quitas padding lateral de las celdas
      paddingRight: '0px',
    },
  },
          headCells: {
            style: {
              position: "sticky",
              top: 0,
              backgroundColor: "#f8f9fa",
              zIndex: 2,
              fontSize: "14px",
              fontWeight: "bold",
              padding: "6px 8px",
            },
          },
        }}
        onRowClicked={handleRowClick}
        onRowDoubleClicked={(row) => handleViewClient(row.id)}
      />
      {onRenderPagination()}
    </div>
  );
};
const Clients = () => {
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(() => {
    return Number(localStorage.getItem('pageSize')) || "todos"; // Carga desde localStorage o usa 10 por defecto
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
  const [filtersT, setFiltersT] = useState({
  estado: '',
  tipo: '',
  nivel: '',
  situacion: '',
});

const [isFilterOpen, setIsFilterOpen] = useState(false);


const [niveles, setNiveles] = useState([]);
const [situaciones, setSituaciones] = useState([]);

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

          const responseLevels = await getData('employees/level/all');
                setNiveles(responseLevels);
                const responseStatus = await getData('employees/status/all');
                setSituaciones(responseStatus);

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
     let url = `employees?is_deleted=0&searchTerm=${searchTerm}`;

    if (filtersT.estado) url += `&is_active=${filtersT.estado}`;
    if (filtersT.tipo) url += `&type=${filtersT.tipo}`;
    if (filtersT.nivel) url += `&level_id=${filtersT.nivel}`;
    if (filtersT.situacion) url += `&statu_id=${filtersT.situacion}`;

    if (pageSize !== 'todos') {
      url += `&page=${currentPage}&pageSize=${pageSize}`;
    }
    response = await getData(url);
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
    setSelectedRowId(row.id);
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

    console.log("employee especific",row.employee_specific);

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
      localStorage.setItem('pageSize',"todos"); // Guardar en cache
    } else {
      setPageSize(Number(event.target.value)); // Actualiza el tamaño de la página
      localStorage.setItem('pageSize', Number(event.target.value)); // Guardar en cache
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

    const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFiltersT((prev) => ({
    ...prev,
    [name]: value,
  }))
    }
    const handleAplyFilter = () => {
     setCurrentPage(1); 
 getRows();
    }
    const [shouldFetch, setShouldFetch] = useState(false);
    useEffect(() => {
  if (shouldFetch) {
    getRows();
    setShouldFetch(false); // Resetear flag
  }
}, [ shouldFetch]);

        const handleResetFilter = () => {
         setFiltersT({
    estado: '',
    tipo: '',
    nivel: '',
    situacion: '',
  });
   setCurrentPage(1);
  setShouldFetch(true); //
    }


  return (
    <div className='max-w-full mx-auto'>
      <div className='flex justify-between px-4 sm:px-6'>
        <Breadcrumbs
          items={[
            { label: 'Inicio', route: '/' },
            { label: 'Cuidadores', route: '/employees' },
          ]}
        />
        <div className='flex space-x-2'>
          <div className='relative'>
  <button
    className="bg-secondary text-lg text-textWhite font-bold py-2 px-2 rounded h-8 mr-4 pt-2"
    onClick={() => setIsFilterOpen(!isFilterOpen)}
  >
    <FaFilter className="text-lg" />
  </button>

  {isFilterOpen && (
    <div
      className="absolute top-10 right-0 bg-white border border-gray-300 rounded shadow-md p-3 z-50 space-y-2"
      onMouseLeave={() => setIsFilterOpen(false)} // Cierra cuando sales del popup
    >
      <select
        name="estado"
        value={filtersT.estado}
        onChange={handleFilterChange}
        className="border border-gray-400 rounded w-full text-xs p-1"
      >
        <option value="">Estado</option>
       {Object.entries(estado_config).map(([value, option]) => (
          <option key={value} value={value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        name="tipo"
        value={filtersT.tipo}
        onChange={handleFilterChange}
        className="border border-gray-400 rounded w-full text-xs p-1"
      >
        <option value="">Tipo</option>
        {Object.entries(tipo_config).map(([value, option]) => (
          <option key={value} value={value}>{option.label}</option>
        ))}
      </select>

      <select
        name="nivel"
        value={filtersT.nivel}
        onChange={handleFilterChange}
        className="border border-gray-400 rounded w-full text-xs p-1"
      >
        <option value="">Nivel</option>
        {niveles.map((n) => (
          <option key={n.id} value={n.id}>{n.name}</option>
        ))}
      </select>

      <select
        name="situacion"
        value={filtersT.situacion}
        onChange={handleFilterChange}
        className="border border-gray-400 rounded w-full text-xs p-1"
      >
        <option value="">Situación</option>
        {situaciones.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <div className='flex flex-row justify-between gap-2'>
  <button type='button' className='px-2 py-1 bg-gray-600 text-white rounded text-sm' onClick={handleResetFilter}> 
    Borrar Filtro
  </button>
  <button type='button' className='px-2 py-1 bg-green-600 text-white rounded text-sm' onClick={handleAplyFilter}>
    Aplicar
  </button>
</div>
        </div>
  )}
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
            <option value={"todos"}>Todos</option>
          </select>
          <button
            className='bg-primary text-lg text-textWhite font-bold py-2 px-2 rounded h-8'
            onClick={handleFormEmployee}
          >
            <FaPlusCircle className='text-lg' />
          </button>
          <button
            className={`bg-red-500 hover:bg-red-700 text-sm text-white font-bold py-2 px-2 rounded h-8 ${
              selectedRows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={selectedRows.length === 0}
          >
            <FaMinusCircle className='text-lg' />
          </button>
          {/* <button
            className='bg-secondary text-lg text-textWhite font-bold py-2 px-2 rounded h-8'
            onClick={handleFilter}
          >
            <FaFilter className='text-lg' />
          </button> */}
        </div>
      </div>
      <div className='max-w-full mx-auto bg-content shadow-md overflow-hidden sm:rounded-lg border-t-2 border-gray-400 grid  grid-cols-10 gap-2'>
        <div
          className={`${
            selectedRow ? 'col-span-8' : 'col-span-10'
          } overflow-auto`}
        >
          <div className='overflow-x-auto max-h-screen'>
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
                <strong>Provincia:</strong> {selectedRow.cod_post?.state?.name}
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
