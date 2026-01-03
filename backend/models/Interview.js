const mongoose = require("mongoose");

const questionAnswerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  userAnswer: { type: String },
  idealAnswer: { type: String },
  score: { type: Number, min: 0, max: 10 },
  feedback: String,
});

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    role: { type: String, required: true },
    experience: { type: String, required: true },
    selectedDuration: { type: Number, enum: [15, 30, 60], default: 30 }, // in minutes
    actualDuration: { type: Number }, // actual time taken in minutes
    status: {
      type: String,
      enum: ["in-progress", "completed", "cancelled"],
      default: "in-progress",
    },
    conversationHistory: [
      {
        role: { type: String, enum: ["user", "ai"], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    questionsAndAnswers: [questionAnswerSchema],
    analysis: {
      overallScore: { type: Number, min: 0, max: 100 },
      technicalSkills: { type: Number, min: 0, max: 100 },
      communication: { type: Number, min: 0, max: 100 },
      problemSolving: { type: Number, min: 0, max: 100 },
      strengths: [String],
      improvements: [String],
      summary: String,
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
