const mongoose = require("mongoose");

const mcqQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index of correct option
  category: { type: String }, // e.g., "JavaScript", "DSA"
});

const codingQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  testCases: [
    {
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true },
      isHidden: { type: Boolean, default: false },
    },
  ],
  starterCode: { type: String },
});

const technicalRoundSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mcqQuestions: [mcqQuestionSchema],
    codingQuestions: [codingQuestionSchema],

    // User's answers
    mcqAnswers: [{ type: Number }], // Array of selected option indices
    codingAnswers: [
      {
        code: { type: String },
        language: { type: String, default: "javascript" },
        submittedAt: { type: Date },
      },
    ],

    // Results
    mcqScore: { type: Number },
    codingScore: { type: Number },
    totalScore: { type: Number },
    passed: { type: Boolean, default: false },

    // Test metadata
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "disqualified"],
      default: "not_started",
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    duration: { type: Number, default: 1800 }, // 30 minutes in seconds
    timeRemaining: { type: Number },

    // Proctoring data
    violations: [
      {
        type: {
          type: String,
          enum: [
            "tab_switch",
            "fullscreen_exit",
            "face_not_detected",
            "multiple_faces",
          ],
        },
        timestamp: { type: Date, default: Date.now },
        severity: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
      },
    ],
    videoRecordingUrl: { type: String },
    cheatingDetected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TechnicalRound", technicalRoundSchema);
