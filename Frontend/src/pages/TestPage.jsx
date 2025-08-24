import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TestPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const questions = location.state?.questions || [];
    const timeDuration = location.state?.timeDuration || 15;

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    const initialTimeInSeconds = timeDuration * 60;
    const [timeLeft, setTimeLeft] = useState(initialTimeInSeconds);
    const [timerActive, setTimerActive] = useState(true);
    const timerRef = useRef(null);

    useEffect(() => {
        if (questions.length === 0) {
            alert("No questions found for the test. Please upload a PDF to generate questions.");
            navigate("/user");
        }
    }, [questions, navigate]);

    useEffect(() => {
        if (timerActive && timeLeft > 0 && !showResults) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            handleSubmitTest();
            alert("Time's up! Your test has been submitted automatically.");
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [timeLeft, timerActive, showResults]);

    useEffect(() => {
        if (!timerActive && !showResults) {
            setTimeLeft(initialTimeInSeconds);
            setTimerActive(true);
        }
    }, [timerActive, showResults, initialTimeInSeconds]);

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
        clearInterval(timerRef.current);
        setTimerActive(false);

        let correctCount = 0;
        questions.forEach((q, index) => {
            const userAnswer = userAnswers[index];
            if (userAnswer && userAnswer.toUpperCase() === q.correct_answer.toUpperCase()) {
                correctCount++;
            }
        });

        const timeTakenInSeconds = initialTimeInSeconds - timeLeft;

        navigate('/result', {
            state: {
                questions,
                userAnswers,
                score: correctCount,
                timeDuration,
                timeTakenInSeconds,
            },
        });
    };

    const getOptionLetter = (index) => String.fromCharCode(65 + index);

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
                    <div className="space-y-6">
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
                                            ${isSelected ? "bg-purple-600 text-white border-purple-700 shadow-md transform scale-[1.01]" : "bg-white text-gray-800 border-gray-300 hover:border-purple-500 hover:bg-purple-50"} focus:outline-none focus:ring-2 focus:ring-purple-400`}
                                        >
                                            <span className="font-semibold mr-3">{optionLetter}.</span> {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-8">
                            <button
                                onClick={handlePreviousQuestion}
                                disabled={currentQuestionIndex === 0}
                                className={`py-3 px-6 rounded-full font-semibold transition duration-300 ease-in-out shadow-md ${currentQuestionIndex === 0 ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600 text-white transform hover:scale-105"}`}
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
                ) : null}
            </div>
        </div>
    );
};

export default TestPage;