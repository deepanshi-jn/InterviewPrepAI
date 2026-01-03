import React from "react";
import { LuTrash2, LuBriefcase, LuCalendar, LuBookOpen } from "react-icons/lu";
import { getInitials } from "../../utils/helper";

const SummaryCard = ({
  colors,
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  lastUpdated,
  onSelect,
  onDelete,
}) => {
  return (
    <div
      className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 overflow-hidden cursor-pointer border border-gray-200/50 hover:border-amber-300/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-100/50 hover:-translate-y-1"
      onClick={onSelect}
    >
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#FF9324] via-[#FCD760] to-[#f5b779] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Delete Button */}
      <button
        className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <LuTrash2 className="w-4 h-4" />
      </button>

      {/* Header with icon */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-md"
          style={{ background: colors.bgcolor }}
        >
          <span className="text-xl font-bold text-gray-800">
            {getInitials(role)}
          </span>
        </div>

        <div className="flex-grow min-w-0">
          <h2 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-amber-600 transition-colors">
            {role}
          </h2>
          <p className="text-sm text-gray-600 font-medium line-clamp-1">
            {topicsToFocus}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
        {description}
      </p>

      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 rounded-lg">
          <LuBriefcase className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-semibold text-gray-700">
            {experience} {experience == 1 ? "yr" : "yrs"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 rounded-lg">
          <LuBookOpen className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-semibold text-gray-700">
            {questions} Q&A
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 rounded-lg">
          <LuCalendar className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-semibold text-gray-700">
            {lastUpdated}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
