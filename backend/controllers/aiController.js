const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  conceptExplainPrompt,
  questionAnswerPrompt,
  topicSuggestionPrompt,
} = require("../utils/prompts");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to sanitize JSON string
const sanitizeJSON = (jsonString) => {
  try {
    // First attempt: try parsing as-is
    return JSON.parse(jsonString);
  } catch (error) {
    // If parsing fails, clean the string
    // Remove any JSON markdown code blocks if present
    let cleaned = jsonString.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }

    // Try parsing the cleaned string
    return JSON.parse(cleaned);
  }
};

//@desc    Generate interview questions and answers using AI
//@route   POST /api/ai/generate-questions
//@access  Private
const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await model.generateContent(prompt);

    const rawText = response.response.text();

    // Parse JSON with sanitization
    const data = sanitizeJSON(rawText);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//@desc    Generate concept explanation using AI
//@route   POST /api/ai/generate-explanation
//@access  Private
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const prompt = conceptExplainPrompt(question);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const response = await model.generateContent(prompt);

    const rawText = response.response.text();

    // Parse JSON with sanitization
    const data = sanitizeJSON(rawText);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//@desc    Suggest topics based on role and experience
//@route   POST /api/ai/suggest-topics
//@access  Private
const suggestTopics = async (req, res) => {
  try {
    const { role, experience } = req.body;

    if (!role || !experience) {
      return res
        .status(400)
        .json({ message: "Role and experience are required" });
    }

    const prompt = topicSuggestionPrompt(role, experience);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await model.generateContent(prompt);
    const rawText = response.response.text();
    const data = sanitizeJSON(rawText);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//@desc    Generate AI response for any prompt
//@access  Private (internal use)
const generateAIResponse = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error("AI generation error:", error);
    throw error;
  }
};

module.exports = {
  generateInterviewQuestions,
  generateConceptExplanation,
  generateAIResponse,
  suggestTopics,
};
