import axios from './axios';
const apiUrl =
  import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3105/api/v1/';
const apiProxiURL =
  import.meta.env.VITE_PROXI_API_URL || 'http://localhost:3100/api/v1';
//const apiCakeURL = 'https://dev.unixfyone.com/admin/api/user/login/login';
import Cookies from 'js-cookie';

export const postAttachment = async (attachmentFile, container) => {
  try {
    const formData = new FormData();
    formData.append('file', attachmentFile);
    formData.append('container', container);
    const res = await axios.post(apiProxiURL + '/storage/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (res.status == 200) {
      return res;
    } else {
      return res.status;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const deleteAttachment = async (filename, container) => {
  try {
    const res = await axios.get(
      apiProxiURL + '/storage/delete/' + container + '/' + filename,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return res.status;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const cakeLogin = async (data) => {
  try {
    const res = await axios.post(apiUrl + 'users/login', data);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const verifyEmail = async (data) => {
  try {
    const res = await axios.post(apiUrl + 'users/verifyEmail', data);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const verifyPassword = async (data) => {
  const token = Cookies.get('email');
  console.log(token);
  try {
    const res = await axios.post(apiUrl + 'users/verifyPassword', data);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const validatePassword = async (data) => {
  try {
    const res = await axios.post(apiUrl + 'users/validatePassword', data);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const verifyToken = async (data) => {
  try {
    const res = await axios.post(apiUrl + 'users/verifyToken', data);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const cakeLogout = async () => {
  try {
    const res = await axios.get(apiUrl + 'users/logout');
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

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

export const show = async (endpoint) => {
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

export const postWithData = async (endpoint, data) => {
  const token = Cookies.get('token');
  try {
    const res = await axios.post(apiUrl + endpoint, data, {
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

export const putWithData = async (endpoint, data) => {
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

// almacen
export const warehouseGetAllMaterials = async () => {
  try {
    const res = await axios.get(apiProxiURL + '/warehouse/', {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (res.status == 200) {
      return res.data;
    } else {
      return 'err 500';
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
