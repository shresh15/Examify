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
app.use(cors());
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
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

app.post("/api/upload-pdf", upload.single("pdf"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No PDF file uploaded." });
    }

    // Retrieve quiz settings from the request body
    const numQuestions = req.body.numQuestions || '10';
    const timeDuration = req.body.timeDuration || '15';
    const difficulty = req.body.difficulty || 'medium';

    const uploadedPdfPath = req.file.path;
    const pythonCommand = process.platform === "win32" ? "python" : "python3";
    const pythonScriptPath = path.join(__dirname, "scripts", "extract_pdf.py");

    try {
        const { stdout: pythonStdout, stderr: pythonStderr } = await new Promise(
            (resolve, reject) => {
                execFile(
                    pythonCommand,
                    [pythonScriptPath, uploadedPdfPath, numQuestions, timeDuration, difficulty], // Pass all arguments here
                    { env: process.env },
                    (error, stdout, stderr) => {
                        fs.unlink(uploadedPdfPath, (err) => {
                            if (err) console.error("Error deleting uploaded PDF:", err);
                        });
                        if (error) {
                            console.error("Error running extract_pdf.py:", error);
                            if (stderr) console.error("Python stderr:", stderr);
                            return reject(
                                new Error(`PDF processing and question generation failed: ${stderr || error.message}`)
                            );
                        }
                        resolve({ stdout, stderr });
                    }
                );
            }
        );

        let scriptOutput;
        try {
            scriptOutput = JSON.parse(pythonStdout);
        } catch (parseError) {
            console.error("Failed to parse extract_pdf.py output:", parseError);
            return res
                .status(500)
                .json({ error: "Failed to parse Python script output." });
        }

        if (scriptOutput.error) {
            console.error("Error reported by extract_pdf.py:", scriptOutput.error);
            return res
                .status(500)
                .json({ error: `Python script error: ${scriptOutput.error}` });
        }

        const extractedText = scriptOutput.text || "";
        let generatedQuestions = scriptOutput.questions || [];

        if (!Array.isArray(generatedQuestions)) {
            console.warn(
                "Python script did not return an array for questions. Assuming empty questions."
            );
            generatedQuestions = [];
        }

        console.log(
            `Successfully processed PDF. Extracted text length: ${extractedText.length}, Generated questions: ${generatedQuestions.length}`
        );

        return res.json({
            success: true,
            text: extractedText,
            questions: generatedQuestions,
        });
    } catch (backendError) {
        console.error("Backend processing error:", backendError.message);
        if (fs.existsSync(uploadedPdfPath)) {
            fs.unlink(uploadedPdfPath, (err) => {
                if (err) console.error("Error deleting uploaded PDF on backendError:", err);
            });
        }
        return res
            .status(500)
            .json({ error: `Server processing error: ${backendError.message}` });
    }
});

app.get("/", (req, res) => {
    res.send("Hello from backend server. API is running!");
});

app.use("/api/auth", authRoutes);

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("Error: MONGO_URI is not defined in your .env file.");
}

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully!"))
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
    });

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});