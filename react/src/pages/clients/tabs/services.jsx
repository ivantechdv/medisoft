import React, { useState, useEffect, useRef } from 'react';
import { getData, postData, putData } from '../../../api';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import Select from '../../../components/Select';
import Spinner from '../../../components/Spinner/Spinner';
import ToastNotify from '../../../components/toast/toast';
import './services.css';
import { FaPlusCircle, FaSearch, FaEdit, FaMinusCircle } from 'react-icons/fa';
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
  const [formDataEnd, setFormDataEnd] = useState({
    service_end: '',
    detail_end: '',
    statu: false,
  });
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
  const [isOpenModalObservation, setIsOpenModalObservation] = useState(false);
  const [isOpenModalServiceEnd, setIsOpenModalServiceEnd] = useState(false);
  const [activeService, setActiveService] = useState(true);
  const [employeePreselection, setEmployeePreselection] = useState([]);
  const [preselection, setPreselection] = useState({
    employe_id: '',
    client_id: '',
    service_id: '',
    status: 'Pendiente',
    observation: '',
    client_service_id: '',
  });
  const [isEditingService, setIsEditingService] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);

  const [isActive, setIsActive] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [originServiceEnd, setOriginServiceEnd] = useState([]);
  const sweetAlert = ConfirmSweetAlert({
    title: 'Servicio',
    text: '¿Esta seguro que desea procesar el servicio?',
    icon: 'question',
  });
  const serviceIdRef = useRef('');
  const employeeRef = useRef('');
  const observationRef = useRef('');
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
          console.log('optionEmployees', optionEmployees);
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

  const getRows = async () => {
    try {
      const queryParameters = new URLSearchParams();
      let services = '';
      if (isActive) {
        services = await getData(
          `client-service/all?client_id=${onFormData?.id}`,
        );
      } else {
        queryParameters.append('statu', 1);
        services = await getData(
          `client-service/all?client_id=${onFormData?.id}&${queryParameters}`,
        );
      }
      setServicesList(services);
    } catch (error) {
      console.log('ERRR', error);
    }
  };
  useEffect(() => {
    if (onFormData) {
      getRows();
    }
  }, [onFormData, isActive]);

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

  const validateFormData = (data, update = false) => {
    const errors = [];

    if (!data.service_id) {
      errors.push('Seleccione un servicio');
    }

    if (data.employee_id === null || data.employee_id === undefined) {
      errors.push('Seleccione un empleado');
    }

    if (!data.service_demand) {
      errors.push('La fecha de alta del servicio es obligatoria');
    }
    if (update && data.employee_id !== 0) {
      if (!data.service_start) {
        errors.push('La fecha de activacion del servicio es obligatoria');
      }
    }

    return errors;
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
        let errors;
        if (!isEditingService) {
          errors = validateFormData(formData);
        } else {
          errors = validateFormData(formData, true);
        }
        if (Object.keys(errors).length > 0) {
          // Manejar errores de validación (puedes mostrar mensajes de error a los usuarios aquí)
          const errorMessages = (
            <ul>
              {errors.map((error, index) => (
                <li key={index}>
                  {'=> '}
                  {error}
                </li>
              ))}
            </ul>
          );
          ToastNotify({
            message: errorMessages,
            position: 'top-left',
            type: 'error',
          });
          setIsLoading(false);
          return;
        }
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
          observation: employee.observation,
          client_service_id: employee.client_service_id,
        };

        if (employee.id) {
          preselectionData.id = employee.id;
        }

        return preselectionData;
      });
      console.log('dataPreselection ', dataPreselection);
      //return;

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
          dataPreselection.forEach((item) => {
            item.client_service_id = responseClientService.id;
          });
          console.log('responseClientService', responseClientService);
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
          dataPreselection.forEach((item) => {
            item.client_service_id = formData.id;
          });
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
          {
            employee_id: row.id,
            name: row.name,
            status: 'Pendiente',
            observation: '',
          },
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
      console.log('row', row);
      serviceIdRef.current = row.service_id;
      queryParameters.append('client_id', row.client_id);
      queryParameters.append('service_id', row.service_id);
      queryParameters.append('client_service_id', row.id);
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
          observation: item.observation,
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
  const openModalObservations = (row) => {
    console.log('row=>', row);
    employeeRef.current = row.employee_id;
    observationRef.current = row.observation;
    setIsOpenModalObservation(true);
  };
  const closeModalObservations = () => {
    setIsOpenModalObservation(false);
    employeeRef.current = '';
    observationRef.current = '';
  };

  const handleChangePreselection = (newValue) => {
    observationRef.current = newValue;
    setPreselection((prevSelected) => {
      return prevSelected.map((item) =>
        item.employee_id === employeeRef.current
          ? { ...item, observation: newValue }
          : item,
      );
    });
  };

  const handleLowService = (origin) => {
    setOriginServiceEnd(origin);
    setIsOpenModalServiceEnd(true);
  };
  const closeModalServiceEnd = () => {
    setIsOpenModalServiceEnd(false);
  };
  const handleChangeServiceEnd = (event) => {
    const { id, value, checked, type } = event.target;
    setFormDataEnd((prevFormDataEnd) => ({
      ...prevFormDataEnd,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleServiceEnd = async () => {
    try {
      let responseServiceEnd = [];
      const dataToSend = { ...formDataEnd };
      if (originServiceEnd == 'form') {
        responseServiceEnd = await putData(
          `client-service/${serviceIdRef.current}`,
          dataToSend,
        );
      } else {
        if (selectedServices.length > 0) {
          const promises = selectedServices.map((serviceId) =>
            putData(`client-service/${serviceId}`, dataToSend),
          );
          responseServiceEnd = await Promise.all(promises);
        }
      }

      if (responseServiceEnd) {
        setIsOpenModalServiceEnd(false);
        setModalExpanded(false);
        setIsOpenModalService(false);
        serviceIdRef.current = '';
        getRows();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleSwitch = () => {
    setIsActive(!isActive);
  };

  const handleCheckboxChange = (serviceId) => {
    setSelectedServices((prevSelected) => {
      if (prevSelected.includes(serviceId)) {
        return prevSelected.filter((id) => id !== serviceId);
      } else {
        return [...prevSelected, serviceId];
      }
    });
  };
  return (
    <>
      <form>
        {(loading || isLoading) && <Spinner />}
        <div className='relative rounded min-h-[calc(100vh-235px)]'>
          <div className='flex justify-between'>
            <div>Servicios Contratados</div>
            <div className='flex space-x-2'>
              <button
                type='button'
                className='bg-primary text-lg text-white font-bold py-2 px-2 rounded h-8'
                onClick={openModalServices}
              >
                <FaPlusCircle className='text-lg' />
              </button>
              <button
                type='button'
                className={`bg-red-600 text-lg text-white font-bold py-2 px-2 rounded h-8 ${
                  !selectedServices.length > 0
                    ? 'cursor-not-allowed bg-red-300'
                    : ''
                }`}
                onClick={() => handleLowService('table')}
                disabled={!selectedServices.length > 0}
              >
                <FaMinusCircle className='text-lg' />
              </button>

              <button
                type='button'
                className={`relative inline-flex items-center h-6 rounded-full w-12 ${
                  isActive ? 'bg-primary' : 'bg-gray-300'
                }`}
                onClick={toggleSwitch}
              >
                <span
                  className={`inline-block w-6 h-6 transform rounded-full bg-white shadow-md transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
          <div className='border-2 border-gray-200 overflow-x-auto mt-2 table-container'>
            <table
              className='min-w-full border-collapse'
              style={{ borderSpacing: '10px 10px' }}
            >
              <thead className='bg-tableHeader'>
                <tr>
                  <th className='hidden md:table-cell'></th>
                  <th className='px-3 py-1 text-left text-xs font-medium uppercase tracking-wider border'>
                    Servicio Contratado
                  </th>
                  <th className='px-3 py-1 text-left text-xs font-medium uppercase tracking-wider border'>
                    Empleado
                  </th>
                  <th className='px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border'>
                    Alta Servicio
                  </th>
                  <th className='px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border'>
                    Activación Servicio
                  </th>
                  <th className='px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border'>
                    Baja Servicio
                  </th>
                  <th className='px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border'>
                    Oferta
                  </th>
                  <th className='px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border'>
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {servicesList.length > 0 &&
                  servicesList.map((row) => {
                    let backgroundColor = 'inherit';

                    if (!row.employee) {
                      backgroundColor = '#ffd27f'; // Naranja claro
                    } else if (!row.service_end) {
                      backgroundColor = '#bdffbd'; // Verde claro
                    } else if (row.service_end) {
                      backgroundColor = '#e3e1e1'; // Gris claro
                    }

                    return (
                      <tr
                        key={row.id}
                        onDoubleClick={() => handleOpenService(row)}
                        style={{ cursor: 'pointer', backgroundColor }}
                      >
                        <td className='text-center hidden md:table-cell border-2'>
                          <input
                            type='checkbox'
                            id={`selectrow-${row.id}`}
                            name={`selectrow-${row.id}`}
                            onChange={() => handleCheckboxChange(row.id)}
                            checked={selectedServices.includes(row.id)}
                            disabled={
                              !row.service_start ||
                              !row.employee ||
                              row.service_end
                            }
                          />
                        </td>
                        <td className='px-2 whitespace-nowrap border-2'>
                          {row.service?.name}
                        </td>
                        <td className='px-2 whitespace-nowrap border-2'>
                          {row.employee?.name || 'Sin asignar'}
                        </td>
                        <td className='px-2 border-2'>
                          {row.service_demand && formatDate(row.service_demand)}
                        </td>
                        <td className='px-2 border-2'>
                          {row.service_start && formatDate(row.service_start)}
                        </td>
                        <td className='px-2 border-2'>
                          {row.service_end && formatDate(row.service_end)}
                        </td>
                        <td className='px-2 whitespace-nowrap border-2'></td>
                        <td className='px-2 whitespace-nowrap border-2'>
                          {row.observation}
                        </td>
                      </tr>
                    );
                  })}
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
                </div>
                {modalExpanded && (
                  <>
                    <div className='col-span-2 border-l-2 border-gray-800 p-2'>
                      <label>Candidatos preseleccionados</label>
                      <table className='w-full divide-y divide-tableHeader mb-4 table-container'>
                        <thead className='bg-tableHeader'>
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
                                <td>
                                  <button
                                    className='ml-4 border border-gray-800 text-gray-800 font-bold py-1 px-2 rounded mr-2'
                                    onClick={() => openModalObservations(row)}
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
                  {' '}
                  {(formData.service_start &&
                    formData.employee_id &&
                    formData.service_end !== '') ||
                    (formData.service_end !== null && ( // Mostrar el botón si service_start y employee_id existen
                      <button
                        type='button'
                        className='bg-red-500 text-white font-bold py-2 px-2 text-sm rounded'
                        onClick={() => handleLowService('form')} // Aquí debes definir la función handleDarDeBaja
                      >
                        Dar de baja
                      </button>
                    ))}
                </div>
                <div className='flex'>
                  <button
                    type='button'
                    className='bg-gray-500 text-white font-bold py-2 px-2 text-sm rounded mr-2'
                    onClick={closeModalServices}
                  >
                    Cancelar
                  </button>
                  <button
                    type='button'
                    className={`py-2 px-2 text-sm rounded font-bold ${
                      formData.service_end !== '' &&
                      formData.service_end !== null
                        ? 'bg-blue-400 text-gray-900 cursor-not-allowed' // Clases cuando está deshabilitado
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                    onClick={handleConfirm}
                    disabled={
                      formData.service_end !== '' &&
                      formData.service_end !== null
                    }
                  >
                    Guardar
                  </button>
                </div>
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
                        Telefono
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
        {isOpenModalObservation && (
          <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center'>
            <div
              className={`relative bg-white p-2 rounded shadow-lg min-h-60 w-4/5 lg:w-3/5`}
            >
              <button
                className='absolute top-0 right-0 text-gray-800 text-lg'
                onClick={closeModalObservations}
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
              <div className={`col-span-1 md:grid md:grid-cols-1 gap-2 p-2`}>
                <div className='col-span-1'>
                  <div className='mb-2'>
                    <label
                      htmlFor='service_id'
                      className='block text-sm font-medium text-secondary'
                    >
                      Observaciones
                    </label>
                    <textarea
                      type='textarea'
                      rows={15}
                      id='observation'
                      value={observationRef.current}
                      onChange={(e) => handleChangePreselection(e.target.value)}
                      className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                    />
                  </div>
                </div>
              </div>
              <div className='flex justify-end p-4'>
                <button
                  type='button'
                  className='bg-green-500 text-white font-bold py-2 px-4 text-sm rounded mr-2'
                  onClick={closeModalObservations}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {isOpenModalServiceEnd && (
          <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center'>
            <div
              className={`relative bg-white p-2 rounded shadow-lg min-h-60 w-4/5 lg:w-2/5`}
            >
              <button
                className='absolute top-0 right-0 text-gray-800 text-lg'
                onClick={closeModalServiceEnd}
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
              <div className={`col-span-1 md:grid md:grid-cols-1 gap-2 p-2`}>
                <div className='col-span-1'>
                  <div className='mb-2'>
                    <label
                      htmlFor='service_end'
                      className='block text-sm font-medium text-secondary'
                    >
                      Fecha de baja
                    </label>
                    <input
                      type='date'
                      id='service_end'
                      value={formDataEnd.service_end}
                      onChange={(e) => handleChangeServiceEnd(e)}
                      className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                    />
                  </div>
                </div>
                <div className='col-span-1'>
                  <div className='mb-2'>
                    <label
                      htmlFor='service_id'
                      className='block text-sm font-medium text-secondary'
                    >
                      Detalles
                    </label>
                    <textarea
                      type='textarea'
                      rows={10}
                      id='detail_end'
                      value={formDataEnd.detail_end}
                      onChange={(e) => handleChangeServiceEnd(e)}
                      className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                    />
                  </div>
                </div>
              </div>
              <div className='flex justify-end p-4'>
                <button
                  type='button'
                  className='bg-red-500 text-white font-bold py-2 px-4 text-sm rounded mr-2'
                  onClick={handleServiceEnd}
                >
                  Finalizar Servicio
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
