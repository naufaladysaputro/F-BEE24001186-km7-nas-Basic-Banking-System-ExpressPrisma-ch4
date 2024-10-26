// const request = require("supertest");
// const express = require("express");
// const UserController = require("../controllers/users.controller.js"); 


// // Mock Prisma Client
// jest.mock("../config/prisma.js", () => ({
//   users: {
//     findMany: jest.fn(),
//   },
// }));

// const prisma = require("../config/prisma.js");

// const app = express();
// app.use(express.json());
// app.get("/users", UserController.getAllUser);

// describe("UserController - getAllUser", () => {
//   it("should return all users with status 200", async () => {
//     // Mock data untuk hasil prisma.users.findMany()
//     const mockUsers = [
//       { id: 1, name: "John Doe", email: "johndoe@example.com" },
//       { id: 2, name: "Jane Doe", email: "janedoe@example.com" },
//     ];

//     // Setup mock response dari prisma
//     prisma.users.findMany.mockResolvedValue(mockUsers);

//     const response = await request(app).get("/users");

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(mockUsers);
//     expect(prisma.users.findMany).toHaveBeenCalledTimes(1);
//   });

//   it("should return 500 if there is an error", async () => {
//     // Setup mock untuk error
//     prisma.users.findMany.mockRejectedValue(new Error("Database error"));

//     const response = await request(app).get("/users");

//     expect(response.status).toBe(500);
//     expect(response.body).toEqual({ error: "Database error" });
//   });
// });

const UserController = require("../../controllers/users.controller.js");

// Mock Prisma Client
jest.mock("../../config/prisma.js", () => ({
    users: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    profiles: {
        delete: jest.fn(),
    },
}));

const prisma = require("../../config/prisma.js");

describe("UserController - getAllUser", () => {
    it("should return all users with status 200", async () => {
        // Mock data untuk hasil prisma.users.findMany()
        const mockUsers = [
            { id: 1, name: "John Doe", email: "johndoe@example.com" },
            { id: 2, name: "Jane Doe", email: "janedoe@example.com" },
        ];

        // Setup mock response dari prisma
        prisma.users.findMany.mockResolvedValue(mockUsers);

        // Mock objek req dan res
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Panggil controller
        await UserController.getAllUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUsers);
        expect(prisma.users.findMany).toHaveBeenCalledTimes(1);
    });

    it("should return 500 if there is an error", async () => {
        // Setup mock untuk error
        prisma.users.findMany.mockRejectedValue(new Error("Database error"));

        // Mock objek req dan res
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Panggil controller
        await UserController.getAllUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
});


describe("UserController - getUserById", () => {
    it("should return the user with the specified id and status 200", async () => {
        // Mock data untuk hasil prisma.users.findUnique()
        const mockUser = {
            id: 1,
            name: "John Doe",
            email: "johndoe@example.com",
            profile: { bio: "Software Developer" },
        };

        // Setup mock response dari prisma
        prisma.users.findUnique.mockResolvedValue(mockUser);

        // Mock objek req dan res
        const req = { params: { id: "1" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Panggil controller
        await UserController.getUserById(req, res);

        // Uji hasilnya
        expect(res.status).not.toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(mockUser);
        expect(prisma.users.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            include: { profile: true },
        });
    });

    it("should return 400 if user with specified id is not found", async () => {
        // Setup mock untuk tidak menemukan user
        prisma.users.findUnique.mockResolvedValue(null);

        // Mock objek req dan res
        const req = { params: { id: "99" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Panggil controller
        await UserController.getUserById(req, res);

        // Uji hasilnya
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "id not found" });
    });

    it("should return 400 and error message if there is a server error", async () => {
        // Setup mock untuk error
        prisma.users.findUnique.mockRejectedValue(new Error("Database error"));

        // Mock objek req dan res
        const req = { params: { id: "1" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Panggil controller
        await UserController.getUserById(req, res);

        // Uji hasilnya
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
});


describe("UserController - createUserWithProfile", () => {
    it("should create a new user with profile and return it", async () => {
        const req = {
            body: {
                email: "test@example.com",
                name: "Test User",
                password: "password",
                identity_type: "ID",
                identity_number: "123456789",
                address: "Test Address",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const mockUser = { id: 1, ...req.body, profile: { id: 1, userId: 1, ...req.body } };
        prisma.users.create.mockResolvedValue(mockUser);

        await UserController.createUserWithProfile(req, res);

        expect(res.json).toHaveBeenCalledWith(mockUser);
        expect(prisma.users.create).toHaveBeenCalledWith({
            data: {
                email: req.body.email,
                name: req.body.name,
                password: req.body.password,
                profile: {
                    create: {
                        identity_type: req.body.identity_type,
                        identity_number: req.body.identity_number,
                        address: req.body.address,
                    },
                },
            },
            include: { profile: true },
        });
    });

    it("should return 500 if an error occurs", async () => {
        const req = { body: {} };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        prisma.users.create.mockRejectedValue(new Error("Database error"));

        await UserController.createUserWithProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Email, name, password, are required" });
    });
});

describe("UserController - updateUsersWithProfile", () => {
    it("should update an existing user and profile and return updated user", async () => {
        const req = {
            params: { id: "1" },
            body: { email: "updated@example.com" },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const mockExistingUser = {
            id: 1,
            email: "test@example.com",
            profile: { id: 1, identity_type: "ID", identity_number: "123456789", address: "Address" },
        };
        const mockUpdatedUser = { id: 1, ...req.body, profile: mockExistingUser.profile };

        prisma.users.findUnique.mockResolvedValue(mockExistingUser);
        prisma.users.update.mockResolvedValue(mockUpdatedUser);

        await UserController.updateUsersWithProfile(req, res);

        expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
        expect(prisma.users.update).toHaveBeenCalledWith({
            where: { id: parseInt(req.params.id) },
            data: {
                email: req.body.email,
                name: mockExistingUser.name,
                password: mockExistingUser.password,
                profile: {
                    update: {
                        identity_type: mockExistingUser.profile.identity_type,
                        identity_number: mockExistingUser.profile.identity_number,
                        address: mockExistingUser.profile.address,
                    },
                },
            },
            include: { profile: true },
        });
    });

    it("should return 400 if user is not found", async () => {
        const req = { params: { id: "99" }, body: {} };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        prisma.users.findUnique.mockResolvedValue(null);

        await UserController.updateUsersWithProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });
});

describe("UserController - deleteUsersById", () => {
    it("should delete a user and associated profile", async () => {
        const req = { params: { id: "1" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const mockExistingUser = { id: 1, profile: { id: 1, userId: 1 } };
        prisma.users.findUnique.mockResolvedValue(mockExistingUser);
        prisma.profiles.delete.mockResolvedValue({});
        prisma.users.delete.mockResolvedValue({});

        await UserController.deleteUsersById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Data has been deleted" });
        expect(prisma.profiles.delete).toHaveBeenCalledWith({ where: { userId: mockExistingUser.id } });
        expect(prisma.users.delete).toHaveBeenCalledWith({ where: { id: parseInt(req.params.id) } });
    });

    it("should return 400 if user is not found", async () => {
        const req = { params: { id: "99" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        prisma.users.findUnique.mockResolvedValue(null);

        await UserController.deleteUsersById(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should return 500 if an error occurs during deletion", async () => {
        const req = { params: { id: "1" } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        prisma.users.findUnique.mockResolvedValue({ id: 1, profile: { id: 1, userId: 1 } });
        prisma.profiles.delete.mockRejectedValue(new Error("Database error"));

        await UserController.deleteUsersById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
});



  