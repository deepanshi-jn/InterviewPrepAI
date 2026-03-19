const { GoogleGenerativeAI } = require("@google/generative-ai");
const { jsonrepair } = require("jsonrepair");
const {
  conceptExplainPrompt,
  questionAnswerPrompt,
  topicSuggestionPrompt,
} = require("../utils/prompts");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to sanitize JSON string
const sanitizeJSON = (jsonString) => {
  if (typeof jsonString !== "string" || !jsonString.trim()) {
    throw new Error("Empty AI response");
  }

  const stripCodeFences = (text) => {
    const trimmed = text.trim();
    if (trimmed.startsWith("```json")) {
      return trimmed.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    }
    if (trimmed.startsWith("```")) {
      return trimmed.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }
    return trimmed;
  };

  const extractLikelyJson = (text) => {
    const firstBrace = text.indexOf("{");
    const firstBracket = text.indexOf("[");

    let start = -1;
    let open = "";
    let close = "";

    if (firstBrace === -1 && firstBracket === -1) return text;

    if (firstBrace === -1 || (firstBracket !== -1 && firstBracket < firstBrace)) {
      start = firstBracket;
      open = "[";
      close = "]";
    } else {
      start = firstBrace;
      open = "{";
      close = "}";
    }

    const end = text.lastIndexOf(close);
    if (start !== -1 && end !== -1 && end > start) {
      return text.slice(start, end + 1);
    }

    return text;
  };

  const attempts = [];

  const raw = jsonString.trim();
  attempts.push(raw);

  const noFence = stripCodeFences(raw);
  if (noFence !== raw) attempts.push(noFence);

  const extracted = extractLikelyJson(noFence);
  if (extracted !== noFence) attempts.push(extracted);

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate);
    } catch (_) {
      try {
        return JSON.parse(jsonrepair(candidate));
      } catch (_) {
        // continue
      }
    }
  }

  throw new Error("AI returned malformed JSON");
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
      error:
        error.message === "AI returned malformed JSON"
          ? "AI generated invalid JSON. Please try again."
          : error.message,
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
      error:
        error.message === "AI returned malformed JSON"
          ? "AI generated invalid JSON. Please try again."
          : error.message,
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
      error:
        error.message === "AI returned malformed JSON"
          ? "AI generated invalid JSON. Please try again."
          : error.message,
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
