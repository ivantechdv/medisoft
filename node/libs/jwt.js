const  {secret}  = require("../config/auth.config");
const   jwt   = require('jsonwebtoken') ;
  let  CTRL = {}
  CTRL.createAccessToken = async(payload) => {

   return new Promise( (resolve, reject) =>{
 
        jwt.sign(
            payload,
            secret,
            {
                expiresIn:86400, //24 hours 
            }, 
            (err, token) => {
                if(err) reject(err) 
                resolve(token)
            }
            )
    })


}

module.exports = CTRL