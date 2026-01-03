const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
    },
    question: String,
    answer: String,
    notes: String,
    isChecked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
