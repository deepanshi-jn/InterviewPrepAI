import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LuCircleCheck,
  LuCircleX,
  LuTrophy,
  LuCode,
  LuFileText,
  LuShieldAlert,
  LuClock,
  LuArrowLeft,
} from "react-icons/lu";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";

const TechnicalRoundResults = () => {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          API_PATHS.TECHNICAL_ROUND.GET_ONE(roundId)
        );

        // If not completed, redirect back
        if (
          response.data.technicalRound.status !== "completed" &&
          response.data.technicalRound.status !== "disqualified"
        ) {
          navigate(`/technical-round/${response.data.technicalRound.session}`);
          return;
        }

        setResults(response.data.technicalRound);
      } catch (error) {
        console.error("Failed to fetch results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [roundId, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <SpinnerLoader />
        </div>
      </DashboardLayout>
    );
  }

  if (!results) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p>Results not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const isPassed = results.passed && !results.cheatingDetected;
  const isDisqualified =
    results.status === "disqualified" || results.cheatingDetected;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <LuArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Overall Results Card */}
        <div
          className={`rounded-2xl p-8 mb-8 border-2 ${
            isDisqualified
              ? "bg-red-500/10 border-red-500"
              : isPassed
              ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500"
              : "bg-orange-500/10 border-orange-500"
          }`}
        >
          <div className="text-center">
            {isDisqualified ? (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-4">
                <LuShieldAlert className="w-10 h-10 text-white" />
              </div>
            ) : isPassed ? (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4">
                <LuTrophy className="w-10 h-10 text-white" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full mb-4">
                <LuCircleX className="w-10 h-10 text-white" />
              </div>
            )}

            <h1 className="text-4xl font-bold mb-2">
              {isDisqualified
                ? "Disqualified"
                : isPassed
                ? "Congratulations!"
                : "Keep Practicing"}
            </h1>
            <p className="text-lg text-slate-300 mb-6">
              {isDisqualified
                ? "Test was terminated due to policy violations"
                : isPassed
                ? "You passed the technical round!"
                : "You didn't pass this time, but keep learning!"}
            </p>

            {!isDisqualified && (
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-amber-400 mb-1">
                    {Math.round(results.totalScore)}%
                  </div>
                  <div className="text-sm text-slate-400">Overall Score</div>
                </div>
              </div>
            )}

            {!isDisqualified && (
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <ScoreCard
                  icon={<LuFileText className="w-5 h-5" />}
                  title="MCQ Score"
                  score={results.mcqScore}
                  color="blue"
                />
                <ScoreCard
                  icon={<LuCode className="w-5 h-5" />}
                  title="Coding Score"
                  score={results.codingScore}
                  color="purple"
                />
              </div>
            )}
          </div>
        </div>

        {/* Violations */}
        {results.violations && results.violations.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <LuShieldAlert className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-bold text-red-400">
                Policy Violations Detected
              </h3>
            </div>
            <div className="space-y-2">
              {results.violations.map((violation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <LuCircleX className="w-4 h-4 text-red-400" />
                    <span className="text-sm capitalize">
                      {violation.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(violation.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MCQ Results */}
        {!isDisqualified && results.mcqQuestions && (
          <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <LuFileText className="w-5 h-5 text-blue-400" />
              <h2 className="text-2xl font-bold">MCQ Results</h2>
              <span className="ml-auto text-sm text-slate-400">
                {
                  results.mcqQuestions.filter(
                    (q, i) => results.mcqAnswers[i] === q.correctAnswer
                  ).length
                }
                /{results.mcqQuestions.length} Correct
              </span>
            </div>

            <div className="space-y-4">
              {results.mcqQuestions.map((question, index) => {
                const isCorrect =
                  results.mcqAnswers[index] === question.correctAnswer;
                const userAnswer = results.mcqAnswers[index];

                return (
                  <div
                    key={index}
                    className={`rounded-xl p-6 border-2 ${
                      isCorrect
                        ? "bg-green-500/5 border-green-500/30"
                        : "bg-red-500/5 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      {isCorrect ? (
                        <LuCircleCheck className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                      ) : (
                        <LuCircleX className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">
                            Question {index + 1}
                          </span>
                          {question.category && (
                            <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">
                              {question.category}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300">{question.question}</p>
                      </div>
                    </div>

                    <div className="space-y-2 ml-8">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg ${
                            optIndex === question.correctAnswer
                              ? "bg-green-500/20 border border-green-500/50"
                              : optIndex === userAnswer && !isCorrect
                              ? "bg-red-500/20 border border-red-500/50"
                              : "bg-slate-700/30"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {optIndex === question.correctAnswer && (
                              <LuCircleCheck className="w-4 h-4 text-green-400" />
                            )}
                            {optIndex === userAnswer && !isCorrect && (
                              <LuCircleX className="w-4 h-4 text-red-400" />
                            )}
                            <span className="text-sm">{option}</span>
                            {optIndex === question.correctAnswer && (
                              <span className="ml-auto text-xs text-green-400 font-medium">
                                Correct Answer
                              </span>
                            )}
                            {optIndex === userAnswer &&
                              optIndex !== question.correctAnswer && (
                                <span className="ml-auto text-xs text-red-400 font-medium">
                                  Your Answer
                                </span>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Coding Results */}
        {!isDisqualified && results.codingQuestions && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <LuCode className="w-5 h-5 text-purple-400" />
              <h2 className="text-2xl font-bold">Coding Submissions</h2>
            </div>

            <div className="space-y-6">
              {results.codingQuestions.map((question, index) => {
                const submission = results.codingAnswers[index];
                const hasSubmission =
                  submission?.code && submission.code.trim().length > 0;

                return (
                  <div
                    key={index}
                    className="bg-slate-700/50 rounded-xl p-6 border border-slate-600"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold mb-1">
                          {question.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            question.difficulty === "Easy"
                              ? "bg-green-500/20 text-green-400"
                              : question.difficulty === "Medium"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {question.difficulty}
                        </span>
                      </div>
                      {hasSubmission ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <LuCircleCheck className="w-5 h-5" />
                          <span className="text-sm font-medium">Submitted</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400">
                          <LuCircleX className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            Not Submitted
                          </span>
                        </div>
                      )}
                    </div>

                    {hasSubmission && (
                      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                        <div className="text-xs text-slate-400 mb-2">
                          Your Solution:
                        </div>
                        <pre className="text-sm text-slate-200 font-mono whitespace-pre-wrap">
                          {submission.code}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors"
          >
            Back to Dashboard
          </button>
          {isPassed && (
            <button
              onClick={() => navigate(`/ai-interview/${results.session}`)}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl font-bold transition-all shadow-lg"
            >
              Proceed to AI Interview
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const ScoreCard = ({ icon, title, score, color }) => {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
  };

  return (
    <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
      <div
        className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br ${colorClasses[color]} rounded-lg mb-2`}
      >
        {icon}
      </div>
      <div className="text-2xl font-bold mb-1">{Math.round(score)}%</div>
      <div className="text-xs text-slate-400">{title}</div>
    </div>
  );
};

export default TechnicalRoundResults;
