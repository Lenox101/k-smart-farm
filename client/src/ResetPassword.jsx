import React, { useState, useEffect, useRef } from "react";
import { FaLock, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import images from "./utils";
import { useNavigate, useParams } from "react-router-dom";
import gsap from "gsap";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams(); // Get reset token from URL
  const formRef = useRef(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password match
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      if (response.ok) {
        navigate("/login", {
          state: { message: "Password successfully reset. Please log in." },
        });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Password reset failed");
      }
    } catch (error) {
      setErrorMessage("Network error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
        {/* Left Side: Illustration */}
        <div
          className="hidden md:block bg-cover bg-center rounded-xl"
          style={{
            backgroundImage: `url(${images.resetPasswordPG})`,
            minHeight: "600px",
          }}
        ></div>

        {/* Right Side: Reset Password Form */}
        <div className="bg-white shadow-2xl rounded-xl p-10">
          <div className="text-center mb-8">
            <FaKey className="mx-auto text-6xl text-green-600 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">Reset Password</h2>
            <p className="text-gray-500 mt-2">Create a new secure password</p>
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="mb-6">
              <label htmlFor="newPassword" className="block text-gray-700 font-semibold mb-2">
                New Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter new password"
                  aria-label="New Password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Confirm new password"
                  aria-label="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center"
            >
              <FaLock className="mr-2" /> Reset Password
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Remember your password?{" "}
              <a href="/login" className="text-green-600 font-bold hover:underline">
                Back to Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
