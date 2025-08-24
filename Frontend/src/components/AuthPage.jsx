import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Keep useNavigate for navigation logic
import axios from "axios";
import loginImg from "../assets/login.png";
// Inline SVG Icons
const MailIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const LockIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const UserIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const PhoneIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-3.67-3.67A19.79 19.79 0 0 1 2 6.18 2 2 0 0 1 4.18 4h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 12a14.32 14.32 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const UploadIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const CheckIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const InfoIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// ToastMessage Component
const ToastMessage = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose(); // Auto-dismiss after 4 seconds
      }, 4000);
      return () => clearTimeout(timer); // Cleanup timer on unmount or message change
    }
  }, [message, onClose]);

  if (!message) return null;

  let bgColor = "bg-gray-800";
  let textColor = "text-white";
  let icon = <InfoIcon className="w-5 h-5 text-blue-400" />;

  if (type === "success") {
    bgColor = "bg-green-300";
    textColor = "text-white";
    icon = <CheckIcon className="w-5 h-5 text-white" />;
  } else if (type === "error") {
    bgColor = "bg-red-300";
    textColor = "text-white";
    icon = <XIcon className="w-5 h-5 text-white" />;
  } else if (type === "warning") {
    bgColor = "bg-yellow-300";
    textColor = "text-gray-900";
    icon = <InfoIcon className="w-5 h-5 text-gray-900" />;
  }

  return (
    <div
      className={`fixed top-4 left-4 z-50 flex items-center p-4 rounded-lg shadow-lg
                  ${bgColor} ${textColor} transform transition-all duration-300 ease-out
                  ${
                    message
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-full opacity-0"
                  }`}
      role="alert"
    >
      {icon}
      <div className="ml-3 text-sm font-medium">{message}</div>
      <button
        type="button"
        className={`ml-auto -mx-1.5 -my-1.5 ${textColor} rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5
                    hover:bg-opacity-20 inline-flex items-center justify-center h-8 w-8`}
        onClick={onClose}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

function AuthPage() {
  // Renamed from App to AuthPage for consistency
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    image: "",
  });
  const [loadingImage, setLoadingImage] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");

  // IMPORTANT: For Cloudinary to work, replace these placeholder values with your actual
  // Cloudinary Cloud Name and Upload Preset. In a production environment, these would be
  // securely managed (e.g., via server-side environment variables).
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const CLOUD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; // Replace with your Cloudinary Upload Preset

  const showToast = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      showToast("No image file selected.", "warning");
      return;
    }

    if (
      CLOUD_NAME === "VITE_CLOUDINARY_CLOUD_NAME" ||
      CLOUD_PRESET === "VITE_CLOUDINARY_UPLOAD_PRESET"
    ) {
      showToast(
        "Cloudinary config missing. Image upload is disabled.",
        "warning"
      );
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUD_PRESET);

    setLoadingImage(true);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );
      const result = await res.json();
      if (result.secure_url) {
        setFormData((prev) => ({ ...prev, image: result.secure_url }));
        window.alert(`Profile image uploaded successfully!`);
      } else {
        window.alert(`Image upload failed. Please try again.`);
      }
    } catch (err) {
      console.error("Image upload error:", err);
      window.alert(`Image upload failed: ` + err.message);
    } finally {
      setLoadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation before submission attempt
    if (
      !formData.email ||
      !formData.password ||
      (!isLogin && (!formData.name || !formData.phone))
    ) {
      window.alert(`Please fill in all required fields.`);
      return;
    }

    setSubmittingForm(true);

    try {
      // IMPORTANT: Ensure your backend is running at http://localhost:8000
      const endpoint = isLogin
        ? "http://localhost:8000/api/auth/login"
        : "http://localhost:8000/api/auth/register";

      const response = await axios.post(endpoint, formData);
      window.alert(
        `${isLogin ? "Login" : "Signup"} successful! Redirecting...`
      );

      // Assuming your backend sends a token and user data
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("profileImage", response.data.user.image || "");

      // Navigate after a short delay
      setTimeout(() => navigate("/userpage"), 1500);
    } catch (error) {
      console.error("Auth error:", error);
      window.alert(
        "Error: " +
          (error.response?.data?.message ||
            error.message ||
            "Something went wrong.")
      );
    } finally {
      setSubmittingForm(false);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen
                   bg-[radial-gradient(circle,_#0A0A2A_0%,_#000000_100%)] p-4 sm:p-6 md:p-8 font-inter"
    >
      {/* Subtle Background Glows (matching Hero/About) */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div
        className="relative z-10 flex flex-col md:flex-row w-full max-w-5xl md:h-[650px]
                     bg-gray-900 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden
                     border border-gray-700"
      >
        {/* Left Section - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2
            className="text-3xl md:text-3xl font-extrabold text-center mb-8
                        bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400"
          >
            {isLogin ? "Login" : "Sign Up"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-600 rounded-lg px-4 py-3 pl-10 bg-gray-800 text-gray-200 placeholder-gray-500
                               focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-purple-600 transition-colors duration-200"
                    required
                  />
                </div>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-600 rounded-lg px-4 py-3 pl-10 bg-gray-800 text-gray-200 placeholder-gray-500
                               focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-purple-600 transition-colors duration-200"
                    required
                  />
                </div>
              </>
            )}

            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-600 rounded-lg px-4 py-3 pl-10 bg-gray-800 text-gray-200 placeholder-gray-500
                               focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-purple-600 transition-colors duration-200"
                required
              />
            </div>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-600 rounded-lg px-4 py-3 pl-10 bg-gray-800 text-gray-200 placeholder-gray-500
                               focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-purple-600 transition-colors duration-200"
                required
              />
            </div>

            {!isLogin && (
              <div className="mt-4">
                <label
                  htmlFor="profile-image-upload"
                  className="block text-gray-300 text-sm font-medium mb-2 cursor-pointer flex items-center"
                >
                  <UploadIcon className="mr-2 text-fuchsia-400 w-5 h-5" />
                  {loadingImage
                    ? "Uploading..."
                    : formData.image
                    ? "Image Uploaded!"
                    : "Upload Profile Picture (Optional)"}
                </label>
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loadingImage}
                />
                {formData.image && !loadingImage && (
                  <img
                    src={formData.image}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover mt-2 mx-auto md:mx-0 border-2 border-purple-500 shadow-md"
                  />
                )}
              </div>
            )}

            <button
              type="submit"
              className="relative cursor-pointer inline-flex items-center justify-center w-full px-6 py-3 rounded-full text-lg font-semibold tracking-wide
                               bg-gradient-to-r from-indigo-700 to-purple-700 text-white shadow-lg overflow-hidden
                               transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-in-out
                               focus:outline-none focus:ring-4 focus:ring-blue-700/50"
              disabled={submittingForm || loadingImage}
            >
              <span className="relative z-10 flex items-center justify-center">
                {submittingForm ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isLogin ? "Logging In..." : "Registering..."}
                  </>
                ) : isLogin ? (
                  "Login"
                ) : (
                  "Register"
                )}
              </span>
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-gray-400 mt-6 text-md">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-blue-300 hover:underline font-medium transition-colors duration-200 hover:text-purple-300"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Login Here"}
            </button>
          </p>
        </div>

        {/* Right Section - Aesthetic Visual */}
        <div className="hidden md:flex md:w-1/2 relative">
          <img
            src={loginImg}
            alt="Study and Learning Visual"
            className="w-full h-full object-cover rounded-r-3xl"
          />
          {/* Optional: Dark overlay on image for consistency */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-r-3xl"></div>
          <div className="absolute bottom-8 left-0 right-0 text-white text-center p-4">
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-fuchsia-300 mb-2">
              Your Learning Journey Starts Here
            </h3>
          </div>
        </div>
      </div>

      {/* Render the ToastMessage component */}
      <ToastMessage
        message={message}
        type={messageType}
        onClose={() => setMessage(null)}
      />
    </div>
  );
}

export default AuthPage;
