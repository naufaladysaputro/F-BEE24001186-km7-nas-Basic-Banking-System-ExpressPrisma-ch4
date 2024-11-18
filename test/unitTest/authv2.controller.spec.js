const AuthV2Controller = require("../../controllers/authv2.controller");
const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { getIo } = require("../../middleware/socket");

jest.mock("../../config/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

jest.mock("../../middleware/socket", () => ({
  getIo: jest.fn().mockReturnValue({
    emit: jest.fn(),
  }),
}));

describe("AuthV2Controller", () => {
  describe("register", () => {
    it("should return 400 if email, password, or name is missing", async () => {
      const req = { body: { email: "", password: "password", name: "" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AuthV2Controller.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email, password, and name are required",
      });
    });

    it("should return 400 if email already exists", async () => {
      const req = { body: { email: "existing@example.com", password: "password", name: "User" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      prisma.user.findUnique.mockResolvedValueOnce({ email: "existing@example.com" });

      await AuthV2Controller.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email already exists",
      });
    });

    it("should handle database errors during registration", async () => {
      const req = { body: { email: "error@example.com", password: "password", name: "User" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      prisma.user.findUnique.mockRejectedValueOnce(new Error("Database error"));

      await AuthV2Controller.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });

    it("should create a new user and emit event", async () => {
      const req = { body: { email: "new@example.com", password: "password", name: "User" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const io = { emit: jest.fn() };
      getIo.mockReturnValueOnce(io);

      prisma.user.findUnique.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce("hashedPassword");
      prisma.user.create.mockResolvedValueOnce({
        id: 1,
        email: "new@example.com",
        name: "User",
      });

      await AuthV2Controller.register(req, res);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(io.emit).toHaveBeenCalledWith("userRegistered", {
        email: "new@example.com",
        name: "User",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Registration successful" });
    });
  });

  describe("login", () => {
    it("should return 400 if email or password is missing", async () => {
      const req = { body: { email: "", password: "" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AuthV2Controller.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email and password are required",
      });
    });

    it("should return 401 if credentials are invalid", async () => {
      const req = { body: { email: "invalid@example.com", password: "wrong" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      prisma.user.findUnique.mockResolvedValueOnce(null);

      await AuthV2Controller.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password",
      });
    });

    it("should handle errors during bcrypt.compare", async () => {
      const req = { body: { email: "user@example.com", password: "password" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: "user@example.com",
        password: "hashedPassword",
      });
      bcrypt.compare.mockRejectedValueOnce(new Error("bcrypt error"));

      await AuthV2Controller.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "bcrypt error" });
    });

    it("should return token on successful login", async () => {
      const req = { body: { email: "user@example.com", password: "password" } };
      const res = { json: jest.fn() };

      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: "user@example.com",
        password: "hashedPassword",
      });
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce("token");

      await AuthV2Controller.login(req, res);

      expect(res.json).toHaveBeenCalledWith({ token: "token" });
    });
  });

  describe("resetPassword", () => {
    it("should return 404 if user is not found", async () => {
      const req = { body: { email: "notfound@example.com", newPassword: "newpass" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      prisma.user.findUnique.mockResolvedValueOnce(null);

      await AuthV2Controller.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should handle errors during password update", async () => {
      const req = { body: { email: "user@example.com", newPassword: "newpass" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      prisma.user.findUnique.mockResolvedValueOnce({ email: "user@example.com" });
      bcrypt.hash.mockResolvedValueOnce("hashedPassword");
      prisma.user.update.mockRejectedValueOnce(new Error("Database error"));

      await AuthV2Controller.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });

    it("should reset password and emit event", async () => {
      const req = { body: { email: "user@example.com", newPassword: "newpass" } };
      const res = { json: jest.fn() };
      const io = { emit: jest.fn() };
      getIo.mockReturnValueOnce(io);

      prisma.user.findUnique.mockResolvedValueOnce({ email: "user@example.com" });
      bcrypt.hash.mockResolvedValueOnce("hashedPassword");
      prisma.user.update.mockResolvedValueOnce({ email: "user@example.com" });

      await AuthV2Controller.resetPassword(req, res);

      expect(io.emit).toHaveBeenCalledWith("passwordReset", { email: "user@example.com" });
      expect(res.json).toHaveBeenCalledWith({ message: "Password reset successful" });
    });
  });

  describe("sendResetPasswordEmail", () => {
    it("should return 404 if user is not found", async () => {
      const req = { body: { email: "notfound@example.com" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      prisma.user.findUnique.mockResolvedValueOnce(null);

      await AuthV2Controller.sendResetPasswordEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should handle errors during email sending", async () => {
        const req = { body: { email: "user@example.com" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        
        // Membuat mock transporter dengan sendMail yang menghasilkan error
        const transporter = {
          sendMail: jest.fn().mockRejectedValueOnce(new Error("Email error")),
        };
        
        const io = { emit: jest.fn() };
        getIo.mockReturnValueOnce(io);
        
        // Mengatur mock untuk createTransport
        nodemailer.createTransport.mockReturnValueOnce(transporter);
      
        // Mengatur mock untuk prisma agar user ditemukan
        prisma.user.findUnique.mockResolvedValueOnce({ email: "user@example.com" });
      
        // Menjalankan fungsi sendResetPasswordEmail
        await AuthV2Controller.sendResetPasswordEmail(req, res);
      
        // Memastikan bahwa status 500 dan error message yang sesuai dikembalikan
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Email error" });
      
        // Memastikan bahwa emitter event tidak dipanggil jika terjadi error
        expect(io.emit).not.toHaveBeenCalled();
      });
      
    
  });
});
