import React, { useState, useEffect } from 'react';
import Select from '../../../../../components/Select';
import {
  FaPlusCircle,
  FaSearch,
  FaEdit,
  FaMinusCircle,
  FaCheckCircle,
} from 'react-icons/fa';

const ServicesModal = ({
  closeModalServices,
  modalExpanded,
  optionsServices,
  formData,
  handleChangeSelect,
  handleChange,
  handleConfirm,
  handleLowService,
  handleModalExpanded,
  showBtnPreselection,
  isEditingService,
  activeService,
  openModalEmployee,
  openModalObservations,
  employees,
  employeesSearch,
  allEmployees,
  preselection,
  handleChangeStatus,
  formatDate,
  formDataAux,
  handleAddPreselection,
  filters,
  handleFilterChange,
  handleLogicToggle,
  handleAddFilter,
  handleRemoveFilter,
  fieldFilters,
  handleApplyFilters,
  handleResetFilters,
}) => {
  console.log('preselection', preselection);
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
  return (
    <>
      <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center z-40'>
        <div
          className={`relative bg-white p-2 rounded shadow-lg min-h-80 ${
            !modalExpanded ? 'w-4/5 lg:w-3/4' : 'w-4/5 lg:w-2/5'
          } max-h-screen overflow-y-auto`}
        >
          <button
            className='absolute top-0 right-0 text-gray-800 text-lg'
            onClick={closeModalServices}
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
          <div
            className={`${
              !modalExpanded
                ? 'md:grid md:grid-cols-4'
                : 'md:grid md:grid-cols-2'
            } gap-2 p-2`}
          >
            <div className='col-span-2 grid grid-cols-3'>
              <div className='col-span-1'>
                <label
                  htmlFor='service_id'
                  className='block text-sm font-medium text-secondary mt-2'
                >
                  Seleccionar Servicio
                </label>
              </div>
              <div className='col-span-2'>
                <Select
                  id='service_id'
                  options={optionsServices}
                  placeholder='Seleccione un servicio'
                  defaultValue={formData.service_id}
                  onChange={(event) => handleChangeSelect(event, 'service_id')}
                  isSearchable
                  isDisabled={isEditingService}
                />
              </div>
              <div className='col-span-1'>
                <label
                  htmlFor='employee_id'
                  className='block text-sm font-medium text-secondary mt-2'
                >
                  Seleccionar Cuidador
                </label>
              </div>
              <div className='col-span-2'>
                <Select
                  id='employee_id'
                  options={employees}
                  placeholder='Seleccione un cuidador'
                  defaultValue={formData.employee_id}
                  onChange={(event) => handleChangeSelect(event, 'employee_id')}
                  isSearchable
                  isDisabled={isEditingService}
                />
              </div>
              <div className='col-span-1 mt-2'></div>
              <div className='col-span-2 mt-2'>
                <div className='flex justify-between'>
                  <label
                    htmlFor='has_offer'
                    className='block text-sm font-medium text-secondary'
                  >
                    Generar oferta?
                    <input
                      type='checkbox'
                      id='has_offer'
                      checked={formData.has_offer} // Use 'checked' instead of 'value' for checkbox
                      onChange={handleChange}
                      className='ml-2 p-1 border border-gray-300 rounded focus:outline-none focus:border-indigo-500'
                      disabled={formData.employee_id !== 0}
                    />
                  </label>
                  {/* {showBtnPreselection && (
                    <>
                      {modalExpanded ? (
                        <button
                          type='button'
                          className='ml-2 border border-gray-800 text-gray-800 text-xs py-1 px-2 rounded mr-2'
                          onClick={handleModalExpanded}
                        >
                          Ocultar
                        </button>
                      ) : (
                        <button
                          type='button'
                          className='ml-2 border border-gray-800 text-gray-800 text-xs py-1 px-2 rounded mr-2'
                          onClick={handleModalExpanded}
                        >
                          Preselección
                        </button>
                      )}
                    </>
                  )} */}
                </div>
              </div>
              <div className='col-span-1 mt-2'>
                <label
                  htmlFor='service_demand'
                  className='block text-sm font-medium text-secondary'
                >
                  Alta de servicio
                </label>
              </div>
              <div className='col-span-2'>
                <input
                  type='date'
                  id='service_alta'
                  value={
                    formData.service_alta == null ? '' : formData.service_alta
                  }
                  onChange={handleChange}
                  disabled={isEditingService}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
              <div className='col-span-1 mt-2'>
                <label
                  htmlFor='service_start'
                  className='block text-sm font-medium text-secondary'
                >
                  Activación de servicio
                </label>
              </div>
              <div className='col-span-2'>
                <input
                  type='date'
                  id='service_start'
                  value={
                    formData.service_start == null ? '' : formData.service_start
                  }
                  onChange={handleChange}
                  disabled={formDataAux.service_start != null}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
              <div className='col-span-1 mt-2'>
                <label
                  htmlFor='observation'
                  className='block text-sm font-medium text-secondary'
                >
                  Observaciones
                </label>
              </div>
              <div className='col-span-2'>
                <textarea
                  type='text'
                  rows={6}
                  id='observation'
                  value={formData.observation}
                  onChange={handleChange}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
              {formData.service_end && (
                <>
                  <div className='mb-1'>
                    <label
                      htmlFor='fecha de baja'
                      className='block text-sm text-gray-800 font-medium'
                    >
                      Fecha de Baja: {formatDate(formData.service_end)}
                    </label>
                  </div>
                  <div className='mb-1'>
                    <label
                      htmlFor='motivo'
                      className='block text-sm text-gray-800 font-medium'
                    >
                      Motivo: {formData.client_statu_reason?.name}
                    </label>
                  </div>
                  <div className='mb-1'>
                    <label
                      htmlFor='Detalles'
                      className='block text-sm text-gray-800 font-medium'
                    >
                      Detalles: {formData.detail_end}
                    </label>
                  </div>
                </>
              )}
            </div>
            {!modalExpanded && (
              <>
                <div className='col-span-2 border-l-2 border-gray-800 p-2'>
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
                          <div key={index} className='flex items-center mb-2'>
                            <select
                              className='mr-2 w-full border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                              value={filter.field}
                              onChange={(e) =>
                                handleFilterChange(
                                  index,
                                  'field',
                                  e.target.value,
                                )
                              }
                            >
                              <option value=''>Seleccionar Campo</option>
                              {fieldFilters.map((field) => (
                                <option
                                  key={field.id}
                                  value={
                                    field.model_relation
                                      ? field.model_relation +
                                        '.' +
                                        field.field_value
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
                                handleFilterChange(
                                  index,
                                  'condition',
                                  e.target.value,
                                )
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
                              // Mostrar "Sí" y "No" con valores 1 y 0
                              <select
                                className='mr-2 w-full border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                                value={filter.value}
                                onChange={(e) =>
                                  handleFilterChange(
                                    index,
                                    'value',
                                    e.target.value,
                                  )
                                }
                              >
                                <option value=''>Seleccionar Opción</option>
                                <option value='1'>Sí</option>
                                <option value='0'>No</option>
                              </select>
                            ) : selectedField?.type === 'Select' ? (
                              // Mostrar opciones basadas en relatedData
                              <select
                                className='mr-2 w-full border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                                value={filter.value}
                                onChange={(e) =>
                                  handleFilterChange(
                                    index,
                                    'value',
                                    e.target.value,
                                  )
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
                              // Mostrar input de texto
                              <input
                                className='mr-2 w-full border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                                type='text'
                                value={filter.value}
                                onChange={(e) =>
                                  handleFilterChange(
                                    index,
                                    'value',
                                    e.target.value,
                                  )
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
                        {/* <th>
                          <button
                            className='ml-4 border border-gray-800 text-gray-800 font-bold py-1 px-2 rounded mr-2'
                            onClick={openModalEmployee}
                          >
                            <FaSearch />
                          </button>
                        </th> */}
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
                                  formDataAux.service_start &&
                                  formDataAux.employee_id
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
                                  openModalObservations(
                                    row,
                                    formData.service_end,
                                  )
                                }
                              >
                                <FaEdit></FaEdit>
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <div className='flex justify-between p-4'>
            <div>
              {formDataAux.service_start && !formDataAux.service_end ? (
                <>
                  <button
                    type='button'
                    className='bg-red-500 text-white font-bold py-2 px-2 text-sm rounded'
                    onClick={() => handleLowService('form')} // Aquí debes definir la función handleDarDeBaja
                  >
                    Dar de baja
                  </button>
                </>
              ) : (
                ''
              )}
            </div>
            <div className='flex'>
              <button
                type='button'
                className='bg-gray-500 text-white font-bold py-2 px-2 text-sm rounded mr-2'
                onClick={closeModalServices}
              >
                Cerrar
              </button>
              <button
                type='button'
                className={`py-2 px-2 text-sm rounded font-bold ${
                  formDataAux.service_end
                    ? 'bg-blue-400 text-gray-900 cursor-not-allowed' // Clases cuando está deshabilitado
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
                onClick={handleConfirm}
                disabled={formDataAux.service_end}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ServicesModal;
