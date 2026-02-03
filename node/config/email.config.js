const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = {
  /**
   * Enviar correo.
   * Si no se pasa email/password usa EMAIL_USER/EMAIL_PASS del .env
   * destinatarios: array de emails
   */
  async enviarCorreo(email, password, destinatarios, asunto, template) {
      try {
          const user = email || process.env.EMAIL_USER;
          const pass = password || process.env.EMAIL_PASS;
          if (!user || !pass) throw new Error('Credenciales SMTP no configuradas');

          const transporter = nodemailer.createTransport({
              service: process.env.EMAIL_SERVICE || 'gmail',
              auth: {
                  user: user,
                  pass: pass,
              },
          });
          const destinatariosString = destinatarios.join(',');
          const mailOptions = {
              from: user,
              to: destinatariosString,
              subject: asunto,
              html: template,
          };

          await transporter.sendMail(mailOptions);
      } catch (error) {
          throw error;
      }
  },
};
