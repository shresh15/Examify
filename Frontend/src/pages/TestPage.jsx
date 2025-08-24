import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TestPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const questions = location.state?.questions || [];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    // --- Clock Feature States ---
    // Total time for the test in seconds (e.g., 10 minutes * 60 seconds/minute for 10 questions)
    const initialTime = questions.length * 60; // 1 minute per question as a default
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [timerActive, setTimerActive] = useState(true); // Control if the timer is running
    const timerRef = useRef(null); // Ref to hold the interval ID

    // Effect to navigate back if no questions are found
    useEffect(() => {
        if (questions.length === 0) {
            alert("No questions found for the test. Please upload a PDF to generate questions.");
            navigate("/user");
        }
    }, [questions, navigate]);

    // Effect to manage the countdown timer
    useEffect(() => {
        if (timerActive && timeLeft > 0 && !showResults) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            // Time's up! Automatically submit the test
            clearInterval(timerRef.current);
            setTimerActive(false);
            handleSubmitTest(); // Automatically submit
            alert("Time's up! Your test has been submitted automatically.");
        }

        // Cleanup function to clear the interval when component unmounts or timer becomes inactive
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [timeLeft, timerActive, showResults]); // Dependencies: timeLeft, timerActive, showResults

    // Reset timer on retake
    useEffect(() => {
        if (!timerActive && !showResults) { // Timer inactive and results not shown (implies retake scenario)
            setTimeLeft(initialTime);
            setTimerActive(true);
        }
    }, [timerActive, showResults, initialTime]);


    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
                <div className="text-xl text-gray-700">Loading test or no questions found...</div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    const handleOptionSelect = (optionLetter) => {
        setUserAnswers((prevAnswers) => ({
            ...prevAnswers,
            [currentQuestionIndex]: optionLetter,
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
        }
    };

    const handleSubmitTest = () => {
        clearInterval(timerRef.current); // Stop the timer
        setTimerActive(false); // Mark timer as inactive

        let correctCount = 0;
        questions.forEach((q, index) => {
            const userAnswer = userAnswers[index];
            if (userAnswer && userAnswer.toUpperCase() === q.correct_answer.toUpperCase()) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setShowResults(true); // Display the results section
    };

    const handleRetakeTest = () => {
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setScore(0);
        setShowResults(false);
        setTimeLeft(initialTime); // Reset time for retake
        setTimerActive(true); // Restart timer for retake
    };

    const getOptionLetter = (index) => String.fromCharCode(65 + index); // ASCII for 'A' is 65

    // Format time for display
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex flex-col items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-xl shadow-2xl p-8 sm:p-10 md:p-12 w-full max-w-3xl lg:max-w-4xl mx-auto my-8">
                <h1 className="text-4xl font-extrabold text-purple-800 mb-6 text-center">
                    Test Your Knowledge
                </h1>

                {!showResults ? (
                    /* Test Questions Section */
                    <div className="space-y-6">
                        {/* Clock Display */}
                        <div className={`text-center text-2xl font-bold mb-4 p-2 rounded-lg ${timeLeft <= 30 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>
                            Time Left: {formatTime(timeLeft)}
                        </div>

                        <div className="text-center text-lg text-gray-600 mb-4">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </div>

                        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 shadow-sm">
                            <h2 className="text-xl md:text-2xl font-bold text-purple-700 mb-4 leading-relaxed">
                                Q{currentQuestionIndex + 1}: {currentQuestion.question}
                            </h2>
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, index) => {
                                    const optionLetter = getOptionLetter(index);
                                    const isSelected = userAnswers[currentQuestionIndex] === optionLetter;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleOptionSelect(optionLetter)}
                                            className={`w-full text-left py-3 px-5 rounded-lg border-2 transition duration-200 ease-in-out
                        ${isSelected
                                                    ? "bg-purple-600 text-white border-purple-700 shadow-md transform scale-[1.01]"
                                                    : "bg-white text-gray-800 border-gray-300 hover:border-purple-500 hover:bg-purple-50"
                                                } focus:outline-none focus:ring-2 focus:ring-purple-400`}
                                        >
                                            <span className="font-semibold mr-3">{optionLetter}.</span> {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-8">
                            <button
                                onClick={handlePreviousQuestion}
                                disabled={currentQuestionIndex === 0}
                                className={`py-3 px-6 rounded-full font-semibold transition duration-300 ease-in-out shadow-md
                  ${currentQuestionIndex === 0
                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                        : "bg-indigo-500 hover:bg-indigo-600 text-white transform hover:scale-105"
                                    }`}
                            >
                                Previous
                            </button>

                            {currentQuestionIndex === questions.length - 1 ? (
                                <button
                                    onClick={handleSubmitTest}
                                    className="py-3 px-8 rounded-full font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300"
                                >
                                    Submit Test
                                </button>
                            ) : (
                                <button
                                    onClick={handleNextQuestion}
                                    className="py-3 px-6 rounded-full font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transform hover:scale-105 transition duration-300 ease-in-out"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Results Section */
                    <div className="text-center space-y-6">
                        <h2 className="text-3xl font-bold text-purple-700 mb-4">Test Results</h2>
                        <p className="text-2xl text-gray-800">
                            You scored: <span className="font-extrabold text-green-600">{score}</span> out of{" "}
                            <span className="font-extrabold text-purple-700">{questions.length}</span>
                        </p>

                        <div className="space-y-4 text-left border border-gray-200 rounded-lg p-6 bg-gray-50 max-h-96 overflow-y-auto">
                            <h3 className="text-xl font-bold text-gray-700 mb-3">Your Answers:</h3>
                            {questions.map((q, index) => {
                                const userAnswer = userAnswers[index];
                                const isCorrect = userAnswer && userAnswer.toUpperCase() === q.correct_answer.toUpperCase();
                                // Find the actual text of the selected option
                                const selectedOptionText = q.options[q.options.findIndex((opt, i) => getOptionLetter(i) === userAnswer)];

                                // Find the actual text of the correct option
                                const correctOptionText = q.options[q.options.findIndex((opt, i) => getOptionLetter(i) === q.correct_answer)];


                                return (
                                    <div key={index} className={`p-4 rounded-lg shadow-sm border ${isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
                                        <p className="font-semibold text-gray-900 mb-1">Q{index + 1}: {q.question}</p>
                                        <p className="text-gray-700 text-sm">
                                            Your answer:{" "}
                                            <span className={`font-medium ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                                                {userAnswer ? `${userAnswer}. ${selectedOptionText}` : "No answer selected"}
                                            </span>
                                        </p>
                                        <p className="text-gray-700 text-sm">
                                            Correct answer:{" "}
                                            <span className="font-medium text-green-700">
                                                {q.correct_answer}. {correctOptionText}
                                            </span>
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Result Actions */}
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
                            <button
                                onClick={handleRetakeTest}
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
                )}
            </div>
        </div>
    );
};

export default TestPage;
