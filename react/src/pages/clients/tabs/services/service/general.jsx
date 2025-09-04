import React from 'react';
import Select from '../../../../../components/Select';

const ServiceGeneral = ({
  modalExpanded,
  optionsServices,
  employees,
  formData,
  formDataAux,
  isEditingService,
  handleChange,
  handleChangeSelect,
  formatDate,
  handleChangeExit,
}) => {
  return (
    <div
      className={`${
        !modalExpanded ? 'md:grid md:grid-cols-2' : 'md:grid md:grid-cols-2'
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
            Cuidador Seleccionado
          </label>
        </div>
        <div className='col-span-2'>
          <div className='flex gap-2 mt-2'>
            <div className='flex-1'>
              <input
                type='text'
                value={formData.name}
                placeholder='Pendiente de asignacion'
                disabled
                className='w-full px-3 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
            <div className='w-1/3'>
              <input
                type='text'
                placeholder='Teléfono'
                value={formData.phone ? formData.phone : ''}
                disabled
                className='w-full px-3 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
              />
            </div>
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
            value={formData.service_alta == null ? '' : formData.service_alta}
            onChange={handleChange}
            disabled={isEditingService}
            onBlur={handleChangeExit}
            className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
          />
        </div>
        <div className='col-span-1 mt-2'>
          <label
            htmlFor='service_start'
            className='block text-sm font-medium text-secondary'
          >
            Alta Cuidador/a
          </label>
        </div>
        <div className='col-span-2'>
          <input
            type='date'
            id='service_start'
            value={formData.service_start == null ? '' : formData.service_start}
            onChange={handleChange}
            onBlur={handleChangeExit}
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
    </div>
  );
};

export default ServiceGeneral;
