const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Prisma } = require('@prisma/client');

class AuthController {
    
    async register(req, res) {
        try {
            const { email, password, name } = req.body;

            // Validasi input
            if (!email || !password || !name) {
                return res.status(400).json({
                    error: "Email, password, and name are required",
                });
            }

            // Cek apakah email sudah terdaftar
            const existingUser = await prisma.users.findUnique({
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

            // Buat user baru
            const user = await prisma.users.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                },
            });
            res.json(user);
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
            const user = await prisma.users.findUnique({
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

}

module.exports = new AuthController();