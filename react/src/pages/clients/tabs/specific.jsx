import React, { useState, useEffect } from 'react';
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

const Form = ({ id, onFormData }) => {
  const [formData, setFormData] = useState([]);
  const [images, setImages] = useState([]);
  const [patologies, setPatologies] = useState([]);
  const [selectedPatologies, setSelectedPatologies] = useState([]);
  const [recommendations, setRecommendations] = useState('');
  const navigateTo = useNavigate();
  useEffect(() => {
    const fetchSelect = async () => {
      const patologies = await getData('patologies/all');

      if (patologies) {
        const options = patologies.map((item) => ({
          value: item.id,
          label: item.name,
        }));

        setPatologies(options);
      }
    };

    fetchSelect();
  }, []);

  useEffect(() => {
    console.log('onFormData', onFormData.clients_patologies);
    console.log('id', id);
    if (onFormData) {
      setRecommendations(onFormData.recommendations);
      const clientPatologies = onFormData.clients_patologies.map((cp) => ({
        value: cp.patology_id,
        label: cp.patology.name, // Asumiendo que `patology` es el objeto relacionado
      }));
      setSelectedPatologies(clientPatologies);
    }
  }, [onFormData]);

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

  const handleQuill = (value) => {
    setRecommendations(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const clientsPatologiesData = selectedPatologies.map((patology) => ({
      patology_id: patology.value, // Suponiendo que el valor es el id de la patología
      client_id: id,
    }));
    let response = false;
    response = await postData('clients-patologies', clientsPatologiesData);
    console.log('response', response);

    const dataToSend = {
      recommendations: recommendations,
    };
    response = await putData('clients/' + id, dataToSend);
    if (response) {
      navigateTo('/client/' + response.id);
    }
  };
  return (
    <form className=''>
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
              id='provider_category_id'
              name='provider_category_id'
              options={patologies}
              onChange={handleSelectChange}
              defaultValue={selectedPatologies}
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
