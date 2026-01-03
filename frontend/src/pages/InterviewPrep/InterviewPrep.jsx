import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuCircleAlert,
  LuListCollapse,
  LuArrowLeft,
  LuMic,
  LuFileCode,
} from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import { toast } from "react-hot-toast";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import Modal from "../../components/Modal";

import QuestionCard from "../../components/Cards/QuestionCard.jsx";
import ModuleCard from "../../components/Cards/ModuleCard.jsx";
import RoleInfoHeader from "./components/RoleInfoHeader.jsx";
import DurationSelectionModal from "../../components/DurationSelectionModal";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import AIResponsePreview from "./components/AIResponsePreview.jsx";
import Drawer from "../../components/Drawer.jsx";
import SkeletonLoader from "../../components/Loader/SkeletonLoader.jsx";

const InterviewPrep = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [openDurationModal, setOpenDurationModal] = useState(false);

  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);

  //fetch session data using sessionId
  const fetchSessionDetailsbyId = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );
      if (response.data && response.data.session) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error("Failed to fetch session details", error);
      setErrorMsg("Failed to fetch session details. Please try again.");
    }
  };

  //generate explanation for a question
  const generateConceptExplanation = async (question) => {
    try {
      setErrorMsg("");
      setExplanation(null);
      setIsLoading(true);
      setOpenLearnMoreDrawer(true);
      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        {
          question,
        }
      );
      if (response.data) {
        setExplanation(response.data);
      }
    } catch (error) {
      console.error("Failed to generate explanation", error);
      setErrorMsg("Failed to generate explanation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  //toggle question checked status
  const toggleQuestionCheckStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.CHECK(questionId)
      );
      if (response.data && response.data.question) {
        fetchSessionDetailsbyId();
      }
    } catch (error) {
      console.error("Failed to toggle check status", error);
      toast.error("Failed to update question status. Please try again.");
    }
  };

  //add more questions
  const uploadMoreQuestions = async () => {
    try {
      setIsUpdateLoader(true);
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData?.role,
          experience: sessionData?.experience,
          topicsToFocus: sessionData?.topicsToFocus,
          numberOfQuestions: 10,
        }
      );
      const generatedQuestions = aiResponse.data;

      // Check if session uses modules
      if (sessionData?.modules && sessionData.modules.length > 0) {
        // Distribute questions across existing modules
        const questionsPerModule = Math.ceil(
          generatedQuestions.length / sessionData.modules.length
        );

        // Add questions to each module
        for (let i = 0; i < sessionData.modules.length; i++) {
          const moduleQuestions = generatedQuestions.slice(
            i * questionsPerModule,
            (i + 1) * questionsPerModule
          );

          if (moduleQuestions.length > 0) {
            await axiosInstance.post(
              API_PATHS.MODULE.ADD_QUESTIONS(sessionData.modules[i]._id),
              {
                questions: moduleQuestions,
              }
            );
          }
        }
        toast.success("Added more questions to modules successfully");
      } else {
        // Add questions to session directly (non-module mode)
        const response = await axiosInstance.post(
          API_PATHS.QUESTION.ADD_TO_SESSION,
          {
            sessionId,
            questions: generatedQuestions,
          }
        );
        if (response.data) {
          toast.success("Added more questions successfully");
        }
      }

      fetchSessionDetailsbyId();
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add more questions. Please try again.");
      }
    } finally {
      setIsUpdateLoader(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsbyId();
    }
    return () => {};
  }, []);

  return (
    <DashboardLayout>
      <div className="bg-[#FFFCF5] min-h-screen">
        {/* Minimalist Header Bar */}
        <div className="border-b border-amber-100">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-amber-600 transition-colors"
            >
              <LuArrowLeft className="text-base" />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Start Technical Round Button */}
              <button
                onClick={() => navigate(`/technical-round/${sessionId}`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#FF9324] to-[#FFA94D] hover:from-[#e68420] hover:to-[#e69540] text-white text-sm font-medium rounded-lg transition-all shadow-sm"
              >
                <LuFileCode className="text-base" />
                <span>Technical Round</span>
              </button>

              {/* Start AI Interview Button */}
              <button
                onClick={() => setOpenDurationModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#FF9324] to-[#FFA94D] hover:from-[#e68420] hover:to-[#e69540] text-white text-sm font-medium rounded-lg transition-all shadow-sm"
              >
                <LuMic className="text-base" />
                <span>AI Interview</span>
              </button>
            </div>
          </div>
        </div>

        <RoleInfoHeader
          role={sessionData?.role || ""}
          topicsToFocus={sessionData?.topicsToFocus || ""}
          experience={sessionData?.experience || "-"}
          questions={sessionData?.questions?.length || "-"}
          description={sessionData?.description || ""}
          lastUpdated={
            sessionData?.updatedAt
              ? moment(sessionData.updatedAt).format("Do MMM YYYY")
              : ""
          }
        />

        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {sessionData?.modules && sessionData.modules.length > 0
                ? "Modules"
                : "Questions"}
            </h2>
          </div>

          <div
            className={`grid gap-6 transition-all duration-300 ${
              openLearnMoreDrawer ? "md:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {/* Questions/Modules Column */}
            <div
              className={`${
                openLearnMoreDrawer
                  ? "md:max-w-none"
                  : "max-w-5xl mx-auto w-full"
              }`}
            >
              {/* Display Modules if available */}
              {sessionData?.modules && sessionData.modules.length > 0 ? (
                <>
                  <AnimatePresence>
                    {sessionData.modules.map((module, index) => (
                      <ModuleCard
                        key={module._id || index}
                        module={module}
                        onLearnMore={generateConceptExplanation}
                        onToggleCheck={toggleQuestionCheckStatus}
                        isLearnMoreOpen={openLearnMoreDrawer}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Load More Questions button for modules */}
                  {!isLoading && sessionData?.modules?.length > 0 && (
                    <div className="flex items-center justify-center mt-6">
                      <button
                        className="group flex items-center gap-2 text-sm font-medium text-gray-700 px-4 py-2 rounded-lg border border-amber-200 hover:bg-amber-50 hover:border-amber-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || isUpdateLoader}
                        onClick={uploadMoreQuestions}
                      >
                        {isUpdateLoader ? (
                          <SpinnerLoader />
                        ) : (
                          <LuListCollapse className="text-base group-hover:rotate-180 transition-transform duration-300" />
                        )}{" "}
                        Load More
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Display Questions without modules (legacy support) */
                <AnimatePresence>
                  {sessionData?.questions?.map((data, index) => {
                    return (
                      <motion.div
                        key={data._id || index}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                          duration: 0.4,
                          type: "spring",
                          stiffness: 100,
                          delay: index * 0.1,
                          damping: 15,
                        }}
                        layout
                        layoutId={`question-${data._id || index}`}
                      >
                        <>
                          <QuestionCard
                            question={data?.question}
                            answer={data?.answer}
                            onLearnMore={() =>
                              generateConceptExplanation(data.question)
                            }
                            isChecked={data?.isChecked}
                            onToggleCheck={() =>
                              toggleQuestionCheckStatus(data._id)
                            }
                            isLearnMoreOpen={openLearnMoreDrawer}
                          />
                          {!isLoading &&
                            sessionData?.questions?.length == index + 1 && (
                              <div className="flex items-center justify-center mt-6">
                                <button
                                  className="group flex items-center gap-2 text-sm font-medium text-gray-700 px-4 py-2 rounded-lg border border-amber-200 hover:bg-amber-50 hover:border-amber-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={isLoading || isUpdateLoader}
                                  onClick={uploadMoreQuestions}
                                >
                                  {isUpdateLoader ? (
                                    <SpinnerLoader />
                                  ) : (
                                    <LuListCollapse className="text-base group-hover:rotate-180 transition-transform duration-300" />
                                  )}{" "}
                                  Load More
                                </button>
                              </div>
                            )}
                        </>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Learn More Column */}
            {openLearnMoreDrawer && (
              <div className="hidden md:block sticky top-4 h-fit">
                <div className="bg-white rounded-lg border border-amber-200 overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-[#FF9324] to-[#FFA94D] px-4 py-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      {!isLoading && explanation?.title}
                    </h3>
                    <button
                      onClick={() => setOpenLearnMoreDrawer(false)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <LuCircleAlert className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {errorMsg && (
                      <p className="flex gap-2 text-xs text-amber-700 font-medium bg-amber-50 px-3 py-2 rounded border border-amber-200">
                        <LuCircleAlert className="mt-0.5" />
                        {errorMsg}
                      </p>
                    )}
                    {isLoading && <SkeletonLoader />}
                    {!isLoading && explanation && (
                      <AIResponsePreview content={explanation?.explanation} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Drawer */}
        <Drawer
          isOpen={openLearnMoreDrawer}
          onClose={() => setOpenLearnMoreDrawer(false)}
          title={!isLoading && explanation?.title}
          className="md:hidden"
        >
          {errorMsg && (
            <p className="flex gap-2 text-sm text-amber-600 font-medium">
              <LuCircleAlert className="mt-1" />
              {errorMsg}
            </p>
          )}
          {isLoading && <SkeletonLoader />}
          {!isLoading && explanation && (
            <AIResponsePreview content={explanation?.explanation} />
          )}
        </Drawer>
      </div>

      {/* Duration Selection Modal */}
      <Modal
        isOpen={openDurationModal}
        onClose={() => setOpenDurationModal(false)}
        hideHeader
      >
        <DurationSelectionModal
          onSelect={(duration) => {
            setOpenDurationModal(false);
            navigate(`/ai-interview/${sessionId}?duration=${duration}`);
          }}
          onCancel={() => setOpenDurationModal(false)}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default InterviewPrep;
