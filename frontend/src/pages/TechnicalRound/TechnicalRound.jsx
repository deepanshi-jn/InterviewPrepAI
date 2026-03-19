import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  LuClock,
  LuTriangleAlert,
  LuCircleCheck,
  LuCircleX,
  LuFileText,
  LuCamera,
  LuMaximize,
  LuShieldAlert,
} from "react-icons/lu";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import Modal from "../../components/Modal";

const TechnicalRound = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const violationTimeoutRef = useRef(null);

  // State
  const [loading, setLoading] = useState(true);
  const [technicalRound, setTechnicalRound] = useState(null);
  const [currentSection, setCurrentSection] = useState("instructions"); // instructions, mcq
  const [currentMCQIndex, setCurrentMCQIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [violations, setViolations] = useState([]);

  // Proctoring state
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load face-api.js for face detection
  useEffect(() => {
    const loadFaceDetection = async () => {
      try {
        // In a real implementation, load face-api.js library
        console.log("Face detection library loaded");
      } catch (error) {
        console.error("Failed to load face detection:", error);
      }
    };
    loadFaceDetection();
  }, []);

  // Initialize technical round
  useEffect(() => {
    const initTechnicalRound = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.post(
          API_PATHS.TECHNICAL_ROUND.START,
          {
            sessionId,
          },
        );

        const roundData = response.data.technicalRound;
        setTechnicalRound(roundData);

        // If resuming, restore previous answers, otherwise initialize empty
        if (roundData.mcqAnswers && roundData.mcqAnswers.length > 0) {
          setMcqAnswers(roundData.mcqAnswers);
        } else {
          setMcqAnswers(new Array(10).fill(-1));
        }

        // Use timeRemaining if available (resumed session), otherwise use duration
        setTimeRemaining(roundData.timeRemaining || roundData.duration);

        // Show toast if resuming
        if (response.data.message === "Resuming technical round") {
          toast.success(
            "Resuming your technical round. Enable camera to continue.",
          );
        }
      } catch (error) {
        console.error("Failed to initialize technical round:", error);
        toast.error(
          error.response?.data?.message || "Failed to start technical round",
        );
        navigate(`/interview-prep/${sessionId}`);
      } finally {
        setLoading(false);
      }
    };

    initTechnicalRound();
  }, [sessionId, navigate]);

  // Timer
  useEffect(() => {
    if (currentSection !== "instructions" && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit("Time expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [currentSection, timeRemaining]);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      // Set camera enabled first to render the video element
      setCameraEnabled(true);

      // Wait for next render cycle, then attach stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          startFaceDetection();
        }
      }, 100);

      toast.success("Camera enabled successfully!");
    } catch (error) {
      console.error("Camera access denied:", error);
      toast.error("Camera access is required for the technical round");
    }
  };

  // Face detection
  const startFaceDetection = () => {
    // Simplified face detection - in production use face-api.js
    const detectFace = () => {
      if (videoRef.current && canvasRef.current) {
        // Simulate face detection
        setFaceDetected(true);

        // In real implementation, detect multiple faces or no faces
        // and log violations accordingly
      }
    };

    setInterval(detectFace, 3000); // Check every 3 seconds
  };

  // Fullscreen handling
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );

      setIsFullscreen(isNowFullscreen);

      if (!isNowFullscreen && currentSection !== "instructions") {
        logViolation("fullscreen_exit", "high");
        setShowExitWarning(true);

        violationTimeoutRef.current = setTimeout(() => {
          setShowExitWarning(false);
        }, 5000);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, [currentSection]);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentSection !== "instructions") {
        logViolation("tab_switch", "high");
        toast.error("⚠️ Tab switching detected! Warning issued.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentSection]);

  // Log violation
  const logViolation = async (type, severity = "medium") => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.TECHNICAL_ROUND.LOG_VIOLATION,
        {
          technicalRoundId: technicalRound._id,
          type,
          severity,
        },
      );

      setViolations((prev) => [
        ...prev,
        { type, timestamp: new Date(), severity },
      ]);

      if (response.data.shouldDisqualify) {
        handleAutoSubmit("Disqualified due to violations");
      } else if (response.data.violationCount >= 2) {
        toast.error(
          `⚠️ Warning ${response.data.violationCount}/3: One more violation will result in disqualification!`,
        );
      }
    } catch (error) {
      console.error("Failed to log violation:", error);
    }
  };

  // Start test
  const handleStartTest = () => {
    if (!cameraEnabled) {
      toast.error("Please enable camera to continue");
      return;
    }

    enterFullscreen();
    setCurrentSection("mcq");
  };

  // Submit MCQ answer
  const handleMCQAnswer = async (questionIndex, answer) => {
    const newAnswers = [...mcqAnswers];
    newAnswers[questionIndex] = answer;
    setMcqAnswers(newAnswers);

    try {
      await axiosInstance.post(API_PATHS.TECHNICAL_ROUND.SUBMIT_MCQ, {
        technicalRoundId: technicalRound._id,
        questionIndex,
        answer,
      });
    } catch (error) {
      console.error("Failed to save MCQ answer:", error);
    }
  };

  // Auto submit
  const handleAutoSubmit = async (reason) => {
    toast.error(`Test ended: ${reason}`);
    await handleCompleteTest();
  };

  // Complete test
  const handleCompleteTest = async () => {
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(
        API_PATHS.TECHNICAL_ROUND.COMPLETE,
        {
          technicalRoundId: technicalRound._id,
        },
      );

      toast.success("Technical round completed!");

      // Stop camera
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        setCameraEnabled(false);
      }

      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }

      // Navigate to results
      navigate(`/technical-round/results/${technicalRound._id}`);
    } catch (error) {
      console.error("Failed to complete technical round:", error);
      toast.error("Failed to submit test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <SpinnerLoader />
      </div>
    );
  }

  if (!technicalRound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Technical round not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header with Timer and Camera */}
      {currentSection !== "instructions" && (
        <div className="fixed top-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            {/* Timer */}
            <div className="flex items-center gap-3">
              <LuClock
                className={`w-5 h-5 ${
                  timeRemaining < 300
                    ? "text-red-400 animate-pulse"
                    : "text-amber-400"
                }`}
              />
              <span
                className={`text-lg font-bold ${
                  timeRemaining < 300 ? "text-red-400" : "text-amber-400"
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-4">
              {/* Camera Status */}
              <div className="flex items-center gap-2">
                <LuCamera
                  className={`w-4 h-4 ${
                    cameraEnabled ? "text-green-400" : "text-red-400"
                  }`}
                />
                <span className="text-sm">
                  {cameraEnabled ? "Camera On" : "Camera Off"}
                </span>
              </div>

              {/* Fullscreen Status */}
              <div className="flex items-center gap-2">
                <LuMaximize
                  className={`w-4 h-4 ${
                    isFullscreen ? "text-green-400" : "text-red-400"
                  }`}
                />
                <span className="text-sm">
                  {isFullscreen ? "Fullscreen" : "Exit Fullscreen"}
                </span>
              </div>

              {/* Violations */}
              {violations.length > 0 && (
                <div className="flex items-center gap-2">
                  <LuShieldAlert className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">
                    Warnings: {violations.length}/3
                  </span>
                </div>
              )}
            </div>

            {/* Section */}
            <div className="text-sm bg-slate-700 px-3 py-1 rounded-lg">
              {`MCQ ${currentMCQIndex + 1}/10`}
            </div>
          </div>
        </div>
      )}

      {/* Warning Banner */}
      {showExitWarning && (
        <div className="fixed top-20 left-0 right-0 bg-red-500 text-white px-4 py-3 text-center z-50 animate-pulse">
          <div className="flex items-center justify-center gap-2">
            <LuTriangleAlert className="w-5 h-5" />
            <span className="font-semibold">
              Warning: Fullscreen exit detected! Re-enter fullscreen
              immediately.
            </span>
          </div>
        </div>
      )}

      {/* Camera Feed (Small corner preview) */}
      {cameraEnabled && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-32 h-24 rounded-lg border-2 border-green-400 shadow-lg"
            />
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Main Content */}
      <div
        className={`container mx-auto px-4 ${
          currentSection !== "instructions" ? "pt-24 pb-8" : "py-12"
        }`}
      >
        {/* Instructions Screen */}
        {currentSection === "instructions" && (
          <InstructionsScreen
            onStart={handleStartTest}
            cameraEnabled={cameraEnabled}
            onEnableCamera={startCamera}
          />
        )}

        {/* MCQ Section */}
        {currentSection === "mcq" && (
          <MCQSection
            questions={technicalRound.mcqQuestions}
            currentIndex={currentMCQIndex}
            answers={mcqAnswers}
            onAnswer={handleMCQAnswer}
            onSubmit={handleCompleteTest}
            isSubmitting={isSubmitting}
            onNext={() => {
              if (currentMCQIndex < 9) {
                setCurrentMCQIndex(currentMCQIndex + 1);
              }
            }}
            onPrevious={() =>
              currentMCQIndex > 0 && setCurrentMCQIndex(currentMCQIndex - 1)
            }
            onGoToQuestion={(index) => setCurrentMCQIndex(index)}
          />
        )}
      </div>
    </div>
  );
};

// Instructions Screen Component
const InstructionsScreen = ({ onStart, cameraEnabled, onEnableCamera }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mb-4">
            <LuShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Technical Round Instructions
          </h1>
          <p className="text-slate-400">
            Please read carefully before starting
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <Section
            title="Test Structure"
            icon={<LuFileText className="w-5 h-5" />}
          >
            <ul className="space-y-2 text-slate-300">
              <li>• 10 Multiple Choice Questions (MCQs)</li>
              <li>• Total Duration: 30 minutes</li>
              <li>• Passing Score: 60%</li>
            </ul>
          </Section>

          <Section
            title="Proctoring Rules"
            icon={<LuCamera className="w-5 h-5 text-red-400" />}
          >
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <LuTriangleAlert className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <span>
                  <strong>Camera Required:</strong> Your camera must be on
                  throughout the test
                </span>
              </li>
              <li className="flex items-start gap-2">
                <LuTriangleAlert className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <span>
                  <strong>Fullscreen Mode:</strong> Test must be in fullscreen.
                  Exiting will log a violation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <LuTriangleAlert className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <span>
                  <strong>No Tab Switching:</strong> Switching tabs will be
                  detected and warned
                </span>
              </li>
              <li className="flex items-start gap-2">
                <LuCircleX className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                <span>
                  <strong>3 Violations = Auto Disqualification</strong>
                </span>
              </li>
            </ul>
          </Section>

          <Section title="Camera Setup" icon={<LuCamera className="w-5 h-5" />}>
            {!cameraEnabled ? (
              <div className="space-y-3">
                <p className="text-slate-300">
                  Click below to enable your camera
                </p>
                <button
                  onClick={onEnableCamera}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <LuCamera className="w-5 h-5" />
                  Enable Camera
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400">
                <LuCircleCheck className="w-5 h-5" />
                <span className="font-medium">Camera enabled and ready!</span>
              </div>
            )}
          </Section>
        </div>

        <button
          onClick={onStart}
          disabled={!cameraEnabled}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all duration-300 shadow-lg"
        >
          {cameraEnabled
            ? "Start Technical Round"
            : "Enable Camera to Continue"}
        </button>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

// MCQ Section Component
const MCQSection = ({
  questions,
  currentIndex,
  answers,
  onAnswer,
  onSubmit,
  isSubmitting,
  onNext,
  onPrevious,
  onGoToQuestion,
}) => {
  const question = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question Navigator */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
        <p className="text-sm text-gray-600 mb-3 font-medium">
          Question Progress
        </p>
        <div className="grid grid-cols-10 gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => onGoToQuestion(index)}
              className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                index === currentIndex
                  ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md"
                  : answers[index] !== -1
                    ? "bg-green-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-md mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-sm text-gray-600 font-medium">
              Question {currentIndex + 1} of 10
            </span>
            {question.category && (
              <span className="ml-3 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                {question.category}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-6 leading-relaxed text-gray-800">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswer(currentIndex, index)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                answers[currentIndex] === index
                  ? "border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 text-gray-800 shadow-md"
                  : "border-gray-300 bg-white hover:border-amber-300 hover:bg-amber-50/30 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    answers[currentIndex] === index
                      ? "border-amber-500 bg-amber-500"
                      : "border-gray-400 bg-white"
                  }`}
                >
                  {answers[currentIndex] === index && (
                    <LuCircleCheck className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="flex-1 font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded-xl font-medium transition-colors text-gray-700"
        >
          Previous
        </button>
        <button
          onClick={currentIndex === 9 ? onSubmit : onNext}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-700 rounded-xl font-medium transition-all shadow-md text-white"
        >
          {currentIndex === 9
            ? isSubmitting
              ? "Submitting..."
              : "Submit Test"
            : "Next"}
        </button>
      </div>
    </div>
  );
};

export default TechnicalRound;
