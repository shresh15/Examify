import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PdfUploader from "../components/PdfUploader";
import { FiLogOut, FiCheckCircle, FiXCircle } from "react-icons/fi";

// Enhanced Message Modal Component
const MessageModal = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message, onClose]);

  if (!message && !isVisible) return null;

  let bgColor, borderColor, icon, textColor;
  if (type === "success") {
    bgColor = "bg-gradient-to-r from-purple-700 to-fuchsia-700";
    borderColor = "border-purple-800";
    icon = <FiCheckCircle className="text-white text-4xl" />;
    textColor = "text-white";
  } else {
    bgColor = "bg-gradient-to-r from-red-700 to-red-900";
    borderColor = "border-red-800";
    icon = <FiXCircle className="text-white text-4xl" />;
    textColor = "text-white";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div
        className={`relative ${bgColor} ${textColor} p-8 rounded-lg shadow-2xl border-b-4 ${borderColor}
                      transform transition-all duration-300 ease-in-out
                      ${
                        isVisible
                          ? "scale-100 opacity-100"
                          : "scale-90 opacity-0"
                      }
                      flex flex-col items-center max-w-sm text-center`}
      >
        {icon}
        <p className="text-xl font-semibold mt-4 mb-4">{message}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const defaultProfileImage =
  "https://placehold.co/150x150/A78BFA/ffffff?text=Profile";

const UserPage = () => {
  const navigate = useNavigate();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");

  // State for quiz settings
  const [numQuestions, setNumQuestions] = useState(5);
  const [timeDuration, setTimeDuration] = useState(15);
  const [difficulty, setDifficulty] = useState("medium");

  const profileImage = localStorage.getItem("profileImage");

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("profileImage");
    showMessage("Logged out successfully!", "success");
    setTimeout(() => navigate("/"), 1000);
  };

  const toggleLogoutMenu = () => {
    setShowLogoutMenu((prev) => !prev);
  };

  const handleOutsideClick = (e) => {
    if (showLogoutMenu && !e.target.closest(".profile-menu-container")) {
      setShowLogoutMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [showLogoutMenu]);

  const handleQuestionsReady = (questionsArray) => {
    setGeneratedQuestions(questionsArray);
    console.log("Questions received in UserPage:", questionsArray);
    if (questionsArray.length > 0) {
      window.alert(
        `✅ Successfully generated ${questionsArray.length} questions!`
      );
    } else {
      window.alert(
        "❌ No questions could be generated from the PDF. Please try a different document."
      );
    }
  };

  const startTest = () => {
    if (generatedQuestions.length > 0) {
      navigate("/test", {
        state: {
          questions: generatedQuestions,
          numQuestions: parseInt(numQuestions),
          timeDuration: parseInt(timeDuration), // Use the state variable
          difficulty,
        },
      });
    } else {
      showMessage(
        "No questions available to start the test. Please upload a PDF first.",
        "error"
      );
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col
                  bg-[radial-gradient(circle,_#0A0A2A_0%,_#000000_100%)] overflow-hidden"
    >
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <nav
        className="sticky top-0 z-50 w-full flex justify-between items-center px-6 md:px-12 py-4 h-20
                      bg-gradient-to-r from-gray-950 via-indigo-950 to-black shadow-xl
                      backdrop-blur-md bg-opacity-80 dark:bg-opacity-80"
      >
        <span
          className="text-3xl md:text-4xl font-extrabold tracking-tight
                          bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400"
        >
          Examify
        </span>

        <div className="relative profile-menu-container">
          <img
            src={profileImage || defaultProfileImage}
            alt="Profile"
            className="w-12 h-12 rounded-full cursor-pointer border-2 border-fuchsia-500 shadow-md object-cover transform transition duration-300 hover:scale-105"
            onClick={toggleLogoutMenu}
          />
          {showLogoutMenu && (
            <div className="absolute right-0 mt-3 w-44 bg-gray-800 rounded-lg shadow-xl py-2 z-10 animate-fade-in-down border border-gray-700">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-5 py-2 text-md text-white hover:bg-gray-700 hover:text-fuchsia-400 transition duration-200 rounded-md flex items-center"
              >
                <FiLogOut className="mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow flex justify-center p-6 md:p-10">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
          <div className="flex-1 bg-gray-900/70 p-6 md:p-8 rounded-3xl shadow-xl backdrop-blur-xl border border-gray-800 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Upload PDF</h2>
              <p className="text-sm text-gray-400 mb-2">Max file size: 5MB</p>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Quiz Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <label
                      htmlFor="numQuestions"
                      className="block text-sm font-medium text-gray-400"
                    >
                      Questions
                    </label>
                    <select
                      id="numQuestions"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                    </select>
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="timeDuration"
                      className="block text-sm font-medium text-gray-400"
                    >
                      Time
                    </label>
                    <select
                      id="timeDuration"
                      value={timeDuration}
                      onChange={(e) => setTimeDuration(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value={10}>10 Minutes</option>
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="difficulty"
                      className="block text-sm font-medium text-gray-400"
                    >
                      Difficulty
                    </label>
                    <select
                      id="difficulty"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>

              <PdfUploader
                onQuestionsReady={handleQuestionsReady}
                numQuestions={numQuestions}
                timeDuration={timeDuration}
                difficulty={difficulty}
              />

              {generatedQuestions.length > 0 && (
                <p className="mt-4 text-sm text-green-300 font-medium">
                  Questions ready from uploaded file.
                </p>
              )}
            </div>

            {generatedQuestions.length > 0 && (
              <button
                onClick={startTest}
                className="group relative inline-flex items-center justify-center mt-6 px-8 py-3 rounded-full text-lg font-semibold tracking-wide
                          bg-gradient-to-r from-indigo-800 to-purple-600 text-white shadow-xl overflow-hidden
                          transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-in-out
                          focus:outline-none focus:ring-4 focus:ring-purple-500/50"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-800 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500 filter blur-lg animate-pulse-glow"></span>
                <span className="relative z-10">
                  Start Test ({generatedQuestions.length})
                </span>
              </button>
            )}
          </div>

          <div className="flex-1 bg-gray-900/70 p-6 md:p-8 rounded-3xl shadow-xl backdrop-blur-xl border border-gray-800 overflow-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              Extracted Text
            </h2>
            <div className="h-full max-h-[500px] overflow-y-auto text-sm text-gray-300 whitespace-pre-wrap">
              {generatedQuestions.length > 0
                ? generatedQuestions.map((q, idx) => (
                    <div key={idx} className="mb-4">
                      <strong>Q{idx + 1}:</strong> {q.question}
                    </div>
                  ))
                : "Upload a PDF to view extracted text."}
            </div>
          </div>
        </div>
      </main>

      <MessageModal
        message={message}
        type={messageType}
        onClose={() => setMessage(null)}
      />
    </div>
  );
};

export default UserPage;
