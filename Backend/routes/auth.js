import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, phone, password, image } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please enter name, email, and password." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User with that email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            name,
            email,
            phone: phone || '',
            password: hashedPassword,
            image: image || undefined
        });

        await user.save();

        const payload = {
            user: {
                id: user._id,
            },
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: "1h" },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    message: 'User registered successfully!',
                    token,
                    user: { id: user._id, name: user.name, email: user.email, phone: user.phone, image: user.image }
                });
            }
        );
    } catch (error) {
        console.error("Registration error:", error.message);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }
        res.status(500).json({ message: "Server error during registration." });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const payload = {
            user: {
                id: user._id,
            },
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: "1h" },
            (err, token) => {
                if (err) throw err;
                res.json({
                    message: 'Login successful!',
                    token,
                    user: { id: user._id, name: user.name, email: user.email, phone: user.phone, image: user.image }
                });
            }
        );
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Server error during login." });
    }
});

export default router; 