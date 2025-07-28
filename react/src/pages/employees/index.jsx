import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation } from 'react-router-dom';

import { getData, postData, putData } from '../../api';
import { FaFilter, FaPlusCircle, FaMinusCircle } from 'react-icons/fa';
import Spinner from '../../components/Spinner/Spinner';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import Breadcrumbs from '../../components/Breadcrumbs';
import Modal from './modal';
import { useNavigate } from 'react-router-dom';
import Filter from './filter';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css'; // Importa los estilos de la librería
import { tipo_config, estado_config } from '../../utils/config';
import { ResizableBox } from 'react-resizable';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaSort, FaSortUp, FaSortDown, FaGripVertical } from 'react-icons/fa';

const DraggableHeader = ({ header, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: header.column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${header.getSize()}px`,
    padding: "8px",
    borderBottom: "1px solid #ccc",
    textAlign: "center",
    fontSize: "13px",
    position: "relative",
    backgroundColor: "#f9f9f9",
    userSelect: "none",
    boxSizing: "border-box",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };

  const getSortIcon = () => {
    if (!header.column.getCanSort()) return null;
    
    const sortDirection = header.column.getIsSorted();
    if (sortDirection === 'asc') return <FaSortUp style={{ marginLeft: 4, opacity: 0.8 }} />;
    if (sortDirection === 'desc') return <FaSortDown style={{ marginLeft: 4, opacity: 0.8 }} />;
    return <FaSort style={{ marginLeft: 4, opacity: 0.3 }} />;
  };

  return (
    <th ref={setNodeRef} style={style}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%'
      }}>
        {/* Área de ordenamiento - ocupa todo el espacio disponible */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: header.column.getCanSort() ? 'pointer' : 'default',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '0 4px'
          }}
          onClick={header.column.getToggleSortingHandler()}
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
          {header.column.getCanSort() && getSortIcon()}
        </div>

        {/* Área de drag - solo el ícono */}
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            padding: '0 4px',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.5,
            ':hover': {
              opacity: 1
            }
          }}
        >
          <FaGripVertical />
        </div>
      </div>

      {header.column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            height: "100%",
            width: "1px",
            cursor: "col-resize",
            zIndex: 1,
            userSelect: "none",
            backgroundColor: "#ddd",
            borderLeft: "3px solid #aaa",
            transition: "background-color 0.4s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#aaa")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ddd")}
        />
      )}
    </th>
  );
};

const MyDataTable = ({
  rows = [],
  onHandleRowClick = () => {},
  onRenderPagination,
  currentPage,
  pageSize,
  onHandleViewClient = () => {},
}) => {
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [columnSizing, setColumnSizing] = useState(() => {
    const saved = localStorage.getItem("myDataTableColumnWidths");
    return saved ? JSON.parse(saved) : {};
  });

  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem("myDataTableColumnOrder");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem("myDataTableColumnWidths", JSON.stringify(columnSizing));
  }, [columnSizing]);

  useEffect(() => {
    if (columnOrder) {
      localStorage.setItem("myDataTableColumnOrder", JSON.stringify(columnOrder));
    }
  }, [columnOrder]);

  const clickTimer = useRef(null);

  const onRowInteraction = (row) => {
    if (!row?.id) return;

    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onHandleViewClient(row.id);
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        onRowClicked(row);
      }, 250);
    }
  };

  const getRowBackgroundColor = (row) => {
    if (!estado_config || estado_config.length < 3) return "#ffffff";
    
    const hasClientServices = row.clients_services?.length > 0;
    if (row.is_active === true) {
      return estado_config[1].color;
    } else if (hasClientServices) {
      return estado_config[2].color;
    }
    return estado_config[0].color;
  };

  const getColor = (key, row) => {
    switch (key) {
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

  const IndicatorsCell = ({ row }) => (
    <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
      {["t", "n", "s"].map((key) => {
        const title =
          key === "t"
            ? tipo_config[row.type]?.label
            : key === "n"
            ? row?.level?.name
            : row?.statu?.name;

        return (
          <div
            key={key}
            title={title}
            style={{
              width: 20,
              height: 20,
              borderRadius: 2,
              backgroundColor: getColor(key, row),
            }}
          />
        );
      })}
    </div>
  );

  const columnDefs = useMemo(() => [
    {
  header: "T",
  id: "indicator_t",
  size: 25,
  minSize: 25,
  maxSize: 25,
  enableSorting: false,
  enableResizing: false,
  enableColumnDragging: false,
  cell: ({ row }) => {
    const data = row.original;
    const title = tipo_config[data.type]?.label;
    return (
      <div
        title={title}
        style={{
          width: 20,
          height: 20,
          borderRadius: 2,
          margin: "0 auto",
          backgroundColor: getColor("t", data),
        }}
      />
    );
  },
},
{
  header: "N",
  id: "indicator_n",
  size: 25,
  minSize: 25,
  maxSize: 25,
  enableSorting: false,
  enableResizing: false,
  enableColumnDragging: false,
  cell: ({ row }) => {
    const data = row.original;
    const title = data?.level?.name;
    return (
      <div
        title={title}
        style={{
          width: 20,
          height: 20,
          borderRadius: 2,
          margin: "0 auto",
          backgroundColor: getColor("n", data),
        }}
      />
    );
  },
},
{
  header: "S",
  id: "indicator_s",
  size: 25,
  minSize: 25,
  maxSize: 25,
  enableSorting: false,
  enableResizing: false,
  enableColumnDragging: false,
  cell: ({ row }) => {
    const data = row.original;
    const title = data?.statu?.name;
    return (
      <div
        title={title}
        style={{
          width: 20,
          height: 20,
          borderRadius: 2,
          margin: "0 auto",
          backgroundColor: getColor("s", data),
        }}
      />
    );
  },
},
    ...[{ key: "id", label: "ID" },
  { key: "dni", label: "DNI" },
  { key: "full_name", label: "Nombre" },
  { key: "email", label: "Correo Electrónico" },
  { key: "phone", label: "Teléfono" },].map(({ key, label }) => ({
      header: label,
      accessorKey: key,
      id: key,
      size: columnSizing[key] ?? (key === "full_name" || key === "email" ? 300 : 120),
      minSize: key === "email" || key === "full_name" ? 150 : 80,
      maxSize: key === "email" || key === "full_name" ? 600 : 250,
      enableSorting: true,
      enableResizing: true,
      sortingFn: (rowA, rowB, columnId) => {
        const valueA = rowA.getValue(columnId);
        const valueB = rowB.getValue(columnId);
        
        if (valueA == null) return 1;
        if (valueB == null) return -1;
        if (valueA == null && valueB == null) return 0;
        
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return valueA - valueB;
        }
        
        return String(valueA).localeCompare(String(valueB));
      },
      cell: ({ row, getValue }) => {
        const isSelected = row.original.id === selectedRowId;
        const bgColor = isSelected
          ? "#d3d3d3"
          : getRowBackgroundColor(row.original);
        return (
          <div
            style={{
              backgroundColor: bgColor,
              width: "100%",
              height: "100%",
              padding: "4px 4px",
              display: "flex",
              alignItems: "center",
              fontSize: "13px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {getValue()}
          </div>
        );
      },
    })),
  ], [selectedRowId, columnSizing, estado_config, tipo_config]);

  const defaultColumnOrder = columnDefs.map((col) => col.id);

  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    state: {
      sorting,
      columnSizing,
      columnOrder: columnOrder || defaultColumnOrder,
    },
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onEnd",
    enableColumnResizing: true,
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = table.getState().columnOrder.indexOf(active.id);
      const newIndex = table.getState().columnOrder.indexOf(over.id);
      const newOrder = arrayMove(table.getState().columnOrder, oldIndex, newIndex);
      setColumnOrder(newOrder);
    }
  };

  const onRowClicked = (row) => {
   if (!row?.id) return;
setSelectedRowId(row.id);
onHandleRowClick(row);
  };

  return (
    <>
      <div style={{ 
        overflowX: "auto", 
        maxHeight: "calc(100vh - 130px)", 
        width: "100%",
        display: "block"
      }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <div style={{
            width: 'max-content',
            minWidth: '100%'
          }}>
            <table 
              style={{ 
                width: "auto",
                borderCollapse: "collapse",
                tableLayout: "fixed"
              }}
            >
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <SortableContext
                    key={headerGroup.id}
                    items={headerGroup.headers.map((h) => h.column.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <tr>
                      {headerGroup.headers.map((header, index) => (

                       index === 0 ||  index === 1 || index===2 ? (
    // Primera columna: no draggable
    <th
      key={header.id}
      style={{
        width: `${header.getSize()}px`,
        padding: "4px",
        borderBottom: "1px solid #ccc",
        textAlign: "center",
        fontSize: "13px",
        backgroundColor: "#f9f9f9",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
    </th>
  ) : (
    <DraggableHeader key={header.id} header={header} index={index} />
  )
                      ))}
                    </tr>
                  </SortableContext>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => {
                  const isSelected = row.original.id === selectedRowId;
                  const rowBgColor = getRowBackgroundColor(row.original);
                  return (
                    <tr
                      key={row.id}
                      onClick={() => onRowInteraction(row.original)}
                      style={{ 
                        cursor: "pointer", 
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{
                            fontSize: "12px",
                            width: `${cell.column.getSize()}px`,
                            boxSizing: "border-box",
                            overflow: "hidden",
                            backgroundColor:"#fff !important",
                            padding:"0px",
                            borderBottom:"1px solid #ccc"
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DndContext>
      </div>
      {pageSize !== "todos" && onRenderPagination?.()}
    </>
  );
};


const Clients = () => {
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(() => {
    return localStorage.getItem('pageSize')|| "10"; // Carga desde localStorage o usa 10 por defecto
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

    if (localStorage.getItem('pageSize') !== 'todos') {
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
      setPageSize("todos");
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
  className="absolute top-10 left-0 bg-white border border-gray-300 rounded shadow-md p-3 z-50 space-y-2"
>
  {/* Estado */}
  <div className="flex items-center space-x-2">
    <label htmlFor="estado" className="text-xs w-16">
      Estado:
    </label>
    <select
      name="estado"
      id="estado"
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
  </div>

  {/* Tipo */}
  <div className="flex items-center space-x-2">
    <label htmlFor="tipo" className="text-xs w-16">
      Tipo:
    </label>
    <select
      name="tipo"
      id="tipo"
      value={filtersT.tipo}
      onChange={handleFilterChange}
      className="border border-gray-400 rounded w-full text-xs p-1"
    >
      <option value="">Tipo</option>
      {Object.entries(tipo_config).map(([value, option]) => (
        <option key={value} value={value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>

  {/* Nivel */}
  <div className="flex items-center space-x-2">
    <label htmlFor="nivel" className="text-xs w-16">
      Nivel:
    </label>
    <select
      name="nivel"
      id="nivel"
      value={filtersT.nivel}
      onChange={handleFilterChange}
      className="border border-gray-400 rounded w-full text-xs p-1"
    >
      <option value="">Nivel</option>
      {niveles.map((n) => (
        <option key={n.id} value={n.id}>
          {n.name}
        </option>
      ))}
    </select>
  </div>

  {/* Situación */}
  <div className="flex items-center space-x-2">
    <label htmlFor="situacion" className="text-xs w-16">
      Situación:
    </label>
    <select
      name="situacion"
      id="situacion"
      value={filtersT.situacion}
      onChange={handleFilterChange}
      className="border border-gray-400 rounded w-full text-xs p-1"
    >
      <option value="">Situación</option>
      {situaciones.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  </div>

  {/* Botones */}
  <div className="flex flex-row justify-between gap-2 pt-2">
    <button
      type="button"
      className="px-2 py-1 bg-gray-600 text-white rounded text-sm"
      onClick={handleResetFilter}
    >
      Borrar Filtro
    </button>
    <button
      type="button"
      className="px-2 py-1 bg-green-600 text-white rounded text-sm"
      onClick={handleAplyFilter}
    >
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
          <button
            className='bg-secondary text-lg text-textWhite font-bold py-2 px-2 rounded h-8'
            onClick={handleFilter}
          >
            <FaFilter className='text-lg' />
          </button>
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
                <strong>Servicios Activos</strong>
              </h2>
              <div className='p-0'>
                {servicesActive.map((service) => (
                  <>
                    
                      <p className='text-xs font-bold text-blue-'>
                        {service.service?.name}
                      </p>
                      <a href={`client/${service.client?.id}?tabs=servicios`}>
                      <div className=' text-xs mb-2'>
                        <p className='p-1 text-blue-500'>{service.client?.full_name}</p>
                        <p>{formatDate(service.service_alta)}</p>
                      </div>
                    </a>
                  </>
                ))}
              </div>
              <h2 className='text-center text-xs bg-topNav w-full py-1'>
                <strong>Especifico</strong>
              </h2>
<div className="grid grid-cols-[100px_1fr] gap-x-2 items-start">
  {/* Disponibilidad */}
  <p className="text-sm font-bold">Disponibilidad:</p>
  <ul className="space-y-1">
    {selectedData.services.map((row, index) => (
      <li key={index} className="text-xs">- {row}</li>
    ))}
  </ul>

  {/* Separador */}
  <div className="col-span-2 border-t-2 border-gray-200 my-4"></div>

  {/* Tareas */}
  <p className="text-sm font-bold">Tareas:</p>
  <ul className="space-y-1">
    {selectedData.tasks.map((row, index) => (
      <li key={index} className="text-xs">- {row}</li>
    ))}
  </ul>

  {/* Separador */}
  <div className="col-span-2 border-t-2 border-gray-200 my-4"></div>

  {/* Patologías */}
  <p className="text-sm font-bold">Patologías:</p>
  <ul className="space-y-1">
    {selectedData.patologies.map((row, index) => (
      <li key={index} className="text-xs">- {row}</li>
    ))}
  </ul>
</div>
           
              <h2 className='text-center text-xs bg-topNav w-full py-1'>
                <strong>En proceso de seleccion</strong>
              </h2>
              {preselections.map((pre) => (
                <>
                  <p className='text-xs font-bold'>{pre.service?.name}</p>
                  <div className=' text-xs mb-2'>
                    <a href={`client/${pre.client?.id}?tabs=servicios`}>
                    <p className='p-1 text-blue-500'>{pre.client?.full_name}</p>
                    <p>{formatDate(pre.clients_service.service_alta)}</p>
                    </a>
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
