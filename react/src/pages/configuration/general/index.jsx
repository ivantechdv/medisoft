import React, { useEffect, useState, useCallback } from 'react';
import { getData, putData, postData } from '../../../api';
import Spinner from '../../../components/Spinner/Spinner';
import ToastNotify from '../../../components/toast/toast';

const PHONE_MASK_OPTIONS = [
  { value: '999 99 99 99', label: '999 99 99 99' },
  { value: '999 999 999', label: '999 999 999' },
  { value: '999999999', label: '999999999' },
];

const General = () => {
  const [configId, setConfigId] = useState(null);
  const [clientConfig, setClientConfig] = useState({});
  const [formValues, setFormValues] = useState({
    phone_mask: PHONE_MASK_OPTIONS[0].value,
    default_country_id: '',
    default_state_id: '',
    country_code: '',
  });
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchStates = useCallback(async (countryId) => {
    if (!countryId) {
      setStates([]);
      return;
    }
    try {
      const response = await getData(`configs/states/${countryId}`);
      setStates(response || []);
    } catch (error) {
      console.error('Error al obtener provincias:', error);
      ToastNotify({
        message: 'No se pudieron cargar las provincias',
        type: 'error',
        position: 'top-left',
      });
    }
  }, []);

  const initializeForm = useCallback(async () => {
    try {
      setLoading(true);
      const [countriesResponse, configResponse] = await Promise.all([
        getData('configs/countries/list'),
        getData('configs/active'),
      ]);

      setCountries(countriesResponse || []);

      if (configResponse) {
        setConfigId(configResponse.id);
        const existingClientConfig = configResponse.client_config || {};
        setClientConfig(existingClientConfig);

        setFormValues((prev) => ({
          ...prev,
          phone_mask: configResponse.phone_mask || prev.phone_mask,
          default_country_id: configResponse.default_country_id || '',
          default_state_id: existingClientConfig.default_state_id || '',
          country_code:
            existingClientConfig.default_country_code ||
            configResponse?.defaultCountry?.code_phone ||
            '',
        }));

        if (configResponse.default_country_id) {
          await fetchStates(configResponse.default_country_id);
        }
      }
    } catch (error) {
      console.error('Error cargando configuración general:', error);
      ToastNotify({
        message: 'No se pudo cargar la configuración',
        type: 'error',
        position: 'top-left',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchStates]);

  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  const handleCountryChange = async (event) => {
    const { value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      default_country_id: value,
      default_state_id: '',
      country_code:
        countries.find((country) => country.id === Number(value))?.code_phone ||
        '',
    }));
    await fetchStates(value);
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formValues.default_country_id) {
      ToastNotify({
        message: 'Selecciona un país por defecto',
        type: 'error',
        position: 'top-left',
      });
      return;
    }

    try {
      setSaving(true);
      const updatedClientConfig = {
        ...clientConfig,
        default_state_id: formValues.default_state_id || null,
        default_country_code: formValues.country_code || '',
      };

      const payload = {
        phone_mask: formValues.phone_mask,
        default_country_id: formValues.default_country_id,
        client_config: updatedClientConfig,
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

      localStorage.setItem('phoneMask', formValues.phone_mask);

      ToastNotify({
        message: 'Configuración actualizada',
        type: 'success',
        position: 'top-left',
      });
    } catch (error) {
      console.error('Error guardando configuración:', error);
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

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow p-6 space-y-6'>
      <h2 className='text-xl font-semibold text-gray-700'>Configuración General</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Máscara del teléfono
          </label>
          <select
            id='phone_mask'
            value={formValues.phone_mask}
            onChange={handleChange}
            className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
          >
            {PHONE_MASK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Código de país (prefijo)
          </label>
          <input
            id='country_code'
            type='text'
            value={formValues.country_code}
            onChange={handleChange}
            className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
            placeholder='+34'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>
            País por defecto
          </label>
          <select
            id='default_country_id'
            value={formValues.default_country_id}
            onChange={handleCountryChange}
            className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
          >
            <option value=''>Selecciona un país…</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Provincia por defecto
          </label>
          <select
            id='default_state_id'
            value={formValues.default_state_id}
            onChange={handleChange}
            disabled={!formValues.default_country_id || states.length === 0}
            className='mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100'
          >
            <option value=''>Selecciona una provincia…</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
          {!formValues.default_country_id && (
            <p className='mt-1 text-xs text-gray-500'>Selecciona un país para ver las provincias.</p>
          )}
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

export default General;
