const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

const authRequired = (req, res , next ) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
  
    // El token está en el formato "Bearer <token>". Dividimos el encabezado para obtener solo el token.
    const token = authorizationHeader.split(' ')[1];

    if (!token) return  res.status(401).json({ message:'No token, authorization denied'})
    
    jwt.verify(token, secret, (err, user) => {
        if (err) {
          const message = err.name === 'TokenExpiredError'
            ? 'Session expired'
            : 'Invalid token';
          const status = err.name === 'TokenExpiredError' ? 401 : 403;
          return res.status(status).json({ message });
        }
        req.user = user;
        next();
    })
 
}

module.exports = authRequired