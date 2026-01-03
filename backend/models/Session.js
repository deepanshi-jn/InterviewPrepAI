const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, required: true },
    description: String,
    experience: { type: String, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
    topicsToFocus: { type: String, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Session", sessionSchema);
