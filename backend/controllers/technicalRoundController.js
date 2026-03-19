const TechnicalRound = require("../models/TechnicalRound");
const Session = require("../models/Session");
const { generateAIResponse } = require("./aiController");

const normalizeMcqAnswers = (answers, questions) => {
  return questions.map((q, index) => {
    const value = answers?.[index];
    const parsed = Number(value);
    if (
      Number.isInteger(parsed) &&
      parsed >= 0 &&
      parsed < (q.options?.length || 0)
    ) {
      return parsed;
    }
    return -1;
  });
};

//@desc    Generate and start technical round for a session
//@route   POST /api/technical-round/start
//@access  Private
const startTechnicalRound = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;

    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if technical round already exists
    let technicalRound = await TechnicalRound.findOne({
      session: sessionId,
      user: userId,
    });

    // If round is completed, don't allow restart
    if (technicalRound && technicalRound.status === "completed") {
      return res.status(400).json({
        message: "Technical round already completed",
        technicalRound,
      });
    }

    // If round is in progress, return it (allow resume)
    if (technicalRound && technicalRound.status === "in_progress") {
      const normalizedAnswers = normalizeMcqAnswers(
        technicalRound.mcqAnswers,
        technicalRound.mcqQuestions,
      );

      if (
        JSON.stringify(normalizedAnswers) !==
        JSON.stringify(technicalRound.mcqAnswers)
      ) {
        technicalRound.mcqAnswers = normalizedAnswers;
        await technicalRound.save();
      }

      // Return questions without correct answers for security
      const safeRound = {
        _id: technicalRound._id,
        mcqQuestions: technicalRound.mcqQuestions.map((q) => ({
          question: q.question,
          options: q.options,
          category: q.category,
        })),
        mcqAnswers: normalizedAnswers,
        status: technicalRound.status,
        timeRemaining: technicalRound.timeRemaining,
        duration: technicalRound.duration,
        violations: technicalRound.violations,
      };

      return res.status(200).json({
        success: true,
        technicalRound: safeRound,
        message: "Resuming technical round",
      });
    }

    // Generate MCQ questions using AI
    const mcqPrompt = `Generate 10 multiple choice questions for a ${session.role} position with ${session.experience} years of experience. Topics: ${session.topicsToFocus}.

Return a JSON array with this structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "category": "JavaScript"
  }
]

Important: Return only valid JSON array, no extra text.`;

    const mcqResponse = await generateAIResponse(mcqPrompt);

    const mcqQuestions = JSON.parse(mcqResponse);

    if (!technicalRound) {
      technicalRound = new TechnicalRound({
        session: sessionId,
        user: userId,
        mcqQuestions,
        mcqAnswers: new Array(10).fill(-1),
        codingQuestions: [],
        codingAnswers: [],
        status: "in_progress",
        startedAt: new Date(),
        timeRemaining: 1800, // 30 minutes
      });
    } else {
      technicalRound.mcqQuestions = mcqQuestions;
      technicalRound.mcqAnswers = new Array(mcqQuestions.length).fill(-1);
      technicalRound.codingQuestions = [];
      technicalRound.codingAnswers = [];
      technicalRound.status = "in_progress";
      technicalRound.startedAt = new Date();
      technicalRound.timeRemaining = technicalRound.duration || 1800;
      technicalRound.violations = [];
      technicalRound.cheatingDetected = false;
      technicalRound.completedAt = undefined;
    }

    await technicalRound.save();

    // Return questions without correct answers
    const safeRound = {
      _id: technicalRound._id,
      mcqQuestions: technicalRound.mcqQuestions.map((q) => ({
        question: q.question,
        options: q.options,
        category: q.category,
      })),
      mcqAnswers: normalizeMcqAnswers(
        technicalRound.mcqAnswers,
        technicalRound.mcqQuestions,
      ),
      status: technicalRound.status,
      startedAt: technicalRound.startedAt,
      duration: technicalRound.duration,
      timeRemaining: technicalRound.timeRemaining,
    };

    res.status(200).json({ technicalRound: safeRound });
  } catch (error) {
    console.error("Start technical round error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Submit MCQ answer
//@route   POST /api/technical-round/submit-mcq
//@access  Private
const submitMCQAnswer = async (req, res) => {
  try {
    const { technicalRoundId, questionIndex, answer } = req.body;

    const technicalRound = await TechnicalRound.findById(technicalRoundId);
    if (!technicalRound) {
      return res.status(404).json({ message: "Technical round not found" });
    }

    if (technicalRound.status !== "in_progress") {
      return res
        .status(400)
        .json({ message: "Technical round is not in progress" });
    }

    const qIndex = Number(questionIndex);
    const selectedAnswer = Number(answer);

    if (
      !Number.isInteger(qIndex) ||
      qIndex < 0 ||
      qIndex >= technicalRound.mcqQuestions.length
    ) {
      return res.status(400).json({ message: "Invalid question index" });
    }

    const question = technicalRound.mcqQuestions[qIndex];
    const optionCount = question?.options?.length || 0;

    if (
      !Number.isInteger(selectedAnswer) ||
      selectedAnswer < 0 ||
      selectedAnswer >= optionCount
    ) {
      return res.status(400).json({ message: "Invalid answer option" });
    }

    technicalRound.mcqAnswers[qIndex] = selectedAnswer;
    await technicalRound.save();

    res.status(200).json({ message: "Answer saved", success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Submit coding answer
//@route   POST /api/technical-round/submit-code
//@access  Private
const submitCodingAnswer = async (req, res) => {
  try {
    res.status(410).json({
      message:
        "Coding section has been removed. Technical round now supports MCQs only.",
      success: false,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Log violation
//@route   POST /api/technical-round/log-violation
//@access  Private
const logViolation = async (req, res) => {
  try {
    const { technicalRoundId, type, severity } = req.body;

    const technicalRound = await TechnicalRound.findById(technicalRoundId);
    if (!technicalRound) {
      return res.status(404).json({ message: "Technical round not found" });
    }

    technicalRound.violations.push({
      type,
      severity: severity || "medium",
      timestamp: new Date(),
    });

    // Auto-disqualify on severe violations
    const severeViolations = technicalRound.violations.filter(
      (v) => v.type === "tab_switch" || v.type === "fullscreen_exit",
    ).length;

    if (severeViolations >= 3) {
      technicalRound.status = "disqualified";
      technicalRound.cheatingDetected = true;
      technicalRound.completedAt = new Date();
    }

    await technicalRound.save();

    res.status(200).json({
      message: "Violation logged",
      shouldDisqualify: technicalRound.status === "disqualified",
      violationCount: severeViolations,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Complete technical round and calculate score
//@route   POST /api/technical-round/complete
//@access  Private
const completeTechnicalRound = async (req, res) => {
  try {
    const { technicalRoundId } = req.body;

    const technicalRound = await TechnicalRound.findById(technicalRoundId);
    if (!technicalRound) {
      return res.status(404).json({ message: "Technical round not found" });
    }

    if (technicalRound.status === "completed") {
      return res
        .status(400)
        .json({ message: "Technical round already completed" });
    }

    // Calculate MCQ score
    technicalRound.mcqAnswers = normalizeMcqAnswers(
      technicalRound.mcqAnswers,
      technicalRound.mcqQuestions,
    );

    let mcqCorrect = 0;
    technicalRound.mcqQuestions.forEach((q, index) => {
      if (technicalRound.mcqAnswers[index] === q.correctAnswer) {
        mcqCorrect++;
      }
    });
    technicalRound.mcqScore = (mcqCorrect / 10) * 100;

    technicalRound.codingScore = 0;

    // Total score based on MCQs only
    technicalRound.totalScore = technicalRound.mcqScore;
    technicalRound.passed =
      technicalRound.totalScore >= 60 && !technicalRound.cheatingDetected;
    technicalRound.status = "completed";
    technicalRound.completedAt = new Date();

    await technicalRound.save();

    // Return full results with correct answers
    const results = {
      _id: technicalRound._id,
      mcqScore: technicalRound.mcqScore,
      totalScore: technicalRound.totalScore,
      passed: technicalRound.passed,
      mcqResults: technicalRound.mcqQuestions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: technicalRound.mcqAnswers[index],
        isCorrect: technicalRound.mcqAnswers[index] === q.correctAnswer,
        category: q.category,
      })),
      violations: technicalRound.violations,
      cheatingDetected: technicalRound.cheatingDetected,
      completedAt: technicalRound.completedAt,
    };

    res.status(200).json({ results });
  } catch (error) {
    console.error("Complete technical round error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Get technical round by ID
//@route   GET /api/technical-round/:id
//@access  Private
const getTechnicalRound = async (req, res) => {
  try {
    const { id } = req.params;
    const technicalRound =
      await TechnicalRound.findById(id).populate("session");

    if (!technicalRound) {
      return res.status(404).json({ message: "Technical round not found" });
    }

    // If completed, return with answers
    if (technicalRound.status === "completed") {
      return res.status(200).json({ technicalRound });
    }

    // If in progress, hide correct answers
    const safeRound = {
      ...technicalRound.toObject(),
      mcqQuestions: technicalRound.mcqQuestions.map((q) => ({
        question: q.question,
        options: q.options,
        category: q.category,
      })),
    };

    res.status(200).json({ technicalRound: safeRound });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Get all technical rounds for a user
//@route   GET /api/technical-round/user/all
//@access  Private
const getAllUserTechnicalRounds = async (req, res) => {
  try {
    const userId = req.user._id;

    const technicalRounds = await TechnicalRound.find({ user: userId })
      .populate("session", "role experience topicsToFocus")
      .sort({ createdAt: -1 });

    res.status(200).json({ technicalRounds });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  startTechnicalRound,
  submitMCQAnswer,
  submitCodingAnswer,
  logViolation,
  completeTechnicalRound,
  getTechnicalRound,
  getAllUserTechnicalRounds,
};
