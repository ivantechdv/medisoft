import React, { useEffect, useState } from 'react';
import { getData, postData, putData } from '../../api';

const Filter = ({
  filters,
  setFilters,
  onCloseFilter,
  onEraseFilter,
  onApplyFilter,
}) => {
  const [tableTopPosition, setTableTopPosition] = useState(0);
  const [selectedRow, setSelectedRow] = useState({ full_name: 'John Doe' }); // Ejemplo de datos iniciales
  const [fieldFilters, setFieldFilters] = useState([]);
  const [applyFilters, setApplyFilters] = useState([]);

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
        const allFilter = await getData(`employees/filter/all`);
        setFieldFilters(allFilter);
      } catch (error) {
        console.log('ERRR', error);
      } finally {
      }
    };
    fetchSelect();
  }, []);

  const handleClosePanel = () => {
    onCloseFilter(); // Lógica para cerrar o limpiar el panel
  };

  const handleAddFilter = () => {
    setFilters([
      ...filters,
      { field: '', condition: '', value: '', logic: 'AND', logicShow: 'AND' },
    ]);
    console.log('filters', filters);
  };
  const handleRemoveFilter = (index) => {
    // Crear una copia del array de filtros
    const updatedFilters = filters.filter((_, i) => i !== index);

    // Actualizar el estado con el array de filtros actualizado
    setFilters(updatedFilters);
  };
  const handleFilterChange = (index, field, value) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };

  const handleLogicToggle = (index) => {
    const newFilters = [...filters];
    newFilters[index].logicShow =
      newFilters[index].logicShow === 'AND' ? 'OR' : 'AND';
    newFilters[index].logic = newFilters[index].logicShow; // Aseguramos que la lógica real también cambie
    setFilters(newFilters);
  };
  const conditionMapping = {
    igual: '=',
    contiene: 'LIKE',
    mayor: '>',
    menor: '<',
  };
  const buildQueryParameters = (filters) => {
    const queryParameters = new URLSearchParams();

    filters.forEach(({ field, condition, value, logic }, index) => {
      const operator = conditionMapping[condition.toLowerCase()];
      if (!operator || !field || !value) return;

      // Formatear el valor para LIKE si es necesario
      const formattedValue = operator === 'LIKE' ? `%${value}%` : value;

      // Determinar si el filtro actual necesita compuerta lógica
      const hasNextFilter = index < filters.length - 1;
      const logicPrefix = index > 0 ? `${filters[index - 1].logic}-` : ''; // Utilizar la compuerta lógica del filtro anterior

      // Construir el parámetro como "logic-field=operator:value"
      const key = `${logicPrefix}${field}`;
      const paramValue = `${operator}:${formattedValue}`;

      queryParameters.append(key, paramValue);
    });

    return queryParameters;
  };

  useEffect(() => {
    const fetchSelect = async () => {
      try {
        let query = '';
        if (applyFilters) {
          query = applyFilters;
        }
        if (query != '') {
          const optionEmployees = await getData(
            `employees/getBySearch?${query}`,
          );
          console.log('optionEmployees', optionEmployees);

          onApplyFilter(optionEmployees);
        }
      } catch (error) {
        console.log('error', error);
      }
    };
    fetchSelect();
  }, [applyFilters]);

  const handleApplyFilters = () => {
    const queryParameters = buildQueryParameters(filters);
    const queryString = queryParameters.toString();
    setApplyFilters(queryString);
  };
  const handleCancelFilters = () => {
    setApplyFilters('');
  };

  return (
    <div
      className='fixed bg-panel border-2 border-gray-300 shadow-lg w-[600px] mb-6'
      style={{
        top: `${tableTopPosition}px`,
        right: 0,
      }}
    >
      <div className='bg-primary w-full h-full p-2'>
        <label className='text-white pt-2'>{'Filtros'}</label>
        <button
          className='absolute top-2 right-2 text-white hover:text-gray-700'
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
          maxHeight: `calc(100vh - ${tableTopPosition + 50}px)`,
        }}
      >
        {filters.map((filter, index) => {
          // Encontrar el filtro seleccionado
          console.log('filter.field_value', filter.field);
          const selectedField = fieldFilters.find((f) => {
            const fullField = f.model_relation
              ? f.model_relation + '.' + f.field_value
              : f.field_value;

            return fullField === filter.field;
          });

          // Convertir las condiciones a un array, o usar un array vacío si no hay campo seleccionado
          const conditions = selectedField
            ? selectedField.condition.split(',')
            : [];
          const relatedData = selectedField?.relatedData || [];

          console.log('relateddata', relatedData);

          return (
            <div
              key={index}
              className='grid grid-cols-6 gap-1 mb-2 items-center'
            >
              <select
                className='col-span-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                value={filter.field}
                onChange={(e) =>
                  handleFilterChange(index, 'field', e.target.value)
                }
              >
                <option value=''>Seleccionar Campo</option>
                {fieldFilters.map((field) => (
                  <option
                    key={field.id}
                    value={
                      field.model_relation
                        ? field.model_relation + '.' + field.field_value
                        : field.field_value
                    }
                  >
                    {field.field}
                  </option>
                ))}
              </select>

              <select
                className='border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                value={filter.condition}
                onChange={(e) =>
                  handleFilterChange(index, 'condition', e.target.value)
                }
              >
                <option value=''>Seleccionar Condición</option>
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>

              {selectedField?.type === 'Select' &&
              selectedField?.origin === 'Lista' ? (
                <select
                  className=' col-span-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  value={filter.value}
                  onChange={(e) =>
                    handleFilterChange(index, 'value', e.target.value)
                  }
                >
                  <option value=''>Seleccionar Opción</option>
                  <option value='1'>Sí</option>
                  <option value='0'>No</option>
                </select>
              ) : selectedField?.type === 'Select' ? (
                <select
                  className=' col-span-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  value={filter.value}
                  onChange={(e) =>
                    handleFilterChange(index, 'value', e.target.value)
                  }
                >
                  <option value=''>Seleccionar Opción</option>
                  {relatedData.map((data) => (
                    <option key={data.id} value={data.id}>
                      {data.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className='col-span-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  type='text'
                  value={filter.value}
                  onChange={(e) =>
                    handleFilterChange(index, 'value', e.target.value)
                  }
                />
              )}
              <div className='flex justify-center items-end space-x-2'>
                <button
                  onClick={() => handleLogicToggle(index)}
                  className='border border-gray-300 w-12 rounded-lg'
                >
                  {filter.logicShow}
                </button>
                <button
                  onClick={handleAddFilter}
                  className='border border-gray-300 w-8 rounded-lg'
                >
                  +
                </button>
                <button
                  onClick={() => handleRemoveFilter(index)}
                  className='border border-gray-300 w-8 rounded-lg'
                >
                  -
                </button>
              </div>
            </div>
          );
        })}
        <div className='flex justify-end mt-4'>
          <button
            className='mr-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-blue-600'
            onClick={onEraseFilter}
          >
            Borrar filtros
          </button>
          <button
            className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
            onClick={handleApplyFilters}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filter;
