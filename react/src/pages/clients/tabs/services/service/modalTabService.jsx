import React, { useState } from 'react';
import ServiceGeneral from './general';
import Preselection from './preselection';
import InvoicesTable from '../invoice/invoice_table';

const ModalTabService = ({
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
  id,
  onFormData,
  onGetRecordById,
  clientServiceId = null,
  handleChangeExit,
}) => {
  const [activeTab, setActiveTab] = useState('general');
  console.log('clientServiceId', clientServiceId);
  return (
    <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center z-40 overflow-y-auto'>
      {/* Contenedor del modal */}
      <div className='bg-white w-full max-w-4xl rounded-lg shadow-lg'>
        {/* Encabezado del modal */}
        <div className='flex justify-between items-center p-4 bg-gray-200 border-b'>
          <h2 className='text-lg font-semibold text-gray-800'>
            Servicios contratados
          </h2>
          <button
            onClick={closeModalServices}
            className='text-gray-500 hover:text-gray-700'
          >
            ✕
          </button>
        </div>

        {/* Pestañas */}
        <div className='border-b'>
          <nav className='flex'>
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 p-3 text-center ${
                activeTab === 'general'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('preseleccion')}
              className={`flex-1 p-3 text-center ${
                activeTab === 'preseleccion'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Preselección de Cuidadores
            </button>
            <button
              onClick={() => setActiveTab('servicios')}
              disabled={clientServiceId == null ? true : false}
              className={`flex-1 p-3 text-center ${
                activeTab === 'servicios'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Servicios Facturables
            </button>
          </nav>
        </div>

        {/* Contenido del modal */}
        <div className='p-6 min-h-[400px] max-h-[400px] '>
          {activeTab === 'general' && (
            <ServiceGeneral
              modalExpanded={modalExpanded}
              optionsServices={optionsServices}
              employees={employees}
              formData={formData}
              formDataAux={formDataAux}
              isEditingService={isEditingService}
              handleChange={handleChange}
              handleChangeSelect={handleChangeSelect}
              formatDate={formatDate}
              handleChangeExit={handleChangeExit}
            />
          )}
          {activeTab === 'preseleccion' && (
            <Preselection
              allEmployees={allEmployees}
              employeesSearch={employeesSearch}
              handleFilterChange={handleFilterChange}
              handleLogicToggle={handleLogicToggle}
              handleAddFilter={handleAddFilter}
              handleRemoveFilter={handleRemoveFilter}
              handleResetFilters={handleResetFilters}
              handleApplyFilters={handleApplyFilters}
              filters={filters}
              fieldFilters={fieldFilters}
              preselection={preselection}
              formDataAux={formDataAux}
              isEditingService={isEditingService}
              handleChangeStatus={handleChangeStatus}
              openModalObservations={openModalObservations}
              formData={formData}
              handleAddPreselection={handleAddPreselection}
            />
          )}
          {activeTab === 'servicios' && (
            <InvoicesTable
              id={id}
              onFormData={onFormData}
              onGetRecordById={onGetRecordById}
              clientServiceId={clientServiceId}
            />
          )}
        </div>

        {/* Botones que aparecen en todas las pestañas */}
        <div className='flex justify-between p-4'>
          <div>
            {formDataAux.service_start && !formDataAux.service_end ? (
              <button
                type='button'
                className='bg-red-500 text-white font-bold py-2 px-2 text-sm rounded'
                onClick={() => handleLowService('form')}
              >
                Dar de baja
              </button>
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
                  ? 'bg-blue-400 text-gray-900 cursor-not-allowed'
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
  );
};

export default ModalTabService;
