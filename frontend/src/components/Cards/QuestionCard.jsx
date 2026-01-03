import React, { useEffect, useRef, useState } from "react";
import { LuChevronDown, LuCheck, LuSquare, LuSparkles } from "react-icons/lu";
import AIResponsePreview from "../../pages/InterviewPrep/components/AIResponsePreview.jsx";

const QuestionCard = ({
  question,
  answer,
  onLearnMore,
  isChecked,
  onToggleCheck,
  isLearnMoreOpen,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isExpanded && !isLearnMoreOpen) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight + 10);
    } else {
      setHeight(0);
    }
  }, [isExpanded, isLearnMoreOpen]);

  // Collapse when Learn More panel opens
  useEffect(() => {
    if (isLearnMoreOpen) {
      setIsExpanded(false);
    }
  }, [isLearnMoreOpen]);

  const toggleExpand = () => {
    if (!isLearnMoreOpen) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <>
      <div
        className={`group relative rounded-lg mb-3 overflow-hidden border transition-all ${
          isChecked
            ? "bg-green-50/30 border-green-200"
            : "bg-white border-amber-100 hover:border-amber-200 hover:shadow-sm"
        }`}
      >
        <div className="py-3 px-4">
          <div className="flex items-start justify-between">
            <div
              className="flex items-start gap-3 cursor-pointer flex-1"
              onClick={toggleExpand}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-semibold ${
                    isChecked
                      ? "bg-green-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  Q
                </div>
              </div>
              <h3
                className={`text-sm font-normal leading-relaxed ${
                  isChecked ? "text-gray-600" : "text-gray-800"
                }`}
              >
                {question}
              </h3>
            </div>

            <div className="flex items-center justify-end ml-4 gap-1.5">
              <div
                className={`flex gap-1.5 ${
                  isExpanded ? "flex" : "hidden group-hover:flex"
                }`}
              >
                <button
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-all ${
                    isChecked
                      ? "text-green-700 bg-green-100 hover:bg-green-200"
                      : "text-gray-700 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCheck();
                  }}
                  title={isChecked ? "Mark as incomplete" : "Mark as complete"}
                >
                  {isChecked ? (
                    <div className="relative">
                      <LuSquare className="text-xs" />
                      <LuCheck className="text-[10px] absolute inset-0 m-auto" />
                    </div>
                  ) : (
                    <LuSquare className="text-xs" />
                  )}
                </button>
                <button
                  className="flex items-center gap-1 text-xs text-amber-700 font-medium bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded transition-all border border-amber-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                    onLearnMore();
                  }}
                >
                  <LuSparkles className="text-xs" />
                  <span className="hidden md:inline">Learn</span>
                </button>
              </div>

              <button
                className="p-1 text-gray-400 hover:text-amber-600 rounded transition-all"
                onClick={toggleExpand}
              >
                <LuChevronDown
                  size={16}
                  className={`transform transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          <div
            className="overflow-hidden transition-all duration-200 ease-in-out"
            style={{ maxHeight: `${height}px` }}
          >
            <div
              ref={contentRef}
              className="mt-3 pt-3 border-t border-amber-100"
            >
              <div className="text-sm text-gray-700 leading-relaxed bg-amber-50/30 px-3 py-2 rounded border border-amber-100">
                <AIResponsePreview content={answer} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionCard;
