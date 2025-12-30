const googleService = require('./../services/googleAuthService');

exports.authRedirect = async (req, res) => {
  try {
    const { code } = req.query;
    const tokens = await googleService.getTokensFromCode(code);
    // Guardar refresh_token en tu BD (por usuario o global)
    await googleService.saveRefreshToken(tokens.refresh_token);
   
    // const accessToken = await googleService.getValidAccessToken();
    // const contact = await googleService.upsertContact(accessToken, { name, phone });

 res.redirect(`http://localhost:5002/employee/1?status=ok`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en la autorización de Google' });
  }
};

exports.syncContact = async (req, res) => {
  try {
   const { name, phone, email, website } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Se requiere name y phone' });
    }

    const accessToken = await googleService.getValidAccessToken();
    const contact = await googleService.upsertContact(accessToken, {
      name, 
      phone, 
      email, 
      website });

    res.json({ success: true, contact });
  } catch (err) {
    console.error('Error al sincronizar contacto:', err.message);
     return res.status(401).json({ error: 'NO_REFRESH_TOKEN' });
    res.status(500).json({ error: 'Error al sincronizar contacto' });
  }
};