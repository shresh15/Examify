import React, { useState } from "react";
import axios from "axios";
import { FiUploadCloud, FiRefreshCw, FiFile, FiXCircle } from "react-icons/fi";

const PdfUploader = ({
  onQuestionsReady,
  numQuestions,
  timeDuration,
  difficulty,
}) => {
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
    formData.append("pdf", file);
    formData.append("numQuestions", numQuestions);
    // --- THIS IS THE CRITICAL LINE TO VERIFY ---
    formData.append("timeDuration", timeDuration);
    formData.append("difficulty", difficulty);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/upload-pdf",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setExtractedText(response.data.text || "");
      const questions = response.data.questions || [];
      setGeneratedMcqsCount(questions.length);

      if (onQuestionsReady) {
        onQuestionsReady(questions);
      }
    } catch (err) {
      console.error("PDF upload or question generation error:", err);
      setError(
        err.response?.data?.error ||
          "Error uploading file or generating questions."
      );
      setExtractedText("");
      setGeneratedMcqsCount(0);
    } finally {
      setLoading(false);
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
            disabled={loading}
            className="hidden"
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
        </label>

        <button
          type="submit"
          disabled={loading || !file}
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

      {(extractedText || generatedMcqsCount > 0) && !error && (
        <div className="mt-6 w-full text-left bg-purple-50 p-4 rounded-lg border border-purple-200">
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
