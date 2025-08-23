import React from "react";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import Navbar from "../components/Navbar";

const Landingpage = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <AboutSection />
    </div>
  );
};

export default Landingpage;
