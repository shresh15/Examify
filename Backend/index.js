import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();

// --- IMPROVED CORS ---
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "https://your-deployed-frontend.com"],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});



app.post("/api/upload-pdf", upload.single("pdf"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No PDF file uploaded." });
    }

    const uploadedPdfPath = req.file.path;
    const numQuestions = req.body.numQuestions || '10';
    const timeDuration = req.body.timeDuration || '15';
    const difficulty = req.body.difficulty || 'medium';

    const pythonCommand = process.platform === "win32" ? "python" : "python3";
    const pythonScriptPath = path.join(__dirname, "scripts", "extract_pdf.py");
    
    // Verify Python script exists
    if (!fs.existsSync(pythonScriptPath)) {
        console.error(`Python script not found at: ${pythonScriptPath}`);
        return res.status(500).json({ 
            error: `Python script not found. Expected at: ${pythonScriptPath}` 
        });
    }

    try {
        const { stdout, stderr } = await new Promise((resolve, reject) => {
            execFile(
                pythonCommand,
                [pythonScriptPath, uploadedPdfPath, numQuestions, timeDuration, difficulty],
                {
                    env: process.env,
                    timeout: 120000 // 2 minutes timeout for the Python process
                },
                (error, stdout, stderr) => {
                    // Always delete file after processing
                    if (fs.existsSync(uploadedPdfPath)) {
                        fs.unlinkSync(uploadedPdfPath);
                    }

                    if (error) {
                        console.error("Python Exec Error:", error.message);
                        console.error("Python stderr:", stderr);
                        console.error("Python stdout:", stdout);
                        return reject({ message: error.message, stderr, stdout });
                    }
                    resolve({ stdout, stderr });
                }
            );
        });

        // Log stdout and stderr for debugging
        if (stderr) {
            console.log("Python stderr:", stderr);
        }
        console.log("Python stdout:", stdout);

        let scriptOutput;
        try {
            scriptOutput = JSON.parse(stdout);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError.message);
            console.error("Raw stdout:", stdout);
            return res.status(500).json({ 
                error: `Failed to parse Python output: ${parseError.message}. Output: ${stdout.substring(0, 500)}` 
            });
        }

        if (scriptOutput.error) {
            console.error("Script Error:", scriptOutput.error);
            return res.status(500).json({ error: scriptOutput.error });
        }

        return res.json({
            success: true,
            text: scriptOutput.text || "",
            questions: scriptOutput.questions || [],
        });

    } catch (err) {
        console.error("Route Error:", err);
        console.error("Error details:", {
            message: err.message,
            stderr: err.stderr,
            stdout: err.stdout,
            stack: err.stack
        });
        return res.status(500).json({
            error: err.stderr || err.stdout || err.message || "An internal error occurred during PDF processing."
        });
    }
});

app.get("/", (req, res) => {
    res.send("API is running!");
});

app.use("/api/auth", authRoutes);

// Database Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined.");
    process.exit(1);
}

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Failed:", err.message));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});