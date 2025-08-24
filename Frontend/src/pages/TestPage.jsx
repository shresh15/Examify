import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, CheckCircle, Clock, XCircle } from "lucide-react"; // Added more icons

const TestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve questions and time duration from location state
  const questions = location.state?.questions || [];
  const timeDuration = location.state?.timeDuration || 15; // Default 15 minutes

  // State for managing the current question, user answers, and review marks
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});

  // Timer state
  const initialTimeInSeconds = timeDuration * 60;
  const [timeLeft, setTimeLeft] = useState(initialTimeInSeconds);
  const [timerActive, setTimerActive] = useState(true);
  const timerRef = useRef(null);

  // UI state for dark mode and modals
  const [darkMode, setDarkMode] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state for questions

  // Effect to handle initial question loading and validation
  useEffect(() => {
    if (questions.length === 0) {
      // If no questions, display a custom modal instead of alert and navigate back
      setShowTimeUpModal(true); // Reusing modal for "No questions" message
      // Note: In a real app, you might have a dedicated "No Questions" modal
      // and prevent further test interaction.
    } else {
      setIsLoading(false); // Questions loaded, hide loading
    }
  }, [questions, navigate]);

  // Effect to manage the countdown timer
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      // Time is up, stop timer and show time-up modal
      clearInterval(timerRef.current);
      setTimerActive(false);
      setShowTimeUpModal(true); // Show time-up modal
      // Automatically submit the test after time runs out
      // A small delay can be added here if needed before auto-submission
      setTimeout(() => {
        handleSubmitTest(true); // Pass true to indicate auto-submission
      }, 1000);
    }

    // Cleanup function to clear interval on component unmount or timer deactivation
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft, timerActive]); // Dependencies: timeLeft and timerActive

  // Current question object
  const currentQuestion = questions[currentQuestionIndex];

  // Handler for selecting an option for the current question
  const handleOptionSelect = (optionLetter) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestionIndex]: optionLetter,
    }));
    // Remove from marked for review if an answer is selected
    setMarkedForReview((prev) => ({ ...prev, [currentQuestionIndex]: false }));
  };

  // Handler for marking a question for review
  const handleMarkForReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestionIndex]: !prev[currentQuestionIndex], // Toggle mark for review
    }));
    // Optionally move to the next question after marking for review
    // if (currentQuestionIndex < questions.length - 1) {
    //   setCurrentQuestionIndex((prev) => prev + 1);
    // }
  };

  // Function to calculate score and navigate to results page
  const calculateAndNavigateToResults = () => {
    let correctCount = 0;
    questions.forEach((q, index) => {
      const userAnswer = userAnswers[index];
      if (
        userAnswer &&
        userAnswer.toUpperCase() === q.correct_answer.toUpperCase()
      ) {
        correctCount++;
      }
    });

    const timeTakenInSeconds = initialTimeInSeconds - timeLeft;

    navigate("/result", {
      state: {
        questions,
        userAnswers,
        score: correctCount,
        timeDuration,
        timeTakenInSeconds,
      },
    });
  };

  // Handler for submitting the test
  const handleSubmitTest = (isAutoSubmit = false) => {
    clearInterval(timerRef.current); // Stop the timer
    setTimerActive(false); // Deactivate timer
    setShowSubmitConfirmation(false); // Hide submit confirmation modal
    setShowTimeUpModal(false); // Hide time-up modal if it was visible

    if (isAutoSubmit) {
      // If it's an auto-submit, proceed directly
      calculateAndNavigateToResults();
    } else {
      // For manual submit, show confirmation first (handled by modal interaction)
      calculateAndNavigateToResults();
    }
  };

  // Helper to get option letter (A, B, C, D)
  const getOptionLetter = (index) => String.fromCharCode(65 + index);

  // Helper to format time into MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Determine the status of a question for sidebar styling
  const getQuestionStatus = (idx) => {
    if (currentQuestionIndex === idx) return "current";
    if (markedForReview[idx]) return "review";
    if (userAnswers[idx]) return "answered";
    return "unanswered";
  };

  // Loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen  overflow-hidden flex flex-col justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="min-h-screen overflow-hidden flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-600 mb-3"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Fallback for when currentQuestion is undefined (e.g., questions array is empty)
  if (!currentQuestion && !isLoading) {
    return (
      // This case is handled by the showTimeUpModal for "No questions found"
      // but a direct message can also be shown
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="text-center">
          <XCircle
            size={48}
            className="text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">
            Error: No Questions Available
          </h2>
          <p className="text-lg">
            Please go back and upload a PDF to generate questions.
          </p>
          <button
            onClick={() => navigate("/user")}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            Go to Upload Page
          </button>
        </div>

        {/* Custom Modal for No Questions (reusing the time-up modal for simplicity) */}
        {showTimeUpModal && (
          <Modal
            title="No Questions Found"
            message="No questions were loaded for this test. Please upload a PDF to generate questions."
            onConfirm={() => navigate("/user")}
            confirmText="Go to Upload Page"
            icon={<XCircle size={32} className="text-red-500" />}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`h-screen w-screen overflow-hidden flex flex-col relative font-inter ${
        darkMode ? "bg-gray-900 text-white" : "bg-slate-100 text-gray-900"
      }`}
    >
      {/* Dark mode background blobs */}
      {darkMode && (
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob-slow"></div>
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob-slow animation-delay-1000"></div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 bg-slate-200 dark:bg-gray-800/80 backdrop-blur-md shadow-md p-4 flex justify-between items-center rounded-b-lg">
        <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400 drop-shadow-sm">
          Examify
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full shadow-inner">
            <Clock size={20} className="text-blue-500" />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 shadow-sm"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-indigo-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 relative z-10 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        {/* Question Section (Main Content) */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 lg:p-10 flex flex-col mr-6">
          <h2 className="text-2xl font-bold mb-6 text-blue-300 dark:text-blue-400 border-b pb-3 border-gray-200 dark:border-gray-700">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="text-lg leading-relaxed mb-8 text-gray-900 dark:text-white">
            {currentQuestion?.question}
          </p>

          <div className="space-y-4 mb-8">
            {currentQuestion?.options.map((option, index) => {
              const optionLetter = getOptionLetter(index);
              const isSelected =
                userAnswers[currentQuestionIndex] === optionLetter;
              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(optionLetter)}
                  className={`w-full text-left py-4 px-6 rounded-lg border-2 transition duration-300 ease-in-out flex items-center shadow-sm ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 text-white border-blue-700 scale-[1.01] shadow-md"
                      : "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:shadow-md"
                  }`}
                >
                  <span className="font-bold text-lg mr-3 min-w-[24px]">
                    {optionLetter}.
                  </span>{" "}
                  <span className="flex-1">{option}</span>
                  {isSelected && (
                    <CheckCircle size={20} className="ml-auto text-white" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center flex-wrap gap-4">
            <div className="flex space-x-4">
              {currentQuestionIndex > 0 && (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-7 py-3 rounded-lg shadow-md hover:bg-gray-400 dark:hover:bg-gray-500 transition duration-300 font-semibold flex items-center space-x-2"
                >
                  <span>Previous</span>
                </button>
              )}

              <button
                onClick={handleMarkForReview}
                className={`px-7 py-3 rounded-lg shadow-md transition duration-300 font-semibold flex items-center space-x-2 ${
                  markedForReview[currentQuestionIndex]
                    ? "bg-red-400 text-white hover:bg-red-600"
                    : "bg-purple-500 text-white hover:bg-purple-600"
                }`}
              >
                {markedForReview[currentQuestionIndex] ? (
                  <>
                    <XCircle size={18} />
                    <span>Unmark Review</span>
                  </>
                ) : (
                  <>
                    <span>Mark for Review</span>
                  </>
                )}
              </button>
            </div>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="bg-blue-600 text-white px-7 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 font-semibold flex items-center space-x-2 ml-auto"
              >
                <span>Next</span>
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitConfirmation(true)} // Show modal on final submit
                className="bg-blue-800 cursor-pointer text-white px-7 py-3 rounded-lg shadow-md hover:bg-blue-900 transition duration-300 font-semibold flex items-center space-x-2 ml-auto"
              >
                <span>Submit Test</span>
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="w-72 md:w-80 bg-white dark:bg-gray-800 border-l dark:border-gray-700 rounded-xl shadow-lg p-6 flex flex-col">
          <h3 className="text-xl font-bold mb-5 text-gray-800 dark:text-gray-200 border-b pb-3 border-gray-200 dark:border-gray-700">
            Question Palette
          </h3>
          <div className="grid grid-cols-4 gap-1 overflow-y-auto  flex-5">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded-full text-sm font-extrabold flex items-center justify-center border-2 transition duration-200 shadow-sm
                  ${
                    getQuestionStatus(idx) === "current"
                      ? "bg-orange-500 text-white border-orange-600 scale-105"
                      : getQuestionStatus(idx) === "review"
                      ? "bg-purple-500 text-white border-purple-600"
                      : getQuestionStatus(idx) === "answered"
                      ? "bg-green-500 text-white border-green-600"
                      : "bg-gray-200 dark:bg-gray-700 text-white border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                aria-label={`Go to question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner">
            <h4 className="text-md font-semibold mb-3 text-white dark:text-white">
              Legend:
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-white">
                <span className="w-5 h-5 rounded-full bg-orange-500 mr-2 border border-orange-600"></span>{" "}
                Current
              </li>
              <li className="flex items-center text-white">
                <span className="w-5 h-5 rounded-full bg-green-500 mr-2 border border-green-600"></span>{" "}
                Answered
              </li>
              <li className="flex items-center text-white">
                <span className="w-5 h-5 rounded-full bg-purple-500 mr-2 border border-purple-600"></span>{" "}
                Marked for Review
              </li>
              <li className="flex items-center text-white">
                <span className="w-5 h-5 rounded-full bg-gray-200  mr-2 border border-gray-300"></span>{" "}
                Unanswered
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      {/* Submit Confirmation Modal */}
      {showSubmitConfirmation && (
        <Modal
          title="Confirm Submission"
          message="Are you sure you want to submit the test? You will not be able to change your answers after submission."
          onConfirm={() => handleSubmitTest()}
          onCancel={() => setShowSubmitConfirmation(false)}
          confirmText="Submit"
          cancelText="Cancel"
          icon={<CheckCircle size={32} className="text-green-500" />}
        />
      )}

      {/* Time Up Modal */}
      {showTimeUpModal && (
        <Modal
          title="Time's Up!"
          message="Your allotted time has expired. The test has been automatically submitted."
          onConfirm={() => handleSubmitTest(true)} // Auto-submit confirmed by clicking OK
          confirmText="View Results"
          icon={<Clock size={32} className="text-red-500" />}
        />
      )}
    </div>
  );
};

// --- Reusable Modal Component ---
const Modal = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  icon,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-sm w-full transform transition-all scale-100 opacity-100">
        <div className="flex flex-col items-center mb-6">
          {icon && <div className="mb-4">{icon}</div>}
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            {message}
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg shadow-md hover:bg-gray-400 transition duration-300 font-semibold"
            >
              {cancelText || "Cancel"}
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 font-semibold"
          >
            {confirmText || "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
