import { useState } from "react";
import React from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Navbar />
      <HeroSection />
    </>
  );
}

export default App;
