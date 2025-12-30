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
exports.upsertContact = async (accessToken, { name, phone, email, website }) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const service = google.people({ version: 'v1', auth });

  // --- FUNCIÓN DE LIMPIEZA ---
  // Elimina todo lo que no sea un número (espacios, guiones, paréntesis, etc.)
  const cleanPhone = (num) => (num ? num.toString().replace(/\D/g, '') : '');

  const phoneToSearch = cleanPhone(phone);

  // 1️⃣ Buscar contacto por teléfono (Normalizado)
  let existingContact = null;
  try {
    const res = await service.people.connections.list({
      resourceName: 'people/me',
      personFields: 'names,phoneNumbers,emailAddresses,urls',
      pageSize: 2000,
    });

    existingContact = res.data.connections?.find(person => {
      const phones = person.phoneNumbers || [];
      // Limpiamos cada teléfono de Google antes de comparar
      return phones.some(p => cleanPhone(p.value) === phoneToSearch);
    });
  } catch (err) {
    console.error('Error buscando contacto existente:', err.message);
  }

  // 2️⃣ Preparar el cuerpo del contacto
  const contactBody = {
    names: [{ givenName: name }],
    phoneNumbers: [{ value: phoneToSearch }], // Guardamos el número limpio
  };

  if (email) contactBody.emailAddresses = [{ value: email }];
  if (website) contactBody.urls = [{ value: website }];

  // 3️⃣ Si existe, actualizar
  if (existingContact) {
    const resourceName = existingContact.resourceName;
    const etag = existingContact.etag;

    const updateRes = await service.people.updateContact({
      resourceName,
      updatePersonFields: 'names,phoneNumbers,emailAddresses,urls',
      requestBody: {
        ...contactBody,
        etag,
      },
    });
    return updateRes.data;
  }

  // 4️⃣ Si no existe, crear nuevo contacto
  const createRes = await service.people.createContact({
    requestBody: {
      ...contactBody,
      memberships: [{ 
        contactGroupMembership: { contactGroupResourceName: 'contactGroups/myContacts' } 
      }]
    },
  });

  return createRes.data;
};