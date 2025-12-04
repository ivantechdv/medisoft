const express = require('express');
const router = express.Router();
const googleController = require('./../controller/googleController');

router.get('/google', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.ENV=="dev"?process.env.URL_DEV:process.env.URL_PROD+'auth/google/callback', // tu callback
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/contacts',
    access_type: 'offline',
    prompt: 'consent'
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// 1️⃣ URL donde Google redirige tras autorización
router.get('/google/callback', googleController.authRedirect);

// 2️⃣ Ruta para sincronizar o crear contacto
router.post('/contacts/sync', googleController.syncContact);

module.exports = router;
