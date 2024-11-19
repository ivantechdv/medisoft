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
import ModalInvoices from './modal_invoice';
import { Tooltip } from 'react-tooltip';
const InvoicesTable = forwardRef(
  ({ id, onFormData, onGetRecordById, updateList }, ref) => {
    const [services, setServices] = useState([]);
    const [invoicesList, setInvoicesList] = useState([]);
    const [optionsServices, setOptionsServices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loadingCount, setLoadingCount] = useState(2);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpenModalConceptsInvoice, setIsOpenModalConceptsInvoice] =
      useState(false);
    const loading = loadingCount > 0;
    const [modalExpanded, setModalExpanded] = useState(false);
    const [isEditingService, setIsEditingService] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [originServiceEnd, setOriginServiceEnd] = useState([]);
    const [visible, setVisible] = useState(false);
    const [isOpenModalServiceEnd, setIsOpenModalServiceEnd] = useState(false);
    const [isOpenModalConfirm, setIsOpenModalConfirm] = useState(false);

    const [formDataEnd, setFormDataEnd] = useState({
      service_end: '',
      detail_end: '',
      statu: false,
      client_statu_reason_id: '',
    });
    const [clientReason, setClientReason] = useState([]);
    const initialValues = {
      client_id: '',
      client_service_id: '',
      concept_invoice_id: '',
      next_payment_date: '',
      pvp: 0,
      discount: 0,
      total: 0,
      createdAt: new Date(),
      next_payment: '',
      period: '',
      base: '',
      unit: '',
      service_start: '',
    };
    const [formData, setFormData] = useState(initialValues);

    const sweetAlert = ConfirmSweetAlert({
      title: 'Servicio',
      text: '¿Esta seguro que desea procesar el servicio?',
      icon: 'question',
    });
    const serviceEndConfirm = ConfirmSweetAlert({
      title: 'Finalizar Servicio',
      text: 'El servicio contratado de esta factura sera dado de baja, ¿Desea continuar?',
      icon: 'question',
    });
    const invoiceIdRef = useRef('');
    const serviceIdRef = useRef('');
    const observationRef = useRef('');
    const navigateTo = useNavigate();

    const getRows = async () => {
      try {
        const queryParameters = new URLSearchParams();
        let services = '';
        if (isActive) {
          services = await getData(
            `client-invoice/all?client_id=${onFormData?.id}`,
          );
        } else {
          queryParameters.append('statu', 1);
          services = await getData(
            `client-invoice/all?client_id=${onFormData?.id}&${queryParameters}`,
          );
        }
        setInvoicesList(services);
      } catch (error) {
        console.log('ERRR', error);
      }
    };
    const updateListInvoice = async () => {
      console.log('Actualizando lista de servicios facturados');
      console.log('onFormData', onFormData);
      try {
        const services = await getData(
          `client-invoice/all?client_id=${onFormData?.id}&statu=1`,
        );
        console.log('services=>', services);
        setInvoicesList(services);
      } catch (error) {
        console.error('Error actualizando la lista de servicios:', error);
      }
    };
    useImperativeHandle(ref, () => ({ updateListInvoice }));

    useEffect(() => {
      if (onFormData) {
        getRows();
      }
    }, [onFormData, isActive, updateList]);

    useEffect(() => {
      const fetchSelect = async () => {
        try {
          const order = 'name-asc';

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
        } catch (error) {
          console.log('ERRR', error);
        } finally {
          setLoadingCount((prev) => prev - 1);
        }
      };
      fetchSelect();
    }, []);

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

    const openModalServices = () => {
      setFormData(initialValues);
      setIsOpenModalConceptsInvoice(true);
      setIsEditingService(false);
    };

    const closeModalConceptsInvoice = ({ form = false }) => {
      if (form) {
        onGetRecordById(id);
      }
      setIsOpenModalConceptsInvoice(false);
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

      if (row) {
        console.log('row', row);
        invoiceIdRef.current = row.id;
        serviceIdRef.current = row.id;
      }
      setIsEditingService(true);
      setFormData(row);
      setIsOpenModalConceptsInvoice(true);
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
      const { service_end, client_statu_reason_id, detail_end } = formDataEnd;
      console.log('formatdataend', formDataEnd);

      if (!service_end || !client_statu_reason_id || !detail_end) {
        ToastNotify({
          message: 'Por favor, complete todos los campos requeridos',
          position: 'top-right',
        });
        return;
      } else {
        setIsOpenModalConfirm(true);
      }
    };

    const handleSendServiceEnd = async () => {
      try {
        let responseServiceEnd = [];
        const dataToSend = { ...formDataEnd };
        if (originServiceEnd == 'form') {
          responseServiceEnd = await putData(
            `client-invoice/${invoiceIdRef.current}`,
            dataToSend,
          );
          if (responseServiceEnd) {
            const responseInvoice = await getData(
              `client-invoice/${invoiceIdRef.current}`,
            );
            if (responseInvoice) {
              const responseClientInvoice = await getData(
                `client-invoice/all?client_service_id=${responseInvoice.client_service_id}`,
              );
              const invoiceUpdatePromises = responseClientInvoice.map(
                async (invoice) => {
                  await putData(`client-invoice/${invoice.id}`, dataToSend);
                },
              );

              await Promise.all(invoiceUpdatePromises);
              await putData(
                `client-service/${responseInvoice.client_service_id}`,
                dataToSend,
              );
            }
          }
        } else {
          if (selectedInvoices.length > 0) {
            const promises = selectedInvoices.map(async (invoiceId) => {
              // Realiza el primer PUT request
              const initialResponse = await putData(
                `client-invoice/${invoiceId}`,
                dataToSend,
              );

              if (initialResponse) {
                const responseClientInvoice = await getData(
                  `client-invoice/all?id=${invoiceId}`,
                );
                const client_service_id =
                  responseClientInvoice[0].client_service_id;

                const responseAllClientInvoice = await getData(
                  `client-invoice/all?client_service_id=${client_service_id}`,
                );

                const invoiceUpdatePromises = responseAllClientInvoice.map(
                  async (invoice) => {
                    await putData(`client-invoice/${invoice.id}`, dataToSend);
                  },
                );
                await Promise.all(invoiceUpdatePromises);
                await putData(
                  `client-service/${client_service_id}`,
                  dataToSend,
                );
              }
            });
            responseServiceEnd = await Promise.all(promises);
          }
        }

        if (responseServiceEnd) {
          updateList('invoice');
          setIsOpenModalServiceEnd(false);
          setIsOpenModalConceptsInvoice(false);
          responseInvoice;
          invoiceIdRef.current = '';
          getRows();
        }
      } catch (error) {
        console.log(error);
      } finally {
        closeModalConfirm();
        getRows();
      }
    };

    const toggleSwitch = () => {
      setIsActive(!isActive);
    };

    const handleCheckboxChange = (serviceId) => {
      setSelectedInvoices((prevSelected) => {
        if (prevSelected.includes(serviceId)) {
          return prevSelected.filter((id) => id !== serviceId);
        } else {
          return [...prevSelected, serviceId];
        }
      });
    };
    const handleSelectChange = (event, field) => {
      setFormDataEnd((prevFormDataEnd) => ({
        ...prevFormDataEnd,
        [field]: event.value,
      }));
    };

    const [isCheckedOne, setIsCheckedOne] = useState(false);

    const [isCheckedTwo, setIsCheckedTwo] = useState(false);

    const handleCheckboxConfirmOne = () => {
      setIsCheckedOne(!isCheckedOne);
    };
    const handleCheckboxConfirmTwo = () => {
      setIsCheckedTwo(!isCheckedTwo);
    };
    const closeModalConfirm = () => {
      setIsOpenModalConfirm(false);
    };
    return (
      <>
        <form>
          {isLoading && <Spinner />}
          <div className='relative rounded '>
            <div className='flex justify-between'>
              <div className='border border-gray-800 p-2'>
                Servicios Facturables
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
                    !selectedInvoices.length > 0
                      ? 'cursor-not-allowed bg-red-300'
                      : ''
                  }`}
                  onClick={() => handleLowService('table')}
                  disabled={!selectedInvoices.length > 0}
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
                      <th className='px-3 py-1 text-left text-xs font-medium uppercase tracking-wider border'>
                        Conceptos
                      </th>
                      <th className='px-3 py-1 text-left text-xs font-medium uppercase tracking-wider border'>
                        Servicio
                      </th>
                      <th className='px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border'>
                        F. Alta
                      </th>
                      <th className='px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border'>
                        F. Baja
                      </th>
                      <th className='px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border'>
                        Periodicidad
                      </th>
                      <th className='px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border'>
                        Fecha Prox. Pago
                      </th>
                      <th className='px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border'>
                        PVP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicesList.length > 0 &&
                      invoicesList.map((row) => {
                        let backgroundColor = 'inherit';

                        if (!row.service_start) {
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
                                checked={selectedInvoices.includes(row.id)}
                                disabled={row.service_end}
                              />
                            </td>
                            <td className='px-2 whitespace-nowrap border-2'>
                              {row.concepts_invoice?.name}
                            </td>
                            <td className='px-2 whitespace-nowrap border-2'>
                              {row.clients_service?.service?.name}
                            </td>
                            <td className='px-2 border-2'>
                              {row.service_start &&
                                formatDate(row.service_start)}
                            </td>
                            <td className='px-2 border-2'>
                              {row.service_end && formatDate(row.service_end)}
                            </td>
                            <td className='px-2 whitespace-nowrap border-2'>
                              {row.period}
                            </td>
                            <td className='px-2 border-2'>
                              {row.next_payment && formatDate(row.next_payment)}
                            </td>
                            <td>
                              <label
                                data-tooltip-id={'id' + row.id}
                                data-tooltip-html={
                                  'Costo: ' +
                                  row.clients_service?.service?.cost +
                                  '<br>' +
                                  'Descuento: ' +
                                  row.discount +
                                  '%<br>PVP: ' +
                                  row.total +
                                  '<br> '
                                }
                              >
                                {row.total}
                              </label>
                              <Tooltip
                                id={'id' + row.id}
                                data-tooltip-place='top'
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </form>
        {isOpenModalConceptsInvoice && (
          <ModalInvoices
            closeModalConceptsInvoice={closeModalConceptsInvoice}
            isEditingService={isEditingService}
            onFormData={onFormData}
            setIsLoading={setIsLoading}
            rowFormData={formData}
            handleLowService={handleLowService}
            getRows={getRows}
          />
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
                  <p className='ml-2 mt-2'>
                    ¿Desea dar de baja al servicio facturable seleccionado?
                  </p>
                </div>
              </div>
              <div className='col-span-1 mt-4'>
                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    className='form-checkbox h-5 w-5 text-blue-600'
                    checked={isCheckedOne}
                    onChange={handleCheckboxConfirmOne}
                  />
                  <span className='ml-2'>
                    Se procederá con la baja de los servicios contratados
                    asociadas a esta factura
                  </span>
                </label>
              </div>
              <div className='col-span-1 mt-4'>
                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    className='form-checkbox h-5 w-5 text-blue-600'
                    checked={isCheckedTwo}
                    onChange={handleCheckboxConfirmTwo}
                  />
                  <span className='ml-2'>
                    Se procederá con la baja de las facturas asociadas al
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
                    !(isCheckedOne && isCheckedTwo)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  onClick={handleSendServiceEnd}
                  disabled={!(isCheckedOne && isCheckedTwo)}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  },
);

export default InvoicesTable;
