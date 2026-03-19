const express = require("express");
const {
  startTechnicalRound,
  submitMCQAnswer,
  submitCodingAnswer,
  logViolation,
  completeTechnicalRound,
  getTechnicalRound,
  getAllUserTechnicalRounds,
} = require("../controllers/technicalRoundController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/start", protect, startTechnicalRound);
router.post("/submit-mcq", protect, submitMCQAnswer);
router.post("/submit-code", protect, submitCodingAnswer);
router.post("/log-violation", protect, logViolation);
router.post("/complete", protect, completeTechnicalRound);
router.get("/user/all", protect, getAllUserTechnicalRounds);
router.get("/:id", protect, getTechnicalRound);

module.exports = router;
