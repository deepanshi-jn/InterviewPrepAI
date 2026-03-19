import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuClock,
  LuCalendar,
  LuTrendingUp,
  LuFileText,
  LuFilter,
  LuCode,
  LuMessageSquare,
  LuCheckCircle,
  LuXCircle,
  LuShieldAlert,
  LuBrainCircuit,
  LuTarget,
} from "react-icons/lu";
import DashboardLayout  from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import moment from "moment";

const InterviewHistory = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [technicalRounds, setTechnicalRounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // all, completed, in-progress
  const [filterType, setFilterType] = useState("all"); // all, ai-interview, technical-round

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const [interviewsResponse, technicalRoundsResponse] = await Promise.all([
        axiosInstance.get(API_PATHS.INTERVIEW.GET_ALL),
        axiosInstance.get(API_PATHS.TECHNICAL_ROUND.GET_ALL),
      ]);
      setInterviews(interviewsResponse.data.interviews || []);
      setTechnicalRounds(technicalRoundsResponse.data.technicalRounds || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-amber-600 bg-amber-100";
    if (score >= 40) return "text-blue-600 bg-blue-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-amber-500 to-amber-600";
    if (score >= 40) return "from-blue-500 to-cyan-500";
    return "from-red-500 to-rose-500";
  };

  const getTechnicalScoreColor = (score) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-blue-700 bg-blue-50 border-blue-200";
    if (score >= 40) return "text-orange-700 bg-orange-50 border-orange-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  const getTechnicalScoreGradient = (score) => {
    if (score >= 80) return "from-emerald-500 to-teal-500";
    if (score >= 60) return "from-blue-500 to-indigo-500";
    if (score >= 40) return "from-orange-500 to-amber-500";
    return "from-red-500 to-pink-500";
  };

  // Filter interviews - only show completed ones
  const filteredInterviews = interviews.filter((interview) => {
    // Only show completed interviews
    if (interview.status !== "completed") return false;
    
    if (filterStatus === "all") return true;
    return interview.status === filterStatus;
  });

  // Filter technical rounds - only show completed ones
  const filteredTechnicalRounds = technicalRounds.filter((round) => {
    // Only show completed or disqualified rounds
    if (round.status !== "completed" && round.status !== "disqualified") return false;
    
    if (filterStatus === "all") return true;
    return round.status === filterStatus;
  });

  // Combine and sort all items by date
  const allItems = [
    ...filteredInterviews.map((item) => ({ ...item, type: "ai-interview" })),
    ...filteredTechnicalRounds.map((item) => ({ ...item, type: "technical-round" })),
  ]
    .filter((item) => {
      if (filterType === "all") return true;
      return item.type === filterType;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#FFFCF5] flex items-center justify-center">
          <SpinnerLoader />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#FFFCF5] py-6">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">
              Interview History
            </h1>
            <p className="text-sm text-gray-600">
              Track your progress across AI interviews and technical assessments
            </p>
          </div>

          {/* Type Filter Pills */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {[
              { value: "all", label: "All Types", icon: LuFileText },
              { value: "ai-interview", label: "AI Interviews", icon: LuMessageSquare },
              { value: "technical-round", label: "Technical Rounds", icon: LuCode },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  filterType === filter.value
                    ? "bg-gradient-to-r from-[#FF9324] to-[#FFA94D] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-amber-100 hover:border-amber-200"
                }`}
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </button>
            ))}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { value: "all", label: "All Status" },
              { value: "completed", label: "Completed" },
              { value: "in-progress", label: "In Progress" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  filterStatus === filter.value
                    ? "bg-gray-800 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Interview Cards */}
          {allItems.length === 0 ? (
            <div className="text-center py-16">
              <LuFileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                No history found
              </h3>
              <p className="text-gray-500 text-sm">
                Start your first interview or technical round to see your history
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {allItems.map((item) => {
                if (item.type === "ai-interview") {
                  return (
                    <div
                      key={`interview-${item._id}`}
                      onClick={() =>
                        item.status === "completed" &&
                        navigate(`/interview-results/${item._id}`)
                      }
                      className={`group bg-white rounded-xl p-5 border border-amber-100 transition-all hover:shadow-md ${
                        item.status === "completed"
                          ? "cursor-pointer hover:border-amber-300"
                          : "opacity-80"
                      }`}
                    >
                      {/* Type Badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full border border-amber-200">
                          <LuMessageSquare className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-xs font-semibold text-amber-700">
                            AI Interview
                          </span>
                        </div>
                      </div>

                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">
                            {item.role}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.experience} years experience
                          </p>
                        </div>

                        {item.status === "completed" &&
                          item.analysis?.overallScore !== undefined && (
                            <div
                              className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${getScoreGradient(
                                item.analysis.overallScore
                              )} text-white font-bold text-lg shadow-lg`}
                            >
                              {item.analysis.overallScore}
                            </div>
                          )}
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                            <LuCalendar className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                              Date
                            </p>
                            <p className="font-semibold text-xs text-gray-800">
                              {moment(
                                item.completedAt || item.createdAt
                              ).format("MMM DD, YYYY")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                            <LuClock className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                              Duration
                            </p>
                            <p className="font-semibold text-xs text-gray-800">
                              {item.selectedDuration ||
                                item.actualDuration ||
                                "-"}{" "}
                              min
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status & Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-amber-100">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            item.status === "completed"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {item.status === "completed"
                            ? "Completed"
                            : "In Progress"}
                        </span>

                        {item.status === "completed" && (
                          <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold group-hover:text-amber-700 transition-colors">
                            <span>View Report</span>
                            <LuTrendingUp className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  // Technical Round Card
                  const isPassed = item.passed && !item.cheatingDetected;
                  const isDisqualified =
                    item.status === "disqualified" || item.cheatingDetected;

                  return (
                    <div
                      key={`technical-${item._id}`}
                      onClick={() =>
                        item.status === "completed" &&
                        navigate(`/technical-round-results/${item._id}`)
                      }
                      className={`group bg-white rounded-xl p-5 border transition-all hover:shadow-md ${
                        isDisqualified
                          ? "border-red-200 bg-red-50/30"
                          : isPassed
                          ? "border-emerald-200 bg-emerald-50/30"
                          : item.status === "completed"
                          ? "border-orange-200 bg-orange-50/30"
                          : "border-gray-200"
                      } ${
                        item.status === "completed"
                          ? "cursor-pointer"
                          : "opacity-80"
                      }`}
                    >
                      {/* Type Badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-200">
                          <LuCode className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-xs font-semibold text-indigo-700">
                            Technical Round
                          </span>
                        </div>
                        {isDisqualified && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full border border-red-200">
                            <LuShieldAlert className="w-3 h-3 text-red-600" />
                            <span className="text-[10px] font-bold text-red-700">
                              Disqualified
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">
                            {item.session?.role || "Technical Assessment"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.session?.experience} years experience
                          </p>
                        </div>

                        {item.status === "completed" &&
                          item.totalScore !== undefined && (
                            <div
                              className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${getTechnicalScoreGradient(
                                item.totalScore
                              )} text-white font-bold text-lg shadow-lg`}
                            >
                              {Math.round(item.totalScore)}
                            </div>
                          )}
                      </div>

                      {/* Score Breakdown */}
                      {item.status === "completed" && (
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-blue-600 uppercase font-bold tracking-wide">
                                MCQ
                              </span>
                              <LuTarget className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <p className="text-xl font-bold text-blue-700">
                              {Math.round(item.mcqScore)}%
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-purple-600 uppercase font-bold tracking-wide">
                                Coding
                              </span>
                              <LuBrainCircuit className="w-3.5 h-3.5 text-purple-500" />
                            </div>
                            <p className="text-xl font-bold text-purple-700">
                              {Math.round(item.codingScore)}%
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <LuCalendar className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                              Date
                            </p>
                            <p className="font-semibold text-xs text-gray-800">
                              {moment(
                                item.completedAt || item.createdAt
                              ).format("MMM DD, YYYY")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <LuClock className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                              Duration
                            </p>
                            <p className="font-semibold text-xs text-gray-800">
                              {Math.round((item.duration || 1800) / 60)} min
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status & Violations */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                              item.status === "completed"
                                ? isPassed
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : isDisqualified
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-orange-50 text-orange-700 border border-orange-200"
                                : "bg-gray-50 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {item.status === "completed"
                              ? isPassed
                                ? "Passed"
                                : isDisqualified
                                ? "Disqualified"
                                : "Not Passed"
                              : "In Progress"}
                          </span>
                          
                          {item.violations && item.violations.length > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-full border border-amber-200">
                              <LuShieldAlert className="w-3 h-3 text-amber-600" />
                              <span className="text-[10px] font-bold text-amber-700">
                                {item.violations.length} warning{item.violations.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                        </div>

                        {item.status === "completed" && (
                          <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold group-hover:text-indigo-700 transition-colors">
                            <span>View Details</span>
                            <LuTrendingUp className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewHistory;
