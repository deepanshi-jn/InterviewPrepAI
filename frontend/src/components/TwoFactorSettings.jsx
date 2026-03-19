import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import SpinnerLoader from "../components/loader/SpinnerLoader.jsx";

const TwoFactorSettings = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check 2FA status on component mount
  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TWO_FACTOR.STATUS);
      setIsEnabled(response.data.twoFactorEnabled);
      setLoading(false);
    } catch (err) {
      setError("Failed to check 2FA status");
      setLoading(false);
    }
  };

  // Step 1: Generate QR code
  const handleEnableTwoFactor = async () => {
    setError("");
    setSuccess("");
    try {
      const response = await axiosInstance.post(API_PATHS.TWO_FACTOR.ENABLE);
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setShowSetup(true);
    } catch (err) {
      setError("Failed to generate 2FA setup. Please try again.");
    }
  };

  // Step 2: Verify the code and activate 2FA
  const handleVerifyAndActivate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.TWO_FACTOR.VERIFY, {
        token: verificationCode,
      });
      setSuccess("Two-factor authentication enabled successfully!");
      setIsEnabled(true);
      setShowSetup(false);
      setVerificationCode("");
      setQrCode("");
      setSecret("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid verification code");
    }
  };

  // Disable 2FA
  const handleDisableTwoFactor = async () => {
    const code = prompt("Enter your current 2FA code to disable:");
    if (!code) return;

    setError("");
    setSuccess("");

    try {
      await axiosInstance.post(API_PATHS.TWO_FACTOR.DISABLE, {
        token: code,
      });
      setSuccess("Two-factor authentication disabled successfully");
      setIsEnabled(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to disable 2FA");
    }
  };

  if (loading) {
    return <SpinnerLoader />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Two-Factor Authentication (2FA)
      </h2>

      <div className="mb-6">
        <p className="text-gray-600 text-sm mb-4">
          Add an extra layer of security to your account by enabling two-factor
          authentication. You'll need to enter a code from your authenticator
          app each time you log in.
        </p>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-800">
              Status:{" "}
              <span className={isEnabled ? "text-green-600" : "text-gray-500"}>
                {isEnabled ? "Enabled" : "Disabled"}
              </span>
            </p>
          </div>
          <button
            onClick={isEnabled ? handleDisableTwoFactor : handleEnableTwoFactor}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isEnabled
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gradient-to-r from-[#FF9324] to-[#FFA94D] hover:from-[#e68420] hover:to-[#e69540] text-white"
            }`}
          >
            {isEnabled ? "Disable 2FA" : "Enable 2FA"}
          </button>
        </div>
      </div>

      {/* Setup Process */}
      {showSetup && (
        <div className="space-y-6 border-t pt-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Step 1: Scan QR Code
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code with your authenticator app (Google
              Authenticator, Authy, etc.)
            </p>
            {qrCode && (
              <div className="flex justify-center mb-4">
                <img src={qrCode} alt="2FA QR Code" className="border p-2" />
              </div>
            )}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">
                Or enter this code manually:
              </p>
              <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                {secret}
              </code>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Step 2: Verify Code
            </h3>
            <form onSubmit={handleVerifyAndActivate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit code from your app
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center text-2xl tracking-widest"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#FF9324] to-[#FFA94D] hover:from-[#e68420] hover:to-[#e69540] text-white font-medium rounded-lg transition-all"
              >
                Verify and Activate
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSetup(false);
                  setVerificationCode("");
                  setQrCode("");
                  setSecret("");
                }}
                className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Instructions */}
      {!showSetup && !isEnabled && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            How to set up 2FA:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
            <li>Download an authenticator app (Google Authenticator, Authy)</li>
            <li>Click "Enable 2FA" button above</li>
            <li>Scan the QR code with your app</li>
            <li>Enter the 6-digit code to verify</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSettings;
