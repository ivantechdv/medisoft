const   jwt   = require('jsonwebtoken') ;
const { secret } = require('../config/auth.config');


 const authRequired = (req, res , next ) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
  
    // El token está en el formato "Bearer <token>". Dividimos el encabezado para obtener solo el token.
    const token = authorizationHeader.split(' ')[1];

    if (!token) return  res.status(401).json({ message:'No token, authorization denied'})
    
    jwt.verify(token, secret, (err , user ) => {
        if (err ) return  res.status(403).json({ message:'Invalid token'})
        req.user = user 
        next()
    }) 
 
}

module.exports = authRequired