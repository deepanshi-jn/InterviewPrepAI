import React from "react";
import { LuCheck, LuCircleAlert, LuLightbulb } from "react-icons/lu";

const QuestionAnswerComparison = ({
  questionNumber,
  question,
  userAnswer,
  idealAnswer,
  score,
  feedback,
}) => {
  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600 bg-green-100";
    if (score >= 5) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreIcon = (score) => {
    if (score >= 8) return <LuCheck className="w-5 h-5 text-green-600" />;
    if (score >= 5) return <LuCircleAlert className="w-5 h-5 text-amber-600" />;
    return <LuCircleAlert className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-500/10 mb-6">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF9324] to-[#e99a4b] flex items-center justify-center shadow-sm">
            <span className="text-sm font-bold text-white">
              Q{questionNumber}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-gray-800 leading-relaxed">
              {question}
            </h4>
          </div>
        </div>

        {/* Score Badge */}
        {score !== undefined && (
          <div className="flex items-center gap-2 ml-4">
            {getScoreIcon(score)}
            <span
              className={`px-3 py-1.5 rounded-full font-bold text-sm ${getScoreColor(
                score
              )}`}
            >
              {score}/10
            </span>
          </div>
        )}
      </div>

      {/* Your Answer */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-amber-500 rounded"></div>
          <h5 className="text-sm font-bold text-gray-700">Your Answer:</h5>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-amber-50/30 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-700 leading-relaxed">
            {userAnswer || "No answer provided"}
          </p>
        </div>
      </div>

      {/* Ideal Answer */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <LuLightbulb className="w-4 h-4 text-green-600" />
          <h5 className="text-sm font-bold text-gray-700">Ideal Answer:</h5>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50/30 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-gray-700 leading-relaxed">{idealAnswer}</p>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-1 h-4 bg-blue-500 rounded mt-1"></div>
            <div>
              <h5 className="text-sm font-bold text-gray-700 mb-2">
                AI Feedback:
              </h5>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feedback}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionAnswerComparison;
