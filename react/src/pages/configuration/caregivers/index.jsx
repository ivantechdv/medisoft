import React, { useEffect, useState, useCallback } from 'react';
import { getCachedData, putData, postData } from '../../../api';
import Spinner from '../../../components/Spinner/Spinner';
import ToastNotify from '../../../components/toast/toast';
import Select from 'react-select';

const Caregivers = () => {
  const [configId, setConfigId] = useState(null);
  const [formValues, setFormValues] = useState({
    default_type: '',
    default_level_id: '',
    default_languages: [],
  });
  const [types, setTypes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const initializeForm = useCallback(async () => {
    try {
      setLoading(true);
      const [levelsResponse, languagesResponse, configResponse] = await Promise.all([
        getCachedData('configs/levels/list'),
        getCachedData('configs/languages/list'),
        getCachedData('configs/active', 10 * 60 * 1000),
      ]);

      setLevels(levelsResponse || []);
      setLanguages(
        (languagesResponse || []).map((lang) => ({
          value: lang.id,
          label: lang.name,
        }))
      );

      const typeOptions = [
        { value: '1', label: 'Cuidador' },
        { value: '2', label: 'Pendiente' },
      ];
      setTypes(typeOptions);

      if (configResponse) {
        setConfigId(configResponse.id);
        const employeeConfig = configResponse.employee_config || {};

        setFormValues({
          default_type: employeeConfig.default_type || '',
          default_level_id: employeeConfig.default_level_id || '',
          default_languages: employeeConfig.default_languages || [],
        });
      }
    } catch (error) {
      console.error('Error cargando configuración de cuidadores:', error);
      ToastNotify({
        message: 'No se pudo cargar la configuración',
        type: 'error',
        position: 'top-left',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleLanguagesChange = (selectedOptions) => {
    setFormValues((prev) => ({
      ...prev,
      default_languages: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const payload = {
        employee_config: {
          default_type: formValues.default_type || null,
          default_level_id: formValues.default_level_id || null,
          default_languages: formValues.default_languages || [],
        },
      };

      if (configId) {
        await putData(`configs/${configId}`, payload);
      } else {
        const newConfig = await postData('configs', {
          ...payload,
          is_active: true,
        });
        setConfigId(newConfig?.id || null);
      }

      ToastNotify({
        message: 'Configuración de cuidadores actualizada',
        type: 'success',
        position: 'top-left',
      });
    } catch (error) {
      console.error('Error guardando configuración de cuidadores:', error);
      ToastNotify({
        message: 'No se pudo guardar la configuración',
        type: 'error',
        position: 'top-left',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='py-16'>
        <Spinner />
      </div>
    );
  }

  const selectedLanguagesOptions = languages.filter((lang) =>
    formValues.default_languages.includes(lang.value)
  );

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow p-6 space-y-6 erp-form'>
      <h2 className='text-xl font-semibold text-gray-700'>Configuración de Cuidadores</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Tipo de cuidador por defecto
          </label>
          <select
            id='default_type'
            value={formValues.default_type}
            onChange={handleChange}
            className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
          >
            <option value=''>Selecciona un tipo…</option>
            {types.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Nivel por defecto
          </label>
          <select
            id='default_level_id'
            value={formValues.default_level_id}
            onChange={handleChange}
            className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
          >
            <option value=''>Selecciona un nivel…</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

        <div className='md:col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Idiomas por defecto
          </label>
          <Select
            isMulti
            options={languages}
            value={selectedLanguagesOptions}
            onChange={handleLanguagesChange}
            placeholder='Selecciona idiomas…'
            className='react-select-container'
            classNamePrefix='react-select'
          />
        </div>
      </div>

      <div className='flex justify-end'>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={saving}
          className={`px-6 py-2 rounded-md text-white font-semibold ${
            saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
};

export default Caregivers;
