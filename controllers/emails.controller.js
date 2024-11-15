//controllers/emails.controller.js

const sendMail = require('../libs/mailer');

const sendWelcomeEmail = async (req, res) => {
  const { email } = req.body;

  try {
    await sendMail(email, 'Welcome!', 'Thank you for registering with us!');
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
};

module.exports = { sendWelcomeEmail };
