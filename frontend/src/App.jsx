import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Home/Dashboard";
import InterviewPrep from "./pages/InterviewPrep/InterviewPrep";
import AIInterview from "./pages/AIInterview/AIInterview";
import InterviewResults from "./pages/AIInterview/InterviewResults";
import InterviewHistory from "./pages/InterviewHistory";
import TechnicalRound from "./pages/TechnicalRound/TechnicalRound";
import TechnicalRoundResults from "./pages/TechnicalRound/TechnicalRoundResults";
import { UserProvider } from "./context/userContext.jsx";

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/interview-prep/:sessionId"
              element={<InterviewPrep />}
            />
            <Route
              path="/technical-round/:sessionId"
              element={<TechnicalRound />}
            />
            <Route
              path="/technical-round/results/:roundId"
              element={<TechnicalRoundResults />}
            />
            <Route path="/ai-interview/:sessionId" element={<AIInterview />} />
            <Route
              path="/interview-results/:interviewId"
              element={<InterviewResults />}
            />
            <Route path="/interview-history" element={<InterviewHistory />} />
          </Routes>
        </Router>

        <Toaster
          toastOptions={{
            className: "",
            style: {
              fontSize: "13px",
            },
          }}
        />
      </div>
    </UserProvider>
  );
};

export default App;
