import React from "react";
import LandingPage from "./pages/LandingPage.jsx";

import { Route, Routes } from "react-router-dom";
import AuthPage from "./components/Authpage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
    </Routes>
  );
}

export default App;
