import React, { useEffect, useState, useRef, useMemo } from 'react';
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
import { normalizePhoneForSearch } from '../../utils/customFormat';
import { client_estado_config, client_tipo_config } from '../../utils/config';

// Función para determinar el color de fondo de las filas según el estado del cliente
const getRowBackgroundColor = (row) => {
  if (!client_estado_config) return '#ffffff';

  const services = row.clients_services?.filter((service) => service.is_deleted === 0) || [];
  const hasActiveServices = services.some((service) => service.statu === true);
  const hasPreviousServices = services.some((service) => service.statu === false);

  if (hasActiveServices) {
    return client_estado_config[1].color; // Verde Intenso - cliente con contrato vigente
  }
  if (hasPreviousServices) {
    return client_estado_config[2].color; // Verde oscuro - cliente que tuvo contrato anterior
  }

  return client_estado_config[0].color; // Gris claro - sin contrato activo
};

const getClientTypeColor = (row) => {
  return client_tipo_config[row.type]?.color || 'gray';
};
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DraggableHeader = ({ header, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: header.column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${header.getSize()}px`,
    padding: '8px',
    borderBottom: '1px solid #ccc',
    textAlign: 'center',
    fontSize: '13px',
    position: 'relative',
    backgroundColor: '#f9f9f9',
    userSelect: 'none',
    boxSizing: 'border-box',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  };

  return (
    <th ref={setNodeRef} style={style}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: header.column.getCanSort() ? 'pointer' : 'default',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '0 4px',
          }}
          onClick={header.column.getToggleSortingHandler()}
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
        </div>
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            padding: '0 4px',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.5,
          }}
        >
          <span style={{ fontSize: 12 }}>☰</span>
        </div>
      </div>
      {header.column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            height: '100%',
            width: '4px',
            cursor: 'col-resize',
            zIndex: 1,
            userSelect: 'none',
            backgroundColor: '#ddd',
            borderLeft: '2px solid #aaa',
          }}
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
  onSelectedRows,
  tableContainerRef,
}) => {
  const [selectedRowId, setSelectedRowId] = useState(
    sessionStorage.getItem('clients_selected_id') || null,
  );
  const [sorting, setSorting] = useState([]);

  const [columnSizing, setColumnSizing] = useState(() => {
    const saved = localStorage.getItem('clientsTableColumnWidths');
    return saved ? JSON.parse(saved) : {};
  });
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('clientsTableColumnOrder');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('clientsTableColumnWidths', JSON.stringify(columnSizing));
  }, [columnSizing]);

  useEffect(() => {
    if (columnOrder) {
      localStorage.setItem('clientsTableColumnOrder', JSON.stringify(columnOrder));
    }
  }, [columnOrder]);

  useEffect(() => {
    if (selectedRowId) {
      sessionStorage.setItem('clients_selected_id', selectedRowId);
    }
  }, [selectedRowId]);

  const clickTimer = useRef(null);
  const onRowInteraction = (row) => {
    if (!row?.id) return;

    setSelectedRowId(row.id);

    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onHandleViewClient(row.id);
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        onHandleRowClick(row);
        sessionStorage.setItem('clients_selected_row', JSON.stringify(row));
      }, 250);
    }
  };

  const columnDefs = useMemo(
    () => [
      {
        header: () => (
          <input
            type="checkbox"
            checked={false}
            onChange={() => {}}
            style={{ cursor: 'pointer' }}
          />
        ),
        id: 'selection',
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableSorting: false,
        enableResizing: false,
        enableColumnDragging: false,
        cell: ({ row }) => {
          return (
            <input
              type="checkbox"
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'pointer', marginLeft: '10px' }}
            />
          );
        },
      },
      // Columna de indicador de tipo (T)
      {
        header: 'T',
        id: 'indicator_t',
        size: 25,
        minSize: 25,
        maxSize: 25,
        enableSorting: false,
        enableResizing: false,
        enableColumnDragging: false,
        cell: ({ row }) => {
          const data = row.original;
          const title = client_tipo_config[data.type]?.label;
          return (
            <div
              title={title}
              style={{
                width: 20,
                height: 20,
                borderRadius: 2,
                margin: '0 auto',
                backgroundColor: getClientTypeColor(data),
              }}
            />
          );
        },
      },
      ...[
        { key: 'id', label: 'ID' },
        { key: 'dni', label: 'DNI' },
        { key: 'full_name', label: 'Nombre' },
        { key: 'email', label: 'Correo Electrónico' },
        { key: 'phone', label: 'Teléfono' },
        { key: 'family1', label: 'Familiar 1' },
        { key: 'family1_phone', label: 'Teléfono 1' },
        { key: 'family2', label: 'Familiar 2' },
        { key: 'family2_phone', label: 'Teléfono 2' },
      ].map(({ key, label }) => ({
        header: label,
        accessorKey: key,
        id: key,
        size: columnSizing[key] ?? (['full_name', 'email'].includes(key) ? 240 : 120),
        minSize: ['full_name', 'email'].includes(key) ? 150 : 80,
        maxSize: ['full_name', 'email'].includes(key) ? 600 : 250,
        enableSorting: true,
        enableResizing: true,
        cell: ({ row, getValue, column }) => {
          const value = getValue();
          const isSelected = row.original.id == selectedRowId;
          const bgColor = isSelected ? '#d3d3d3' : getRowBackgroundColor(row.original);

          // Manejo específico para campos de familia
          if (key.startsWith('family')) {
            const original = row.original || {};
            const idx = key.includes('1') ? 0 : 1;
            const isPhone = key.endsWith('_phone');
            const family = original.families ? original.families[idx] : null;
            const text = family ? (isPhone ? family.phone || '-' : family.name || '-') : '-';
            return (
              <div
                style={{
                  backgroundColor: bgColor,
                  width: '100%',
                  height: '100%',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '13px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {text}
              </div>
            );
          }

          return (
            <div
              style={{
                backgroundColor: bgColor,
                width: '100%',
                height: '100%',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '13px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {value ?? '-'}
            </div>
          );
        },
      })),
    ],
    [selectedRowId, columnSizing],
  );

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
    columnResizeMode: 'onEnd',
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
      <div
        ref={tableContainerRef}
        style={{
          overflowX: 'auto',
          maxHeight: 'calc(100vh - 130px)',
          width: '100%',
          display: 'block',
        }}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <div style={{ width: 'max-content', minWidth: '100%' }}>
            <table style={{ width: 'auto', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <SortableContext key={headerGroup.id} items={headerGroup.headers.map((h) => h.column.id)} strategy={verticalListSortingStrategy}>
                    <tr>
                      {headerGroup.headers.map((header, index) =>
                        index < 2 ? (
                          <th
                            key={header.id}
                            style={{
                              width: `${header.getSize()}px`,
                              padding: '4px',
                              borderBottom: '1px solid #ccc',
                              textAlign: 'center',
                              fontSize: '13px',
                              backgroundColor: '#f9f9f9',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ) : (
                          <DraggableHeader key={header.id} header={header} index={index} />
                        ),
                      )}
                    </tr>
                  </SortableContext>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => {
                  const rowBackgroundColor = getRowBackgroundColor(row.original);
                  return (
                    <tr 
                      key={row.id} 
                      onClick={() => onRowInteraction(row.original)} 
                      style={{ 
                        cursor: 'pointer',
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{
                            fontSize: '12px',
                            width: `${cell.column.getSize()}px`,
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            padding: '0px',
                            borderBottom: '1px solid #ccc',
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
      {pageSize !== 'todos' && onRenderPagination?.()}
    </>
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
  const saved = localStorage.getItem('clients_pageSize');
  if (saved === 'todos') {
    return 'todos';
  }
  // Si no hay nada guardado o no es un número válido, usar 'todos' por defecto
  return saved && !isNaN(saved) ? Number(saved) : 'todos';
});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState(''); // Filtro de estado aplicado
  const [filterTipo, setFilterTipo] = useState(''); // Filtro de tipo aplicado
  const [filtersT, setFiltersT] = useState({ // Filtros temporales (selects)
    estado: '',
    tipo: '',
  });
  const [showFilterModal, setShowFilterModal] = useState(false); // Modal de filtros
  const [totalPages, setTotalPages] = useState(1);
  const [title, setTitle] = useState('');
  const id = useRef('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null); //seleccion del registro unico
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [tableTopPosition, setTableTopPosition] = useState(0);
  const [photo, setPhoto] = useState('');

  const [selectedRows, setSelectedRows] = useState([]); //los checkbox
  const [isLoading, setIsLoading] = useState(true);
  const [servicesActive, setServicesActive] = useState([]);
  const navigateTo = useNavigate();
  const hasRestoredSelection = useRef(false);

  useEffect(() => {
    const table = document.querySelector('.table-container'); // Clase de contenedor de la tabla
    if (table) {
      const rect = table.getBoundingClientRect();
      setTableTopPosition(rect.top);
    }
  }, []);

  const getRows = async () => {
    try {
      if (!debouncedSearchTerm) {
        setIsLoading(true);
      }

      const normalizedSearchTerm = debouncedSearchTerm;

      // Construir URL con filtros
      let url = `clients?is_deleted=0`;
      if (normalizedSearchTerm) {
        url += `&searchTerm=${normalizedSearchTerm}`;
      }
      if (filterEstado) {
        url += `&estado=${filterEstado}`;
      }
      if (filterTipo) {
        url += `&type=${filterTipo}`;
      }

      let response;
      if (pageSize == 'todos') {
        response = await getData(url);
      } else {
        response = await getData(`${url}&page=${currentPage}&pageSize=${pageSize}`);
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
    const handler = setTimeout(() => {
      const trimmed = searchTerm.trim();
      const isNumericInput = trimmed !== '' && /^[0-9\s]+$/.test(trimmed);
      const normalized = isNumericInput
        ? normalizePhoneForSearch(searchTerm)
        : searchTerm;
      setDebouncedSearchTerm(normalized);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    getRows();
  }, [currentPage, pageSize, filterEstado, filterTipo, debouncedSearchTerm]);

  useEffect(() => {
    if (hasRestoredSelection.current) return;
    const storedRow = sessionStorage.getItem('clients_selected_row');
    if (!storedRow) return;

    const parsedRow = JSON.parse(storedRow);
    if (!parsedRow?.id) return;

    const match = rows.find((row) => row.id === parsedRow.id);
    if (match) {
      hasRestoredSelection.current = true;
      setSelectedRow(match);
      setSelectedRowId(match.id);
      fetchClientServices(match.id);
    }
  }, [rows]);

  const handleAplyFilter = () => {
    setFilterEstado(filtersT.estado);
    setFilterTipo(filtersT.tipo);
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleResetFilter = () => {
    setFiltersT({
      estado: '',
      tipo: '',
    });
    setFilterEstado('');
    setFilterTipo('');
    setCurrentPage(1);
    setShowFilterModal(false);
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

  const fetchClientServices = async (clientId) => {
    const queryParameters = new URLSearchParams();
    queryParameters.append('statu', 1);
    const order = 'service_alta-desc';

    try {
      const services = await getData(
        `client-service/all?client_id=${clientId}&${queryParameters}&order=${order}`,
      );
      setServicesActive(services || []);
    } catch (error) {
      console.error('Error al obtener servicios del cliente:', error);
      setServicesActive([]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltersT((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRowClick = async (rowData, event) => {
    if (!rowData?.id) return;
    setSelectedRow(rowData);
    setSelectedRowId(rowData.id);
    sessionStorage.setItem('clients_selected_row', JSON.stringify(rowData));
    await fetchClientServices(rowData.id);
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
    const value = event.target.value;
    if (value == 'todos') {
      setPageSize('todos');
      localStorage.setItem('clients_pageSize', 'todos'); // Guardar con clave específica
    } else {
      const numValue = Number(value);
      setPageSize(numValue); // Guardar como número
      localStorage.setItem('clients_pageSize', numValue); // Guardar con clave específica
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
            <button
              className='bg-secondary text-lg text-textWhite font-bold py-2 px-2 rounded h-8 mr-4 pt-2'
              onClick={() => setShowFilterModal(!showFilterModal)}
            >
              <FaFilter className='text-lg' />
            </button>
            
            {showFilterModal && (
              <div className='absolute top-10 left-0 bg-white border border-gray-300 rounded shadow-md p-3 z-50 space-y-2 w-48'>
                {/* Estado */}
                <div className='flex items-center space-x-2'>
                  <label htmlFor='estado' className='text-xs w-16'>
                    Estado:
                  </label>
                  <select
                    name='estado'
                    id='estado'
                    value={filtersT.estado}
                    onChange={handleFilterChange}
                    className='border border-gray-400 rounded w-full text-xs p-1'
                  >
                    <option value=''>Estado</option>
                    <option value='activo'>Activo</option>
                    <option value='inactivo'>Inactivo</option>
                    <option value='resto'>Resto</option>
                  </select>
                </div>
                
                {/* Tipo */}
                <div className='flex items-center space-x-2'>
                  <label htmlFor='tipo' className='text-xs w-16'>
                    Tipo:
                  </label>
                  <select
                    name='tipo'
                    id='tipo'
                    value={filtersT.tipo}
                    onChange={handleFilterChange}
                    className='border border-gray-400 rounded w-full text-xs p-1'
                  >
                    <option value=''>Tipo</option>
                    <option value='Cliente'>Cliente</option>
                    <option value='Posible Cliente'>Posible Cliente</option>
                  </select>
                </div>
                
                {/* Botones */}
                <div className='flex flex-row justify-between gap-2 pt-2'>
                  <button
                    type='button'
                    className='px-1 py-1 bg-gray-600 text-white rounded text-sm'
                    onClick={handleResetFilter}
                  >
                    Borrar Filtro
                  </button>
                  <button
                    type='button'
                    className='px-2 py-1 bg-green-600 text-white rounded text-sm'
                    onClick={handleAplyFilter}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className='relative'>
            <input
              type='text'
              className='w-[250px] border border-gray-600 rounded h-8 px-2 text-base pr-7' // Aumentado a text-base (16px)
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
            value={pageSize === 'todos' ? 'todos' : pageSize}
            onChange={handlePageSizeChange}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={'todos'}>Todos</option>
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
