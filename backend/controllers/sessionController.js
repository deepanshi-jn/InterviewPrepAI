const Session = require("../models/Session");
const Question = require("../models/Question");

//@desc    Create a new session
//@route   POST /api/sessions/create
//@access  Private
const createSession = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, description, questions } =
      req.body;
    const userId = req.user._id;

    // Create session
    const session = await Session.create({
      user: userId,
      role,
      experience,
      topicsToFocus,
      description,
    });

    // Create questions associated with the session
    const questionDocs = await Promise.all(
      questions.map(async (q) => {
        const question = await Question.create({
          session: session._id,
          question: q.question,
          answer: q.answer,
        });
        return question._id;
      })
    );

    // Associate questions with session
    session.questions = questionDocs;
    await session.save();

    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Get sessions of logged-in user
//@route   GET /api/sessions/my-sessions
//@access  Private
const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("questions");

    res.status(200).json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Get session by ID
//@route   GET /api/sessions/:id
//@access  Private
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate({
        path: "questions",
        options: { sort: { isPinned: -1, createdAt: 1 } },
      })
      .populate({
        path: "modules",
        options: { sort: { order: 1 } },
        populate: {
          path: "questions",
          options: { sort: { createdAt: 1 } },
        },
      })
      .exec();

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Delete session by ID
//@route   DELETE /api/sessions/:id
//@access  Private
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    // Ensure the session belongs to the logged-in user
    if (session.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this session" });
    }
    // Delete associated questions
    await Question.deleteMany({ session: session._id });

    // Delete the session
    await session.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createSession,
  getMySessions,
  getSessionById,
  deleteSession,
};
