// ResultPage.jsx

import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize once outside the component to avoid recreating on every render
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [openExplanations, setOpenExplanations] = useState({});
  const [generatedExplanations, setGeneratedExplanations] = useState({});
  const [loadingExplanations, setLoadingExplanations] = useState({});

  const hasSavedRecord = useRef(false);

  const { questions, userAnswers, score, timeDuration, timeTakenInSeconds } =
    location.state || {};

  useEffect(() => {
    if (!hasSavedRecord.current && questions && questions.length > 0) {
      let currentRecords = JSON.parse(localStorage.getItem("testRecords"));

      if (!Array.isArray(currentRecords)) {
        currentRecords = [];
      }

      const totalQuestions = questions.length;
      const accuracy =
        totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(2) : 0;

      const newRecord = {
        date: new Date().toISOString(),
        totalQuestions,
        score,
        accuracy,
        timeTakenInSeconds,
        timeDuration,
      };

      const updatedRecords = [...currentRecords, newRecord];
      localStorage.setItem("testRecords", JSON.stringify(updatedRecords));

      hasSavedRecord.current = true;
    }
  }, [questions, score, timeTakenInSeconds, timeDuration]);

  const totalQuestions = questions?.length || 0;
  const accuracy =
    totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(2) : 0;
  const timeManagement =
    timeDuration > 0
      ? ((timeTakenInSeconds / (timeDuration * 60)) * 100).toFixed(2)
      : 0;

  if (!questions || totalQuestions === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
        <div className="text-xl text-gray-700">
          No results found. Please take a test first.
        </div>
        <button
          onClick={() => navigate("/userpage")}
          className="mt-4 py-2 px-6 rounded-full font-semibold bg-indigo-500 text-white"
        >
          Go Back to Upload
        </button>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getOptionLetter = (index) => String.fromCharCode(65 + index);

  const generateExplanation = async (
    index,
    question,
    userAnswerFormatted,
    correctAnswerFormatted,
  ) => {
    // Prevent duplicate API calls if already loading
    if (loadingExplanations[index]) return;

    try {
      setLoadingExplanations((prev) => ({ ...prev, [index]: true }));
      setGeneratedExplanations((prev) => ({
        ...prev,
        [index]: "Generating explanation...",
      }));
      setOpenExplanations((prev) => ({
        ...prev,
        [index]: true,
      }));

      // Uses gemini-3.5-flash-lite so it has a separate free-tier quota from gemini-3.8-flash
      const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
      });

      const prompt = `Question: ${question}
User's Incorrect Answer: ${userAnswerFormatted || "Not answered"}
Correct Answer: ${correctAnswerFormatted}
Task:
- Explain briefly why the user's selected answer is incorrect (or clarify the concept if unanswered) and why the correct answer is right.
- Keep it concise, clear, and helpful (2-4 sentences).
- Do not use markdown formatting like ** or bullet points. Keep it as a single plain paragraph.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setGeneratedExplanations((prev) => ({
        ...prev,
        [index]: text,
      }));
    } catch (error) {
      console.error("Error generating explanation:", error);
      setGeneratedExplanations((prev) => ({
        ...prev,
        [index]: " Failed to generate explanation. Please try again.",
      }));
      // Clear failed state so the user can retry on next click
      setTimeout(() => {
        setGeneratedExplanations((prev) => {
          const updated = { ...prev };
          if (updated[index]?.startsWith("⚠️")) {
            delete updated[index];
          }
          return updated;
        });
      }, 3000);
    } finally {
      setLoadingExplanations((prev) => ({ ...prev, [index]: false }));
    }
  };

  const toggleExplanation = (index) => {
    setOpenExplanations((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl p-8 sm:p-10 md:p-12 w-full max-w-4xl mx-auto my-8">
        <h1 className="text-4xl font-extrabold text-purple-800 mb-6 text-center">
          Test Results
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-8">
          <div className="p-6 bg-blue-50 rounded-lg shadow-md border border-blue-200">
            <h2 className="text-xl font-bold text-blue-700">Correctness</h2>
            <p className="text-4xl font-extrabold text-blue-900 mt-2">
              {score} / {totalQuestions}
            </p>
          </div>
          <div className="p-6 bg-green-50 rounded-lg shadow-md border border-green-200">
            <h2 className="text-xl font-bold text-green-700">Accuracy</h2>
            <p className="text-4xl font-extrabold text-green-900 mt-2">
              {accuracy}%
            </p>
          </div>
          <div className="p-6 bg-orange-50 rounded-lg shadow-md border border-orange-200">
            <h2 className="text-xl font-bold text-orange-700">Time Taken</h2>
            <p className="text-4xl font-extrabold text-orange-900 mt-2">
              {formatTime(timeTakenInSeconds)}
            </p>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Your Performance
          </h3>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <span className="w-32 font-semibold text-gray-700">Accuracy</span>
              <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${accuracy}%` }}
                ></div>
              </div>
              <span className="font-bold text-green-700">{accuracy}%</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="w-32 font-semibold text-gray-700">
                Time Management
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${Math.min(100, timeManagement)}%` }}
                ></div>
              </div>
              <span className="font-bold text-purple-700">
                {timeManagement}%
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-6 text-left border border-gray-200 rounded-lg p-6 bg-gray-50 max-h-96 overflow-y-auto">
          <h3 className="text-2xl font-bold text-gray-700 mb-3 text-center">
            Detailed Review
          </h3>
          {questions.map((q, index) => {
            const userAnswer = userAnswers?.[index];
            const isCorrect =
              userAnswer &&
              userAnswer.toUpperCase() === q.correct_answer.toUpperCase();

            const selectedOptionIndex = q.options.findIndex(
              (opt, i) => getOptionLetter(i) === userAnswer?.toUpperCase(),
            );
            const selectedOptionText =
              selectedOptionIndex !== -1
                ? q.options[selectedOptionIndex]
                : null;

            const correctOptionIndex = q.options.findIndex(
              (opt, i) => getOptionLetter(i) === q.correct_answer.toUpperCase(),
            );
            const correctOptionText =
              correctOptionIndex !== -1 ? q.options[correctOptionIndex] : null;

            const formattedUserAnswer = userAnswer
              ? `${userAnswer}. ${selectedOptionText}`
              : "No answer selected";
            const formattedCorrectAnswer = `${q.correct_answer}. ${correctOptionText}`;

            return (
              <div
                key={index}
                className={`p-4 rounded-lg shadow-sm border ${
                  isCorrect
                    ? "border-green-300 bg-green-50"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <p className="font-semibold text-gray-900 mb-1">
                  Q{index + 1}: {q.question}
                </p>
                <p className="text-gray-700 text-sm">
                  Your answer:{" "}
                  <span
                    className={`font-medium ${
                      isCorrect ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {formattedUserAnswer}
                  </span>
                </p>
                <p className="text-gray-700 text-sm">
                  Correct answer:{" "}
                  <span className="font-medium text-green-700">
                    {formattedCorrectAnswer}
                  </span>
                </p>

                {/* Render explanation button ONLY for wrong or unanswered questions */}
                {!isCorrect && (
                  <div className="mt-4 border-t border-red-200 pt-3">
                    <button
                      disabled={loadingExplanations[index]}
                      onClick={() => {
                        if (generatedExplanations[index]) {
                          toggleExplanation(index);
                        } else {
                          generateExplanation(
                            index,
                            q.question,
                            formattedUserAnswer,
                            formattedCorrectAnswer,
                          );
                        }
                      }}
                      className="text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 font-semibold text-sm transition-colors duration-200 focus:outline-none"
                    >
                      {loadingExplanations[index]
                        ? "Generating..."
                        : generatedExplanations[index]
                          ? openExplanations[index]
                            ? "Hide Explanation"
                            : "Show Explanation"
                          : "Explain Mistake"}
                    </button>
                    {openExplanations[index] && (
                      <div className="mt-2 p-3 bg-white border border-indigo-200 rounded-md text-gray-800 text-sm whitespace-pre-line">
                        {generatedExplanations[index]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
          <button
            onClick={() =>
              navigate("/test", { state: { questions, timeDuration } })
            }
            className="py-3 px-8 rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Retake Test
          </button>
          <button
            onClick={() => navigate("/userpage")}
            className="py-3 px-8 rounded-full font-bold bg-gray-600 hover:bg-gray-700 text-white shadow-lg transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-gray-300"
          >
            Go Back to Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
