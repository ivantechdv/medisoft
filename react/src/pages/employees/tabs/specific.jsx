import React, { useState, useEffect, useRef } from 'react';
import {
  getData,
  postData,
  putData,
  postStorage,
  getStorage,
} from '../../../api';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Select from '../../../components/Select';
import Spinner from '../../../components/Spinner/Spinner';
import ToastNotify from '../../../components/toast/toast';
import {
  FaPlusCircle,
  FaSearch,
  FaEdit,
  FaMinusCircle,
  FaEye,
} from 'react-icons/fa';
import { decode } from 'html-entities';
import { Tooltip } from 'react-tooltip';
import {
  ConfirmSweetAlert,
  InfoSweetAlert,
} from '../../../components/SweetAlert/SweetAlert';

const Form = ({
  employee_id,
  onFormData,
  onGetRecordById,
  setUnsavedChanges,
}) => {
  const sweetAlert = ConfirmSweetAlert({
    title: 'Informacion especifica',
    text: '¿Esta seguro que desea guardar la información?',
    icon: 'question',
  });

  const formatDateTime = () => {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Cambia al timezone correspondiente
    };

    const formattedDateTime = new Intl.DateTimeFormat('es-ES', options).format(
      new Date(),
    );

    const formattedDate = formattedDateTime.replace(
      /(\d+)\/(\d+)\/(\d+),\s+(\d+):(\d+):(\d+)/,
      '$3-$2-$1T$4:$5',
    );

    console.log('formattedDateTime:', formattedDateTime);
    console.log('formattedDate:', formattedDate);
    return formattedDate;
  };

  const initialValues = {
    id: '',
    services: [],
    patologies: [],
    tasks: [],
    experiences: [],
  };
  const [formData, setFormData] = useState(initialValues);
  const [employees, setEmployees] = useState([]);
  const [loadingCount, setLoadingCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState('client');
  const [gainExperiences, setGainExperiences] = useState([]);
  const [patologies, setPatologies] = useState([]);
  const [services, setServices] = useState([]);
  const [tasks, setTaks] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState([]);
  let loading = loadingCount > 0;
  const quillRef = useRef(null);
  const navigateTo = useNavigate();

  useEffect(() => {
    const fetchSelect = async () => {
      try {
        const order = 'name-asc';

        const service = await getData(
          `employees/gain-experience/all?order=${order}`,
        );
        setGainExperiences(service);
        const task = await getData(`employees/task/all?order=${order}`);
        setTaks(task);

        const patologies = await getData(`patologies/all?order=${order}`);
        setPatologies(patologies);
        const option_services = await getData(`services/all?order=${order}`);
        setServices(option_services);

        if (employee_id) {
          // Asegúrate de que `id` esté definido
          await getRecordById(employee_id);
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
    const getRecord = async () => {
      try {
        if (employee_id && patologies && services && tasks && gainExperiences) {
          // Asegúrate de que `id` esté definido
          await getRecordById(employee_id);
        }
      } catch (error) {
        console.log('ERRR', error);
      } finally {
      }
    };
    getRecord();
  }, [employee_id, patologies, services, tasks, gainExperiences]);

  const getRecordById = async (employee_id) => {
    try {
      //setIsLoading(true);
      const response = await getData(
        'employees/specific/all?employee_id=' + employee_id,
      );
      if (response.length > 0) {
        const data = response[0];

        // Convert comma-separated strings into arrays
        const servicesArray = data.services
          ? data.services.split(',').map(Number)
          : [];
        const patologiesArray = data.patologies
          ? data.patologies.split(',').map(Number)
          : [];
        const tasksArray = data.tasks ? data.tasks.split(',').map(Number) : [];
        const experiencesArray = data.experiences
          ? data.experiences.split(',').map(Number)
          : [];

        setFormData({
          ...data,
          services: servicesArray,
          patologies: patologiesArray,
          tasks: tasksArray,
          experiences: experiencesArray,
          employee_id: employee_id,
          id: response[0].id,
        });
      }
    } catch (error) {
      console.error('Error al obtener el registro por id:', error);
    } finally {
      // setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { services, patologies, tasks, experiences } = formData;

    if (
      services.length === 0 ||
      patologies.length === 0 ||
      tasks.length === 0 ||
      experiences.length === 0
    ) {
      ToastNotify({
        message: 'Por favor,  seleccione al menos una opción en cada categoría',
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
        const servicesString = services.join(',');
        const patologiesString = patologies.join(',');
        const tasksString = tasks.join(',');
        const experiencesString = experiences.join(',');

        const dataToSend = {
          services: servicesString,
          patologies: patologiesString,
          tasks: tasksString,
          experiences: experiencesString,
          employee_id: employee_id,
        };
        console.log('datatosend', dataToSend);
        handleSend(dataToSend);
      }
    });
  };

  const handleSend = async (dataToSend) => {
    setIsLoading(true);
    try {
      let message = '';

      let response = false;
      if (formData.id == '') {
        response = await postData('employees/specific', dataToSend);
      } else {
        response = await putData(
          'employees/specific/' + formData.id,
          dataToSend,
        );
      }
      if (response) {
        ToastNotify({
          message: 'Información registrada con exito!',
          position: 'top',
        });
      }
    } catch (error) {
      console.log('error =>', error);
    } finally {
      getRecordById(dataToSend.employee_id);
      setIsLoading(false);
    }
  };

  const handleSelected = (event) => {
    const { name, value, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: checked
        ? [...prevFormData[name], parseInt(value)]
        : prevFormData[name].filter((id) => id !== parseInt(value)),
    }));
  };

  return (
    <form className=''>
      {/* {(loading || isLoading) && <Spinner />} */}
      <div className=' rounded min-h-[calc(100vh-235px)]'>
        <div className='justify-end items-end absolute bottom-5 right-6 z-50'>
          <button
            type='button'
            className='bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            onClick={handleSubmit}
          >
            Guardar
          </button>
        </div>
        <div className='flex justify-between'>
          <div className='border border-gray-800 p-1 mb-2'>
            Disponibilidad horaria
          </div>
        </div>
        <div className='grid grid-cols-2 md:grid md:grid-cols-3 gap-1'>
          {services.length > 0 &&
            services.map((service) => (
              <div key={service.id} className='flex items-center'>
                <input
                  type='checkbox'
                  id={`service-${service.id}`}
                  name='services'
                  value={service.id}
                  checked={formData.services?.includes(service.id)}
                  onChange={handleSelected}
                  className='mr-2'
                />
                <label
                  htmlFor={`service-${service.id}`}
                  className='font-medium text-gray-700'
                >
                  {service.name}
                </label>
              </div>
            ))}
        </div>
        <div className='flex justify-between'>
          <div className='border border-gray-800 p-1 mb-2 mt-4'>
            Experiencia
          </div>
        </div>
        <div className='grid grid-cols-2 md:grid md:grid-cols-3 gap-1'>
          {gainExperiences.length > 0 &&
            gainExperiences.map((exp) => (
              <div key={exp.id} className='flex items-center'>
                <input
                  type='checkbox'
                  id={`exp-${exp.id}`}
                  name='experiences'
                  value={exp.id}
                  checked={formData.experiences?.includes(exp.id)}
                  onChange={handleSelected}
                  className='mr-2'
                />
                <label
                  htmlFor={`exp-${exp.id}`}
                  className='font-medium text-gray-700'
                >
                  {exp.name}
                </label>
              </div>
            ))}
        </div>
        <div className='flex justify-between'>
          <div className='border border-gray-800 p-1 mb-2 mt-4'>
            Tareas Realizadas
          </div>
        </div>
        <div className='grid grid-cols-2 md:grid md:grid-cols-3 gap-1'>
          {tasks.length > 0 &&
            tasks.map((task) => (
              <div key={task.id} className='flex items-center'>
                <input
                  type='checkbox'
                  id={`tasks-${task.id}`}
                  name='tasks'
                  value={task.id}
                  checked={formData.tasks?.includes(task.id)}
                  onChange={handleSelected}
                  className='mr-2'
                />
                <label
                  htmlFor={`tasks-${task.id}`}
                  className='font-medium text-gray-700'
                >
                  {task.name}
                </label>
              </div>
            ))}
        </div>
        <div className='flex justify-between'>
          <div className='border border-gray-800 p-1 mb-2 mt-4'>
            Especialidad en las siguientes patologias
          </div>
        </div>
        <div className='grid grid-cols-2 md:grid md:grid-cols-3 gap-1'>
          {patologies.length > 0 &&
            patologies.map((patologie) => (
              <div key={patologie.id} className='flex items-center'>
                <input
                  type='checkbox'
                  id={`patologie-${patologie.id}`}
                  name='patologies'
                  value={patologie.id}
                  checked={formData.patologies?.includes(patologie.id)}
                  onChange={handleSelected}
                  className='mr-2'
                />
                <label
                  htmlFor={`patologie-${patologie.id}`}
                  className='font-medium text-gray-700'
                >
                  {patologie.name}
                </label>
              </div>
            ))}
        </div>
      </div>
    </form>
  );
};

export default Form;
