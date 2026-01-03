import React from "react";
import { LuBriefcase, LuClock, LuBookOpen } from "react-icons/lu";

const RoleInfoHeader = ({
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  lastUpdated,
}) => {
  return (
    <div className="border-b border-amber-100 bg-gradient-to-b from-amber-50/30 to-white">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Role Title */}
        <div className="mb-3">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">{role}</h1>
          <p className="text-sm text-gray-600">{topicsToFocus}</p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-700">
            <LuBriefcase className="w-4 h-4 text-amber-600" />
            <span>
              {experience} {experience == 1 ? "year" : "years"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-700">
            <LuBookOpen className="w-4 h-4 text-amber-600" />
            <span>{questions} questions</span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-700">
            <LuClock className="w-4 h-4 text-amber-600" />
            <span>{lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleInfoHeader;
