import React, { useState, useEffect, useRef } from 'react';
import { getData, postData, putData } from '../../../api';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Select from '../../../components/Select';
import Spinner from '../../../components/Spinner/Spinner';
import ToastNotify from '../../../components/toast/toast';
import { FaPlusCircle, FaSearch } from 'react-icons/fa';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../../components/SweetAlert/SweetAlert';
const Form = ({ id, onFormData, onGetRecordById }) => {
  const initialValues = {
    id: '',
    service_id: '',
    employee_id: '',
    createdAt: new Date(),
    has_offer: false,
    offer: '',
    observation: '',
    service_start: null,
    service_end: null,
    service_demand: null,
  };
  const [formData, setFormData] = useState(initialValues);
  const [services, setServices] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [optionsServices, setOptionsServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingCount, setLoadingCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModalService, setIsOpenModalService] = useState(false);
  const loading = loadingCount > 0;
  const [modalExpanded, setModalExpanded] = useState(false);
  const [showBtnPreselection, setShowBtnPreselection] = useState(false);
  const [isOpenModalEmployee, setIsOpenModalEmployee] = useState(false);
  const [activeService, setActiveService] = useState(true);
  const [employeePreselection, setEmployeePreselection] = useState([]);
  const [preselection, setPreselection] = useState({
    employe_id: '',
    client_id: '',
    service_id: '',
    status: 'Pendiente',
  });
  const [isEditingService, setIsEditingService] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);

  const sweetAlert = ConfirmSweetAlert({
    title: 'Servicio',
    text: '¿Esta seguro que desea procesar el servicio?',
    icon: 'question',
  });

  const navigateTo = useNavigate();

  useEffect(() => {
    const fetchSelect = async () => {
      try {
        const order = 'name-asc';
        const option_services = await getData(`services/all?order=${order}`);
        setServices(option_services);
        if (option_services) {
          const options = option_services.map((item) => ({
            value: item.id,
            label: item.name,
          }));
          setOptionsServices(options);
        }
        const optionEmployees = await getData(`employees/all?order=${order}`);
        if (optionEmployees) {
          setEmployeePreselection(optionEmployees);
          let options = [{ value: 0, label: 'Sin asignar' }];
          options = options.concat(
            optionEmployees.map((item) => ({
              value: item.id,
              label: item.name,
            })),
          );
          setEmployees(options);
        }
      } catch (error) {
        console.log('ERRR', error);
      } finally {
        setLoadingCount((prev) => prev - 1);
      }
    };
    fetchSelect();
  }, []);

  useEffect(() => {
    if (onFormData) {
      const fetchRow = async () => {
        try {
          const services = await getData(
            `client-service/all?client_id=${onFormData?.id}`,
          );
          setServicesList(services);
        } catch (error) {
          console.log('ERRR', error);
        }
      };
      fetchRow();
    }
  }, [onFormData]);

  useEffect(() => {
    if (onFormData) {
      setTimeout(() => setLoadingCount((prev) => prev - 1), 500);
    }
  }, [onFormData]);

  const handleChange = (event) => {
    const { id, value, checked, type } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleChangeSelect = (event, field) => {
    const newValue = event.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: newValue,
    }));
    if (field === 'employee_id' && event.value === 0) {
      setShowBtnPreselection(true);
      setActiveService(true);
    } else if (field === 'employee_id') {
      setShowBtnPreselection(false);
      setModalExpanded(false);
      setActiveService(false);
    }
  };

  const handleModalExpanded = () => {
    setModalExpanded(!modalExpanded);
  };
  const generateOfferText = () => {
    if (onFormData && onFormData.clients_patologies) {
      // Asegúrate de mapear los objetos a sus nombres
      console.log('patologias', onFormData.clients_patologies);
      const patologiesText = onFormData.clients_patologies
        .map((patology) => patology.patology.name)
        .join(', ');
      return `Buscamos un cuidador/a con experiencia en las siguientes especialidades: ${patologiesText}.`;
    }
    return '';
  };

  const handleConfirm = async (event) => {
    event.preventDefault();
    await sweetAlert.showSweetAlert().then((result) => {
      const isConfirmed = result !== null && result;
      if (!isConfirmed) {
        ToastNotify({
          message: 'Acción cancelada por el usuario',
          position: 'top-right',
        });
        return;
      } else {
        handleSubmit(event);
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const dataPreselection = preselection.map((employee) => {
        const preselectionData = {
          employee_id: employee.employee_id,
          client_id: onFormData?.id,
          service_id: formData.service_id,
          status: employee.status,
        };

        if (employee.id) {
          preselectionData.id = employee.id;
        }

        return preselectionData;
      });

      let action = '';
      if (!isEditingService) {
        let offerText = '';
        if (formData.has_offer) {
          offerText = generateOfferText();
        }
        const { id, ...rest } = {
          ...formData,
          client_id: onFormData?.id,
          offer: offerText,
        };
        const dataToSend = rest;
        const responseClientService = await postData(
          'client-service',
          dataToSend,
        );
        if (responseClientService) {
          if (formData.employee_id === 0) {
            console.log('usuarios preseleccionado =>', dataPreselection);

            const responseClientServicePreselection = await postData(
              'client-service-preselection/bulk',
              dataPreselection,
            );
            if (!responseClientServicePreselection) {
              throw new Error('Error al guardar la preselección');
            }
          }
        }
        action = 'registrado';
      } else {
        const dataToSend = {
          ...formData,
        };
        const responseClientService = await putData(
          `client-service/${formData.id}`,
          dataToSend,
        );
        if (responseClientService) {
          const responseClientServicePreselection = await postData(
            'client-service-preselection/bulk',
            dataPreselection,
          );
          if (!responseClientServicePreselection) {
            throw new Error('Error al guardar la preselección');
          }
        }
        action = 'actualizado';
      }
      closeModalServices();
      onGetRecordById(id);
      ToastNotify({
        message: `Servicio ${action} con éxito`,
        position: 'top-left',
        type: 'success',
      });
    } catch (error) {
      console.log('error =>', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModalServices = () => {
    setIsOpenModalService(true);
    setPreselection([]);
    setShowBtnPreselection(false);
    setFormData(initialValues);
    setIsEditingService(false);
  };

  const closeModalServices = () => {
    setModalExpanded(false);
    setIsOpenModalService(false);
  };
  const openModalEmployee = () => {
    setIsOpenModalEmployee(true);
  };
  const closeModalEmployee = () => {
    setIsOpenModalEmployee(false);
  };

  const handleEmployeeSelection = (event, row) => {
    const { value, checked } = event.target;
    setPreselection((prevSelected) => {
      if (checked) {
        return [
          ...prevSelected,
          { employee_id: row.id, name: row.name, status: 'Pendiente' },
        ];
      } else {
        return prevSelected.filter(
          (selectedRow) => selectedRow.employee_id !== row.id,
        );
      }
    });
  };
  const handleAddPreselection = () => {
    console.log('preselection => ', preselection);
    closeModalEmployee();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };
  const handleOpenService = async (row) => {
    const queryParameters = new URLSearchParams();
    setPreselection([]);

    if (row) {
      queryParameters.append('client_id', row.client_id);
      queryParameters.append('service_id', row.service_id);
      const responsePreselection = await getData(
        `client-service-preselection/all?${queryParameters}`,
      );
      if (responsePreselection) {
        console.log('response preselection', responsePreselection);
        // Mapear responsePreselection para construir los objetos necesarios
        const isAssigned = responsePreselection.some(
          (item) => item.status === 'Asignado',
        );
        setIsAssigned(isAssigned); // Almacenar en el estado

        const preselectionEmployees = responsePreselection.map((item) => ({
          id: item.id,
          employee_id: item.employee_id,
          client_id: item.client_id,
          service_id: item.service_id,
          name: item.employee.name,
          status: item.status, // Puedes ajustar esto según tus necesidades
        }));

        // Asignar preselectionEmployees a setPreselection
        setPreselection(preselectionEmployees);
        setShowBtnPreselection(true);
        setActiveService(true);
      }
    }
    setIsEditingService(true);
    setFormData(row);
    setIsOpenModalService(true);
  };

  const handleChangeStatus = (newValue, employeeId) => {
    if (isAssigned) {
      // Si hay algún item asignado y el nuevo valor no es "Asignado", no hacer nada
      return;
    }
    setPreselection((prevSelected) => {
      return prevSelected.map((item) =>
        item.employee_id === employeeId ? { ...item, status: newValue } : item,
      );
    });
    if (newValue === 'Asignado') {
      setPreselection((prevSelected) =>
        prevSelected.map((item) =>
          item.employee_id !== employeeId
            ? { ...item, status: 'Rechazado' }
            : item,
        ),
      );

      setActiveService(false);
      setFormData((prevFormData) => ({
        ...prevFormData,
        employee_id: employeeId,
        service_start: new Date().toISOString().split('T')[0],
      }));

      console.log('fecha', new Date().toISOString());
    } else {
      setActiveService(true);
      setFormData((prevFormData) => ({
        ...prevFormData,
        employee_id: 0,
        service_start: '',
      }));
    }
  };
  return (
    <>
      <form>
        {(loading || isLoading) && <Spinner />}
        <div className='relative rounded min-h-[calc(100vh-235px)]'>
          <div className='flex justify-end'>
            <div className='flex space-x-2'>
              <button
                type='button'
                className='bg-primary text-lg text-white font-bold py-2 px-2 rounded h-8'
                onClick={openModalServices}
              >
                <FaPlusCircle className='text-lg' />
              </button>
            </div>
          </div>
          <div className='border-t border-gray-200 overflow-x-auto'>
            <table className='min-w-full border-collapse'>
              <thead className='bg-tableHeader'>
                <tr>
                  <th className='hidden md:table-cell'></th>
                  <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                    Servicio Contratado
                  </th>
                  <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                    Empleado
                  </th>

                  <th className='px-2 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                    Alta Servicio
                  </th>
                  <th className='px-2 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                    Activación Servicio
                  </th>
                  <th className='px-2 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                    Baja Servicio
                  </th>
                  <th className='px-2 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                    Oferta
                  </th>
                  <th className='px-2 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {servicesList.length > 0 &&
                  servicesList.map((row) => (
                    <tr
                      key={row.id}
                      onMouseEnter={(e) =>
                        (e.target.parentNode.style.backgroundColor = '#F3F4F6')
                      }
                      onMouseLeave={(e) =>
                        (e.target.parentNode.style.backgroundColor = 'inherit')
                      }
                      onDoubleClick={() => handleOpenService(row)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className='text-center hidden md:table-cell'>
                        <input
                          type='checkbox'
                          id='selectrow'
                          name='selectrow'
                        />
                      </td>
                      <td className='px-2 whitespace-nowrap'>
                        {row.service?.name}
                      </td>
                      <td className='px-2 whitespace-nowrap'>
                        {row.employee?.name || 'Sin asignar'}
                      </td>
                      <td className='px-2'>
                        {row.service_demand && formatDate(row.service_demand)}
                      </td>
                      <td className='px-2'>
                        {row.service_start && formatDate(row.service_start)}
                      </td>
                      <td className='px-2'>
                        {row.service_end && formatDate(row.service_end)}
                      </td>
                      <td className='px-2 whitespace-nowrap'></td>
                      <td className='px-2 whitespace-nowrap'>
                        {row.observation}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
      <div>
        {isOpenModalService && (
          <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center'>
            <div
              className={`relative bg-white p-2 rounded shadow-lg min-h-80 ${
                modalExpanded ? 'w-4/5 lg:w-3/4' : 'w-4/5 lg:w-1/4'
              }`}
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
                className={`col-span-1 ${
                  modalExpanded
                    ? 'md:grid md:grid-cols-3'
                    : 'md:grid md:grid-cols-1'
                } gap-2 p-2`}
              >
                <div className='col-span-1'>
                  <div className='mb-2'>
                    <label
                      htmlFor='service_id'
                      className='block text-sm font-medium text-secondary'
                    >
                      Seleccionar Servicio
                    </label>
                    <Select
                      id='service_id'
                      options={optionsServices}
                      placeholder='Seleccione un servicio'
                      defaultValue={formData.service_id}
                      onChange={(event) =>
                        handleChangeSelect(event, 'service_id')
                      }
                      isSearchable
                      isDisabled={isEditingService}
                    />
                  </div>
                  <div className='mb-2'>
                    <label
                      htmlFor='employee_id'
                      className='block text-sm font-medium text-secondary'
                    >
                      Seleccionar Empleado
                    </label>
                    <Select
                      id='employee_id'
                      options={employees}
                      placeholder='Seleccione un empleado'
                      defaultValue={formData.employee_id}
                      onChange={(event) =>
                        handleChangeSelect(event, 'employee_id')
                      }
                      isSearchable
                      isDisabled={isEditingService}
                    />
                  </div>
                  <div className='mb-2 mt-2'>
                    <label
                      htmlFor='has_offer'
                      className='block text-sm font-medium text-secondary'
                    >
                      <div className='flex items-center'>
                        Generar oferta?
                        <input
                          type='checkbox'
                          id='has_offer'
                          checked={formData.has_offer} // Use 'checked' instead of 'value' for checkbox
                          onChange={handleChange}
                          className='ml-2 p-1 border border-gray-300 rounded focus:outline-none focus:border-indigo-500'
                          disabled={formData.employee_id !== 0}
                        />
                        {showBtnPreselection && (
                          <div>
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
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  <div className='mb-2'>
                    <label
                      htmlFor='service_demand'
                      className='block text-sm font-medium text-secondary'
                    >
                      Alta de servicio
                    </label>
                    <input
                      type='date'
                      id='service_demand'
                      value={
                        formData.service_demand == null
                          ? ''
                          : formData.service_demand
                      }
                      onChange={handleChange}
                      disabled={isEditingService}
                      className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                    />
                  </div>
                  <div className='mb-2'>
                    <label
                      htmlFor='service_start'
                      className='block text-sm font-medium text-secondary'
                    >
                      Activación de servicio
                    </label>
                    <input
                      type='date'
                      id='service_start'
                      value={
                        formData.service_start == null
                          ? ''
                          : formData.service_start
                      }
                      onChange={handleChange}
                      disabled={activeService}
                      className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                    />
                  </div>
                  <div className='mb-1'>
                    <label
                      htmlFor='observation'
                      className='block text-sm font-medium text-secondary'
                    >
                      Observaciones
                    </label>
                    <input
                      type='text'
                      id='observation'
                      value={formData.observation}
                      onChange={handleChange}
                      className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                      disabled={isEditingService}
                    />
                  </div>
                </div>
                {modalExpanded && (
                  <div className='col-span-2'>
                    <label>Candidatos preseleccionados</label>
                    <table className='w-full divide-y divide-tableHeader mb-4 table-container'>
                      <thead className='bg-tableHeader'>
                        <tr>
                          <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                            Empleado
                          </th>
                          <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                            Especialidad
                          </th>
                          <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                            Estatus
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
                              <td></td>
                              <td>
                                <select
                                  value={row.status}
                                  onChange={
                                    isEditingService
                                      ? (e) =>
                                          handleChangeStatus(
                                            e.target.value,
                                            row.employee_id,
                                          )
                                      : null
                                  }
                                  className={`px-2 py-2 border rounded text-white ${
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
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className='flex justify-end p-4'>
                <button
                  type='button'
                  className='bg-gray-500 text-white font-bold py-2 px-2 text-sm rounded mr-2'
                  onClick={closeModalServices}
                >
                  Cancelar
                </button>
                <button
                  type='button'
                  className='bg-primary text-white font-bold py-2 px-2 text-sm rounded'
                  onClick={handleConfirm}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
        {isOpenModalEmployee && (
          <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center'>
            <div
              className={`relative bg-white p-4 rounded shadow-lg min-h-80 w-4/5 lg:w-1/2`}
            >
              <button
                className='absolute top-0 right-0 text-gray-800 text-lg'
                onClick={closeModalEmployee}
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
              <label>Busqueda de empleado</label>
              <div className='table-responsive overflow-x-auto h-56'>
                <table className='w-full divide-y divide-tableHeader mb-4 table-container'>
                  <thead className='bg-tableHeader'>
                    <tr>
                      <th></th>
                      <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                        Empleado
                      </th>
                      <th className='px-3 py-1 text-left text-xs font-medium text-secondary uppercase tracking-wider'>
                        Especialidad
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeePreselection.length > 0 &&
                      employeePreselection.map((row) => (
                        <tr>
                          <td>
                            <input
                              type='checkbox'
                              name={`employeeSelected${row.id}`}
                              id={`employeeSelected${row.id}`}
                              value={row.id}
                              checked={preselection.some(
                                (selectedRow) =>
                                  selectedRow.employee_id === row.id,
                              )}
                              onClick={(e) => handleEmployeeSelection(e, row)}
                            />
                          </td>
                          <td>{row.name}</td>
                          <td></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className='flex justify-end p-4'>
                <button
                  type='button'
                  className='bg-primary text-sm text-white font-bold py-2 px-2 rounded'
                  onClick={handleAddPreselection}
                >
                  Preseleccionar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Form;
