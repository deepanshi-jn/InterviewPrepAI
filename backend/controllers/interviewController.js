const Interview = require("../models/Interview");
const Session = require("../models/Session");
const { generateAIResponse } = require("./aiController");
const {
  aiInterviewerPrompt,
  interviewAnalysisPrompt,
} = require("../utils/prompts");

// Start a new AI interview
const startInterview = async (req, res) => {
  try {
    const { sessionId, selectedDuration } = req.body;
    const userId = req.user._id;

    // Get session details
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Validate duration
    const validDurations = [15, 30, 60];
    const duration = validDurations.includes(selectedDuration)
      ? selectedDuration
      : 30;

    // Create new interview
    const interview = new Interview({
      user: userId,
      session: sessionId,
      role: session.role,
      experience: session.experience,
      selectedDuration: duration,
      startedAt: new Date(),
      conversationHistory: [],
      questionsAndAnswers: [],
    });

    await interview.save();

    // Generate first AI message
    const aiPrompt = aiInterviewerPrompt(
      session.role,
      session.experience,
      session.topicsToFocus,
      []
    );

    const aiResponseText = await generateAIResponse(aiPrompt);
    console.log("AI Response Text:", aiResponseText);

    let aiResponse;
    try {
      aiResponse = JSON.parse(aiResponseText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw AI response:", aiResponseText);
      // Fallback response if parsing fails
      aiResponse = {
        message:
          "Hello! I'm excited to interview you today for the " +
          session.role +
          " position. To start, could you please tell me about yourself and your background?",
        isComplete: false,
      };
    }

    // Add AI's first message to conversation
    interview.conversationHistory.push({
      role: "ai",
      message: aiResponse.message,
      timestamp: new Date(),
    });

    await interview.save();

    res.status(201).json({
      interview,
      aiMessage: aiResponse.message,
    });
  } catch (error) {
    console.error("Error starting interview:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to start interview",
      error: error.message,
    });
  }
};

// Continue interview conversation
const continueInterview = async (req, res) => {
  try {
    const { interviewId, userMessage } = req.body;

    const interview = await Interview.findById(interviewId).populate("session");
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Add user message to conversation
    interview.conversationHistory.push({
      role: "user",
      message: userMessage,
      timestamp: new Date(),
    });

    // Generate AI response
    const aiPrompt = aiInterviewerPrompt(
      interview.role,
      interview.experience,
      interview.session.topicsToFocus,
      interview.conversationHistory
    );

    const aiResponseText = await generateAIResponse(aiPrompt);
    console.log("AI Continue Response:", aiResponseText);

    let aiResponse;
    try {
      aiResponse = JSON.parse(aiResponseText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback response
      aiResponse = {
        message:
          "Thank you for your response. Let me ask you another question to better understand your experience.",
        isComplete: false,
      };
    }

    // Add AI response to conversation
    interview.conversationHistory.push({
      role: "ai",
      message: aiResponse.message,
      timestamp: new Date(),
    });

    // Check if interview should be completed
    if (aiResponse.isComplete) {
      interview.status = "completed";
      interview.completedAt = new Date();
      interview.duration = Math.round(
        (interview.completedAt - interview.startedAt) / 60000
      ); // minutes
    }

    await interview.save();

    res.json({
      interview,
      aiMessage: aiResponse.message,
      isComplete: aiResponse.isComplete || false,
    });
  } catch (error) {
    console.error("Error continuing interview:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to continue interview",
      error: error.message,
    });
  }
};

// Complete interview and generate analysis
const completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    interview.status = "completed";
    interview.completedAt = new Date();
    interview.actualDuration = Math.round(
      (interview.completedAt - interview.startedAt) / 60000
    );

    // Generate analysis
    const analysisPrompt = interviewAnalysisPrompt(
      interview.role,
      interview.experience,
      interview.conversationHistory
    );

    const analysisText = await generateAIResponse(analysisPrompt);
    const analysis = JSON.parse(analysisText);

    interview.analysis = analysis;

    // Generate Q&A pairs with ideal answers and scoring
    // Extract questions and answers from conversation history
    const qaPrompt = `Based on this interview conversation, generate a detailed question-by-question analysis.
    
Interview Role: ${interview.role}
Experience Level: ${interview.experience}

Conversation History:
${interview.conversationHistory
  .map(
    (msg, idx) =>
      `${msg.role === "ai" ? "Interviewer" : "Candidate"}: ${msg.message}`
  )
  .join("\n\n")}

For each technical question asked in the interview, provide:
1. The exact question asked
2. The candidate's answer (from the conversation)
3. An ideal/reference answer showing what a strong candidate would say
4. A score out of 10 based on the candidate's response
5. Specific feedback on what was good and what could be improved

Return a JSON object with this structure:
{
  "questionsAndAnswers": [
    {
      "question": "string",
      "userAnswer": "string",
      "idealAnswer": "string",
      "score": number (0-10),
      "feedback": "string with specific improvement suggestions"
    }
  ]
}

Only include actual technical/behavioral questions asked during the interview, not greetings or closing statements.`;

    try {
      const qaAnalysisText = await generateAIResponse(qaPrompt);
      const qaAnalysis = JSON.parse(qaAnalysisText);

      if (
        qaAnalysis.questionsAndAnswers &&
        Array.isArray(qaAnalysis.questionsAndAnswers)
      ) {
        interview.questionsAndAnswers = qaAnalysis.questionsAndAnswers;
      }
    } catch (qaError) {
      console.error("Error generating Q&A analysis:", qaError);
      // Continue without Q&A if it fails
      interview.questionsAndAnswers = [];
    }

    await interview.save();

    res.json({ interview, analysis });
  } catch (error) {
    console.error("Error completing interview:", error);
    res.status(500).json({ message: "Failed to complete interview" });
  }
};

// Get interview details
const getInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId)
      .populate("session")
      .populate("user", "name email");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json(interview);
  } catch (error) {
    console.error("Error fetching interview:", error);
    res.status(500).json({ message: "Failed to fetch interview" });
  }
};

// Get all interviews for a session
const getSessionInterviews = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const interviews = await Interview.find({
      session: sessionId,
      user: userId,
    }).sort({ createdAt: -1 });

    res.json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
};

// Get all user interviews
const getUserInterviews = async (req, res) => {
  try {
    const userId = req.user._id;

    const interviews = await Interview.find({ user: userId })
      .populate("session", "role experience")
      .sort({ createdAt: -1 });

    res.json(interviews);
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    res.status(500).json({ message: "Failed to fetch user interviews" });
  }
};

module.exports = {
  startInterview,
  continueInterview,
  completeInterview,
  getInterview,
  getSessionInterviews,
  getUserInterviews,
};
