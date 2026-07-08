import axios from './axios';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/';
const publicUrl = import.meta.env.VITE_API_PUBLIC || 'http://localhost:3000/';
import Cookies from 'js-cookie';
import { isTokenExpired } from '../utils/auth';

const apiResponseCache = new Map();
const apiInFlightCache = new Map();
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

export const select = async (endpoint) => {
  const fetchData = async () => {
    try {
      const res = await axios.get(apiUrl + endpoint);
      return res;
    } catch (error) {
      console.log(error);
    }
  };
  const data = await fetchData();
  if (Array.isArray(data)) {
    const options = data.map((item) => ({
      value: item.id,
      label: item.name,
    }));

    return options;
  } else {
    console.log('Error: No se pudo obtener los datos');
    return [];
  }
};

export const getData = async (endpoint) => {
  const token = Cookies.get('authToken');
  const fetchData = async () => {
    try {
      const res = await axios.get(apiUrl + endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };
  const data = await fetchData();
  return data;
};

export const getCachedData = async (
  endpoint,
  ttlMs = DEFAULT_CACHE_TTL_MS,
) => {
  const now = Date.now();
  const cacheKey = endpoint;
  const cached = apiResponseCache.get(cacheKey);

  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data;
  }

  if (apiInFlightCache.has(cacheKey)) {
    return apiInFlightCache.get(cacheKey);
  }

  const request = getData(endpoint)
    .then((data) => {
      apiResponseCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    })
    .finally(() => {
      apiInFlightCache.delete(cacheKey);
    });

  apiInFlightCache.set(cacheKey, request);
  return request;
};

export const clearApiCache = (prefix = '') => {
  if (!prefix) {
    apiResponseCache.clear();
    apiInFlightCache.clear();
    return;
  }

  for (const key of apiResponseCache.keys()) {
    if (key.startsWith(prefix)) {
      apiResponseCache.delete(key);
    }
  }
  for (const key of apiInFlightCache.keys()) {
    if (key.startsWith(prefix)) {
      apiInFlightCache.delete(key);
    }
  }
};

export const postData = async (endpoint, data) => {
  const token = Cookies.get('authToken');
  const config = {};
  
  if (token) {
    config.headers = {
      Authorization: `Bearer ${token}`,
    };
  }
  
  try {
    const res = await axios.post(apiUrl + endpoint, data, config);
    clearApiCache();
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const putData = async (endpoint, data) => {
  const token = Cookies.get('authToken');
  try {
    const res = await axios.put(apiUrl + endpoint, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    clearApiCache();
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteById = async (endpoint, id) => {
  try {
    const res = await axios.delete(apiUrl + endpoint + id);
    clearApiCache();
    return res.status;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const postStorage = async (file, container) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(
      apiUrl + 'storage?container=' + container,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getStorage = (url) => {
  try {
    const file = publicUrl + url;
    return file;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteStorage = async (filename, container) => {
  try {
    const res = await axios.delete(
      `${apiUrl}storage/delete/${container}/${filename}`,
    );
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const verifyToken = async (data) => {
  if (!data?.token) return { success: false };
  if (isTokenExpired(data.token)) return { success: false };
  return { success: true };
};

export const cakeLogout = async () => {
  try {
    const res = await axios.post(apiUrl + 'users/logout');
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Funciones específicas para configuración de teléfono por país
export const getCountriesPhoneConfigs = async () => {
  return await getCachedData('configs/countries/phone-configs', 10 * 60 * 1000);
};

export const updateCountryPhoneConfig = async (countryId, data) => {
  return await putData(`configs/countries/${countryId}/phone-config`, data);
};

export const deleteCountryPhoneConfig = async (countryId) => {
  const token = Cookies.get('authToken');
  try {
    const res = await axios.delete(apiUrl + `configs/countries/${countryId}/phone-config`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
