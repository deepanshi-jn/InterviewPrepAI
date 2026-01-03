const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  createModule,
  getModulesBySession,
  updateModule,
  deleteModule,
  addQuestionsToModule,
  toggleModuleCompletion,
  getModuleProgress,
} = require("../controllers/moduleController");

router.post("/create", protect, createModule);
router.get("/session/:sessionId", protect, getModulesBySession);
router.put("/:id", protect, updateModule);
router.delete("/:id", protect, deleteModule);
router.post("/:id/questions", protect, addQuestionsToModule);
router.post("/:id/toggle-complete", protect, toggleModuleCompletion);
router.get("/:id/progress", protect, getModuleProgress);

module.exports = router;
