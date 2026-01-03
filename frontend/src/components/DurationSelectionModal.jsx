import React, { useState } from "react";
import { LuClock, LuZap, LuTarget, LuTrophy } from "react-icons/lu";

const DurationSelectionModal = ({ onSelect, onCancel }) => {
  const [selectedDuration, setSelectedDuration] = useState(30);

  const durationOptions = [
    {
      value: 15,
      label: "Quick Practice",
      duration: "15 Minutes",
      icon: LuZap,
      description: "Perfect for a quick warm-up session",
      questions: "5-7 questions",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-300",
    },
    {
      value: 30,
      label: "Standard Session",
      duration: "30 Minutes",
      icon: LuTarget,
      description: "Comprehensive practice with detailed feedback",
      questions: "10-12 questions",
      color: "from-[#FF9324] to-[#e99a4b]",
      bgColor: "from-amber-50 to-amber-100",
      borderColor: "border-amber-300",
      recommended: true,
    },
    {
      value: 60,
      label: "Deep Dive",
      duration: "1 Hour",
      icon: LuTrophy,
      description: "In-depth interview simulation experience",
      questions: "15-20 questions",
      color: "from-purple-500 to-indigo-500",
      bgColor: "from-purple-50 to-indigo-50",
      borderColor: "border-purple-300",
    },
  ];

  return (
    <div className="w-[90vw] md:w-[45vw] p-8 flex flex-col justify-center bg-gradient-to-br from-white to-amber-50/30">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-1 bg-gradient-to-r from-[#FF9324] to-[#FCD760] rounded-full"></div>
          <LuClock className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-[#FF9324] to-[#FCD760] bg-clip-text text-transparent">
          Choose Interview Duration
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Select the duration that best fits your preparation goals
        </p>
      </div>

      {/* Duration Options */}
      <div className="space-y-4 mb-6">
        {durationOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedDuration === option.value;

          return (
            <div
              key={option.value}
              onClick={() => setSelectedDuration(option.value)}
              className={`relative group cursor-pointer rounded-xl p-5 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                isSelected
                  ? `bg-gradient-to-br ${option.bgColor} ${option.borderColor} shadow-lg`
                  : "bg-white border-gray-200 hover:border-amber-300"
              }`}
            >
              {/* Recommended Badge */}
              {option.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 bg-gradient-to-r from-[#FF9324] to-[#e99a4b] text-white text-xs font-bold rounded-full shadow-lg">
                    RECOMMENDED
                  </span>
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${option.color} shadow-md`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">
                        {option.label}
                      </h4>
                      <p className="text-sm font-semibold text-amber-600">
                        {option.duration}
                      </p>
                    </div>

                    {/* Radio Button */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-500"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {option.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {option.questions}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
        >
          Cancel
        </button>
        <button
          onClick={() => onSelect(selectedDuration)}
          className="flex-1 py-3 bg-gradient-to-r from-[#FF9324] to-[#e99a4b] hover:from-black hover:to-black text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <LuClock className="w-4 h-4" />
          Start Interview
        </button>
      </div>
    </div>
  );
};

export default DurationSelectionModal;
