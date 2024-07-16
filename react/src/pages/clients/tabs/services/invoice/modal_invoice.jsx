import React, { useState, useEffect } from 'react';
import Select from '../../../../../components/Select';
import { FaPlusCircle, FaSearch, FaEdit, FaMinusCircle } from 'react-icons/fa';
import { getData, postData, putData } from '../../../../../api';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../../../../components/SweetAlert/SweetAlert';
import ToastNotify from '../../../../../components/toast/toast';
import Draggable from 'react-draggable';
const ModalInvoices = ({
  closeModalConceptsInvoice,
  isEditingService,
  onFormData,
  setIsLoading,
  rowFormData,
  handleLowService,
  getRows,
}) => {
  const sweetAlert = ConfirmSweetAlert({
    title: 'Servicio Facturable',
    text: '¿Esta seguro que desea procesar la factura?',
    icon: 'question',
  });
  const [optionsServices, setOptionsServices] = useState([]);
  const [clientServices, setClientServices] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [optionsConcepts, setOptionsConcepts] = useState([]);
  const [services, setServices] = useState([]);
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

  useEffect(() => {
    const fetchSelect = async () => {
      try {
        const queryParameters = new URLSearchParams();

        if (!isEditingService) {
          queryParameters.append('statu', 1);
        }
        queryParameters.append('client_id', onFormData.id);
        queryParameters.append('service_start', 'true');
        const order = 'name-asc';

        const option_services = await getData(
          `client-service/all?${queryParameters}`,
        );
        console.log('client-service =>', option_services);
        setClientServices(option_services);
        if (option_services) {
          const options = option_services.map((item) => ({
            value: item.id,
            label: item.service?.name,
          }));
          setOptionsServices(options);
        }

        const option_concepts = await getData(`concepts-invoices/all?statu=1`);
        console.log('option_concepts', option_concepts);
        if (option_concepts) {
          setConcepts(option_concepts);
          const options = option_concepts.map((item) => ({
            value: item.id,
            label: item.name,
          }));
          setOptionsConcepts(options);
        }
      } catch (error) {
        console.log('ERRR', error);
      } finally {
      }
    };
    fetchSelect();
    if (rowFormData) {
      setFormData(rowFormData);
    }
  }, []);
  const calculateValues = (key, value) => {
    setFormData((prevFormData) => {
      let newFormData = { ...prevFormData, [key]: value };

      if (key === 'discount') {
        const discountAmount = (parseFloat(newFormData.pvp) * value) / 100;
        const newTotal = parseFloat(newFormData.pvp) - discountAmount;
        newFormData.total =
          newTotal > parseFloat(newFormData.pvp)
            ? parseFloat(newFormData.pvp).toFixed(2)
            : newTotal.toFixed(2);
      } else if (key === 'total') {
        const discountPercentage =
          ((parseFloat(newFormData.pvp) - value) /
            parseFloat(newFormData.pvp)) *
          100;
        newFormData.discount =
          discountPercentage < 0 ? '0.00' : discountPercentage.toFixed(2);
      } else {
        newFormData[key] = value;
      }

      return newFormData;
    });
  };

  const handleChange = (event) => {
    const { id, value, checked, type } = event.target;
    const parsedValue =
      type === 'checkbox'
        ? checked
        : id === 'discount' || id === 'total'
        ? parseFloat(value) || 0
        : value;
    calculateValues(id, parsedValue);
  };
  const handleBlur = (event) => {
    const { id, value } = event.target;
    const parsedValue =
      id === 'total' ? parseFloat(value).toFixed(2) || '0.00' : value;

    setFormData({
      ...formData,
      [id]: parsedValue,
    });

    calculateValues(id, parsedValue);
  };

  const calculateNextPaymentDate = (startDate, base, unit) => {
    const date = new Date(startDate);
    switch (base) {
      case 'Mensual':
        date.setMonth(date.getMonth() + unit);
        break;
      case 'Anual':
        date.setFullYear(date.getFullYear() + unit);
        break;
      case 'Unico':
        date;
        break;
      default:
        break;
    }

    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    console.log('Effect triggered:', {
      service_start: formData.service_start,
      base: formData.base,
      unit: formData.unit,
    });

    if (formData.service_start && formData.base) {
      const nextPaymentDate = calculateNextPaymentDate(
        formData.service_start,
        formData.base,
        formData.unit,
      );

      console.log('Next Payment Date Calculated:', nextPaymentDate);

      setFormData((prevFormData) => ({
        ...prevFormData,
        next_payment: nextPaymentDate,
      }));
    }
  }, [formData.service_start, formData.base]);

  const handleChangeSelect = (event, field) => {
    const newValue = event.value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: newValue,
    }));

    if (field === 'client_service_id') {
      const serviceEntry = clientServices.find(
        (service) => service.id == event.value,
      );

      if (serviceEntry) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          pvp: serviceEntry.service.cost.toFixed(2),
          discount: 0,
          total: serviceEntry.service.cost.toFixed(2),
          service_start: serviceEntry.service_start,
        }));
      }
    } else if (field === 'concept_invoice_id') {
      const conceptEntry = concepts.find(
        (concept) => concept.id == event.value,
      );
      if (conceptEntry) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          period: conceptEntry.payment_period.name,
          base: conceptEntry.payment_period.calculation_base,
          unit: conceptEntry.payment_period.calculation_unit,
        }));
      }
    }
  };

  const handleConfirm = async (event) => {
    event.preventDefault();

    const queryParameters = new URLSearchParams();
    queryParameters.append('statu', 1);
    queryParameters.append('concept_invoice_id', formData?.concept_invoice_id);
    queryParameters.append('client_service_id', formData?.client_service_id);
    const services = await getData(
      `client-invoice/all?client_id=${onFormData?.id}&${queryParameters}`,
    );

    console.log('formData.id =>', formData.id);
    console.log('services.id =>', services);
    if (services.length > 0 && formData.id != services[0].id) {
      ToastNotify({
        message: 'El servicio ya ha sido facturado',
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
        // let errors;
        // if (!isEditingService) {
        //   errors = validateFormData(formData);
        // } else {
        //   errors = validateFormData(formData, true);
        // }
        // if (Object.keys(errors).length > 0) {
        //   // Manejar errores de validación (puedes mostrar mensajes de error a los usuarios aquí)
        //   const errorMessages = (
        //     <ul>
        //       {errors.map((error, index) => (
        //         <li key={index}>
        //           {'=> '}
        //           {error}
        //         </li>
        //       ))}
        //     </ul>
        //   );
        //   ToastNotify({
        //     message: errorMessages,
        //     position: 'top-left',
        //     type: 'error',
        //   });
        //   return;
        // }
        handleSubmit(event);
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      let action = '';
      if (!isEditingService) {
        const dataToSend = { ...formData, client_id: 1 };
        const responseClientService = await postData(
          'client-invoice',
          dataToSend,
        );
        if (responseClientService) {
          // dataPreselection.forEach((item) => {
          //   item.client_service_id = responseClientService.id;
          // });
          // console.log('responseClientService', responseClientService);
          // if (formData.employee_id === 0) {
          //   console.log('usuarios preseleccionado =>', dataPreselection);
          //   const responseClientServicePreselection = await postData(
          //     'client-service-preselection/bulk',
          //     dataPreselection,
          //   );
          //   if (!responseClientServicePreselection) {
          //     throw new Error('Error al guardar la preselección');
          //   }
          // }
        }
        action = 'registrado';
      } else {
        const dataToSend = {
          ...formData,
        };
        const responseClientInvoice = await putData(
          `client-invoice/${formData.id}`,
          dataToSend,
        );
        if (responseClientInvoice) {
          // dataPreselection.forEach((item) => {
          //   item.client_service_id = formData.id;
          // });
          // const responseClientServicePreselection = await postData(
          //   'client-service-preselection/bulk',
          //   dataPreselection,
          // );
          // if (!responseClientServicePreselection) {
          //   throw new Error('Error al guardar la preselección');
          // }
        }
        action = 'actualizado';
      }
      closeModalConceptsInvoice(true);
      ToastNotify({
        message: `Servicio ${action} con éxito`,
        position: 'top-left',
        type: 'success',
      });
    } catch (error) {
      console.log('error =>', error);
    } finally {
      getRows();
      setIsLoading(false);
    }
  };
  return (
    <div className='fixed inset-0 bg-gray-500 bg-opacity-85 flex items-center justify-center z-40'>
      <Draggable>
        <div
          className={`relative bg-white p-2 rounded shadow-lg min-h-80 w-4/5 lg:w-1/4 max-h-screen overflow-y-auto`}
        >
          <button
            className='absolute top-0 right-0 text-gray-800 text-lg'
            onClick={closeModalConceptsInvoice}
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
                  htmlFor='concept_invoice_id'
                  className='block text-sm font-medium text-secondary'
                >
                  Conceptos
                </label>
                <Select
                  id='concept_invoice_id'
                  options={optionsConcepts}
                  placeholder='Servicios facturables'
                  defaultValue={formData.concept_invoice_id}
                  onChange={(event) =>
                    handleChangeSelect(event, 'concept_invoice_id')
                  }
                  isSearchable
                  isDisabled={isEditingService}
                />
              </div>
              <div className='mb-2'>
                <label
                  htmlFor='service_id'
                  className='block text-sm font-medium text-secondary'
                >
                  Seleccionar Servicio
                </label>
                <Select
                  id='client_service_id'
                  options={optionsServices}
                  placeholder='Seleccione un servicio'
                  defaultValue={formData.client_service_id}
                  onChange={(event) =>
                    handleChangeSelect(event, 'client_service_id')
                  }
                  isSearchable
                  isDisabled={isEditingService}
                />
              </div>
              <div className='mb-2'>
                <label
                  htmlFor='service_start'
                  className='block text-sm font-medium text-secondary'
                >
                  Alta de servicio
                </label>
                <input
                  type='date'
                  id='service_start'
                  value={
                    formData.service_start == null ? '' : formData.service_start
                  }
                  onChange={handleChange}
                  disabled={isEditingService}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
              <div className='mb-1'>
                <label
                  htmlFor='pvp'
                  className='block text-sm font-medium text-secondary'
                >
                  PVP
                </label>
                <input
                  type='text'
                  id='pvp'
                  value={formData.pvp}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                  disabled={true}
                />
              </div>
              <div className='mb-1'>
                <label
                  htmlFor='discount'
                  className='block text-sm font-medium text-secondary'
                >
                  Descuento %
                </label>
                <input
                  type='number'
                  id='discount'
                  value={formData.discount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isEditingService}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
              <div className='mb-1'>
                <label
                  htmlFor='total'
                  className='block text-sm font-medium text-secondary'
                >
                  Total PVP
                </label>
                <input
                  type='number'
                  id='total'
                  value={formData.total}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isEditingService}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
              <div className='mb-1'>
                <label
                  htmlFor='period'
                  className='block text-sm font-medium text-secondary'
                >
                  Periodo
                </label>
                <input
                  type='text'
                  id='period'
                  value={formData.period}
                  disabled={true}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
              <div className='mb-1'>
                <label
                  htmlFor='unit'
                  className='block text-sm font-medium text-secondary'
                >
                  Unidad de calculo
                </label>
                <input
                  type='text'
                  id='unit'
                  value={formData.unit}
                  disabled={true}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
              <div className='mb-1'>
                <label
                  htmlFor='next_payment'
                  className='block text-sm font-medium text-secondary'
                >
                  Proximo pago
                </label>
                <input
                  type='date'
                  id='next_payment'
                  value={formData.next_payment}
                  disabled={true}
                  className='w-full px-3 mt-1 p-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500'
                />
              </div>
            </div>
          </div>
          <div className='flex justify-between p-4'>
            <div>
              <button
                type='button'
                className='bg-red-500 text-white font-bold py-2 px-2 text-sm rounded'
                onClick={() => handleLowService('form')} // Aquí debes definir la función handleDarDeBaja
              >
                Dar de baja
              </button>
            </div>
            <div className='flex'>
              <button
                type='button'
                className='bg-gray-500 text-white font-bold py-2 px-2 text-sm rounded mr-2'
                onClick={closeModalConceptsInvoice}
              >
                Cerrar
              </button>
              <button
                type='button'
                className={`py-2 px-2 text-sm rounded font-bold bg-primary text-white hover:bg-primary-dark`}
                onClick={handleConfirm}
                disabled={isEditingService}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default ModalInvoices;
