import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Extract text from an image using Gemini Vision API
 * @param {File} imageFile - The image file to extract text from
 * @returns {Promise<{text: string}>} - The extracted text
 */
export const geminiService = {
  async extractTextFromImage(imageFile) {
    try {
      if (!API_KEY) {
        throw new Error("Gemini API key is not configured");
      }

      // Use a free model - gemini-2.5-flash
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash" 
      });

      // Convert image file to base64
      const imageData = await fileToBase64(imageFile);

      const prompt = "Extract all text from this image. Return only the extracted text without any additional formatting or explanation.";

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData,
            mimeType: imageFile.type,
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      return { text };
    } catch (error) {
      console.error("Error extracting text from image:", error);
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  },

  async convertHandwrittenNotesToText(imageFile) {
    try {
      if (!API_KEY) {
        throw new Error("Gemini API key is not configured");
      }

      // Use a free model - gemini-2.5-flash
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash" 
      });

      // Convert image file to base64
      const imageData = await fileToBase64(imageFile);

      const prompt = "This image contains handwritten notes. Convert the handwritten text to digital text. Return only the converted text without any additional formatting, explanation, or markdown.";

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData,
            mimeType: imageFile.type,
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error) {
      console.error("Error converting handwritten notes:", error);
      throw new Error(`Failed to convert handwritten notes: ${error.message}`);
    }
  },
};

/**
 * Convert a file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 encoded string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(",")[1]; // Remove data:image/...;base64, prefix
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

