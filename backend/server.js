require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const technicalRoundRoutes = require("./routes/technicalRoundRoutes");
const { protect } = require("./middlewares/authMiddleware");
const {
  generateInterviewQuestions,
  generateConceptExplanation,
  suggestTopics,
} = require("./controllers/aiController");

const app = express();

// Middleware to handle CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect to the database
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

//Server uploads folder (must be before routes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/technical-round", technicalRoundRoutes);

app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanation);
app.use("/api/ai/suggest-topics", protect, suggestTopics);

//start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
