import React from "react";

const AboutSection = () => {
  return (
    <section
      id="about"
      className="relative py-24 px-6 min-h-screen flex items-center justify-center
                 bg-[radial-gradient(circle,#0A0A2A_0%,#000000_100%)] overflow-hidden"
    >
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob-slow animation-delay-3000"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center px-4">
        <h3
          className="text-5xl md:text-6xl font-extrabold mb-12 leading-tight
                       bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400"
        >
          Unlock Your Potential: The Story Behind Our Vision
        </h3>

        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-16 opacity-90">
          Our mission is to empower learners like you to master complex subjects
          smarter, not harder. By putting you in control, our platform
          transforms your extensive notes into dynamic, AI-generated
          Multiple-Choice Questions and timed quizzes. Spend less time on
          tedious preparation and more on effective, focused practice.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
          <div
            className="p-8 bg-gray-900/50 rounded-2xl shadow-2xl backdrop-blur-sm
                        hover:scale-105 hover:shadow-fuchsia-500/20 transition-all duration-300 transform border border-gray-800"
          >
            <div className="text-fuchsia-400 mb-6 mx-auto">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
            </div>
            <div className="cursor-pointer">
              <h4 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-fuchsia-300">
                Instant Transformation
              </h4>
              <p className="text-gray-400 text-lg">
                Upload any PDF, and our advanced AI instantly converts your
                content into precise, ready-to-use MCQs.
              </p>
            </div>
          </div>

          <div
            className="p-8 bg-gray-900/50 rounded-2xl shadow-2xl backdrop-blur-sm
                        hover:scale-105 hover:shadow-blue-500/20 transition-all duration-300 transform border border-gray-800"
          >
            <div className="text-blue-400 mb-6">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-1.25-3M15 10V5a3 3 0 00-3-3m0 0l-1-1-1 1v3m0 0H9m1.5-4.5h.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h.375M12 10V5a3 3 0 00-3-3m0 0l-1-1-1 1v3m0 0H9m1.5-4.5h.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h.375"
                ></path>
              </svg>
            </div>
            <div className="cursor-pointer">
              <h4 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
                AI-Powered Precision
              </h4>
              <p className="text-gray-400 text-lg">
                Our sophisticated algorithms ensure relevant, challenging
                questions derived directly from your material.
              </p>
            </div>
          </div>

          <div
            className="p-8 bg-gray-900/50 rounded-2xl shadow-2xl backdrop-blur-sm
                        hover:scale-105 hover:shadow-purple-500/20 transition-all duration-300 transform border border-gray-800"
          >
            <div className="text-purple-400 mb-6">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <div className="cursor-pointer">
              <h4 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-300">
                Optimized Learning
              </h4>
              <p className="text-gray-400 text-lg">
                Spend less time preparing questions and more time on focused
                practice to truly master your concepts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
