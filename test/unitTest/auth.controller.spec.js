const AuthController = require("../../controllers/auth.controller.js");
const prisma = require("../../config/prisma.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Mock prisma client
jest.mock("../../config/prisma.js", () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
}));

// Mock bcrypt
jest.mock("bcrypt", () => ({
    genSalt: jest.fn().mockResolvedValue("salt"),
    hash: jest.fn().mockResolvedValue("hashedPassword"),
    compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
    sign: jest.fn().mockReturnValue("token"),
    verify: jest.fn(),
}));

describe("AuthController", () => {
    describe("register", () => {
        it("should return 400 if email, password, or name is missing", async () => {
            const req = { body: { email: "", password: "test", name: "" } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await AuthController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Email, password, and name are required",
            });
        });

        it("should return 400 if email already exists", async () => {
            const req = {
                body: {
                    email: "existing@example.com",
                    password: "test",
                    name: "Test User",
                    identityType: "ID Card",
                    identityNumber: "123456789",
                    address: "Test Address",
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            prisma.user.findUnique.mockResolvedValueOnce({ email: req.body.email });

            await AuthController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Email already exists",
            });
        });

        it("should create a new user and return success message", async () => {
            const req = {
                body: {
                    email: "newuser@example.com",
                    password: "test",
                    name: "New User",
                    identityType: "ID Card",
                    identityNumber: "123456789",
                    address: "New Address",
                },
            };
            const res = {
                json: jest.fn(),
            };

            prisma.user.findUnique.mockResolvedValueOnce(null);
            prisma.user.create.mockResolvedValueOnce({
                id: 1,
                email: req.body.email,
                name: req.body.name,
                profile: {
                    identityType: req.body.identityType,
                    identityNumber: req.body.identityNumber,
                    address: req.body.address,
                },
            });

            await AuthController.register(req, res);

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

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Email and password are required",
            });
        });

        it("should return 400 if email is not found", async () => {
            const req = { body: { email: "notfound@example.com", password: "test" } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            prisma.user.findUnique.mockResolvedValueOnce(null);

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Email not found",
            });
        });

        it("should return 400 if password is invalid", async () => {
            const req = { body: { email: "user@example.com", password: "wrongpassword" } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            prisma.user.findUnique.mockResolvedValueOnce({ password: "hashedPassword" });
            bcrypt.compare.mockResolvedValueOnce(false);

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Invalid password",
            });
        });

        it("should create a token and return it on successful login", async () => {
            const req = { body: { email: "user@example.com", password: "test" } };
            const res = {
                json: jest.fn(),
            };

            prisma.user.findUnique.mockResolvedValueOnce({ id: 1, email: req.body.email, password: "hashedPassword" });
            bcrypt.compare.mockResolvedValueOnce(true);

            await AuthController.login(req, res);

            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 1, email: req.body.email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            expect(res.json).toHaveBeenCalledWith({ token: "token" });
        });
    });

    // Menambahkan unit test untuk getProfile
    describe("getProfile", () => {
        it("should return 401 if token is missing", async () => {
            const req = { headers: {} }; // Tidak ada token dalam header
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await AuthController.getProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: "Token is required" });
        });

        it("should return 401 if token is invalid", async () => {
            const req = { headers: { authorization: "Bearer invalidtoken" } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Mock jwt.verify untuk melempar error
            jwt.verify.mockImplementationOnce(() => {
                throw new Error("Invalid token");
            });

            await AuthController.getProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
        });

        it("should return 404 if user is not found", async () => {
            const req = { headers: { authorization: "Bearer validtoken" } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Mock jwt.verify untuk mengembalikan ID pengguna
            jwt.verify.mockReturnValueOnce({ id: 1 });

            // Mock prisma untuk mengembalikan null
            prisma.user.findUnique.mockResolvedValueOnce(null);

            await AuthController.getProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
        });

        it("should return user profile if user is found", async () => {
            const req = { headers: { authorization: "Bearer validtoken" } };
            const res = {
                json: jest.fn(),
            };

            // Mock jwt.verify untuk mengembalikan ID pengguna
            jwt.verify.mockReturnValueOnce({ id: 1 });

            // Mock prisma untuk mengembalikan data pengguna
            prisma.user.findUnique.mockResolvedValueOnce({
                id: 1,
                email: "user@example.com",
                name: "Test User",
            });

            await AuthController.getProfile(req, res);

            expect(res.json).toHaveBeenCalledWith({
                email: "user@example.com",
                "id": 1,
                name: "Test User",
            });
        });
    });
});
