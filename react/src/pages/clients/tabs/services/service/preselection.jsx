import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { FaCheckCircle, FaEdit, FaEye } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
const Preselection = ({
  allEmployees,
  employeesSearch,
  handleFilterChange,
  handleLogicToggle,
  handleAddFilter,
  handleRemoveFilter,
  handleResetFilters,
  handleApplyFilters,
  filters,
  fieldFilters,
  preselection,
  formDataAux,
  isEditingService,
  handleChangeStatus,
  openModalObservations,
  formData,
  handleAddPreselection,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [btnEnabled, setBtnEnabled] = useState(false);
  const handleSearchSelect = (event, field) => {
    const newValue = event.value;
    setSelectedEmployee(newValue);
  };
  const handleAddEmployee = () => {
    const filteredEmployees = allEmployees
      .map((employee) => {
        // Retorna el empleado si el ID coincide, si no, retorna null
        return employee.id === selectedEmployee ? employee : null;
      })
      .filter((employee) => employee !== null); // Elimina los null del resultado
    handleAddPreselection(filteredEmployees);
  };
  useEffect(() => {
    if (formData.observation !== formDataAux.observation) {
      setBtnEnabled(true);
    }
  }, [formData.observation]);

  const formattedObservation = (observation) => {
    return observation
      ? observation.replace(/\n/g, '<br />')
      : 'Sin observación';
  };
  return (
    <>
      <div className='relative col-span-2 border-l-2 border-gray-800 p-2'>
        <div className='flex'>
          <label className='w-1/2 mt-2'>Buscar Cuidador</label>
          <div className='w-full'>
            <Select
              id='employee_search_id'
              options={employeesSearch}
              placeholder='Buscar un cuidador'
              onChange={(event) =>
                handleSearchSelect(event, 'employee_search_id')
              }
              isSearchable
            />
          </div>
          <button
            className='w-10 bg-primary text-white px-2 h-8 mt-1 rounded-md ml-2'
            onClick={handleAddEmployee}
          >
            <FaCheckCircle />
          </button>
          <button
            className='ml-2 p-1'
            onClick={() =>
              document
                .getElementById('filter-window')
                .classList.toggle('hidden')
            }
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
                d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 11h8M8 15h5'
              />
            </svg>
          </button>
          <div
            id='filter-window'
            className='absolute top-0 right-0 bg-white p-4 rounded shadow-lg hidden'
          >
            {filters.map((filter, index) => {
              const selectedField = fieldFilters.find((f) => {
                const fullField = f.model_relation
                  ? f.model_relation + '.' + f.field_value
                  : f.field_value;
                return fullField === filter.field;
              });

              const conditions = selectedField
                ? selectedField.condition.split(',')
                : [];
              const relatedData = selectedField?.relatedData || [];

              return (
                <div key={index} className='flex items-center mb-2'>
                  <select
                    className='mr-2 w-full border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
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
                    className='mr-2 w-full border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
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
                      className='mr-2 w-full border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
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
                      className='mr-2 w-full border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
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
                      className='mr-2 w-full border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                      type='text'
                      value={filter.value}
                      onChange={(e) =>
                        handleFilterChange(index, 'value', e.target.value)
                      }
                    />
                  )}
                  <div className='flex justify-between items-end'>
                    <button
                      className='mr-2'
                      onClick={() => handleLogicToggle(index)}
                    >
                      {filter.logicShow}
                    </button>
                    <button onClick={handleAddFilter}>+</button>
                    <button
                      className='mr-2'
                      onClick={() => handleRemoveFilter(index)}
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
                onClick={() =>
                  document
                    .getElementById('filter-window')
                    .classList.toggle('hidden')
                }
              >
                Cerrar
              </button>
              <button
                className='mr-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600'
                onClick={handleResetFilters}
              >
                Resetear
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

        <table className='w-full border border-gray-300 divide-y divide-tableHeader mb-4 table-container2'>
          <thead className='bg-tableHeader2'>
            <tr>
              <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider border border-gray-300 divide-y'>
                Cuidador
              </th>
              <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider border border-gray-300 divide-y'>
                Teléfono
              </th>
              <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider border border-gray-300 divide-y'>
                Estatus
              </th>
              <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider border border-gray-300 divide-y'>
                Observaciones
              </th>
            </tr>
          </thead>
          <tbody>
            {preselection.length > 0 &&
              preselection.map((row) => (
                <tr>
                  <td className='text-xs border border-gray-300 divide-y'>
                    {row.name}
                  </td>
                  <td className='text-xs border border-gray-300 divide-y'>
                    {row.phone}
                  </td>
                  <td className='border border-gray-300 divide-y'>
                    <select
                      value={row.status}
                      disabled={
                        formDataAux.service_start && formDataAux.employee_id
                      }
                      onChange={
                        isEditingService
                          ? (e) =>
                              handleChangeStatus(
                                e.target.value,
                                row.employee_id,
                              )
                          : null
                      }
                      className={`px-1 py-1 border rounded text-white text-xs ${
                        row.status === 'Pendiente'
                          ? 'bg-yellow-500'
                          : row.status === 'Rechazado'
                          ? 'bg-red-500'
                          : row.status === 'Asignado'
                          ? 'bg-green-500'
                          : ''
                      }`}
                    >
                      <option value='Pendiente'>Pendiente</option>
                      <option value='Rechazado'>Rechazado</option>
                      <option value='Asignado'>Asignado</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className='ml-4 border border-gray-800 text-gray-800 font-bold py-1 px-2 rounded mr-2'
                      onClick={() =>
                        openModalObservations(row, formData.service_end)
                      }
                    >
                      <FaEdit />
                    </button>
                    <button
                      type='button'
                      data-tooltip-id='tooltip'
                      data-tooltip-html={formattedObservation(row.observation)}
                      className='tooltip-button'
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            <Tooltip id='tooltip' />
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Preselection;
