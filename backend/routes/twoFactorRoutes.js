const express = require("express");
const {
  enableTwoFactor,
  verifyTwoFactor,
  validateTwoFactor,
  disableTwoFactor,
  getTwoFactorStatus,
} = require("../controllers/twoFactorController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Protected routes (user must be logged in)
router.post("/enable", protect, enableTwoFactor); // Generate QR code
router.post("/verify", protect, verifyTwoFactor); // Confirm 2FA setup
router.post("/disable", protect, disableTwoFactor); // Turn off 2FA
router.get("/status", protect, getTwoFactorStatus); // Check if 2FA is enabled

// Public route (used during login)
router.post("/validate", validateTwoFactor); // Verify 2FA code at login

module.exports = router;
