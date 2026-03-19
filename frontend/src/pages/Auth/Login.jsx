import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext.jsx";

const Login = ({ setCurrentPage, closeModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showTwoFactorInput, setShowTwoFactorInput] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [userId, setUserId] = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setError("");
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
        twoFactorToken: twoFactorCode || undefined,
      });

      // Check if 2FA is required
      if (response.data.requiresTwoFactor) {
        setShowTwoFactorInput(true);
        setUserId(response.data.userId);
        setError(""); // Clear any previous errors
        return;
      }

      const { token } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        closeModal();
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred during login. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-md p-6 flex flex-col justify-center bg-white">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-gray-800">Welcome Back</h3>
        <p className="text-xs text-gray-600 mt-1">
          Please enter your details to log in
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-3">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email Address"
          placeholder="john@example.com"
          type="email"
          disabled={showTwoFactorInput}
        />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin(e);
            }
          }}
          label="Password"
          placeholder="Min 8 characters"
          type="password"
          disabled={showTwoFactorInput}
        />

        {showTwoFactorInput && (
          <div className="space-y-2">
            <Input
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              label="Two-Factor Authentication Code"
              placeholder="Enter 6-digit code"
              type="text"
              maxLength={6}
            />
            <p className="text-xs text-gray-600">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-gradient-to-r from-[#FF9324] to-[#FFA94D] hover:from-[#e68420] hover:to-[#e69540] text-white font-medium rounded-lg transition-all mt-4 text-sm"
        >
          {showTwoFactorInput ? "VERIFY CODE" : "LOGIN"}
        </button>

        <p className="text-xs text-gray-600 text-center mt-3">
          Don't have an account?{" "}
          <button
            type="button"
            className="text-amber-600 font-medium hover:text-amber-700 transition-colors"
            onClick={() => setCurrentPage("signup")}
          >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
