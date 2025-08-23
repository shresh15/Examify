import React from "react";

const scrollToSection = (e, id) => {
  e.preventDefault();
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};

const Navbar = () => {
  return (
    <nav
      className=" fixed  top-0 z-50 w-full flex justify-between items-center px-6 md:px-12 py-4 h-20
                 bg-gradient-to-r from-gray-950 via-gray-900 to-black shadow-xl // Made 'via' color darker
                 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 overflow-hidden"
    >
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-5 right-5 w-32 h-32 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <a href="/" className="relative z-10 flex items-center group">
        <h1
          className="text-3xl md:text-3xl font-extrabold tracking-tight
                     bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400
                     group-hover:scale-105 transition-transform duration-300"
        >
          Examify
        </h1>
      </a>

      <div className="relative z-10 flex items-center space-x-6 md:space-x-8">
        <a
          href="#about"
          onClick={(e) => scrollToSection(e, "about")}
          className="text-lg font-medium text-gray-300 hover:text-fuchsia-400
                     relative after:block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5
                     after:bg-fuchsia-500 after:transition-all after:duration-300 hover:after:w-full"
        >
          About
        </a>

        <a
          href="#contact"
          onClick={(e) => scrollToSection(e, "contact")}
          className="text-lg font-medium text-gray-300 hover:text-fuchsia-400
                     relative after:block after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5
                     after:bg-fuchsia-500 after:transition-all after:duration-300 hover:after:w-full"
        >
          Contact us
        </a>

        <a
          href="/login"
          className="inline-flex items-center justify-center px-6 py-2 rounded-full text-lg font-semibold
                     bg-gradient-to-r from-purple-700 to-fuchsia-700 text-white shadow-lg
                     hover:from-purple-800 hover:to-fuchsia-800
                     transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-in-out
                     focus:outline-none focus:ring-4 focus:ring-purple-500/50"
        >
          Login
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
