import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  LuMic,
  LuMicOff,
  LuVolume2,
  LuVolumeX,
  LuMessageSquare,
  LuUser,
  LuBot,
  LuArrowLeft,
  LuCircleCheck,
  LuLoader,
  LuClock,
  LuTriangleAlert,
} from "react-icons/lu";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import Modal from "../../components/Modal";

const AIInterview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const duration = parseInt(searchParams.get("duration")) || 30;

  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState([]);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const conversationEndRef = useRef(null);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive && timeRemaining > 0 && !interviewComplete) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - auto-complete interview
            handleCompleteInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, interviewComplete]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast.error("Could not capture voice. Please try again.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Start interview
  useEffect(() => {
    startNewInterview();
  }, [sessionId]);

  // Auto scroll to bottom
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const startNewInterview = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(API_PATHS.INTERVIEW.START, {
        sessionId,
        selectedDuration: duration,
      });

      setInterview(response.data.interview);
      const aiMessage = response.data.aiMessage;

      setConversation([
        {
          role: "ai",
          message: aiMessage,
          timestamp: new Date(),
        },
      ]);

      // Start timer
      setTimerActive(true);

      // Speak AI's first message
      if (!isMuted) {
        speakText(aiMessage);
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      toast.error("Failed to start interview");
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text) => {
    if (synthRef.current && !isMuted) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setUserInput("");
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return;

    const message = userInput.trim();
    setUserInput("");

    // Add user message to conversation
    const newConversation = [
      ...conversation,
      { role: "user", message, timestamp: new Date() },
    ];
    setConversation(newConversation);

    try {
      setIsProcessing(true);

      const response = await axiosInstance.post(API_PATHS.INTERVIEW.CONTINUE, {
        interviewId: interview._id,
        userMessage: message,
      });

      const aiMessage = response.data.aiMessage;
      const isComplete = response.data.isComplete;

      // Add AI response to conversation
      setConversation((prev) => [
        ...prev,
        { role: "ai", message: aiMessage, timestamp: new Date() },
      ]);

      // Speak AI response
      if (!isMuted) {
        speakText(aiMessage);
      }

      // Check if interview is complete
      if (isComplete) {
        setInterviewComplete(true);
        setTimeout(() => {
          completeInterview();
        }, 3000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsProcessing(false);
    }
  };

  const completeInterview = async () => {
    try {
      // Stop timer
      setTimerActive(false);

      const response = await axiosInstance.post(
        API_PATHS.INTERVIEW.COMPLETE(interview._id)
      );
      toast.success("Interview completed! Analyzing your performance...");
      setTimeout(() => {
        navigate(`/interview-results/${interview._id}`);
      }, 1500);
    } catch (error) {
      console.error("Error completing interview:", error);
      toast.error("Failed to complete interview");
    }
  };

  const handleCompleteInterview = () => {
    setInterviewComplete(true);
    completeInterview();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleBackClick = () => {
    // Show quit confirmation modal only if interview is not complete
    if (!interviewComplete) {
      setShowQuitModal(true);
    } else {
      navigate(-1);
    }
  };

  const handleQuitInterview = () => {
    // Stop timer and audio
    setTimerActive(false);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    handleBackClick;

    toast.success("Interview cancelled. No report will be generated.");
    navigate(`/interview-prep/${sessionId}`);
  };

  const handleCancelQuit = () => {
    setShowQuitModal(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <SpinnerLoader />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#FFFCEF] py-6">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <LuArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF9324] to-[#FCD760] bg-clip-text text-transparent">
                    AI Interview Session
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {interview?.role} • {interview?.experience} years experience
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Timer */}
                  <div
                    className={`px-4 py-2 rounded-full font-mono font-bold ${
                      timeRemaining < 60
                        ? "bg-red-100 text-red-700"
                        : timeRemaining < 300
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {formatTime(timeRemaining)}
                  </div>

                  {/* Mute/Unmute Button */}
                  <button
                    onClick={toggleMute}
                    className={`p-3 rounded-full transition-all ${
                      isMuted
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {isMuted ? (
                      <LuVolumeX className="w-5 h-5" />
                    ) : (
                      <LuVolume2 className="w-5 h-5" />
                    )}
                  </button>

                  {/* Status Indicator */}
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      interviewComplete
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {interviewComplete ? (
                      <>
                        <LuCircleCheck className="w-4 h-4" />
                        Completed
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
                        In Progress
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100 shadow-lg shadow-amber-500/10 mb-6 h-[500px] overflow-y-auto p-6">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 mb-4 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "ai" && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9324] to-[#e99a4b] flex items-center justify-center flex-shrink-0">
                    <LuBot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[70%] px-5 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-[#FF9324] to-[#e99a4b] text-white rounded-br-md"
                      : "bg-gray-100 text-gray-800 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {msg.role === "user" && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <LuUser className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-3 mb-4 justify-start">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9324] to-[#e99a4b] flex items-center justify-center">
                  <LuBot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 px-5 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={conversationEndRef} />
          </div>

          {/* Input Area */}
          {!interviewComplete && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100 shadow-lg shadow-amber-500/10 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your response or use voice..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  disabled={isProcessing || interviewComplete}
                />

                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                    isListening
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse"
                      : "bg-gradient-to-r from-[#FF9324] to-[#e99a4b] hover:from-black hover:to-black text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:scale-105"
                  }`}
                  disabled={isProcessing || isSpeaking}
                >
                  {isListening ? (
                    <>
                      <LuMicOff className="w-5 h-5" />
                      Stop
                    </>
                  ) : (
                    <>
                      <LuMic className="w-5 h-5" />
                      Speak
                    </>
                  )}
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isProcessing}
                  className="px-6 py-3 bg-gradient-to-r from-[#FF9324] to-[#e99a4b] hover:from-black hover:to-black text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <LuLoader className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <LuMessageSquare className="w-5 h-5" />
                      Send
                    </>
                  )}
                </button>
              </div>

              {isSpeaking && (
                <p className="text-sm text-amber-600 mt-3 flex items-center gap-2">
                  <LuVolume2 className="w-4 h-4 animate-pulse" />
                  AI is speaking...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quit Confirmation Modal */}
      <Modal isOpen={showQuitModal} onClose={handleCancelQuit} hideHeader>
        <div className="p-6 text-center">
          {/* Warning Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <LuTriangleAlert className="w-8 h-8 text-red-600" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Quit Interview?
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            Are you sure you want to quit this interview? Your progress will not
            be saved and no performance report will be generated.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCancelQuit}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all hover:scale-105"
            >
              Continue Interview
            </button>
            <button
              onClick={handleQuitInterview}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all hover:scale-105"
            >
              Yes, Quit
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AIInterview;
