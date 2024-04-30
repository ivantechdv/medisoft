// aca hacemos las importaciones 
// que tengan dependencias cirulares 

// En models/index.js
const User = require('./users/users.model');
const LegalChangeLogs = require('./legal/legal_changeLogs.model');

module.exports = {
  User,
  LegalChangeLogs
};
