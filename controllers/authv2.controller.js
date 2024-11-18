const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getIo } = require("../middleware/socket");
const Sentry = require("@sentry/node");
const nodemailer = require("nodemailer");

class AuthV2Controller {
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password, and name are required" });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name },
      });

    //   // Emit notifikasi via Socket.IO
    //   const io = getIo();
    //   io.emit("userRegistered", { email: user.email, name: user.name });

     // Emit event untuk notifikasi register
     const io = getIo();
     io.emit("userRegistered", { email, name });

      res.status(201).json({ message: "Registration successful" });
    } catch (error) {
      Sentry.captureException(error);
      res.status(500).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ token });
    } catch (error) {
      Sentry.captureException(error);
      res.status(500).json({ error: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({ error: "Email and new password are required" });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

    //   // Emit notifikasi via Socket.IO
    //   const io = getIo();
    //   io.emit("passwordReset", { email });

      // Emit event untuk notifikasi reset password
      const io = getIo();
      io.emit("passwordReset", { email });

      res.json({ message: "Password reset successful" });
    } catch (error) {
      Sentry.captureException(error);
      res.status(500).json({ error: error.message });
    }
  }

 // Endpoint untuk mengirim email reset password
 async sendResetPasswordEmail(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate token reset password (contoh sederhana)
      const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
      const resetLink = `${process.env.FRONTEND_URL}/api/v1/authv2/reset-password?token=${resetToken}`;

      // Konfigurasi transporter nodemailer
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Gunakan SSL
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Data email
      const mailData = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset Your Password",
        html: `
          <h1>Reset Password Request</h1>
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
        `,
      };

      // Kirim email
      const info = await transporter.sendMail(mailData);

      // Emit notifikasi melalui Socket.IO
      const io = getIo();
      io.emit("emailSent", { to: email, subject: "Reset Your Password" });

      res.status(200).json({
        message: "Reset password email sent successfully",
        // token: resetToken, // Menambahkan token reset password
        message_id: info.messageId,
      });
    } catch (error) {
      Sentry.captureException(error);
      console.error("Error sending reset password email:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

}



module.exports = new AuthV2Controller();
