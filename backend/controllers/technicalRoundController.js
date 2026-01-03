const TechnicalRound = require("../models/TechnicalRound");
const Session = require("../models/Session");
const { generateAIResponse } = require("./aiController");

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
      // Return questions without correct answers for security
      const safeRound = {
        _id: technicalRound._id,
        mcqQuestions: technicalRound.mcqQuestions.map((q) => ({
          question: q.question,
          options: q.options,
          category: q.category,
        })),
        codingQuestions: technicalRound.codingQuestions.map((q) => ({
          _id: q._id,
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          testCases: q.testCases.filter((tc) => !tc.isHidden),
          starterCode: q.starterCode,
        })),
        mcqAnswers: technicalRound.mcqAnswers,
        codingAnswers: technicalRound.codingAnswers,
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

    // Generate MCQ and Coding questions using AI
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

    const codingPrompt = `Generate 2 coding problems for a ${session.role} position with ${session.experience} years of experience. Topics: ${session.topicsToFocus}.

One should be Easy difficulty, another Medium difficulty. Include test cases.

Return a JSON array with this structure:
[
  {
    "title": "Problem Title",
    "description": "Detailed problem description with examples",
    "difficulty": "Easy",
    "testCases": [
      {"input": "input example", "expectedOutput": "output example", "isHidden": false}
    ],
    "starterCode": "function solution() {\\n  // Your code here\\n}"
  }
]

Important: 
- Return only valid JSON array, no extra text.
- difficulty must be exactly one of: "Easy", "Medium", or "Hard"`;

    const [mcqResponse, codingResponse] = await Promise.all([
      generateAIResponse(mcqPrompt),
      generateAIResponse(codingPrompt),
    ]);

    const mcqQuestions = JSON.parse(mcqResponse);
    const codingQuestions = JSON.parse(codingResponse);

    if (!technicalRound) {
      technicalRound = new TechnicalRound({
        session: sessionId,
        user: userId,
        mcqQuestions,
        codingQuestions,
        mcqAnswers: new Array(10).fill(-1),
        codingAnswers: [{ code: "" }, { code: "" }],
        status: "in_progress",
        startedAt: new Date(),
        timeRemaining: 1800, // 30 minutes
      });
    } else {
      technicalRound.mcqQuestions = mcqQuestions;
      technicalRound.codingQuestions = codingQuestions;
      technicalRound.status = "in_progress";
      technicalRound.startedAt = new Date();
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
      codingQuestions: technicalRound.codingQuestions.map((q) => ({
        _id: q._id,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        starterCode: q.starterCode,
        testCases: q.testCases
          .filter((tc) => !tc.isHidden)
          .map((tc) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          })),
      })),
      mcqAnswers: technicalRound.mcqAnswers,
      codingAnswers: technicalRound.codingAnswers,
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

    technicalRound.mcqAnswers[questionIndex] = answer;
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
    const { technicalRoundId, questionIndex, code, language } = req.body;

    const technicalRound = await TechnicalRound.findById(technicalRoundId);
    if (!technicalRound) {
      return res.status(404).json({ message: "Technical round not found" });
    }

    if (technicalRound.status !== "in_progress") {
      return res
        .status(400)
        .json({ message: "Technical round is not in progress" });
    }

    technicalRound.codingAnswers[questionIndex] = {
      code,
      language: language || "javascript",
      submittedAt: new Date(),
    };
    await technicalRound.save();

    res.status(200).json({ message: "Code saved", success: true });
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
      (v) => v.type === "tab_switch" || v.type === "fullscreen_exit"
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
    let mcqCorrect = 0;
    technicalRound.mcqQuestions.forEach((q, index) => {
      if (technicalRound.mcqAnswers[index] === q.correctAnswer) {
        mcqCorrect++;
      }
    });
    technicalRound.mcqScore = (mcqCorrect / 10) * 100;

    // For now, coding score is based on submission (manual review needed in real scenario)
    const codingSubmitted = technicalRound.codingAnswers.filter(
      (a) => a.code && a.code.trim().length > 0
    ).length;
    technicalRound.codingScore = (codingSubmitted / 2) * 100;

    // Total score (60% MCQ, 40% Coding)
    technicalRound.totalScore =
      technicalRound.mcqScore * 0.6 + technicalRound.codingScore * 0.4;
    technicalRound.passed =
      technicalRound.totalScore >= 60 && !technicalRound.cheatingDetected;
    technicalRound.status = "completed";
    technicalRound.completedAt = new Date();

    await technicalRound.save();

    // Return full results with correct answers
    const results = {
      _id: technicalRound._id,
      mcqScore: technicalRound.mcqScore,
      codingScore: technicalRound.codingScore,
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
      codingResults: technicalRound.codingQuestions.map((q, index) => ({
        title: q.title,
        description: q.description,
        userCode: technicalRound.codingAnswers[index]?.code,
        submittedAt: technicalRound.codingAnswers[index]?.submittedAt,
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
    const technicalRound = await TechnicalRound.findById(id).populate(
      "session"
    );

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

module.exports = {
  startTechnicalRound,
  submitMCQAnswer,
  submitCodingAnswer,
  logViolation,
  completeTechnicalRound,
  getTechnicalRound,
};
