import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { getCachedData, postData, putData } from '../../api';
import {
  FaFilter,
  FaPlusCircle,
  FaMinusCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUndo,
  FaGripVertical,
} from 'react-icons/fa';
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
import { getUserPreferences, saveUserPreferences } from '../../api/userPreferences';

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

const LIST_CACHE_TTL_MS = 2 * 60 * 1000;
const CLIENTS_TABLE_PREFS_KEY = 'clients_table_preferences';

const ResizableHeaderCell = ({ header }) => {
  const { getResizeHandler, column } = header;
  return (
    <th
      style={{
        width: `${column.getSize()}px`,
        padding: '4px 6px',
        borderBottom: '1px solid #d9e1ea',
        textAlign: 'center',
        fontSize: '10.5px',
        backgroundColor: '#edf2f7',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
      </div>

      {column.getCanResize() && (
        <div
          onMouseDown={getResizeHandler()}
          onTouchStart={getResizeHandler()}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            height: '100%',
            width: '4px',
            cursor: 'col-resize',
            zIndex: 1,
            userSelect: 'none',
            backgroundColor: '#fff',
            borderLeft: '2px solid #aaa',
          }}
        />
      )}
    </th>
  );
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
    padding: '4px 6px',
    borderBottom: '1px solid #d9e1ea',
    textAlign: 'center',
    fontSize: '10.5px',
    position: 'relative',
    backgroundColor: '#edf2f7',
    userSelect: 'none',
    boxSizing: 'border-box',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  };

  const getSortIcon = () => {
    if (!header.column.getCanSort()) return null;

    const sortDirection = header.column.getIsSorted();
    if (sortDirection === 'asc')
      return <FaSortUp style={{ marginLeft: 4, opacity: 0.8 }} />;
    if (sortDirection === 'desc')
      return <FaSortDown style={{ marginLeft: 4, opacity: 0.8 }} />;
    return <FaSort style={{ marginLeft: 4, opacity: 0.3 }} />;
  };

  return (
    <th ref={setNodeRef} style={style}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
          {header.column.getCanSort() && getSortIcon()}
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
          <FaGripVertical />
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
            width: '1px',
            cursor: 'col-resize',
            zIndex: 1,
            userSelect: 'none',
            backgroundColor: '#ddd',
            borderLeft: '3px solid #aaa',
            transition: 'background-color 0.4s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#aaa')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ddd')}
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
  selectedRowIds = [],
  tableContainerRef,
}) => {
  const localPreferences = useMemo(() => {
    try {
      const raw = localStorage.getItem(CLIENTS_TABLE_PREFS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }, []);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const selectedRows = selectedRowIds;
  const [sorting, setSorting] = useState(
    Array.isArray(localPreferences.sorting) ? localPreferences.sorting : [],
  );
  const [initialPreferencesLoaded, setInitialPreferencesLoaded] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  const [columnSizing, setColumnSizing] = useState(
    localPreferences.columnSizing && typeof localPreferences.columnSizing === 'object'
      ? localPreferences.columnSizing
      : {},
  );
  const [columnOrder, setColumnOrder] = useState(
    Array.isArray(localPreferences.columnOrder) ? localPreferences.columnOrder : null,
  );

  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const preferences = await getUserPreferences('clients');
        if (preferences.sorting && Array.isArray(preferences.sorting)) {
          setSorting(preferences.sorting);
        }
        if (preferences.columnSizing && typeof preferences.columnSizing === 'object') {
          setColumnSizing(preferences.columnSizing);
        }
        if (preferences.columnOrder && Array.isArray(preferences.columnOrder)) {
          setColumnOrder(preferences.columnOrder);
        }
        if (preferences.selectedRowId) {
          setSelectedRowId(preferences.selectedRowId);
        }
        if (preferences.pageSize) {
          setPageSize(preferences.pageSize);
        }
        localStorage.setItem(CLIENTS_TABLE_PREFS_KEY, JSON.stringify(preferences));
        setInitialPreferencesLoaded(true);
      } catch (error) {
        console.error('Error loading user preferences:', error);
        setInitialPreferencesLoaded(true);
      }
    };

    loadUserPreferences();
  }, []);

  useEffect(() => {
    console.log('Save effect triggered:', { 
      initialPreferencesLoaded, 
      userHasInteracted,
      columnSizing 
    });
    
    if (initialPreferencesLoaded && userHasInteracted) {
      const savePreferences = async () => {
        console.log('SAVING preferences to DB:', { 
          sorting,
          columnSizing,
          columnOrder,
          selectedRowId,
          pageSize
        });
        try {
          const preferencesToSave = {
            sorting,
            columnSizing,
            columnOrder,
            selectedRowId,
            pageSize
          };
          localStorage.setItem(CLIENTS_TABLE_PREFS_KEY, JSON.stringify(preferencesToSave));
          await saveUserPreferences('clients', preferencesToSave);
        } catch (error) {
          console.error('Error saving table preferences:', error);
        }
      };

      const timeoutId = setTimeout(savePreferences, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [sorting, columnSizing, columnOrder, selectedRowId, pageSize, initialPreferencesLoaded, userHasInteracted]);

  const clickTimer = useRef(null);

  const handleRowSelection = (rowId) => {
    onSelectedRows?.((prev) => {
      if (prev.includes(rowId)) {
        return prev.filter((id) => id !== rowId);
      }
      return [...prev, rowId];
    });
  };

  const toggleAllRowsSelection = () => {
    const allIds = rows.map((row) => row.id);
    if (selectedRows.length === rows.length) {
      onSelectedRows?.([]);
    } else {
      onSelectedRows?.(allIds);
    }
  };

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
        // sessionStorage.setItem('clients_selected_row', JSON.stringify(row));
      }, 180);
    }
  };

  const columnDefs = useMemo(
    () => [
      {
        header: () => (
          <input
            type="checkbox"
            checked={selectedRows.length === rows.length && rows.length > 0}
            onChange={toggleAllRowsSelection}
            style={{ cursor: 'pointer' }}
          />
        ),
        id: 'selection',
        size: columnSizing.selection ?? 55,
        minSize: 35,
        maxSize: 80,
        enableSorting: false,
        enableResizing: true,
        enableColumnDragging: false,
        cell: ({ row }) => {
          const isSelected = selectedRows.includes(row.original.id);
          return (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleRowSelection(row.original.id)}
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
        size: columnSizing.indicator_t ?? 28,
        minSize: 25,
        maxSize: 60,
        enableSorting: false,
        enableResizing: true,
        enableColumnDragging: false,
        cell: ({ row }) => {
          const data = row.original;
          const title = client_tipo_config[data.type]?.label;
          return (
            <div
              title={title}
              style={{
                width: 14,
                height: 14,
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
                  backgroundColor: 'transparent',
                  width: '100%',
                  height: '100%',
                  padding: '3px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '10.5px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  wordBreak: 'normal',
                }}
                title={text}
              >
                {text}
              </div>
            );
          }

          return (
            <div
              style={{
                backgroundColor: 'transparent',
                width: '100%',
                height: '100%',
                padding: '3px 8px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '10.5px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                wordBreak: 'normal',
              }}
              title={value ?? '-'}
            >
              {value ?? '-'}
            </div>
          );
        },
      })),
    ],
    [selectedRowId, columnSizing, selectedRows, rows],
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
    onSortingChange: (updater) => {
      setUserHasInteracted(true);
      setSorting(updater);
    },
    onColumnSizingChange: (updater) => {
      setUserHasInteracted(true);
      setColumnSizing(updater);
    },
    onColumnOrderChange: (updater) => {
      setUserHasInteracted(true);
      setColumnOrder(updater);
    },
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
      setUserHasInteracted(true);
      setColumnOrder(newOrder);
    }
  };

  const onRowClicked = (row) => {
    if (!row?.id) return;
    setSelectedRowId(row.id);
    onHandleRowClick(row);
  };

  // No renderizar la tabla hasta cargar preferencias de usuario.
  if (!initialPreferencesLoaded) {
    return (
      <div
        className='w-full flex items-center justify-center'
        style={{ minHeight: 220 }}
      >
        <Spinner />
      </div>
    );
  }

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
              <colgroup>
                {table.getAllLeafColumns().map((column) => (
                  <col
                    key={column.id}
                    style={{
                      width: `${column.getSize()}px`,
                    }}
                  />
                ))}
              </colgroup>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <SortableContext key={headerGroup.id} items={headerGroup.headers.map((h) => h.column.id)} strategy={verticalListSortingStrategy}>
                    <tr>
                      {headerGroup.headers.map((header, index) =>
                        index < 2 ? (
                          <ResizableHeaderCell key={header.id} header={header} />
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
                  const isSelectedRow = row.original.id === selectedRowId;
                  const rowBackgroundColor = isSelectedRow
                    ? '#d1d5db'
                    : getRowBackgroundColor(row.original);
                  return (
                    <tr 
                      key={row.id} 
                      onClick={() => onRowInteraction(row.original)} 
                      style={{ 
                        cursor: 'pointer',
                      }}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const paintFromId = !['selection', 'indicator_t'].includes(
                          cell.column.id,
                        );
                        const cellBackgroundColor = paintFromId
                          ? rowBackgroundColor
                          : 'transparent';
                        return (
                          <td
                            key={cell.id}
                            style={{
                              fontSize: '10.5px',
                              width: `${cell.column.getSize()}px`,
                              boxSizing: 'border-box',
                              overflow: 'hidden',
                              padding: '0px',
                              borderBottom: '1px solid #e8edf3',
                              backgroundColor: cellBackgroundColor,
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
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
    title: 'Inactivar clientes',
    text: '¿Desea inactivar los clientes seleccionados? Dejarán de aparecer en el listado principal.',
    icon: 'warning',
  });
  const restoreAlert = ConfirmSweetAlert({
    title: 'Restaurar clientes',
    text: '¿Desea restaurar los clientes seleccionados?',
    icon: 'question',
  });

  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState('todos');
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

  const [showDeleted, setShowDeleted] = useState(false);
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
      let url = `clients?is_deleted=${showDeleted ? 1 : 0}`;
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
        response = await getCachedData(url, LIST_CACHE_TTL_MS);
      } else {
        response = await getCachedData(
          `${url}&page=${currentPage}&pageSize=${pageSize}`,
          LIST_CACHE_TTL_MS,
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
  }, [currentPage, pageSize, filterEstado, filterTipo, debouncedSearchTerm, showDeleted]);

  useEffect(() => {
    if (hasRestoredSelection.current) return;
    // const storedRow = sessionStorage.getItem('clients_selected_row');
    // if (!storedRow) return;

    // const parsedRow = JSON.parse(storedRow);
    // if (!parsedRow?.id) return;

    // const match = rows.find((row) => row.id === parsedRow.id);
    // if (match) {
    //   hasRestoredSelection.current = true;
    //   setSelectedRow(match);
    //   setSelectedRowId(match.id);
    //   fetchClientServices(match.id);
    // }
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
    // sessionStorage.setItem('clients_selected_row', JSON.stringify(rowData));
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
      // localStorage.setItem('clients_pageSize', 'todos'); // Guardar con clave específica
    } else {
      const numValue = Number(value);
      setPageSize(numValue); // Guardar como número
      // localStorage.setItem('clients_pageSize', numValue); // Guardar con clave específica
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
      const result = await (showDeleted
        ? restoreAlert.showSweetAlert()
        : sweetAlert.showSweetAlert());
      const isConfirmed = result !== null && result;

      if (!isConfirmed) {
        ToastNotify({
          message: 'Acción cancelada por el usuario',
          position: 'top-right',
        });
        return;
      }

      const payload = showDeleted
        ? { is_deleted: 0, is_active: true }
        : { is_deleted: 1, is_active: false };

      for (const row of selectedRows) {
        const id = row;
        try {
          await putData(`clients/${id}`, payload);
        } catch (error) {
          console.error(`Error al actualizar el cliente con ID ${id}:`, error);
        }
      }

      setSelectedRows([]);
      getRows();
      ToastNotify({
        message: showDeleted
          ? 'Clientes restaurados correctamente.'
          : 'Clientes inactivados correctamente.',
        position: 'top-left',
        type: 'success',
      });
    } catch (error) {
      console.error('Error al actualizar registros:', error);
    }
  };

  const handleToggleDeletedView = () => {
    setShowDeleted((prev) => !prev);
    setSelectedRows([]);
    setCurrentPage(1);
  };
  return (
    <div className='max-w-full mx-auto erp-list-page'>
      <div className='flex justify-between px-4 sm:px-6 erp-list-toolbar'>
        <Breadcrumbs
          items={[
            { label: 'Inicio', route: '/' },
            { label: 'Clientes', route: '/Clients' },
          ]}
        />

        <div className='flex items-center space-x-2 erp-list-actions'>
          <div className='relative'>
            <button
              className='bg-secondary text-lg text-textWhite font-bold py-2 px-2 rounded h-8 mr-2 flex items-center justify-center'
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
              className='w-[250px] border border-gray-600 rounded h-8 px-2 text-base pr-7'
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
            className={`text-sm font-bold py-2 px-3 rounded h-8 ${
              showDeleted
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            } flex items-center justify-center`}
            onClick={handleToggleDeletedView}
            title={showDeleted ? 'Volver al listado activo' : 'Ver registros inactivados'}
          >
            {showDeleted ? 'Ver activos' : 'Ver borrados'}
          </button>
          {!showDeleted && (
            <button
              className='bg-primary text-lg text-textWhite font-bold py-2 px-2 rounded h-8 flex items-center justify-center'
              onClick={handleFormClient}
            >
              <FaPlusCircle className='text-lg' />
            </button>
          )}
          <button
            className={`text-sm text-white font-bold py-2 px-2 rounded h-8 ${
              showDeleted
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-500 hover:bg-red-700'
            } ${selectedRows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} flex items-center justify-center`}
            disabled={selectedRows.length === 0}
            onClick={handleDelete}
            title={showDeleted ? 'Restaurar seleccionados' : 'Inactivar seleccionados'}
          >
            {showDeleted ? (
              <FaUndo className='text-lg' />
            ) : (
              <FaMinusCircle className='text-lg' />
            )}
          </button>
          {!showDeleted && (
            <button className='bg-secondary text-lg text-textWhite font-bold py-1 px-2 rounded h-8 flex items-center justify-center'>
              <FaFilter className='text-lg' />
            </button>
          )}
        </div>
      </div>
      <div className='max-w-full mx-auto bg-content shadow-md overflow-hidden sm:rounded-lg border-t-2 border-gray-400 grid grid-cols-10 gap-2 erp-list-shell'>
        <div className={`${selectedRow ? 'col-span-8' : 'col-span-10'}`}>
          <div className='border-t border-gray-200 overflow-x-auto'>
            <div className='overflow-x-auto max-h-screen'>
              {/* Contenedor de la tabla con table-layout: fixed */}
              <MyDataTable
                rows={rows}
                onHandleRowClick={handleRowClick}
                onHandleViewClient={handleViewClient}
                onRenderPagination={renderPagination}
                currentPage={currentPage}
                pageSize={pageSize}
                onSelectedRows={setSelectedRows}
                selectedRowIds={selectedRows}
              />
            </div>
          </div>
        </div>

        {/* Modal */}
        {selectedRow && (
          <div className='col-span-2 bg-panel border-2 border-gray-300 shadow-lg h-[calc(100vh-85px)] overflow-auto erp-detail-panel'>
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
