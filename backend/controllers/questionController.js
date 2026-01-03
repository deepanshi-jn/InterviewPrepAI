const Question = require("../models/Question");
const Session = require("../models/Session");
const Module = require("../models/Module");

//@desc    add additional questions to an existing session
//@route   POST /api/questions/add
//@access  Private
const addQuestionsToSession = async (req, res) => {
  try {
    const { sessionId, questions, moduleId } = req.body;

    if (!sessionId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid input data" });
    }
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if module exists (if moduleId is provided)
    if (moduleId) {
      const module = await Module.findById(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
    }

    const createQuestions = await Question.insertMany(
      questions.map((q) => ({
        session: sessionId,
        module: moduleId || undefined,
        question: q.question,
        answer: q.answer,
      }))
    );

    //update session with new questions
    session.questions.push(...createQuestions.map((q) => q._id));
    await session.save();

    // Update module if moduleId is provided
    if (moduleId) {
      await Module.findByIdAndUpdate(moduleId, {
        $push: { questions: { $each: createQuestions.map((q) => q._id) } },
      });
    }

    res.status(201).json({ success: true, questions: createQuestions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    pin or unpin a question
//@route   POST /api/questions/:id/pin
//@access  Private
const togglePinQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.isPinned = !question.isPinned;
    await question.save();

    res.status(200).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    update note for a question
//@route   POST /api/questions/:id/note
//@access  Private
const updateQuestionNote = async (req, res) => {
  try {
    const questionId = req.params.id;
    const { note } = req.body;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.notes = note || "";
    await question.save();

    res.status(200).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    toggle checked status for a question
//@route   POST /api/questions/:id/check
//@access  Private
const toggleCheckQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.isChecked = !question.isChecked;
    await question.save();

    res.status(200).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addQuestionsToSession,
  togglePinQuestion,
  updateQuestionNote,
  toggleCheckQuestion,
};
