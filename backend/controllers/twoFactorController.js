const User = require("../models/User");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

//@desc    Enable 2FA for user (generates secret and QR code)
//@route   POST /api/2fa/enable
//@access  Private
const enableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a secret key for this user
    // This secret is unique and will be used to generate time-based codes
    const secret = speakeasy.generateSecret({
      name: `InterviewPrepAI (${user.email})`, // Shows in authenticator app
      length: 32,
    });

    // Store the secret temporarily (not enabled yet until verified)
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code that user can scan with their authenticator app
    // The QR code contains the secret, so the app can generate matching codes
    QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
      if (err) {
        return res.status(500).json({ message: "Error generating QR code" });
      }

      res.json({
        message: "Scan this QR code with your authenticator app",
        qrCode: dataUrl, // Image data for QR code
        secret: secret.base32, // Manual entry key (if QR scan fails)
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Verify and activate 2FA (user enters code to confirm setup)
//@route   POST /api/2fa/verify
//@access  Private
const verifyTwoFactor = async (req, res) => {
  try {
    const { token } = req.body; // 6-digit code from authenticator app
    const user = await User.findById(req.user.id);

    if (!user || !user.twoFactorSecret) {
      return res
        .status(400)
        .json({ message: "2FA setup not initiated. Please enable 2FA first." });
    }

    // Verify the code matches what we expect
    // This confirms the user successfully scanned the QR code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 2, // Allows codes from 2 time steps before/after (60 seconds buffer)
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Activate 2FA for this user
    user.twoFactorEnabled = true;
    await user.save();

    res.json({
      message: "2FA enabled successfully",
      twoFactorEnabled: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Verify 2FA code during login
//@route   POST /api/2fa/validate
//@access  Public (but requires userId from initial login)
const validateTwoFactor = async (req, res) => {
  try {
    const { userId, token } = req.body; // userId from first login step, token from user

    const user = await User.findById(userId);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA not enabled for this user" });
    }

    // Verify the 6-digit code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    res.json({
      message: "2FA verification successful",
      verified: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Disable 2FA for user
//@route   POST /api/2fa/disable
//@access  Private
const disableTwoFactor = async (req, res) => {
  try {
    const { token } = req.body; // Requires current 2FA code to disable (security measure)
    const user = await User.findById(req.user.id);

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA is not enabled" });
    }

    // Verify user has access to authenticator before disabling
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    // Remove 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    res.json({
      message: "2FA disabled successfully",
      twoFactorEnabled: false,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Check 2FA status for user
//@route   GET /api/2fa/status
//@access  Private
const getTwoFactorStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      twoFactorEnabled: user.twoFactorEnabled || false,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  enableTwoFactor,
  verifyTwoFactor,
  validateTwoFactor,
  disableTwoFactor,
  getTwoFactorStatus,
};
