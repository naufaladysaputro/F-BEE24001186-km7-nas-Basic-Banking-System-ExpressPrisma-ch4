const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthController {
    async register(req, res) {
        try {
            const { email, password, name, identityType, identityNumber, address } = req.body;

            // Validasi input
            if (!email || !password || !name) {
                return res.status(400).json({
                    error: "Email, password, and name are required",
                });
            }

            // Cek apakah email sudah terdaftar
            const existingUser = await prisma.user.findUnique({
                where: { email },   
            });
            if (existingUser) {
                return res.status(400).json({
                    error: "Email already exists",
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Buat user baru beserta profil
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    profile: {
                        create: {
                            identityType,
                            identityNumber,
                            address,
                        },
                    },
                },
                include: { profile: true },
            });

            res.json({ message: "Registration successful" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validasi input
            if (!email || !password) {
                return res.status(400).json({
                    error: "Email and password are required",
                });
            }

            // Cek apakah email terdaftar
            const user = await prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                return res.status(400).json({
                    error: "Email not found",
                });
            }

            // Cek apakah password benar
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    error: "Invalid password",
                });
            }

            // Buat token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            console.log("Generated Token:", token);
            res.json({ token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const token = req.headers.authorization?.split(" ")[1];

            // Verifikasi token
            if (!token) {
                return res.status(401).json({ error: "Token is required" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;

            // Ambil data pengguna berdasarkan ID
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { // Hanya ambil field yang diperlukan
                    email: true,
                    name: true,
                },
            });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Kembalikan data pengguna
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AuthController();
