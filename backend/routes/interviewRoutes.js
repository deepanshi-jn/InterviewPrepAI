const express = require("express");
const {
  startInterview,
  continueInterview,
  completeInterview,
  getInterview,
  getSessionInterviews,
  getUserInterviews,
} = require("../controllers/interviewController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Start a new interview
router.post("/start", protect, startInterview);

// Continue interview conversation
router.post("/continue", protect, continueInterview);

// Complete interview and get analysis
router.post("/:interviewId/complete", protect, completeInterview);

// Get specific interview
router.get("/:interviewId", protect, getInterview);

// Get all interviews for a session
router.get("/session/:sessionId", protect, getSessionInterviews);

// Get all user interviews
router.get("/user/all", protect, getUserInterviews);

module.exports = router;
