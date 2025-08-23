import React, { useState } from "react";
import axios from "axios";

const PdfUploader = ({ onQuestionsReady }) => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedMcqsCount, setGeneratedMcqsCount] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setExtractedText("");
    setError("");
    setGeneratedMcqsCount(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setError("");
    setExtractedText("");
    setGeneratedMcqsCount(0);

    const formData = new FormData();
    formData.append("pdf", file); // 'pdf' should match the name expected by multer on the backend

    try {
      // Send the PDF file to the backend
      // The backend (server.js) is expected to return { success: true, text: "...", questions: [...] }
      const response = await axios.post(
        "http://localhost:8000/api/upload-pdf",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }, // Important for file uploads
        }
      );

      // Handle successful response from backend
      setExtractedText(response.data.text || ""); // Store extracted text
      const questions = response.data.questions || []; // Get the questions array
      setGeneratedMcqsCount(questions.length); // Update the count for display

      // Call the onQuestionsReady prop to pass the questions to the parent component (UserPage)
      if (onQuestionsReady) {
        onQuestionsReady(questions);
      }
    } catch (err) {
      // Handle errors during the upload or processing
      console.error("PDF upload or question generation error:", err);
      setError(
        err.response?.data?.error ||
          "Error uploading file or generating questions."
      );
      setExtractedText(""); // Clear text on error
      setGeneratedMcqsCount(0); // Reset question count on error
    } finally {
      setLoading(false); // Set loading to false once the process is complete (success or error)
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-inner w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Upload PDF to Create Test Series
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center space-y-4 w-full"
      >
        <label
          htmlFor="pdf-upload"
          className="w-full cursor-pointer bg-white border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition duration-200 ease-in-out"
        >
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={loading} // Disable input when loading
            className="hidden" // Hide the default file input
          />
          {file ? (
            <p className="text-purple-700 font-medium break-words">
              {file.name}
            </p>
          ) : (
            <p className="text-gray-500">
              Drag & Drop your PDF here, or{" "}
              <span className="text-purple-600 font-medium">Browse</span>
            </p>
          )}
          {/* <p className="text-sm text-gray-400 mt-2">
            Max file size: 10MB (approx)
          </p> */}
        </label>

        <button
          type="submit"
          disabled={loading || !file} // Disable button if loading or no file selected
          className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition duration-300 ease-in-out ${
            loading || !file
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-500 hover:bg-purple-700 shadow-md"
          }`}
        >
          {loading ? "Processing PDF..." : "Upload & Generate Test"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-red-600 font-medium text-center">{error}</p>
      )}

      {/* Display a snippet of extracted text and question count */}
      {(extractedText || generatedMcqsCount > 0) && !error && (
        <div className="mt-6 w-full text-left bg-purple-50 p-4 rounded-lg border border-purple-200">
          {extractedText && (
            <div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                Extracted Text Snippet:
              </h3>
              <div className="bg-white p-3 rounded-md border border-gray-200 text-sm text-gray-700 overflow-auto max-h-40">
                <pre className="whitespace-pre-wrap font-sans">
                  {extractedText.substring(0, 500)}
                  {extractedText.length > 500 ? "..." : ""}
                </pre>
              </div>
            </div>
          )}

          {generatedMcqsCount > 0 && (
            <p className="mt-4 text-black font-semibold text-lg text-center">
              {generatedMcqsCount} MCQs Generated
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
