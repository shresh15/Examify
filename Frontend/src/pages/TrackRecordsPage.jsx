// TrackRecordsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const TrackRecordsPage = () => {
    const navigate = useNavigate();
    const [testRecords, setTestRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedRecords = JSON.parse(localStorage.getItem("testRecords")) || [];
            // To ensure it's a list, check if it's an array. If not, make it one.
            const recordsArray = Array.isArray(storedRecords) ? storedRecords : [storedRecords];
            setTestRecords(recordsArray);
        } catch (error) {
            console.error("Failed to parse test records from local storage:", error);
            setTestRecords([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const formatTime = (seconds) => {
        if (typeof seconds !== 'number' || isNaN(seconds)) {
            return "N/A";
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                Loading records...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 font-sans relative">
            <button
                onClick={() => navigate("/userpage")}
                className="absolute top-6 left-6 flex items-center text-indigo-400 hover:text-indigo-200 transition-colors duration-200"
            >
                <FiArrowLeft className="mr-2" /> Back to Dashboard
            </button>
            <div className="flex flex-col items-center justify-center pt-20">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400">
                    Test Records
                </h1>

                {testRecords.length === 0 ? (
                    <div className="text-xl text-gray-400 mt-10">
                        No past test records found.
                    </div>
                ) : (
                    <div className="w-full max-w-4xl space-y-6">
                        {testRecords.map((record, index) => (
                            <div
                                key={index}
                                className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-indigo-500 transition-colors duration-200"
                            >
                                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                                    <h2 className="text-xl font-bold text-indigo-400">
                                        Test on {new Date(record.date).toLocaleDateString()}
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        Time: {new Date(record.date).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-gray-400 text-sm">Correctness</p>
                                        <p className="text-xl font-bold text-green-400">
                                            {record.score} / {record.totalQuestions}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Accuracy</p>
                                        <p className="text-xl font-bold text-green-400">
                                            {record.accuracy}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Time Taken</p>
                                        {/* 💡 Display time taken and total duration */}
                                        <p className="text-xl font-bold text-orange-400">
                                            {formatTime(record.timeTakenInSeconds)} / {record.timeDuration}m
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackRecordsPage;