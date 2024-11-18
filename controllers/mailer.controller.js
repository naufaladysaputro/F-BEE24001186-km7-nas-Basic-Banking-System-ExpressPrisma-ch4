const nodemailer = require("nodemailer"); // Import nodemailer
const { getIo } = require("../middleware/socket");
require("dotenv").config();

class MailerController {
  constructor() {
    // Inisialisasi transporter
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Gunakan SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Pastikan metode di-bind ke instance
    this.sendMail = this.sendMail.bind(this);
  }

  async sendMail(req, res) {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const mailData = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    try {
      // Kirim email
      const info = await this.transporter.sendMail(mailData);

      // Emit notifikasi via Socket.IO
      const io = getIo();
      io.emit("emailSent", { to, subject });

      res.status(200).json({
        message: "Mail sent successfully",
        message_id: info.messageId,
      });
    } catch (error) {
      console.error("Error saat mengirim email:", error.message);
      res.status(500).json({
        message: "Failed to send email",
        error: error.message,
      });
    }
  }
}

module.exports = new MailerController();
