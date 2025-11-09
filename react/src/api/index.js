import axios from './axios';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/';
const publicUrl = import.meta.env.VITE_API_PUBLIC || 'http://localhost:3000/';
import Cookies from 'js-cookie';

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
  const token = Cookies.get('token');
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

export const postData = async (endpoint, data) => {
  //const token = Cookies.get('token');
  try {
    const res = await axios.post(apiUrl + endpoint, data);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const putData = async (endpoint, data) => {
  const token = Cookies.get('token');
  try {
    const res = await axios.put(apiUrl + endpoint, data, {
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

export const deleteById = async (endpoint, id) => {
  try {
    const res = await axios.delete(apiUrl + endpoint + id);
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
