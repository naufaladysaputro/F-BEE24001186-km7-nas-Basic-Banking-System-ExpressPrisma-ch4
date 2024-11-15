//libs/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Bisa diganti dengan layanan lain (contoh: 'yahoo', 'hotmail', atau konfigurasi SMTP lainnya)
  auth: {
    user: process.env.EMAIL_USER, // Alamat email Anda
    pass: process.env.EMAIL_PASS, // Password atau App Password untuk email Anda
  },
});

const sendMail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendMail;