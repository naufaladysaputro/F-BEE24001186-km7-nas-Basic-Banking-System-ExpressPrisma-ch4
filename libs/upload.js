// libs/upload.js
const multer = require('multer');

// Konfigurasi penyimpanan di memory
const storage = multer.memoryStorage();

// Inisialisasi multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal ukuran file 2 MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/; // Jenis file yang diizinkan
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(file.originalname.toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: File upload hanya menerima gambar!"));
    }
});

// Ekspor middleware multer
module.exports = upload;
