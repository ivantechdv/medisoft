const axios = require('axios');
const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_TOKEN_URI
} = process.env;

const REFRESH_TOKEN_PATH = './google/refresh_token.json';

// === Manejo de Tokens ===

exports.getTokensFromCode = async (code) => {
  const { data } = await axios.post(GOOGLE_TOKEN_URI, {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code'
  });
  return data;
};

exports.saveRefreshToken = async (refreshToken) => {
  const dir = './google';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(REFRESH_TOKEN_PATH, JSON.stringify({ refresh_token: refreshToken }));
};

exports.getRefreshToken = () => {
  if (!fs.existsSync(REFRESH_TOKEN_PATH)) return null;
  const data = JSON.parse(fs.readFileSync(REFRESH_TOKEN_PATH, 'utf8'));
  return data.refresh_token;
};

exports.getValidAccessToken = async () => {
  const refreshToken = exports.getRefreshToken();
  if (!refreshToken) throw new Error('No existe refresh token. Autoriza primero.');

  const { data } = await axios.post(GOOGLE_TOKEN_URI, {
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  });
  return data.access_token;
};

// === Lógica de Contactos (Upsert) ===

exports.upsertContact = async (accessToken, { name, phone, email, website }) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const service = google.people({ version: 'v1', auth });

  // Normalización: Nos quedamos solo con los dígitos para comparar
  const cleanPhone = (num) => (num ? num.toString().replace(/\D/g, '') : '');
  const phoneToSearch = cleanPhone(phone);

  if (!phoneToSearch) {
    throw new Error("El número de teléfono es obligatorio para realizar la búsqueda.");
  }

  let existingContact = null;

  try {
    // 1️⃣ Buscar usando el motor de búsqueda de Google (más eficiente que listar todo)
    const searchRes = await service.people.searchContacts({
      query: phoneToSearch,
      readMask: 'names,phoneNumbers,emailAddresses,urls',
    });

    // 2️⃣ Validar si el resultado es una coincidencia exacta de número
    if (searchRes.data.results && searchRes.data.results.length > 0) {
      // Buscamos entre los resultados aquel que tenga el número limpio idéntico
      const found = searchRes.data.results.find(result => {
        const person = result.person;
        const phones = person.phoneNumbers || [];
        return phones.some(p => cleanPhone(p.value).includes(phoneToSearch));
      });
      
      if (found) existingContact = found.person;
    }
  } catch (err) {
    console.error('Error buscando contacto:', err.response ? err.response.data : err.message);
  }

  // 3️⃣ Preparar el objeto de datos para Google
  const contactBody = {
    names: [{ givenName: name }],
    phoneNumbers: [{ value: phone }], // Guardamos el formato original (ej: +54...)
  };

  if (email) contactBody.emailAddresses = [{ value: email }];
  if (website) contactBody.urls = [{ value: website }];

  // 4️⃣ Operación Upsert
  if (existingContact) {
    console.log(`Actualizando contacto existente: ${existingContact.resourceName}`);
    
    try {
      const updateRes = await service.people.updateContact({
        resourceName: existingContact.resourceName,
        updatePersonFields: 'names,phoneNumbers,emailAddresses,urls',
        requestBody: {
          ...contactBody,
          etag: existingContact.etag, // Campo crítico para que Google acepte el update
        },
      });
      return updateRes.data;
    } catch (updateErr) {
      console.error('Error al actualizar:', updateErr.response ? updateErr.response.data : updateErr.message);
      throw updateErr;
    }
  } else {
    console.log('No se encontró coincidencia. Creando contacto nuevo...');
    
    try {
      const createRes = await service.people.createContact({
        requestBody: contactBody,
      });
      return createRes.data;
    } catch (createErr) {
      console.error('Error al crear:', createErr.response ? createErr.response.data : createErr.message);
      throw createErr;
    }
  }
};