const axios = require('axios');
const fs = require('fs');
require('dotenv').config();
const { google } = require('googleapis');
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_TOKEN_URI
} = process.env;

let REFRESH_TOKEN_PATH = './google/refresh_token.json';

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

// === Contactos ===
exports.upsertContact = async (accessToken, { name, phone }) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const service = google.people({ version: 'v1', auth });

  // 1️⃣ Buscar contacto por teléfono
  let existingContact = null;
  try {
    const res = await service.people.connections.list({
      resourceName: 'people/me',
      personFields: 'names,phoneNumbers',
      pageSize: 2000,
    });

    existingContact = res.data.connections?.find(person => {
      const phones = person.phoneNumbers || [];
      return phones.some(p => p.value === phone);
    });
  } catch (err) {
    console.error('Error buscando contacto existente:', err.message);
  }

  // 2️⃣ Si existe, actualizar
  const phoneValue = phone ? phone.toString().replace(/\D/g,'') : '';
  if (existingContact) {
    
     const resourceName = existingContact.resourceName;
  const etag = existingContact.etag; 
    const updateRes = await service.people.updateContact({
    resourceName,
    updatePersonFields: 'names,phoneNumbers',
    requestBody: {
      etag, // agrega esto
      names: [{ givenName: name }],
      phoneNumbers: [{ value: phoneValue }],
    },
  });
    return updateRes.data;
  }

  // 3️⃣ Si no existe, crear nuevo contacto
  const createRes = await service.people.createContact({
    requestBody: {
      names: [{ givenName: name }],
      phoneNumbers: [{ value: phoneValue }],
      memberships: [{ contactGroupMembership: { contactGroupResourceName: 'contactGroups/myContacts' } }]  
    },
  });

  return createRes.data;
};