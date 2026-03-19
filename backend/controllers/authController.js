const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

//@desc    Register a new user
//@route   POST /api/auth/register
//@access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
    });

    // Return user data with JWT
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Login user
//@route   POST /api/auth/login
//@access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password, twoFactorToken } = req.body;

    // Check if user already exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(500).json({ message: "Invalid credentials" });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(500).json({ message: "Invalid credentials" });
    }

    // If 2FA is enabled, check if token is provided and valid
    if (user.twoFactorEnabled) {
      if (!twoFactorToken) {
        // Password is correct, but 2FA code is required
        return res.status(200).json({
          requiresTwoFactor: true,
          userId: user._id,
          message: "Please enter your 2FA code",
        });
      }

      // Verify the 2FA token
      const speakeasy = require("speakeasy");
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: twoFactorToken,
        window: 2,
      });

      if (!verified) {
        return res.status(400).json({ message: "Invalid 2FA code" });
      }
    }

    // Password verified (and 2FA if enabled) - issue token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      twoFactorEnabled: user.twoFactorEnabled,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Get user profile
//@route   GET /api/auth/profile
//@access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Update user profile photo
//@route   PUT /api/auth/profile/photo
//@access  Private
const updateProfilePhoto = async (req, res) => {
  try {
    const { profileImageUrl } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImageUrl },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfilePhoto,
};
