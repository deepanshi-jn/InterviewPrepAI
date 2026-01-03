import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuClock,
  LuCalendar,
  LuTrophy,
  LuChevronRight,
  LuFilter,
  LuFileText,
} from "react-icons/lu";
import { DashboardLayout } from "../components/layouts/DashboardLayout";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import SpinnerLoader from "../components/Loader/SpinnerLoader";
import EmptyState from "../components/EmptyState";
import moment from "moment";

const InterviewHistory = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    filterInterviews();
  }, [filter, interviews]);

  const fetchInterviews = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_PATHS.INTERVIEW.GET_ALL);
      setInterviews(response.data || []);
    } catch (error) {
      console.error("Failed to fetch interviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterInterviews = () => {
    if (filter === "all") {
      setFilteredInterviews(interviews);
    } else if (filter === "completed") {
      setFilteredInterviews(
        interviews.filter((interview) => interview.status === "completed")
      );
    } else if (filter === "in-progress") {
      setFilteredInterviews(
        interviews.filter((interview) => interview.status === "in-progress")
      );
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  const filterOptions = [
    { value: "all", label: "All Interviews" },
    { value: "completed", label: "Completed" },
    { value: "in-progress", label: "In Progress" },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <SpinnerLoader />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#FFFCF5]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">
              Interview Reports
            </h1>
            <p className="text-sm text-gray-600">
              Review your past interviews and track your progress
            </p>
          </div>
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  filter === option.value
                    ? "bg-gradient-to-r from-[#FF9324] to-[#FFA94D] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-amber-100 hover:border-amber-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Interviews List */}
          {filteredInterviews.length === 0 ? (
            <div className="text-center py-16">
              <LuFileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                No Interviews Found
              </h3>
              <p className="text-gray-500 text-sm">
                {filter === "all"
                  ? "Start your first AI interview to see your reports"
                  : `No ${filter.replace("-", " ")} interviews found`}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredInterviews.map((interview) => (
                <div
                  key={interview._id}
                  onClick={() =>
                    interview.status === "completed" &&
                    navigate(`/interview-results/${interview._id}`)
                  }
                  className={`bg-white rounded-lg border border-amber-100 overflow-hidden transition-all ${
                    interview.status === "completed"
                      ? "hover:border-amber-200 hover:shadow-sm cursor-pointer"
                      : "opacity-75"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-gray-800">
                            {interview.session?.role || interview.role}
                          </h3>
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
                        </div>
                        <p className="text-xs text-gray-600">
                          {interview.session?.experience ||
                            interview.experience}{" "}
                          Level
                        </p>
                      </div>

                      {/* Score Badge */}
                      {interview.status === "completed" &&
                        interview.analysis?.overallScore && (
                          <div
                            className={`flex items-center justify-center w-12 h-12 rounded-full ${getScoreColor(
                              interview.analysis.overallScore
                            )} font-semibold text-base`}
                          >
                            {interview.analysis.overallScore}
                          </div>
                        )}
                    </div>

                    {/* Interview Details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <LuCalendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          {moment(interview.createdAt).format("MMM DD, YYYY")}
                        </span>
                      </div>
                      {interview.actualDuration && (
                        <div className="flex items-center gap-1.5">
                          <LuClock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{interview.actualDuration} min</span>
                        </div>
                      )}
                      {interview.selectedDuration && (
                        <div className="flex items-center gap-1.5">
                          <LuTrophy className="w-3.5 h-3.5 text-amber-600" />
                          <span>{interview.selectedDuration} min session</span>
                        </div>
                      )}
                    </div>

                    {/* View Report Button */}
                    {interview.status === "completed" && (
                      <div className="mt-3 flex items-center justify-end">
                        <button className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium text-xs group">
                          <span>View Report</span>
                          <LuChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
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
