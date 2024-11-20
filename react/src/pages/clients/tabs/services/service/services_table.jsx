import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { getData, postData, putData } from '../../../../../api';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import Select from '../../../../../components/Select';
import Spinner from '../../../../../components/Spinner/Spinner';
import ToastNotify from '../../../../../components/toast/toast';
import '../services.css';
import {
  FaPlusCircle,
  FaSearch,
  FaEdit,
  FaMinusCircle,
  FaEye,
} from 'react-icons/fa';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../../../../components/SweetAlert/SweetAlert';
import ModalServices from './modalService';
import { Tooltip } from 'react-tooltip';
const ServicesTable = forwardRef(
  ({ id, onFormData, onGetRecordById, updateList }, ref) => {
    useImperativeHandle(ref, () => ({
      updateListService() {
        // Aquí defines la función que quieres llamar
        console.log('Actualizando lista de servicios');
        getRows();
        // Lógica para actualizar la lista de servicios
      },
    }));
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
    const [formDataAux, setFormDataAux] = useState(initialValues);
    const [formDataEnd, setFormDataEnd] = useState({
      service_end: '',
      detail_end: '',
      statu: false,
      client_statu_reason_id: '',
    });
    const [services, setServices] = useState([]);
    const [servicesList, setServicesList] = useState([]);
    const [optionsServices, setOptionsServices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loadingCount, setLoadingCount] = useState(2);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenModalService, setIsOpenModalService] = useState(false);
    const [isOpenModalConfirm, setIsOpenModalConfirm] = useState(false);

    const loading = loadingCount > 0;
    const [modalExpanded, setModalExpanded] = useState(false);
    const [showBtnPreselection, setShowBtnPreselection] = useState(false);
    const [isOpenModalEmployee, setIsOpenModalEmployee] = useState(false);
    const [isOpenModalObservation, setIsOpenModalObservation] = useState(false);
    const [isOpenModalServiceEnd, setIsOpenModalServiceEnd] = useState(false);
    const [activeService, setActiveService] = useState(true);
    const [employeePreselection, setEmployeePreselection] = useState([]);
    const [fieldFilters, setFieldFilters] = useState([]);
    const [applyFilters, setApplyFilters] = useState([]);

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
    const [clientReason, setClientReason] = useState([]);
    const sweetAlert = ConfirmSweetAlert({
      title: 'Servicio',
      text: '¿Esta seguro que desea procesar el servicio?',
      icon: 'question',
    });

    const textRef = useRef('');
    const serviceEndConfirm = ConfirmSweetAlert({
      title: 'Finalizar Servicio',
      text: textRef.current,
      icon: 'question',
    });
    const serviceIdRef = useRef('');
    const employeeRef = useRef('');
    const observationRef = useRef('');
    const serviceEndRef = useRef(false);
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
          const patologyIds = onFormData.clients_patologies
            .map((cp) => cp.patology_id) // Extrae directamente los patology_id
            .join(','); // Une los patology_id en una cadena separada por comas

          console.log('patologias', patologyIds); // Esto imprimirá algo como "1,3,4"

          const optionEmployees = await getData(
            `employees/getBySearch?patologies=${patologyIds}`,
          );

          if (optionEmployees) {
            console.log('optionEmployees', optionEmployees);
            setEmployeePreselection(optionEmployees);
            let options = [{ value: 0, label: 'Sin asignar' }];
            options = options.concat(
              optionEmployees.map((item) => ({
                value: item.id,
                label: item.full_name,
              })),
            );
            setEmployees(options);
          }
          const responseReason = await getData(
            `client-statu-reason/all?order=${order}`,
          );

          if (responseReason) {
            const options = responseReason.map((item, index) => ({
              value: item.id,
              label: item.name,
              key: item.id ?? `default-key-${index}`,
            }));

            setClientReason(options);
          }

          const allFilter = await getData(`employees/filter/all`);
          setFieldFilters(allFilter);
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
        const order = 'id-desc';
        const queryParameters = new URLSearchParams();
        let services = '';
        if (isActive) {
          services = await getData(
            `client-service/all?client_id=${onFormData?.id}&order=${order}`,
          );
        } else {
          queryParameters.append('statu', 1);
          services = await getData(
            `client-service/all?client_id=${onFormData?.id}&${queryParameters}&order=${order}`,
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
      } else if (field === 'service_id') {
        const selectedServiceId = newValue;

        // Filtrar empleados por el servicio seleccionado
        console.log('employeePreselection', employeePreselection);
        const filteredEmployees = employeePreselection.filter((employee) => {
          // Verificar que employee_specific y services no sean undefined
          const services = employee.employee_specific?.services;

          if (services) {
            const servicesArray = services.split(',').map(Number); // Convertir en array de números
            return servicesArray.includes(selectedServiceId);
          }

          return false; // Si no hay servicios, excluir al empleado
        });

        console.log('Empleados filtrados', filteredEmployees);

        // Generar las opciones del select
        let options = [{ value: 0, label: 'Sin asignar' }];
        options = options.concat(
          filteredEmployees.map((item) => ({
            value: item.id,
            label: item.full_name,
          })),
        );

        // Actualizar el estado con los empleados filtrados
        setEmployees(options);
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
      const queryParameters = new URLSearchParams();
      queryParameters.append('statu', 1);
      queryParameters.append('service_id', formData?.service_id);
      queryParameters.append('employee_id', formData?.employee_id);
      const services = await getData(
        `client-service/all?client_id=${onFormData?.id}&${queryParameters}`,
      );

      console.log('formData.id =>', formData.id);
      console.log('services.id =>', services);
      if (services.length > 0 && formData.id != services[0].id) {
        ToastNotify({
          message: 'El servicio ya esta activo con el mismo cuidador!',
          position: 'top-right',
          type: 'error',
        });
        return;
      }
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
        console.log('preseleccion guardar ', preselection);
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
            if (dataPreselection.length > 0) {
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
            if (dataPreselection.length > 0) {
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
      setFormDataAux([]);
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
              name: row.full_name,
              phone: row.phone,
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
        setShowBtnPreselection(false);
        console.log('row', row);
        serviceIdRef.current = row.id;
        queryParameters.append('client_id', row.client_id);
        queryParameters.append('service_id', row.service_id);
        queryParameters.append('client_service_id', row.id);
        const responsePreselection = await getData(
          `client-service-preselection/all?${queryParameters}`,
        );
        if (responsePreselection.length > 0) {
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
            name: item.employee.full_name,
            status: item.status, // Puedes ajustar esto según tus necesidades
            observation: item.observation,
          }));

          // Asignar preselectionEmployees a setPreselection
          setPreselection(preselectionEmployees);
          setActiveService(true);

          const optionEmployees = await getData(`employees/filter/all`);

          if (optionEmployees) {
            setEmployeePreselection(optionEmployees);
            let options = [{ value: 0, label: 'Sin asignar' }];
            options = options.concat(
              optionEmployees.map((item) => ({
                value: item.id,
                label: item.full_name,
              })),
            );
            setEmployees(options);
          }
        }

        if (row.employee_id == 0) {
          setShowBtnPreselection(true);
        }
      }
      setIsEditingService(true);
      setFormData(row);
      setFormDataAux(row);
      setIsOpenModalService(true);
    };

    const handleChangeStatus = (newValue, employeeId) => {
      if (isAssigned) {
        // Si hay algún item asignado y el nuevo valor no es "Asignado", no hacer nada
        return;
      }
      setPreselection((prevSelected) => {
        return prevSelected.map((item) =>
          item.employee_id === employeeId
            ? { ...item, status: newValue }
            : item,
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
    const openModalObservations = (row, serviceEnd) => {
      console.log('row=>', serviceEnd);
      employeeRef.current = row.employee_id;
      observationRef.current = row.observation;
      serviceEndRef.current = serviceEnd ? true : false;
      setIsOpenModalObservation(true);
    };
    const closeModalObservations = () => {
      setIsOpenModalObservation(false);
      employeeRef.current = '';
      observationRef.current = '';
      serviceEndRef.current = false;
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

    const handleLowService = async (origin) => {
      textRef.current = '¿Finalizar servicio contratado?';
      if (origin == 'form') {
        const responseGetClientInvoice = await getData(
          `client-invoice/all?client_id=${onFormData?.id}&client_service_id=${serviceIdRef.current}&statu=1`,
        );
        if (responseGetClientInvoice) {
          textRef.current =
            'Este servicio tiene factura asociada, si continua se dara de baja a ambos servicios, ¿Desea continuar?';
        }
      } else {
        if (selectedServices.length > 0) {
          let responseGetClientInvoice = false;
          const promises = selectedServices.map((serviceId) =>
            getData(
              `client-invoice/all?client_id=${onFormData?.id}&client_service_id=${serviceId}&statu=1`,
            ),
          );
          responseGetClientInvoice = await Promise.all(promises);
          if (responseGetClientInvoice) {
            textRef.current =
              'Algunos de los servicios contratados tienen facturas vinculadas que seran dados de baja, ¿Desea continuar?';
          }
        }
      }
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
      const { service_end, client_statu_reason_id, detail_end } = formDataEnd;

      if (!service_end || !client_statu_reason_id || !detail_end) {
        ToastNotify({
          message: 'Por favor, complete todos los campos requeridos',
          position: 'top-right',
        });
        return;
      }

      setIsOpenModalConfirm(true);
      // await serviceEndConfirm.showSweetAlert().then((result) => {
      //   const isConfirmed = result !== null && result;
      //   if (!isConfirmed) {
      //     ToastNotify({
      //       message: 'Acción cancelada por el usuario',
      //       position: 'top-right',
      //     });
      //     return;
      //   } else {
      //     handleSendServiceEnd();
      //   }
      // });
    };
    const handleSendServiceEnd = async () => {
      try {
        let responseServiceEnd = [];
        const dataToSend = { ...formDataEnd };
        if (originServiceEnd == 'form') {
          const responseGetClientInvoice = await getData(
            `client-invoice/all?client_id=${onFormData?.id}&client_service_id=${serviceIdRef.current}&statu=1`,
          );
          if (responseGetClientInvoice) {
            const invoiceUpdatePromises = responseGetClientInvoice.map(
              async (invoice) => {
                await putData(`client-invoice/${invoice.id}`, dataToSend);
              },
            );

            await Promise.all(invoiceUpdatePromises);
          }
          responseServiceEnd = await putData(
            `client-service/${serviceIdRef.current}`,
            dataToSend,
          );
        } else {
          if (selectedServices.length > 0) {
            const promises = selectedServices.map(async (serviceId) => {
              const putResponse = await putData(
                `client-service/${serviceId}`,
                dataToSend,
              );
              const responseGetClientInvoice = await getData(
                `client-invoice/all?client_id=${onFormData?.id}&client_service_id=${serviceId}&statu=1`,
              );
              const invoiceUpdatePromises = responseGetClientInvoice.map(
                async (invoice) => {
                  await putData(`client-invoice/${invoice.id}`, dataToSend);
                },
              );

              await Promise.all(invoiceUpdatePromises);

              return { putResponse, responseGetClientInvoice };
            });
            responseServiceEnd = await Promise.all(promises);
          }
        }

        if (responseServiceEnd) {
          updateList('service');
          setIsOpenModalServiceEnd(false);
          setModalExpanded(false);
          setIsOpenModalService(false);
          serviceIdRef.current = '';
          getRows();
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsOpenModalConfirm(false);
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

    const [tooltip, setTooltip] = useState({
      visible: false,
      content: '',
      position: { top: 0, left: 0 },
    });

    const showTooltip = (content, event) => {
      const { clientX: left, clientY: top } = event;
      const containerRect = event.currentTarget
        .closest('.table-container')
        .getBoundingClientRect();
      setTooltip({
        visible: true,
        content,
        position: {
          top: top - containerRect.top,
          left: left - containerRect.left,
        },
      });
    };

    const hideTooltip = () => {
      setTooltip({
        visible: false,
        content: '',
        position: { top: 0, left: 0 },
      });
    };

    const handleSelectChange = (event, field) => {
      setFormDataEnd((prevFormDataEnd) => ({
        ...prevFormDataEnd,
        [field]: event.value,
      }));
    };

    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxConfirm = () => {
      setIsChecked(!isChecked);
    };
    const closeModalConfirm = () => {
      setIsOpenModalConfirm(false);
    };

    const [filters, setFilters] = useState([
      { field: '', condition: '', value: '', logic: 'AND', logicShow: 'AND' },
    ]);

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
      newFilters[index + 1].logic =
        newFilters[index + 1].logic === 'AND' ? 'OR' : 'AND';
      newFilters[index].logicShow =
        newFilters[index].logicShow === 'AND' ? 'OR' : 'AND';
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

      filters.forEach(({ field, condition, value }, index) => {
        const operator = conditionMapping[condition.toLowerCase()];
        if (!operator || !field || !value) return;

        // Formatear el valor para LIKE si es necesario
        const formattedValue = operator === 'LIKE' ? `%${value}%` : value;

        // Obtener la lógica de unión para el filtro siguiente
        const logic = index > 0 ? filters[index].logic : ''; // No se aplica lógica al primer filtro

        // Construir el parámetro como "logic-field=operator:value"
        const key = `${logic ? `${logic}-` : ''}${field}`; // Solo añadir lógica si no es el primer filtro
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
          const optionEmployees = await getData(
            `employees/getBySearch?${query}`,
          );

          if (optionEmployees) {
            setEmployeePreselection(optionEmployees);
            let options = [{ value: 0, label: 'Sin asignar' }];
            options = options.concat(
              optionEmployees.map((item) => ({
                value: item.id,
                label: item.full_name,
              })),
            );
            setEmployees(options);
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
      console.log(queryString);
    };

    return (
      <>
        <form>
          {isLoading && <Spinner />}
          <div className='relative rounded min-h-72'>
            <div className='flex justify-between'>
              <div className='border border-gray-800 p-2'>
                Servicios Contratados
              </div>
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
                  className={`relative inline-flex items-center h-6 rounded-full w-12 mr-2 ${
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
                <label className='ml-2'>Mostrar baja </label>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <div className='border-2 border-gray-200 overflow-x-auto mt-2 table-container'>
                <table
                  className='min-w-full border-collapse'
                  style={{ borderSpacing: '10px 10px' }}
                >
                  <thead className='bg-tableHeader'>
                    <tr>
                      <th className='hidden md:table-cell'></th>
                      <th
                        className='px-3 py-1 text-left text-xs font-medium uppercase tracking-wider border'
                        style={{ width: '200px' }}
                      >
                        Servicio
                      </th>
                      <th className='px-3 py-1 text-left text-xs font-medium uppercase tracking-wider border'>
                        Trabajador
                      </th>
                      <th className='px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border'>
                        F. Alta
                      </th>
                      <th className='px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border'>
                        Activación
                      </th>
                      <th className='px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border'>
                        F. Baja
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

                        if (!row.employee || !row.service_start) {
                          backgroundColor = '#ffd27f'; // Naranja claro
                        } else if (!row.service_end) {
                          backgroundColor = '#bdffbd'; // Verde claro
                        } else if (row.service_end) {
                          backgroundColor = '#e3e1e1'; // Gris claro
                        }

                        return (
                          <tr
                            key={row.id}
                            onClick={() => handleOpenService(row)}
                            style={{ cursor: 'pointer', backgroundColor }}
                          >
                            <td
                              className='text-center hidden md:table-cell border-2'
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type='checkbox'
                                id={`selectrow-${row.id}`}
                                name={`selectrow-${row.id}`}
                                onChange={() => handleCheckboxChange(row.id)}
                                checked={selectedServices.includes(row.id)}
                                disabled={row.service_end}
                              />
                            </td>
                            <td className='px-2 whitespace-nowrap border-2'>
                              {row.service?.name}
                            </td>
                            <td className='px-2 whitespace-nowrap border-2'>
                              {row.employee?.full_name || 'Sin asignar'}
                            </td>
                            <td className='px-2 border-2'>
                              {row.service_demand &&
                                formatDate(row.service_demand)}
                            </td>
                            <td className='px-2 border-2'>
                              {row.service_start &&
                                formatDate(row.service_start)}
                            </td>
                            <td className='px-2 border-2'>
                              {row.service_end && formatDate(row.service_end)}
                            </td>
                            <td className='px-2 whitespace-nowrap border-2'>
                              <button
                                type='button'
                                data-tooltip-id='tooltip'
                                data-tooltip-content={row.offer}
                              >
                                <FaEye />
                              </button>
                            </td>
                            <td className='px-2 whitespace-nowrap border-2'>
                              <button
                                type='button'
                                data-tooltip-id='tooltip'
                                data-tooltip-content={row.observation}
                              >
                                <FaEye />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              <Tooltip id='tooltip' />
            </div>
          </div>
        </form>
        <div>
          {isOpenModalService && (
            <ModalServices
              closeModalServices={closeModalServices}
              modalExpanded={modalExpanded}
              optionsServices={optionsServices}
              formData={formData}
              handleChangeSelect={handleChangeSelect}
              handleChange={handleChange}
              handleConfirm={handleConfirm}
              handleLowService={handleLowService}
              handleModalExpanded={handleModalExpanded}
              showBtnPreselection={showBtnPreselection}
              isEditingService={isEditingService}
              activeService={activeService}
              openModalEmployee={openModalEmployee}
              openModalObservations={openModalObservations}
              employees={employees}
              preselection={preselection}
              handleChangeStatus={handleChangeStatus}
              formatDate={formatDate}
              formDataAux={formDataAux}
            />
          )}
          {isOpenModalEmployee && (
            <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center z-40'>
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
                <div className='flex items-center'>
                  <label>Busqueda de empleado</label>
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
                </div>
                <div
                  id='filter-window'
                  className='absolute top-12 left-0 bg-white p-4 rounded shadow-lg hidden'
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
                            handleFilterChange(index, 'field', e.target.value)
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
                              handleFilterChange(index, 'value', e.target.value)
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
                          // Mostrar input de texto
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
                      Cancelar
                    </button>
                    <button
                      className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                      onClick={handleApplyFilters}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
                <div className='table-responsive overflow-x-auto h-56'>
                  <table className='w-full divide-y divide-tableHeader mb-4 table-container2'>
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
                            <td>{row.full_name}</td>
                            <td>{row.phone}</td>
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
            <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center z-40'>
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
                        disabled={serviceEndRef.current}
                        value={observationRef.current}
                        onChange={(e) =>
                          handleChangePreselection(e.target.value)
                        }
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
            <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center z-40'>
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
                        htmlFor='reason'
                        className='block text-sm font-medium text-secondary'
                      >
                        Motivo
                      </label>
                      <Select
                        id='client_statu_reason_id'
                        options={clientReason}
                        placeholder='Seleccione Motivo'
                        defaultValue={formDataEnd.client_statu_reason_id}
                        onChange={(event) =>
                          handleSelectChange(event, 'client_statu_reason_id')
                        }
                        isSearchable
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

          {isOpenModalConfirm && (
            <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center z-40'>
              <div
                className={`relative bg-white p-2 rounded shadow-lg min-h-60 w-1/2 md:w-2/4 lg:w-1/3`}
              >
                <button
                  className='absolute top-0 right-0 text-gray-800 text-lg'
                  onClick={closeModalConfirm}
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
                <div className={`col-span-1 md:grid md:grid-cols-1 gap-2 p-4`}>
                  <div className='col-span-1'>
                    <p className='ml-2 mt-2'>{textRef.current}</p>
                  </div>
                </div>
                <div className='col-span-1 mt-4'>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      className='form-checkbox h-5 w-5 text-blue-600'
                      checked={isChecked}
                      onChange={handleCheckboxConfirm}
                    />
                    <span className='ml-2'>
                      Se procederá con la baja de las facturas asociadas a este
                      servicio
                    </span>
                  </label>
                </div>
                <div className='flex justify-end p-4'>
                  <button
                    type='button'
                    className={`bg-gray-500 text-white font-bold py-2 px-4 text-sm rounded mr-8`}
                    onClick={closeModalConfirm}
                  >
                    Cerrar
                  </button>
                  <button
                    type='button'
                    className={`bg-red-500 text-white font-bold py-2 px-4 text-sm rounded mr-2 ${
                      !isChecked ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleSendServiceEnd}
                    disabled={!isChecked}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  },
);

export default ServicesTable;
