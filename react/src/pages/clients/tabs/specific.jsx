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
const Form = ({ id, onFormData, onGetRecordById, setUnsavedChanges }) => {
  const [formData, setFormData] = useState({
    patology_id: '',
    recommendations: '',
  });
  const [images, setImages] = useState([]);
  const [patologies, setPatologies] = useState([]);
  const [selectedPatologies, setSelectedPatologies] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [recommendations, setRecommendations] = useState('');
  const [selectedPatologiesOld, setSelectedPatologiesOld] = useState([]);
  const [selectedTasksOld, setSelectedTasksOld] = useState([]);
  const [recommendationsOld, setRecommendationsOld] = useState('');
  const [loadingCount, setLoadingCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  let loading = loadingCount > 0;
  const quillRef = useRef(null);
  const navigateTo = useNavigate();
  useEffect(() => {
    const fetchSelect = async () => {
      try {
        const order = 'name-asc';
        const patologies = await getData(`patologies/all?order=${order}`);

        if (patologies) {
          const options = patologies.map((item) => ({
            value: item.id,
            label: item.name,
          }));

          setPatologies(options);
        }
        const tasks = await getData(`employees/task/all?order=${order}`);

        if (tasks) {
          const options = tasks.map((item) => ({
            value: item.id,
            label: item.name,
          }));

          setTasks(options);
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
      setRecommendations(onFormData.recommendations);
      setRecommendationsOld(onFormData.recommendations);
      const clientPatologies = onFormData.clients_patologies
        .filter((cp) => cp.patology && cp.patology.name) // Filtrar aquellos que tengan patología y nombre
        .map((cp) => ({
          value: cp.patology_id,
          label: cp.patology.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setSelectedPatologies(clientPatologies);
      setSelectedPatologiesOld(clientPatologies);

      const clientTaks = onFormData.clients_tasks
        .filter((cp) => cp.task && cp.task.name) // Filtrar aquellos que tengan patología y nombre
        .map((cp) => ({
          value: cp.task_id,
          label: cp.task.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setSelectedTasks(clientTaks);
      setSelectedTasksOld(clientTaks);

      const isQuillEmpty = isQuillContentEmpty(onFormData.recommendations);
      let recommendations = '';
      if (isQuillEmpty) {
        recommendations = '';
      } else {
        recommendations = onFormData.recommendations;
      }
      setTimeout(() => setLoadingCount((prev) => prev - 1), 500);
    }
  }, [onFormData]);

  const stripHTML = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  useEffect(() => {
    // Strip HTML tags from recommendations and recommendationsOld
    const strippedRecommendations = stripHTML(recommendations);
    const strippedRecommendationsOld = stripHTML(recommendationsOld);

    // Compare selectedPatologies and selectedPatologiesOld, and stripped recommendations
    const hasChanges =
      JSON.stringify(selectedPatologies) !==
        JSON.stringify(selectedPatologiesOld) ||
      strippedRecommendations !== strippedRecommendationsOld;
    setUnsavedChanges(hasChanges);
  }, [
    selectedPatologies,
    selectedPatologiesOld,
    recommendations,
    recommendationsOld,
    setUnsavedChanges,
  ]);
  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const handleSelectChange = (selected) => {
    setSelectedPatologies(selected);
  };
  const handleSelectTasks = (selected) => {
    setSelectedTasks(selected);
  };
  const isQuillContentEmpty = (content) => {
    // Eliminar todas las etiquetas HTML del contenido y comprobar si el resultado está vacío
    const strippedContent = content.replace(/<\/?[^>]+(>|$)/g, '');
    return strippedContent.trim() === '';
  };
  const handleQuill = (value) => {
    setRecommendations(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedPatologies.length === 0) {
      ToastNotify({
        message: 'Debe seleccionar al menos una patología.',
        position: 'top-left',
        type: 'error',
      });
      return; // Detener el envío del formulario
    }

    // Validar si el campo de recomendaciones está vacío
    if (isQuillContentEmpty(recommendations)) {
      ToastNotify({
        message: 'El campo de recomendaciones no puede estar vacío.',
        position: 'top-left',
        type: 'error',
      });
      return; // Detener el envío del formulario
    }
    setIsLoading(true);
    try {
      let message = '';
      const clientsPatologiesData = selectedPatologies.map((patology) => ({
        patology_id: patology.value, // Suponiendo que el valor es el id de la patología
        client_id: id,
      }));
      let response = false;
      response = await postData('clients-patologies', clientsPatologiesData);
      console.log('response', response);

      const clientsTasksData = selectedTasks.map((task) => ({
        task_id: task.value, // Suponiendo que el valor es el id de la patología
        client_id: id,
      }));
      let responseTask = false;
      responseTask = await postData('clients-tasks', clientsTasksData);
      console.log('responseTask', responseTask);

      const dataToSend = {
        recommendations: recommendations,
      };
      response = await putData('clients/' + id, dataToSend);
      if (response) {
        onGetRecordById(id);
        message = 'Datos especificos registrado con exito';
        ToastNotify({
          message: message,
          position: 'top-left',
          type: 'success',
        });
      }
    } catch (error) {
      console.log('error =>', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form className=''>
      {(loading || isLoading) && <Spinner />}
      <div className='relative rounded min-h-[calc(100vh-235px)]'>
        <div className='col-span-2 md:grid md:grid-cols-2 gap-2'>
          <div className='col-span-2'>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
            >
              Patologías
            </label>
            <Select
              id='patology_id'
              name='patology_id'
              options={patologies}
              onChange={handleSelectChange}
              defaultValue={selectedPatologies}
              isMulti={true} // Enable multi-selection
            />
          </div>
          <div className='col-span-2'>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
            >
              Tareas
            </label>
            <Select
              id='task_id'
              name='task_id'
              options={tasks}
              onChange={handleSelectTasks}
              defaultValue={selectedTasks}
              isMulti={true} // Enable multi-selection
            />
          </div>
          <div className='col-span-2'>
            <label
              htmlFor='recommendations'
              className='block text-sm font-medium text-gray-700'
            >
              Recomendaciones
            </label>
            <ReactQuill
              ref={quillRef}
              value={recommendations}
              onChange={handleQuill}
              style={{ minHeight: '200px', height: '200px' }}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'link'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  [{ align: [] }],
                  ['blockquote'],
                  ['image', 'video'], // Agregar herramientas de imagen y video
                ],
              }}
            />
          </div>
        </div>
      </div>
      <div className='flex justify-end items-end  pr-4 mt-4'>
        <button
          type='submit'
          className='bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={handleSubmit}
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default Form;
