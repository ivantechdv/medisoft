const nodemailer = require('nodemailer');

module.exports = {
  async enviarCorreo(email, password, destinatarios, asunto, template) {
      try {
          const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                  user: email,
                  pass: password,
              },
          });
          const destinatariosString = destinatarios.join(',');
          const mailOptions = {
              from: email,
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
