import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // your db connection file
import User from "./models/User.js";    // we'll create this

// Load env variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Test route
app.get("/", (req, res) => {
    res.send("Hello World from the backend!");
});

// Register route
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Save new user
        const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).json({
            message: "✅ User registered successfully",
            user: { id: newUser._id, name: newUser.name, email: newUser.email },
        });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Start server
app.listen(port, () => {
    console.log(`✅ Server is running on port ${port}`);
});
