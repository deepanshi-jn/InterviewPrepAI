import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuClock,
  LuCalendar,
  LuTrendingUp,
  LuFileText,
  LuFilter,
} from "react-icons/lu";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import moment from "moment";

const InterviewHistory = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // all, completed, in-progress

  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  const fetchInterviewHistory = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_PATHS.INTERVIEW.GET_ALL);
      setInterviews(response.data.interviews || []);
    } catch (error) {
      console.error("Failed to fetch interview history:", error);
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

  const filteredInterviews = interviews.filter((interview) => {
    if (filterStatus === "all") return true;
    return interview.status === filterStatus;
  });

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
              Track your progress and review past interviews
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { value: "all", label: "All" },
              { value: "completed", label: "Completed" },
              { value: "in-progress", label: "In Progress" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  filterStatus === filter.value
                    ? "bg-gradient-to-r from-[#FF9324] to-[#FFA94D] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-amber-100 hover:border-amber-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Interview Cards */}
          {filteredInterviews.length === 0 ? (
            <div className="text-center py-16">
              <LuFileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                No interviews found
              </h3>
              <p className="text-gray-500 text-sm">
                Start your first AI interview to see your history
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredInterviews.map((interview) => (
                <div
                  key={interview._id}
                  onClick={() =>
                    interview.status === "completed" &&
                    navigate(`/interview-results/${interview._id}`)
                  }
                  className={`group bg-white rounded-lg p-4 border border-amber-100 transition-all ${
                    interview.status === "completed"
                      ? "cursor-pointer hover:border-amber-200 hover:shadow-sm"
                      : "opacity-75"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-800 mb-0.5">
                        {interview.role}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {interview.experience} years experience
                      </p>
                    </div>

                    {interview.status === "completed" &&
                      interview.analysis?.overallScore !== undefined && (
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${getScoreGradient(
                            interview.analysis.overallScore
                          )} text-white font-semibold text-base shadow-sm`}
                        >
                          {interview.analysis.overallScore}
                        </div>
                      )}
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                        <LuCalendar className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Date</p>
                        <p className="font-medium text-xs text-gray-700">
                          {moment(
                            interview.completedAt || interview.createdAt
                          ).format("MMM DD, YYYY")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                        <LuClock className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Duration</p>
                        <p className="font-medium text-xs text-gray-700">
                          {interview.selectedDuration ||
                            interview.actualDuration ||
                            "-"}{" "}
                          min
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-amber-100">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        interview.status === "completed"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {interview.status === "completed"
                        ? "Completed"
                        : "In Progress"}
                    </span>

                    {interview.status === "completed" && (
                      <div className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                        <span>View Report</span>
                        <LuTrendingUp className="w-3.5 h-3.5" />
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
