const nodemailer = require('nodemailer');

/**
 * Envía un correo electrónico utilizando nodemailer
 * @param {Object} options - Opciones del correo electrónico
 * @param {string} options.email - Dirección de correo del destinatario
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.message - Contenido del correo en texto plano
 * @param {string} options.html - Contenido del correo en HTML (opcional)
 */
const sendEmail = async (options) => {
  // Crear transportador
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === 465, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Definir opciones del correo
  const mailOptions = {
    from: `DDSBedrocl <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // Enviar el correo
  const info = await transporter.sendMail(mailOptions);
  
  console.log(`Correo enviado: ${info.messageId}`);
};

module.exports = sendEmail; 