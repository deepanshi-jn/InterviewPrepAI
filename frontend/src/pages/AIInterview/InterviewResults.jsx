import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LuArrowLeft,
  LuTrophy,
  LuBrain,
  LuMessageCircle,
  LuLightbulb,
  LuTarget,
  LuClock,
  LuCalendar,
  LuCircleCheck,
  LuCircleAlert,
  LuChevronDown,
} from "react-icons/lu";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import QuestionAnswerComparison from "../../components/QuestionAnswerComparison";
import moment from "moment";

const InterviewResults = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQA, setShowQA] = useState(false);

  useEffect(() => {
    fetchInterviewDetails();
  }, [interviewId]);

  const fetchInterviewDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        API_PATHS.INTERVIEW.GET_ONE(interviewId)
      );
      setInterview(response.data);
    } catch (error) {
      console.error("Error fetching interview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <SpinnerLoader />
        </div>
      </DashboardLayout>
    );
  }

  if (!interview) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Interview not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const { analysis } = interview;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-blue-600 bg-blue-100";
    if (score >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-blue-500 to-cyan-500";
    if (score >= 40) return "from-orange-500 to-amber-500";
    return "from-red-500 to-rose-500";
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#FFFCEF] py-6">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <LuArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF9324] to-[#FCD760] bg-clip-text text-transparent">
                    Interview Results
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {interview.role} • {interview.experience} years experience
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <LuCalendar className="w-4 h-4" />
                      {moment(interview.completedAt).format("MMM DD, YYYY")}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <LuClock className="w-4 h-4" />
                      {interview.duration} minutes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-white to-amber-50/50 backdrop-blur-sm rounded-2xl p-8 border border-amber-100 shadow-lg shadow-amber-500/10">
              <div className="text-center">
                <LuTrophy className="w-16 h-16 mx-auto mb-4 text-amber-600" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Overall Performance
                </h2>
                <div
                  className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getScoreGradient(
                    analysis?.overallScore
                  )} text-white text-5xl font-bold shadow-lg mb-4`}
                >
                  {analysis?.overallScore || 0}
                </div>
                <p className="text-gray-600 text-lg">
                  {analysis?.overallScore >= 80
                    ? "Excellent Performance!"
                    : analysis?.overallScore >= 60
                    ? "Good Job!"
                    : analysis?.overallScore >= 40
                    ? "Room for Improvement"
                    : "Keep Practicing"}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Technical Skills */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-500/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9324] to-[#e99a4b] flex items-center justify-center">
                  <LuBrain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Technical Skills
                  </h3>
                  <p className="text-sm text-gray-500">Knowledge & Expertise</p>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span
                  className={`text-4xl font-bold ${getScoreColor(
                    analysis?.technicalSkills
                  )}`}
                >
                  {analysis?.technicalSkills || 0}
                </span>
                <span className="text-gray-400 mb-1">/ 100</span>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getScoreGradient(
                    analysis?.technicalSkills
                  )} transition-all duration-1000`}
                  style={{ width: `${analysis?.technicalSkills || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Communication */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-500/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FCD760] to-[#f5b779] flex items-center justify-center">
                  <LuMessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Communication</h3>
                  <p className="text-sm text-gray-500">Clarity & Expression</p>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span
                  className={`text-4xl font-bold ${getScoreColor(
                    analysis?.communication
                  )}`}
                >
                  {analysis?.communication || 0}
                </span>
                <span className="text-gray-400 mb-1">/ 100</span>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getScoreGradient(
                    analysis?.communication
                  )} transition-all duration-1000`}
                  style={{ width: `${analysis?.communication || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Problem Solving */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-500/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9324] to-[#e99a4b] flex items-center justify-center">
                  <LuLightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Problem Solving
                  </h3>
                  <p className="text-sm text-gray-500">Analytical Thinking</p>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span
                  className={`text-4xl font-bold ${getScoreColor(
                    analysis?.problemSolving
                  )}`}
                >
                  {analysis?.problemSolving || 0}
                </span>
                <span className="text-gray-400 mb-1">/ 100</span>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getScoreGradient(
                    analysis?.problemSolving
                  )} transition-all duration-1000`}
                  style={{ width: `${analysis?.problemSolving || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-500/10">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <LuTarget className="w-5 h-5 text-amber-600" />
                Performance Summary
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {analysis?.summary || "No summary available"}
              </p>
            </div>
          </div>

          {/* Strengths and Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Strengths */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-500/10">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <LuCircleCheck className="w-5 h-5 text-green-600" />
                Key Strengths
              </h3>
              <ul className="space-y-3">
                {analysis?.strengths?.map((strength, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-700"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <LuCircleCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-500/10">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <LuCircleAlert className="w-5 h-5 text-amber-600" />
                Areas for Improvement
              </h3>
              <ul className="space-y-3">
                {analysis?.improvements?.map((improvement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-700"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <LuCircleAlert className="w-4 h-4 text-amber-600" />
                    </div>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Q&A Analysis */}
          {interview.questionsAndAnswers &&
            interview.questionsAndAnswers.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-500/10 mb-6">
                <button
                  onClick={() => setShowQA(!showQA)}
                  className="w-full flex items-center justify-between text-left mb-4"
                >
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <LuTarget className="w-6 h-6 text-amber-600" />
                    Question-by-Question Analysis (
                    {interview.questionsAndAnswers.length} questions)
                  </h3>
                  <LuChevronDown
                    className={`w-6 h-6 text-amber-600 transition-transform ${
                      showQA ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showQA && (
                  <div className="space-y-6 mt-6">
                    {interview.questionsAndAnswers.map((qa, index) => (
                      <QuestionAnswerComparison
                        key={index}
                        questionNumber={index + 1}
                        question={qa.question}
                        userAnswer={qa.userAnswer}
                        idealAnswer={qa.idealAnswer}
                        score={qa.score}
                        feedback={qa.feedback}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() =>
                navigate(`/interview-prep/${interview.session._id}`)
              }
              className="px-6 py-3 bg-gradient-to-r from-[#FF9324] to-[#e99a4b] hover:from-black hover:to-black text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all hover:scale-105"
            >
              Back to Preparation
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-300 shadow-lg transition-all hover:scale-105"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewResults;
