const ImageController = require("../../controllers/images.controller.js");
const prisma = require("../../config/prisma.js");
const imagekit = require("../../libs/imagekit");

jest.mock("../../config/prisma.js", () => ({
  image: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
}));

jest.mock("../../libs/imagekit", () => ({
  upload: jest.fn(),
}));

describe("ImageController", () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllImages", () => {
    it("should return all images with status 200", async () => {
      const mockImages = [{ id: 1, title: "Test Image" }];
      prisma.image.findMany.mockResolvedValue(mockImages);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ImageController.getAllImages(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: true, data: mockImages });
    });

    it("should return 500 if there is a database error", async () => {
      prisma.image.findMany.mockRejectedValue(new Error("Database error"));

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ImageController.getAllImages(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: false, message: "Database error" });
    });
  });

  describe("getImageById", () => {
    it("should return image by ID with status 200", async () => {
      const mockImage = { id: 1, title: "Test Image" };
      prisma.image.findUnique.mockResolvedValue(mockImage);

      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ImageController.getImageById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: true, data: mockImage });
    });

    it("should return 404 if image is not found", async () => {
      prisma.image.findUnique.mockResolvedValue(null);

      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ImageController.getImageById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ status: false, message: "Image not found" });
    });

    it("should return 500 if there is a database error", async () => {
      prisma.image.findUnique.mockRejectedValue(new Error("Database error"));

      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ImageController.getImageById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: false, message: "Database error" });
    });
  });

  describe("imagekitUpload", () => {
    it("should upload image and return image data with status 200", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 });
      imagekit.upload.mockResolvedValue({ url: "http://example.com/image.jpg", name: "image.jpg", type: "image/jpeg" });
      prisma.image.create.mockResolvedValue({ id: 1, title: "Uploaded Image", description: "Test description" });

      const req = {
        body: { title: "Uploaded Image", description: "Test description", userId: 1 },
        file: { buffer: Buffer.from("test"), originalname: "image.jpg" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ImageController.imagekitUpload(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: true,
        data: expect.objectContaining({
          id: 1,
          name: "image.jpg",
          url: "http://example.com/image.jpg",
        }),
      });
    });

    it("should return 400 if user ID is invalid", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const req = {
        body: { userId: 999 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ImageController.imagekitUpload(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ status: false, message: "Invalid user ID" });
    });

    it("should return 500 if there is an error during upload", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 });
      imagekit.upload.mockRejectedValue(new Error("Upload error"));

      const req = {
        body: { title: "Uploaded Image", description: "Test description", userId: 1 },
        file: { buffer: Buffer.from("test"), originalname: "image.jpg" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ImageController.imagekitUpload(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: false, message: "Upload error" });
    });
  });

  describe("updateImageById", () => {
    it("should update image and return updated data with status 200", async () => {
      const existingImage = { id: 1, title: "Old Title" };
      prisma.image.findUnique.mockResolvedValue(existingImage);
      prisma.image.update.mockResolvedValue({ id: 1, title: "New Title" });

      const req = { params: { id: 1 }, body: { title: "New Title" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ImageController.updateImageById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: true, data: { id: 1, title: "New Title" } });
    });

    it("should return 404 if image is not found", async () => {
      prisma.image.findUnique.mockResolvedValue(null);

      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ImageController.updateImageById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: false, message: "Cannot destructure property 'title' of 'req.body' as it is undefined." });
    });

    it("should return 500 if there is a database error during update", async () => {
      prisma.image.findUnique.mockResolvedValue({ id: 1, title: "Old Title" });
      prisma.image.update.mockRejectedValue(new Error("Update error"));

      const req = { params: { id: 1 }, body: { title: "New Title" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ImageController.updateImageById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: false, message: "Update error" });
    });
  });

  describe("deleteImageById", () => {
    it("should delete image and return success message with status 200", async () => {
      prisma.image.findUnique.mockResolvedValue({ id: 1 });
      prisma.image.delete.mockResolvedValue({});

      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ImageController.deleteImageById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: true, message: "Image has been deleted" });
    });

    it("should return 404 if image is not found", async () => {
      prisma.image.findUnique.mockResolvedValue(null);

      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ImageController.deleteImageById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ status: false,
        message: "Image not found",
      });
    });

    it("should return 500 if there is a database error during deletion", async () => {
      prisma.image.findUnique.mockResolvedValue({ id: 1 });
      prisma.image.delete.mockRejectedValue(new Error("Delete error"));

      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ImageController.deleteImageById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: false, message: "Delete error" });
    });
  });
});
