// const cron = require('node-cron');
// const Legal = require('./../controllers/legal/legal.controller'); 
// const Email = require('./../controllers/email/email.controller'); 
// const User = require('./../controllers/users/users.controller'); 
// const { json } = require('body-parser');

// // Configurar la tarea programada para que se ejecute todos los días a las 6:00 PM

// cron.schedule('0 18 * * *', async () => {
//     try {
//         // Obtener los archivos por expirar
//         const storageByExpirated = await Legal.getStoragesByExpirated({ isCronjob: true });

//         const users = await User.getUserAlertStorage({ isCronjob: true });
//         const destinatarios = users.map(user => user.email);
//         const user_id=users[0].id;
//         const subject= "Archivos por vencer";
//         const template= "legal/AlertStorage";

//         const email= await Email.sendEmail(user_id, destinatarios, subject, template, storageByExpirated);
//     } catch (error) {
//         console.error('Error al ejecutar la tarea programada:', error);
//     }
// });