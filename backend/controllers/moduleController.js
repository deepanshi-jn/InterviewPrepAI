const Module = require("../models/Module");
const Session = require("../models/Session");
const Question = require("../models/Question");

//@desc    Create a new module for a session
//@route   POST /api/modules/create
//@access  Private
const createModule = async (req, res) => {
  try {
    const { sessionId, name, description, questions } = req.body;

    if (!sessionId || !name) {
      return res
        .status(400)
        .json({ message: "Session ID and module name are required" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Get the current module count for ordering
    const moduleCount = await Module.countDocuments({ session: sessionId });

    // Create the module
    const module = await Module.create({
      session: sessionId,
      name,
      description,
      order: moduleCount,
    });

    // Create questions if provided
    if (questions && Array.isArray(questions) && questions.length > 0) {
      const questionDocs = await Promise.all(
        questions.map(async (q) => {
          const question = await Question.create({
            session: sessionId,
            module: module._id,
            question: q.question,
            answer: q.answer,
          });
          return question._id;
        })
      );

      module.questions = questionDocs;
      await module.save();

      // Add questions to session as well
      session.questions.push(...questionDocs);
    }

    // Add module to session
    session.modules.push(module._id);
    await session.save();

    res.status(201).json({ success: true, module });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Get all modules for a session
//@route   GET /api/modules/session/:sessionId
//@access  Private
const getModulesBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const modules = await Module.find({ session: sessionId })
      .sort({ order: 1 })
      .populate("questions");

    res.status(200).json({ success: true, modules });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Update module
//@route   PUT /api/modules/:id
//@access  Private
const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    if (name) module.name = name;
    if (description !== undefined) module.description = description;

    await module.save();

    res.status(200).json({ success: true, module });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Delete module
//@route   DELETE /api/modules/:id
//@access  Private
const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Delete all questions in this module
    await Question.deleteMany({ module: id });

    // Remove module from session
    await Session.findByIdAndUpdate(module.session, {
      $pull: { modules: id, questions: { $in: module.questions } },
    });

    await module.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Module deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Add questions to a module
//@route   POST /api/modules/:id/questions
//@access  Private
const addQuestionsToModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Questions array is required" });
    }

    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Create questions
    const questionDocs = await Promise.all(
      questions.map(async (q) => {
        const question = await Question.create({
          session: module.session,
          module: module._id,
          question: q.question,
          answer: q.answer,
        });
        return question._id;
      })
    );

    // Add questions to module
    module.questions.push(...questionDocs);
    await module.save();

    // Add questions to session
    await Session.findByIdAndUpdate(module.session, {
      $push: { questions: { $each: questionDocs } },
    });

    res.status(201).json({ success: true, module });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Toggle module completion status
//@route   POST /api/modules/:id/toggle-complete
//@access  Private
const toggleModuleCompletion = async (req, res) => {
  try {
    const { id } = req.params;

    const module = await Module.findById(id).populate("questions");
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Check if all questions are checked
    const allQuestionsChecked = module.questions.every((q) => q.isChecked);

    // Auto-complete if all questions are checked, or toggle based on current status
    module.isCompleted = allQuestionsChecked;

    await module.save();

    res.status(200).json({ success: true, module });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc    Get module progress statistics
//@route   GET /api/modules/:id/progress
//@access  Private
const getModuleProgress = async (req, res) => {
  try {
    const { id } = req.params;

    const module = await Module.findById(id).populate("questions");
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    const totalQuestions = module.questions.length;
    const completedQuestions = module.questions.filter(
      (q) => q.isChecked
    ).length;
    const progressPercentage =
      totalQuestions > 0
        ? Math.round((completedQuestions / totalQuestions) * 100)
        : 0;

    res.status(200).json({
      success: true,
      progress: {
        total: totalQuestions,
        completed: completedQuestions,
        percentage: progressPercentage,
        isCompleted: module.isCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createModule,
  getModulesBySession,
  updateModule,
  deleteModule,
  addQuestionsToModule,
  toggleModuleCompletion,
  getModuleProgress,
};
