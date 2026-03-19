const questionAnswerPrompt = (
  role,
  experience,
  topicsToFocus,
  numberOfQuestions,
) => `
    You are an expert interview coach. You are an AI Trained to generate technical interview questions and answers.
    Task:
    - Role: ${role}
    - Candidate Experience: ${experience} years
    - Topics to Focus On: ${topicsToFocus}
    - Write ${numberOfQuestions} interview questions.
    - For each question, generate a detailed but beginner-friendly answer.
    - If an answer needs a code example, include a short snippet as plain text in the "answer" string.
    - Keep formatting clear and concise.
    - Return a pure JSON array of objects with ONLY "question" and "answer" fields.
    - IMPORTANT JSON RULES:
      1) Return ONLY valid JSON (no markdown, no backticks, no comments).
      2) Do NOT include trailing commas.
      3) Escape all double quotes inside string values.
      4) Ensure newline characters are escaped correctly in JSON strings.
    Example valid shape:
    [
      {
        "question": "What is a closure in JavaScript?",
        "answer": "A closure is a feature in JavaScript where an inner function can access variables from its outer scope."
      }
    ]
    Important: Return only the JSON array, no extra explanations or text.
    `;

const conceptExplainPrompt = (question) => `
    You are an expert interview coach. You are an AI Trained to generate beginner-friendly explanations for technical concepts.
    Task:
    - Explain the following concept in simple terms: "${question}"
    - Provide a clear and concise explanation suitable for someone new to the topic.
    - Use analogies or examples where appropriate to enhance understanding.
    - Keep the explanation focused and avoid unnecessary jargon.
    - Return the result as a valid JSON object in the following format: 
    { 
      "title": "Concept Title",
      "explanation": "your explanation here"
    }
    Important: DO NOT add any extra text outside the JSON format. Only return the JSON object.
    `;

const aiInterviewerPrompt = (
  role,
  experience,
  topicsToFocus,
  conversationHistory,
) => {
  const historyContext =
    conversationHistory.length > 0
      ? conversationHistory
          .map(
            (msg) =>
              `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${
                msg.message
              }`,
          )
          .join("\n")
      : "";

  return `You are an expert technical interviewer conducting a real-time interview for a ${role} position with ${experience} years of experience requirement. Focus areas: ${topicsToFocus}.

Interview Guidelines:
- Start with "Tell me about yourself" if this is the first question
- Ask relevant follow-up questions based on the candidate's responses
- Test technical knowledge, problem-solving, and understanding of core concepts
- Be professional but conversational
- Ask one question at a time
- Provide brief acknowledgments of good answers
- Challenge the candidate appropriately based on their experience level
- Mix behavioral and technical questions
- Keep responses concise and natural (2-3 sentences max)

Conversation so far:
${historyContext || "This is the start of the interview."}

Respond naturally as an interviewer. Return ONLY a JSON object with your response:
{
  "message": "your interviewer response here",
  "isComplete": false
}

If you believe the interview should end (after 8-10 meaningful exchanges), set "isComplete": true and provide a closing message.
Important: Return only the JSON object, no extra text.`;
};

const interviewAnalysisPrompt = (role, experience, conversationHistory) => {
  const conversation = conversationHistory
    .map(
      (msg) =>
        `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${msg.message}`,
    )
    .join("\n");

  return `You are an expert interview evaluator. Analyze the following interview conversation for a ${role} position requiring ${experience} years of experience.

Interview Transcript:
${conversation}

Provide a comprehensive analysis and return ONLY a JSON object with the following structure:
{
  "overallScore": 75,
  "technicalSkills": 80,
  "communication": 70,
  "problemSolving": 75,
  "strengths": ["Clear communication", "Strong technical knowledge in React"],
  "improvements": ["Could elaborate more on problem-solving approach", "More specific examples needed"],
  "summary": "The candidate demonstrated solid technical knowledge and good communication skills. They showed understanding of core concepts but could benefit from providing more detailed examples of past projects."
}

Scoring Guide (0-100):
- Technical Skills: Depth of technical knowledge and accuracy
- Communication: Clarity, articulation, and professionalism
- Problem Solving: Analytical thinking and approach to challenges
- Overall Score: Weighted average considering all factors

Important: Return only the JSON object, no extra text.`;
};

const topicSuggestionPrompt = (role, experience) => `
You are an expert career advisor and technical interview coach. Based on the role and experience level, suggest 6-8 relevant and important topics that a candidate should focus on for interview preparation.

Role: ${role}
Experience: ${experience} years

Guidelines:
- Suggest topics that are most relevant to this specific role
- Consider the experience level when determining topic complexity
- Mix fundamental and advanced topics appropriately
- Include both technical skills and soft skills where relevant
- Keep topic names concise (1-3 words each)
- Order topics from most important to least important

Return ONLY a JSON object in this exact format:
{
  "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5", "Topic 6"]
}

Important: Return only the JSON object with an array of topic strings, no extra text.`;

module.exports = {
  questionAnswerPrompt,
  conceptExplainPrompt,
  aiInterviewerPrompt,
  interviewAnalysisPrompt,
  topicSuggestionPrompt,
};
