import React from "react";

import LandingPage from "./pages/LandingPage.jsx";
import UserPage from "./pages/Userpage.jsx";
import { Route, Routes } from "react-router-dom";
import AuthPage from "./components/Authpage.jsx";
import TestPage from "./pages/TestPage.jsx";
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/userpage" element={<UserPage />} />
      <Route path="/test" element={<TestPage />} />
    </Routes>
  );
}

export default App;
