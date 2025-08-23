import React from "react";
import { Typewriter } from "react-simple-typewriter";

const handleDone = () => {};
const handleType = () => {};

const HeroSection = () => {
  return (
    <section
      className="relative flex flex-col justify-center items-center text-center py-32 px-6 min-h-screen
                 bg-[radial-gradient(circle,#0A0A2A_0%,#000000_100%)] overflow-hidden"
    >
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h2
          className="text-5xl md:text-6xl font-playfair mb-8 leading-tight
             text-transparent bg-clip-text bg-gradient-to-r
             from-blue-400 via-purple-400 to-fuchsia-400
             bg-[length:200%_200%] animate-gradient-move"
        >
          Transform Your Notes into Intelligent MCQ Tests
        </h2>

        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-6 opacity-90">
          Seamlessly convert complex study materials into dynamic quizzes.
        </p>

        <div className="min-h-[50px] md:min-h-[60px] flex items-center justify-center mb-10">
          <span className="text-fuchsia-300 font-bold text-3xl md:text-4xl">
            {" "}
            {/* Changed to fuchsia-400 */}
            <Typewriter
              words={[
                "Upload PDFs",
                "Generate Quizzes",
                "Analyze Your Performance!",
              ]}
              loop={0}
              cursor
              cursorStyle="|"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1500}
              onLoopDone={handleDone}
              onType={handleType}
            />
          </span>
        </div>

        <a
          href="/login"
          className="relative inline-flex items-center justify-center px-10 py-4 rounded-full text-lg font-semibold tracking-wide
             bg-gradient-to-r from-purple-700 to-fuchsia-700 text-white shadow-xl
             overflow-hidden // Crucial for containing the glow
             group // <--- THIS IS KEY! Ensures group-hover works on children
             transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-in-out
             focus:outline-none focus:ring-4 focus:ring-purple-500/50"
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 filter blur-lg animate-pulse-glow"></span>

          <span className="relative z-10 inline-flex items-center">
            Get Started Now
            <svg
              className="ml-3 -mr-1 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </span>
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
