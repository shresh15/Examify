// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import connectDB from "./config/db.js"; // your db connection file
// import User from "./models/User.js"; // we'll create this
// import multer from "multer";
// // Load env variables
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import { execFile } from "child_process";
// dotenv.config();

// const app = express();
// const port = process.env.PORT || 8000;
// const upload = multer({ dest: "uploads/" });
// // Middleware
// app.use(express.json());
// app.use(cors());

// // Connect to MongoDB
// connectDB();

// // Test route
// app.get("/", (req, res) => {
//   res.send("Hello World from the backend!");
// });

// // Register route
// app.post("/api/auth/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Save new user
//     const newUser = new User({ name, email, password });
//     await newUser.save();

//     res.status(201).json({
//       message: "✅ User registered successfully",
//       user: { id: newUser._id, name: newUser.name, email: newUser.email },
//     });
//   } catch (error) {
//     console.error("❌ Registration error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// app.post("/api/upload-pdf", upload.single("pdf"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "No PDF file uploaded" });
//   }
// });

// // Start server
// app.listen(port, () => {
//   console.log(`✅ Server is running on port ${port}`);
// });

// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js"; // Assuming you have authentication setup
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process"; // For running Python scripts

// Helper to get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
// This must be called early in your application's lifecycle
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enables Cross-Origin Resource Sharing (important for frontend-backend communication)
app.use(express.json()); // Parses incoming JSON requests

// Ensure 'uploads' directory exists for Multer
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer setup for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Store uploaded PDFs in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using timestamp + original extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// PDF upload and Test Generation route
app.post("/api/upload-pdf", upload.single("pdf"), async (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded." });
  }

  const uploadedPdfPath = req.file.path; // Path to the temporarily saved PDF file
  const pythonCommand = process.platform === "win32" ? "python" : "python3"; // Determine Python command based on OS

  try {
    // --- DIAGNOSTIC LOG ---
    // Log the API key length from Node.js process.env *before* spawning Python
    console.log(
      `DEBUG (Node.js): process.env.GEMINI_API_KEY length: ${
        process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
      }`
    );
    // --- END DIAGNOSTIC LOG ---

    // --- STEP: Extract Text and Generate Questions using a single Python script (extract_pdf.py) ---
    const pythonScriptPath = path.join(__dirname, "scripts", "extract_pdf.py");
    console.log(
      `Executing Python script: ${pythonScriptPath} with PDF: ${uploadedPdfPath}`
    );

    const { stdout: pythonStdout, stderr: pythonStderr } = await new Promise(
      (resolve, reject) => {
        execFile(
          pythonCommand,
          [pythonScriptPath, uploadedPdfPath],
          { env: process.env }, // Pass Node.js process's environment variables to Python
          (error, stdout, stderr) => {
            // Clean up the uploaded PDF file after script execution (important!)
            fs.unlink(uploadedPdfPath, (err) => {
              if (err) console.error("Error deleting uploaded PDF:", err);
            });

            if (error) {
              console.error("Error running extract_pdf.py:", error);
              // Log any stderr from Python, which might contain useful error info
              if (stderr) console.error("Python stderr:", stderr);
              return reject(
                new Error(
                  `PDF processing and question generation failed: ${
                    stderr || error.message
                  }`
                )
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

    // Ensure generatedQuestions is an array
    if (!Array.isArray(generatedQuestions)) {
      console.warn(
        "Python script did not return an array for questions. Assuming empty questions."
      );
      generatedQuestions = [];
    }

    console.log(
      `Successfully processed PDF. Extracted text length: ${extractedText.length}, Generated questions: ${generatedQuestions.length}`
    );

    // --- Send back the extracted text (optional) and generated questions ---
    return res.json({
      success: true,
      text: extractedText, // You can still return this if your frontend wants to display it
      questions: generatedQuestions, // This is the crucial part for your test
    });
  } catch (backendError) {
    console.error("Backend processing error:", backendError.message);
    // Ensure uploaded file is cleaned up if an error occurs mid-process (if not already)
    if (fs.existsSync(uploadedPdfPath)) {
      fs.unlink(uploadedPdfPath, (err) => {
        if (err)
          console.error("Error deleting uploaded PDF on backendError:", err);
      });
    }
    return res
      .status(500)
      .json({ error: `Server processing error: ${backendError.message}` });
  }
});

// Default route
app.get("/", (req, res) => {
  res.send("Hello from backend server. API is running!");
});

// Auth routes (assuming these are separate files/logic)
app.use("/api/auth", authRoutes);

// MongoDB setup
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in your .env file.");
  // process.exit(1); // Consider handling this more gracefully in production
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    // process.exit(1); // Consider handling this more gracefully
  });

// Final app.listen
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
