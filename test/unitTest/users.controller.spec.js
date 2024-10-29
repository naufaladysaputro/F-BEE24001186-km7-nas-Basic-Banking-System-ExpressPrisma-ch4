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
    user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    profile: {
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
        prisma.user.findMany.mockResolvedValue(mockUsers);

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
        expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    it("should return 500 if there is an error", async () => {
        // Setup mock untuk error
        prisma.user.findMany.mockRejectedValue(new Error("Database error"));

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
        prisma.user.findUnique.mockResolvedValue(mockUser);

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
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            include: { profile: true },
        });
    });

    it("should return 400 if user with specified id is not found", async () => {
        // Setup mock untuk tidak menemukan user
        prisma.user.findUnique.mockResolvedValue(null);

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
        expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should return 400 and error message if there is a server error", async () => {
        // Setup mock untuk error
        prisma.user.findUnique.mockRejectedValue(new Error("Database error"));

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


 describe("createUserWithProfile", () => {
    it("should create a user and profile with status 200", async () => {
      const req = {
        body: {
          email: "johndoe@example.com",
          name: "John Doe",
          password: "password123",
          identityType: "ID",
          identityNumber: "123456789",
          address: "123 Main St",
        },
      };

      const mockUser = {
        id: 1,
        email: "johndoe@example.com",
        name: "John Doe",
        profile: {},
      };

      prisma.user.create.mockResolvedValue(mockUser);

      const res = {
        json: jest.fn(),
      };

      await UserController.createUserWithProfile(req, res);

      expect(res.json).toHaveBeenCalledWith(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: req.body.email,
          name: req.body.name,
          password: req.body.password,
          profile: {
            create: {
              identityType: req.body.identityType,
              identityNumber: req.body.identityNumber,
              address: req.body.address,
            },
          },
        },
        include: { profile: true },
      });
    });

    it("should return 400 if required fields are missing", async () => {
      const req = { body: { name: "John Doe", password: "password123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserController.createUserWithProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email, name, and password are required",
      });
    });

    it("should return 500 if there is an error", async () => {
      const req = {
        body: {
          email: "johndoe@example.com",
          name: "John Doe",
          password: "password123",
        },
      };

      prisma.user.create.mockRejectedValue(new Error("Database error"));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserController.createUserWithProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });


  describe("updateUsersWithProfile", () => {
    it("should update a user and profile with status 200", async () => {
      const req = {
        params: { id: "1" },
        body: {
          email: "updated@example.com",
          name: "Updated Name",
        },
      };

      const mockUser = {
        id: 1,
        email: "johndoe@example.com",
        name: "John Doe",
        profile: {
          identityType: "ID",
          identityNumber: "123456789",
          address: "123 Main St",
        },
      };

      const updatedUser = { ...mockUser, email: req.body.email };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(updatedUser);

      const res = {
        json: jest.fn(),
      };

      await UserController.updateUsersWithProfile(req, res);

      expect(res.json).toHaveBeenCalledWith(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          email: req.body.email,
          name: req.body.name,
          password: mockUser.password, // assuming password is unchanged
          profile: {
            update: {
              identityType: mockUser.profile.identityType,
              identityNumber: mockUser.profile.identityNumber,
              address: mockUser.profile.address,
            },
          },
        },
        include: { profile: true },
      });
    });

    it("should return 400 if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const req = { params: { id: "1" }, body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserController.updateUsersWithProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should return 500 if there is an error", async () => {
      const req = { params: { id: "1" }, body: {} };

      prisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserController.updateUsersWithProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  describe("deleteUsersById", () => {
    it("should delete a user with status 200", async () => {
      const req = { params: { id: "1" } };

      const mockUser = { id: 1, profile: { userId: 1 } };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.profile.delete.mockResolvedValue({});
      prisma.user.delete.mockResolvedValue({});

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserController.deleteUsersById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Data has been deleted" });
    });

    it("should return 400 if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const req = { params: { id: "1" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserController.deleteUsersById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should return 500 if there is an error", async () => {
      const req = { params: { id: "1" } };

      prisma.user.findUnique.mockResolvedValue({ id: 1 });
      prisma.profile.delete.mockRejectedValue(new Error("Database error"));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserController.deleteUsersById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });



  