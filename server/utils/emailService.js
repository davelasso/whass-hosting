const nodemailer = require('nodemailer');
const logger = require('./logger');

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false // Solo para desarrollo
  }
});

// Verificar la conexión SMTP al iniciar
transporter.verify((error, success) => {
  if (error) {
    logger.error('Error al verificar la conexión SMTP:', error);
  } else {
    logger.info('Servidor SMTP listo para enviar emails');
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: `"Whass Hosting" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: text.replace(/\n/g, '<br>')
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email enviado:', info.messageId);
    return info;
  } catch (error) {
    logger.error('Error al enviar email:', error);
    if (error.code === 'EAUTH') {
      throw new Error('Error de autenticación SMTP. Verifica las credenciales.');
    }
    throw new Error('Error al enviar el email. Por favor, intenta más tarde.');
  }
};

module.exports = {
  sendEmail,
  transporter
}; 