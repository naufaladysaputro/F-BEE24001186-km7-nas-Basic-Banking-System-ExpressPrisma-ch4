const imagekit = require("../libs/imagekit");
const prisma = require("../config/prisma");

class ImageController {
  
  // Get all images
  async getAllImages(req, res) {
    try {
      const images = await prisma.image.findMany({
        include: { user: true }, // Menyertakan informasi user jika diperlukan
      });
      res.status(200).json({
        status: true,
        data: images,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  // Get image by ID
  async getImageById(req, res) {
    try {
      const { id } = req.params;
      const image = await prisma.image.findUnique({
        where: { id: parseInt(id) },
        include: { user: true }, // Menyertakan informasi user jika diperlukan
      });

      if (!image) {
        return res.status(404).json({
          status: false,
          message: "Image not found",
        });
      }

      res.status(200).json({
        status: true,
        data: image,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  // Create and upload image (existing method)
  async imagekitUpload(req, res) {
    try {
      const { title, description, userId } = req.body;

      const userExists = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
      });

      if (!userExists) {
        return res.status(400).json({
          status: false,
          message: "Invalid user ID",
        });
      }

      const stringFile = req.file.buffer.toString("base64");

      const uploadFile = await imagekit.upload({
        fileName: req.file.originalname,
        file: stringFile,
      });

      const imageRecord = await prisma.image.create({
        data: {
          title,
          description,
          url: uploadFile.url,
          userId: parseInt(userId),
        },
      });

      res.status(200).json({
        status: true,
        data: {
          id: imageRecord.id,
          name: uploadFile.name,
          url: uploadFile.url,
          type: uploadFile.type,
          title: imageRecord.title,
          description: imageRecord.description,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  // Update image by ID
  async updateImageById(req, res) {
    try {
      const { id } = req.params;
      const { title, description } = req.body;

      const existingImage = await prisma.image.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingImage) {
        return res.status(404).json({
          status: false,
          message: "Image not found",
        });
      }

      const updatedImage = await prisma.image.update({
        where: { id: parseInt(id) },
        data: {
          title: title || existingImage.title,
          description: description || existingImage.description,
        },
      });

      res.status(200).json({
        status: true,
        data: updatedImage,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  // Delete image by ID
  async deleteImageById(req, res) {
    try {
      const { id } = req.params;

      const existingImage = await prisma.image.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingImage) {
        return res.status(404).json({
          status: false,
          message: "Image not found",
        });
      }

      await prisma.image.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({
        status: true,
        message: "Image has been deleted",
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
}


module.exports = new ImageController();
