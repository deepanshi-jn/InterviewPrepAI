import React, { useState } from "react";
import { motion } from "framer-motion";
import { LuChevronDown, LuChevronUp, LuCheck, LuCircle } from "react-icons/lu";
import QuestionCard from "./QuestionCard";

const ModuleCard = ({
  module,
  onLearnMore,
  onToggleCheck,
  isLearnMoreOpen,
  index,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate progress
  const totalQuestions = module?.questions?.length || 0;
  const completedQuestions =
    module?.questions?.filter((q) => q.isChecked).length || 0;
  const progressPercentage =
    totalQuestions > 0
      ? Math.round((completedQuestions / totalQuestions) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="mb-4"
    >
      {/* Module Header */}
      <div className="bg-white rounded-lg border border-amber-200 overflow-hidden shadow-sm">
        <div
          className="bg-gradient-to-r from-[#FF9324] to-[#FFA94D] p-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {module?.isCompleted || progressPercentage === 100 ? (
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <LuCheck className="text-white text-sm font-bold" />
                </div>
              ) : (
                <LuCircle className="text-white text-lg" />
              )}
              <div>
                <h3 className="text-base font-semibold text-white">
                  {module?.name || "Untitled Module"}
                </h3>
                {module?.description && (
                  <p className="text-white/70 text-xs mt-0.5">
                    {module.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Progress Indicator */}
              <div className="flex flex-col items-end">
                <div className="text-white text-xs font-medium">
                  {completedQuestions} / {totalQuestions}
                </div>
                <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Expand/Collapse Button */}
              <button className="text-white hover:bg-white/10 p-1 rounded transition-colors">
                {isExpanded ? (
                  <LuChevronUp className="text-base" />
                ) : (
                  <LuChevronDown className="text-base" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Module Questions */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-3"
          >
            {module?.questions && module.questions.length > 0 ? (
              module.questions.map((question, qIndex) => (
                <QuestionCard
                  key={question._id}
                  question={question?.question}
                  answer={question?.answer}
                  onLearnMore={() => onLearnMore(question.question)}
                  isChecked={question?.isChecked}
                  onToggleCheck={() => onToggleCheck(question._id)}
                  isLearnMoreOpen={isLearnMoreOpen}
                />
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                <p>No questions in this module yet.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ModuleCard;
