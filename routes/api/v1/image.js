const express = require("express");
const ImageController = require("../../../controllers/images.controller"); // Mengimpor ImageController
const upload = require("../../../libs/upload");
const router = express.Router();

// Rute untuk mengunggah gambar
router.post("/", upload.single("image"), ImageController.imagekitUpload);

// Rute untuk mendapatkan semua gambar
router.get("/", ImageController.getAllImages);

// Rute untuk mendapatkan gambar berdasarkan ID
router.get("/:id", ImageController.getImageById);

// Rute untuk memperbarui gambar berdasarkan ID
router.put("/:id", upload.single("image"), ImageController.updateImageById);

// Rute untuk menghapus gambar berdasarkan ID
router.delete("/:id", ImageController.deleteImageById);

module.exports = router;
