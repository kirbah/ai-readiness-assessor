import React from "react";
import ProgressBar from "./components/ProgressBar";
import QuestionCard from "./components/QuestionCard";
import ResultsPage from "./components/ResultsPage";
import "./App.css";

function App() {
  // Static mock data for Phase 2 - no state management yet
  const currentQuestion = 3;
  const totalQuestions = 10;
  const showResults = false; // Static flag - will be dynamic later

  return (
    <div className="App">
      <div className="container-fluid py-4">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-primary mb-3">
              AI Readiness Assessment
            </h1>
            <p className="lead text-muted">
              Evaluate your organization's readiness for enterprise AI adoption
            </p>
          </div>

          {/* Main Content */}
          {!showResults ? (
            <>
              {/* Progress Bar */}
              <ProgressBar current={currentQuestion} total={totalQuestions} />

              {/* Question Card */}
              <QuestionCard />
            </>
          ) : (
            // Results Page
            <ResultsPage />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
