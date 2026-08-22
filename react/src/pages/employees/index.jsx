import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { getData, getCachedData, postData, putData } from '../../api';
import { FaFilter, FaPlusCircle, FaMinusCircle, FaUndo } from 'react-icons/fa';
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
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../components/SweetAlert/SweetAlert';
import ToastNotify from '../../components/toast/toast';
import { normalizePhoneForSearch } from '../../utils/customFormat';
import { getUserPreferences, saveUserPreferences } from '../../api/userPreferences';
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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaSort, FaSortUp, FaSortDown, FaGripVertical } from 'react-icons/fa';

const LIST_CACHE_TTL_MS = 2 * 60 * 1000;

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
            padding: '0 4px',
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
              opacity: 1,
            },
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
  setPageSize,
  onHandleViewClient = () => {},
  onSelectedRows,
  selectedRowIds = [],
  tableContainerRef,
  initialSelectedId,
}) => {
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [initialPreferencesLoaded, setInitialPreferencesLoaded] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const selectedRows = selectedRowIds;
  const [columnSizing, setColumnSizing] = useState({});
  const [columnOrder, setColumnOrder] = useState(null);

  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const preferences = await getUserPreferences('employees');
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
        setInitialPreferencesLoaded(true);
      } catch (error) {
        console.error('Error loading user preferences:', error);
        setInitialPreferencesLoaded(true);
      }
    };

    loadUserPreferences();
  }, []);

  useEffect(() => {
    if (initialPreferencesLoaded && userHasInteracted) {
      const savePreferences = async () => {
        try {
          await saveUserPreferences('employees', { 
            sorting,
            columnSizing,
            columnOrder,
            selectedRowId,
            pageSize
          });
        } catch (error) {
          console.error('Error saving table preferences:', error);
        }
      };

      const timeoutId = setTimeout(savePreferences, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [sorting, columnSizing, columnOrder, selectedRowId, pageSize, initialPreferencesLoaded, userHasInteracted]);

  useEffect(() => {
    console.log('columnSizing state changed to:', columnSizing, 'Keys:', Object.keys(columnSizing));
  }, [columnSizing]);

  useEffect(() => {
    if (!initialSelectedId) return;
    const normalized = Number(initialSelectedId);
    if (!Number.isNaN(normalized) && normalized !== selectedRowId) {
      setSelectedRowId(normalized);
    }
  }, [initialSelectedId, selectedRowId]);

  const onRowClick = (row, event) => {
    if (!row?.id) return;
    if (event?.detail > 1) return;

    setSelectedRowId(row.id);
    onRowClicked(row);
  };

  const onRowDoubleClick = (row) => {
    if (!row?.id) return;

    setSelectedRowId(row.id);
    const color = getRowBackgroundColor(row);
    onHandleViewClient(row.id, color);
  };

  const getRowBackgroundColor = (row) => {
    if (!estado_config || estado_config.length < 3) return '#ffffff';

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
      case 't':
        return tipo_config[row.type]?.color || 'gray';
      case 'n':
        return row?.level?.color ? `rgb(${row.level.color})` : 'gray';
      case 's':
        return row?.statu?.color ? `rgb(${row.statu.color})` : 'gray';
      default:
        return 'gray';
    }
  };

  // Función para manejar el cambio de selección de filas
  const handleRowSelection = (rowId) => {
    onSelectedRows((prev) => {
      if (prev.includes(rowId)) {
        return prev.filter((id) => id !== rowId);
      }
      return [...prev, rowId];
    });
  };

  const toggleAllRowsSelection = () => {
    const allIds = rows.map((row) => row.id);
    if (selectedRows.length === rows.length) {
      onSelectedRows([]);
    } else {
      onSelectedRows(allIds);
    }
  };

  const columnDefs = useMemo(
    () => {
      console.log('Building columnDefs with columnSizing:', columnSizing);
      return [
        // Columna de selección (checkbox)
        {
          header: () => (
            <input
              type='checkbox'
              checked={selectedRows.length === rows.length && rows.length > 0}
              onChange={toggleAllRowsSelection}
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
           const isSelected = selectedRows.includes(row.original.id);
          // const isSelected = row.original.id == selectedRowId;
          return (
            <input
              type='checkbox'
              checked={isSelected}
              onChange={() => handleRowSelection(row.original.id)}
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'pointer', marginLeft: '10px' }}
            />
          );
        },
      },
      // Columnas de indicadores
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
          const title = tipo_config[data.type]?.label;
          return (
            <div className='erp-indicator-cell' title={title}>
              <div
                className='erp-indicator-swatch'
                style={{ backgroundColor: getColor('t', data) }}
              />
            </div>
          );
        },
      },
      {
        header: 'N',
        id: 'indicator_n',
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
            <div className='erp-indicator-cell' title={title}>
              <div
                className='erp-indicator-swatch'
                style={{ backgroundColor: getColor('n', data) }}
              />
            </div>
          );
        },
      },
      {
        header: 'S',
        id: 'indicator_s',
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
            <div className='erp-indicator-cell' title={title}>
              <div
                className='erp-indicator-swatch'
                style={{ backgroundColor: getColor('s', data) }}
              />
            </div>
          );
        },
      },
      ...[
        { key: 'id', label: 'ID' },
        { key: 'dni', label: 'DNI' },
        { key: 'full_name', label: 'Nombre' },
        { key: 'email', label: 'Correo Electrónico' },
        { key: 'phone', label: 'Teléfono' },
        { key: 'alias', label: 'Alias' },
        { key: 'start_date', label: 'Fecha Alta' },
      ].map(({ key, label }) => {
        const calculatedSize = columnSizing[key] ?? (['full_name', 'email', 'alias'].includes(key) ? 300 : 120);
        return {
          header: label,
          accessorKey: key,
          id: key,
          size: calculatedSize,
          minSize: ['full_name', 'email', 'alias'].includes(key) ? 150 : 80,
          maxSize: ['full_name', 'email', 'alias'].includes(key) ? 600 : 250,
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
          cell: ({ row, getValue, column }) => {
            const originalValue = String(getValue() || "");
            const isAlias = column.id === 'alias'; 
            const isStartDate = column.id === 'start_date';
            
            let displayedValue = originalValue;

            // Solo recortamos si es la columna Alias
            if (isAlias) {
              const columnWidth = column.getSize();
              // Estimación: ancho de columna dividido por ~9px por carácter
              const maxChars = Math.floor(columnWidth / 8); 
              
              if (originalValue.length > maxChars) {
                displayedValue = originalValue.substring(0, Math.max(0, maxChars - 3)) + "...";
              }
            }

            if (isStartDate && originalValue) {
              const parts = originalValue.split('-');
              if (parts.length === 3) {
                displayedValue = `${parts[2]}/${parts[1]}/${parts[0]}`;
              }
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
                  whiteSpace: isAlias ? 'normal' : 'nowrap',
                  wordBreak: isAlias ? 'break-word' : 'normal',
                }}
              >
               {displayedValue}
              </div>
            );
          },
        };
      }),
    ];
  },
  [
    selectedRowId,
    columnSizing,
    estado_config,
    tipo_config,
    selectedRows,
    rows,
  ],
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
      const newOrder = arrayMove(
        table.getState().columnOrder,
        oldIndex,
        newIndex,
      );
      setUserHasInteracted(true);
      setColumnOrder(newOrder);
    }
  };

  const onRowClicked = (row) => {
    if (!row?.id) return;
    setSelectedRowId(row.id);
    onHandleRowClick(row);
    // sessionStorage.setItem('employees_selected_row', JSON.stringify(row));
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <div
            style={{
              width: 'max-content',
              minWidth: '100%',
            }}
          >
            <table
              style={{
                width: 'auto',
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
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
                      {headerGroup.headers.map((header, index) =>
                        // Las primeras 4 columnas (checkbox + 3 indicadores) no son draggables
                        index < 4 ? (
                          <th
                            key={header.id}
                            style={{
                              width: `${header.getSize()}px`,
                              padding: '4px 6px',
                              borderBottom: '1px solid #d9e1ea',
                              textAlign: 'center',
                              fontSize: '10.5px',
                              backgroundColor: '#edf2f7',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </th>
                        ) : (
                          <DraggableHeader
                            key={header.id}
                            header={header}
                            index={index}
                          />
                        ),
                      )}
                    </tr>
                  </SortableContext>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => {
                  const isSelected = row.original.id === selectedRowId;
                  const rowBgColor = isSelected
                    ? '#d1d5db'
                    : getRowBackgroundColor(row.original);
                  return (
                    <tr
                      key={row.id}
                      onClick={(event) => onRowClick(row.original, event)}
                      onDoubleClick={() => onRowDoubleClick(row.original)}
                      style={{
                        cursor: 'pointer',
                      }}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const paintFromId = ![
                          'selection',
                          'indicator_t',
                          'indicator_n',
                          'indicator_s',
                        ].includes(cell.column.id);
                        const cellBackgroundColor = paintFromId
                          ? rowBgColor
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
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
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

const Employees = () => {
  
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState('todos');

 const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  // Debounced search term to avoid firing requests on every key stroke
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  // Efecto para actualizar debouncedSearchTerm con retraso (debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchTerm.trim();
      const isNumericInput = trimmed !== '' && /^[0-9\s]+$/.test(trimmed);
      const normalizedSearchTerm = isNumericInput
        ? normalizePhoneForSearch(searchTerm)
        : searchTerm;
      setDebouncedSearchTerm(normalizedSearchTerm);
    }, 500); // Ajusta el tiempo de debounce (ms) según prefieras
    return () => clearTimeout(handler);
  }, [searchTerm]);
  const [totalPages, setTotalPages] = useState(1);
  const [title, setTitle] = useState('');
  const id = useRef('');

  
  // 2. AGREGA ESTA REFERENCIA (debajo de tus otros useRef):
  const tableContainerRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null); // seleccion del registro unico
  const [tableTopPosition, setTableTopPosition] = useState(0);
  const [photo, setPhoto] = useState('');
  const [selectedRows, setSelectedRows] = useState([]); //los checkbox
  const [isLoading, setIsLoading] = useState(true);
  const [isFilter, setIsFilter] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [advancedFilterQuery, setAdvancedFilterQuery] = useState(null);
  const [filters, setFilters] = useState([
    { field: '', condition: '', value: '', logic: 'AND', logicShow: 'AND' },
  ]);
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
  const sweetAlert = ConfirmSweetAlert({
    title: 'Inactivar cuidadores',
    text: '¿Desea inactivar los cuidadores seleccionados? Dejarán de aparecer en el listado principal.',
    icon: 'warning',
  });
  const restoreAlert = ConfirmSweetAlert({
    title: 'Restaurar cuidadores',
    text: '¿Desea restaurar los cuidadores seleccionados?',
    icon: 'question',
  });


  
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

        const responseLevels = await getCachedData('employees/level/all');
        setNiveles(responseLevels);
        const responseStatus = await getCachedData('employees/status/all');
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
      // Mostrar spinner cuando no hay término de búsqueda activo (o cuando se cargan páginas)
      if (!debouncedSearchTerm) {
        setIsLoading(true);
      }
      let response;
      // Usar el término debounced para construir la URL y evitar llamadas por cada pulsación
      let url = `employees?is_deleted=${showDeleted ? 1 : 0}&searchTerm=${debouncedSearchTerm}`;

      if (filtersT.estado) url += `&is_active=${filtersT.estado}`;
      if (filtersT.tipo) url += `&type=${filtersT.tipo}`;
      if (filtersT.nivel) url += `&level_id=${filtersT.nivel}`;
      if (filtersT.situacion) url += `&statu_id=${filtersT.situacion}`;
      if (filtersT.alias) url += `&statu_id=${filtersT.alias}`;

      if (pageSize !== 'todos') {
        url += `&page=${currentPage}&pageSize=${pageSize}`;
      } else {
        // Cuando pageSize es 'todos', usar un número grande para obtener todos los registros
        url += `&page=1&pageSize=1000`;
      }
      response = await getCachedData(url, LIST_CACHE_TTL_MS);
      console.log(response);
      const { data, meta } = response;

      setRows(data);
      setTotalPages(meta.totalPages);

      // const savedScroll = sessionStorage.getItem('employees_last_scroll');
      // if (savedScroll && tableContainerRef.current) {
      //   // Usamos requestAnimationFrame o un timeout corto para asegurar 
      //   // que el DOM ya tiene las filas renderizadas
      setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTop = 0;
        }
      }, 100);
    } catch (error) {
      console.error('Error ', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (advancedFilterQuery) return;
    try {
      getRows();
    } catch (error) {
      console.log('error =>', error);
    }
  }, [currentPage, pageSize, debouncedSearchTerm, advancedFilterQuery, showDeleted]);

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setAdvancedFilterQuery(null);
    setCurrentPage(1);
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
    if (!row?.id) return;
    setSelectedRow(row);
    setSelectedRowId(row.id);
    // sessionStorage.setItem('employees_selected_id', row.id);
    // sessionStorage.setItem('employees_selected_row', JSON.stringify(row));
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

    console.log('employee especific', row.employee_specific);

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
const handleViewClient = (clientId, color) => {
  // if (tableContainerRef.current) {
  //   sessionStorage.setItem('employees_last_scroll', tableContainerRef.current.scrollTop);
  // }
  // 2. Guardar página actual
  // sessionStorage.setItem('employees_last_page', currentPage);
  
  // 3. Guardar el ID para que siga marcado al volver
  // sessionStorage.setItem('employees_selected_id', clientId);
  navigateTo(`/employee/${clientId}`, {
    state: { color },
  });
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
    const value = event.target.value;
    if (value == 'todos') {
      setPageSize('todos');
      // localStorage.setItem('employees_pageSize', 'todos'); // Guardar con clave específica
    } else {
      const numValue = Number(value);
      setPageSize(numValue); // Guardar como número
      // localStorage.setItem('employees_pageSize', numValue); // Guardar con clave específica
    }
    setCurrentPage(1); // Reinicia a la primera página
  };
  const handleFilter = () => {
    setIsFilter(!isFilter);
  };

  const eraseFilter = () => {
    setAdvancedFilterQuery(null);
    setIsFilter(false);
    setFilters([
      { field: '', condition: '', value: '', logic: 'AND', logicShow: 'AND' },
    ]);
    getRows();
  };

  const applyFilter = async (queryString) => {
    if (!queryString) return;

    setAdvancedFilterQuery(queryString);
    setIsLoading(true);
    try {
      const data = await getData(`employees/getBySearch?${queryString}`);
      setRows(data);
      setTotalPages(1);
      setCurrentPage(1);
      setPageSize('todos');
    } catch (error) {
      console.error('Error applying advanced filter:', error);
    } finally {
      setIsLoading(false);
    }
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
          await putData(`employees/${id}`, payload);
        } catch (error) {
          console.error(`Error al actualizar el cuidador con ID ${id}:`, error);
        }
      }

      setSelectedRows([]);
      getRows();
      ToastNotify({
        message: showDeleted
          ? 'Cuidadores restaurados correctamente.'
          : 'Cuidadores inactivados correctamente.',
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
    setAdvancedFilterQuery(null);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltersT((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleAplyFilter = () => {
    setAdvancedFilterQuery(null);
    setCurrentPage(1);
    getRows();
  };
  const [shouldFetch, setShouldFetch] = useState(false);
  useEffect(() => {
    if (shouldFetch) {
      getRows();
      setShouldFetch(false); // Resetear flag
    }
  }, [shouldFetch]);

  const handleResetFilter = () => {
    setFiltersT({
      estado: '',
      tipo: '',
      nivel: '',
      situacion: '',
    });
    setCurrentPage(1);
    setShouldFetch(true); //
  };

  return (
    <div className='max-w-full mx-auto erp-list-page'>
      <div className='flex justify-between px-4 sm:px-6 erp-list-toolbar'>
        <Breadcrumbs
          items={[
            { label: 'Inicio', route: '/' },
            { label: 'Cuidadores', route: '/employees' },
          ]}
        />
        <div className='flex items-center space-x-2 erp-list-actions'>
          <div className='relative'>
            <button
              className='bg-secondary text-lg text-textWhite font-bold py-2 px-2 rounded h-8 mr-2 flex items-center justify-center'
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FaFilter className='text-lg' />
            </button>

            {isFilterOpen && (
              <div className='absolute top-10 left-0 bg-white border border-gray-300 rounded shadow-md p-3 z-50 space-y-2'>
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
                    {Object.entries(estado_config).map(([value, option]) => (
                      <option key={value} value={value}>
                        {option.label}
                      </option>
                    ))}
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
                    {Object.entries(tipo_config).map(([value, option]) => (
                      <option key={value} value={value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nivel */}
                <div className='flex items-center space-x-2'>
                  <label htmlFor='nivel' className='text-xs w-16'>
                    Nivel:
                  </label>
                  <select
                    name='nivel'
                    id='nivel'
                    value={filtersT.nivel}
                    onChange={handleFilterChange}
                    className='border border-gray-400 rounded w-full text-xs p-1'
                  >
                    <option value=''>Nivel</option>
                    {niveles.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Situación */}
                <div className='flex items-center space-x-2'>
                  <label htmlFor='situacion' className='text-xs w-16'>
                    Situación:
                  </label>
                  <select
                    name='situacion'
                    id='situacion'
                    value={filtersT.situacion}
                    onChange={handleFilterChange}
                    className='border border-gray-400 rounded w-full text-xs p-1'
                  >
                    <option value=''>Situación</option>
                    {situaciones.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botones */}
                <div className='flex flex-row justify-between gap-2 pt-2'>
                  <button
                    type='button'
                    className='px-2 py-1 bg-gray-600 text-white rounded text-sm'
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
              placeholder='Búsqueda Rápida'
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
            <option value={'todos'}>Todos</option>
          </select>
          <button
            className={`text-sm font-bold py-2 px-3 rounded h-8 ${
              showDeleted
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
            onClick={handleToggleDeletedView}
            title={showDeleted ? 'Volver al listado activo' : 'Ver registros inactivados'}
          >
            {showDeleted ? 'Ver activos' : 'Ver borrados'}
          </button>
          {!showDeleted && (
            <button
              className='bg-primary text-lg text-textWhite font-bold py-2 px-2 rounded h-8 flex items-center justify-center'
              onClick={handleFormEmployee}
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
            <button
              className='bg-secondary text-lg text-textWhite font-bold py-2 px-2 rounded h-8 flex items-center justify-center'
              onClick={handleFilter}
            >
              <FaFilter className='text-lg' />
            </button>
          )}
        </div>
      </div>
      <div className='max-w-full mx-auto bg-content shadow-md overflow-hidden sm:rounded-lg border-t-2 border-gray-400 grid grid-cols-10 gap-2 erp-list-shell'>
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
              setPageSize={setPageSize}
              onSelectedRows={setSelectedRows}
              selectedRowIds={selectedRows}
              tableContainerRef={tableContainerRef}
              initialSelectedId={null}
            />
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
                        <p className='p-1 text-blue-500'>
                          {service.client?.full_name}
                        </p>
                        <p>{formatDate(service.service_start)}</p>
                      </div>
                    </a>
                  </>
                ))}
              </div>
              <h2 className='text-center text-xs bg-topNav w-full py-1'>
                <strong>Especifico</strong>
              </h2>
              <div className='grid grid-cols-[100px_1fr] gap-x-2 items-start'>
                {/* Disponibilidad */}
                <p className='text-sm font-bold'>Disponibilidad:</p>
                <ul className='space-y-1'>
                  {selectedData.services.map((row, index) => (
                    <li key={index} className='text-xs'>
                      - {row}
                    </li>
                  ))}
                </ul>

                {/* Separador */}
                <div className='col-span-2 border-t-2 border-gray-200 my-4'></div>

                {/* Tareas */}
                <p className='text-sm font-bold'>Tareas:</p>
                <ul className='space-y-1'>
                  {selectedData.tasks.map((row, index) => (
                    <li key={index} className='text-xs'>
                      - {row}
                    </li>
                  ))}
                </ul>

                {/* Separador */}
                <div className='col-span-2 border-t-2 border-gray-200 my-4'></div>

                {/* Patologías */}
                <p className='text-sm font-bold'>Patologías:</p>
                <ul className='space-y-1'>
                  {selectedData.patologies.map((row, index) => (
                    <li key={index} className='text-xs'>
                      - {row}
                    </li>
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
                      <p className='p-1 text-blue-500'>
                        {pre.client?.full_name}
                      </p>
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
            setFilters={setFilters}
            onCloseFilter={() => setIsFilter(false)}
            onEraseFilter={eraseFilter}
            onApplyFilter={applyFilter}
            isFilterLoading={isLoading}
          />
        )}
      </div>
      {isLoading && <Spinner />}
    </div>
  );
};

export default Employees;
