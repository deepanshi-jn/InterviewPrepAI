import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input.jsx";
import SpinnerLoader from "../../components/Loader/SpinnerLoader.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { LuSparkles, LuX, LuPlus } from "react-icons/lu";

const CreateSessionForm = () => {
  const [formData, setFormData] = useState({
    role: "",
    experience: "",
    topicsToFocus: "",
    description: "",
    useModules: false, // New field to toggle module-based organization
  });
  const [isLoasding, setIsLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [customTopic, setCustomTopic] = useState("");

  const navigate = useNavigate();

  // Auto-suggest topics when role and experience are filled
  useEffect(() => {
    const fetchTopicSuggestions = async () => {
      if (formData.role && formData.experience) {
        setIsLoadingSuggestions(true);
        try {
          const response = await axiosInstance.post(
            API_PATHS.AI.SUGGEST_TOPICS,
            {
              role: formData.role,
              experience: formData.experience,
            }
          );
          // Expect response like: { topics: ["React", "JavaScript", "CSS"] }
          setSuggestedTopics(response.data.topics || []);
        } catch (error) {
          console.error("Failed to fetch topic suggestions:", error);
          setSuggestedTopics([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setSuggestedTopics([]);
        setSelectedTopics([]);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      fetchTopicSuggestions();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [formData.role, formData.experience]);

  // Update topicsToFocus when selected topics change
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      topicsToFocus: selectedTopics.join(", "),
    }));
  }, [selectedTopics]);

  const handleTopicToggle = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleAddCustomTopic = () => {
    if (customTopic.trim() && !selectedTopics.includes(customTopic.trim())) {
      setSelectedTopics((prev) => [...prev, customTopic.trim()]);
      setCustomTopic("");
    }
  };

  const handleRemoveTopic = (topic) => {
    setSelectedTopics((prev) => prev.filter((t) => t !== topic));
  };

  const handleChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    const { role, experience, useModules } = formData;
    const topicsToFocus = selectedTopics.join(", ");

    if (!role || !experience || selectedTopics.length === 0) {
      setErrors("Please fill all required fields");
      return;
    }
    setErrors("");
    setIsLoading(true);
    try {
      // API call to create session
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role,
          experience,
          topicsToFocus,
          numberOfQuestions: 10,
        }
      );
      //should be areay like [{question:"", answer:""}]
      const generatedQuestions = aiResponse.data;

      if (useModules) {
        // Create session with modules
        // Split topics and create a module for each topic
        const topics = topicsToFocus
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t);

        // Create session first
        const sessionResponse = await axiosInstance.post(
          API_PATHS.SESSION.CREATE,
          {
            role,
            experience,
            topicsToFocus,
            description: formData.description,
            questions: [],
          }
        );

        const sessionId = sessionResponse.data.session._id;

        // Distribute questions across modules based on topics
        const questionsPerModule = Math.ceil(
          generatedQuestions.length / topics.length
        );

        // Create modules with questions
        for (let i = 0; i < topics.length; i++) {
          const moduleQuestions = generatedQuestions.slice(
            i * questionsPerModule,
            (i + 1) * questionsPerModule
          );

          if (moduleQuestions.length > 0) {
            await axiosInstance.post(API_PATHS.MODULE.CREATE, {
              sessionId,
              name: topics[i],
              description: `Questions related to ${topics[i]}`,
              questions: moduleQuestions,
            });
          }
        }

        navigate(`/interview-prep/${sessionId}`);
      } else {
        // Create session without modules (legacy mode)
        const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
          ...formData,
          questions: generatedQuestions,
        });
        if (response.data?.session?._id) {
          navigate(`/interview-prep/${response.data.session._id}`);
        }
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrors(error.response.data.message);
      } else {
        setErrors("Failed to create session. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 md:p-8 flex flex-col justify-center bg-gradient-to-br from-white to-amber-50/30">
      {/* Header with gradient accent */}
      <div className="mb-6">
        <div className="w-12 h-1 bg-gradient-to-r from-[#FF9324] to-[#FCD760] rounded-full mb-4"></div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-[#FF9324] to-[#FCD760] bg-clip-text text-transparent">
          Start a New Interview Journey
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Fill out a few quick details and unlock your personalized set of
          interview questions!
        </p>
      </div>

      <form onSubmit={handleCreateSession} className="space-y-4">
        <Input
          value={formData.role}
          onChange={({ target }) => handleChange("role", target.value)}
          label="Role"
          placeholder="e.g. UI/UX Designer"
          type="text"
        />

        <Input
          value={formData.experience}
          onChange={({ target }) => handleChange("experience", target.value)}
          label="Experience (in years)"
          placeholder="e.g. 3"
          type="number"
        />

        {/* AI-Powered Topic Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Topics to Focus
            {isLoadingSuggestions && (
              <span className="ml-2 text-xs text-amber-600 flex items-center gap-1 inline-flex">
                <LuSparkles className="w-3 h-3 animate-pulse" />
                AI suggesting...
              </span>
            )}
          </label>

          {/* Selected Topics Display */}
          {selectedTopics.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
              {selectedTopics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-amber-300 rounded-full text-sm font-medium text-gray-700 shadow-sm"
                >
                  {topic}
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(topic)}
                    className="ml-1 hover:bg-red-100 rounded-full p-0.5 transition-colors"
                  >
                    <LuX className="w-3 h-3 text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* AI Suggested Topics */}
          {suggestedTopics.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <LuSparkles className="w-3 h-3 text-amber-500" />
                <span className="font-medium">
                  AI Suggestions for {formData.role}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicToggle(topic)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedTopics.includes(topic)
                        ? "bg-gradient-to-r from-[#FF9324] to-[#e99a4b] text-white shadow-md"
                        : "bg-white border border-gray-300 text-gray-700 hover:border-amber-400 hover:bg-amber-50"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Topic */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" &&
                (e.preventDefault(), handleAddCustomTopic())
              }
              placeholder="Add custom topic..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddCustomTopic}
              disabled={!customTopic.trim()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <LuPlus className="w-4 h-4" />
              Add
            </button>
          </div>

          {selectedTopics.length === 0 &&
            !isLoadingSuggestions &&
            suggestedTopics.length === 0 && (
              <p className="text-xs text-gray-500 italic">
                {formData.role && formData.experience
                  ? "Add topics manually or wait for AI suggestions"
                  : "Fill in role and experience to get AI-powered topic suggestions"}
              </p>
            )}
        </div>

        <Input
          value={formData.description}
          onChange={({ target }) => handleChange("description", target.value)}
          label="Description (Optional)"
          placeholder="e.g., Preparing for FAANG interviews, focusing on system design..."
          type="textarea"
        />

        {/* Module Toggle */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.useModules}
              onChange={({ target }) =>
                handleChange("useModules", target.checked)
              }
              className="w-5 h-5 text-[#FF9324] bg-white border-amber-300 rounded focus:ring-[#FF9324] focus:ring-2"
            />
            <div>
              <span className="font-semibold text-gray-800">
                Organize by Modules
              </span>
              <p className="text-xs text-gray-600 mt-1">
                Split questions into topic-based modules with progress tracking
              </p>
            </div>
          </label>
        </div>

        {errors && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {errors}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoasding}
          className="w-full py-3 bg-gradient-to-r from-[#FF9324] to-[#e99a4b] hover:from-black hover:to-black text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-6"
        >
          {isLoasding && <SpinnerLoader />}
          {isLoasding ? "Creating..." : "Create Session"}
        </button>
      </form>
    </div>
  );
};
export default CreateSessionForm;
