import React from 'react';
import Select from '../../../../../components/Select';
import { FaPlusCircle, FaSearch, FaEdit, FaMinusCircle } from 'react-icons/fa';

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
  preselection,
  handleChangeStatus,
  formatDate,
  formDataAux,
}) => {
  return (
    <>
      <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center z-40'>
        <div
          className={`relative bg-white p-2 rounded shadow-lg min-h-80 ${
            modalExpanded ? 'w-4/5 lg:w-3/4' : 'w-4/5 lg:w-2/5'
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
              modalExpanded
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
                  Seleccionar Empleado
                </label>
              </div>
              <div className='col-span-2'>
                <Select
                  id='employee_id'
                  options={employees}
                  placeholder='Seleccione un empleado'
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
                  {showBtnPreselection && (
                    <>
                      {modalExpanded ? (
                        <button
                          type='button'
                          className='ml-2 border border-gray-800 text-gray-800 text-xs py-1 px-2 rounded mr-2'
                          onClick={handleModalExpanded}
                        >
                          Ocultar preselección
                        </button>
                      ) : (
                        <button
                          type='button'
                          className='ml-2 border border-gray-800 text-gray-800 text-xs py-1 px-2 rounded mr-2'
                          onClick={handleModalExpanded}
                        >
                          Mostrar preselección
                        </button>
                      )}
                    </>
                  )}
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
                  disabled={isEditingService}
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
            {modalExpanded && (
              <>
                <div className='col-span-2 border-l-2 border-gray-800 p-2'>
                  <label>Candidatos preseleccionados</label>
                  <table className='w-full divide-y divide-tableHeader mb-4 table-container2'>
                    <thead className='bg-tableHeader2'>
                      <tr>
                        <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                          Empleado
                        </th>
                        <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                          Teléfono
                        </th>
                        <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                          Estatus
                        </th>
                        <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                          Observaciones
                        </th>
                        <th>
                          <button
                            className='ml-4 border border-gray-800 text-gray-800 font-bold py-1 px-2 rounded mr-2'
                            onClick={openModalEmployee}
                          >
                            <FaSearch />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {preselection.length > 0 &&
                        preselection.map((row) => (
                          <tr>
                            <td>{row.name}</td>
                            <td>{row.phone}</td>
                            <td>
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
                                className={`px-1 py-1 border rounded text-white ${
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
                  (formDataAux.service_start &&
                    formDataAux.employee_id &&
                    !formDataAux.service_end) ||
                  formDataAux.service_end
                    ? 'bg-blue-400 text-gray-900 cursor-not-allowed' // Clases cuando está deshabilitado
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
                onClick={handleConfirm}
                disabled={
                  (formDataAux &&
                    formDataAux.service_start &&
                    formDataAux.employee_id &&
                    !formDataAux.service_end) ||
                  formDataAux.service_end
                }
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
