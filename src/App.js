import React, { useState, useEffect } from "react";
import questionsData from "./data/questions.json";
import ProgressBar from "./components/ProgressBar";
import QuestionCard from "./components/QuestionCard";
import ResultsPage from "./components/ResultsPage";
import "./App.css";

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    // Load current question index from localStorage, default to 0
    const savedIndex = localStorage.getItem("aiAssessmentCurrentIndex");
    return savedIndex ? parseInt(savedIndex) : 0;
  });

  const [userAnswers, setUserAnswers] = useState(() => {
    // Load user answers from localStorage, default to empty object
    const savedAnswers = localStorage.getItem("aiAssessmentAnswers");
    return savedAnswers ? JSON.parse(savedAnswers) : {};
  });

  const [showResults, setShowResults] = useState(() => {
    // Check if we should show results based on saved state
    const savedIndex = localStorage.getItem("aiAssessmentCurrentIndex");
    const savedAnswers = localStorage.getItem("aiAssessmentAnswers");
    if (savedIndex && savedAnswers) {
      const index = parseInt(savedIndex);
      const answers = JSON.parse(savedAnswers);
      const totalQuestions = questionsData.length;
      // Show results if last question was completed
      return (
        index >= totalQuestions - 1 &&
        Object.keys(answers).length === totalQuestions
      );
    }
    return false;
  });

  const questions = questionsData;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answerId) => {
    // Save the user's answer for this question
    const newAnswers = {
      ...userAnswers,
      [currentQuestion.id]: answerId,
    };
    setUserAnswers(newAnswers);

    // Save to localStorage
    localStorage.setItem("aiAssessmentAnswers", JSON.stringify(newAnswers));

    // If not the last question, move to next
    if (currentQuestionIndex < totalQuestions - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      localStorage.setItem("aiAssessmentCurrentIndex", newIndex.toString());
    } else {
      // Last question - show results
      setShowResults(true);
      // Clear the current index but keep answers for results
      localStorage.setItem(
        "aiAssessmentCurrentIndex",
        totalQuestions.toString()
      );
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      localStorage.setItem("aiAssessmentCurrentIndex", newIndex.toString());
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    Object.entries(userAnswers).forEach(([questionId, answerId]) => {
      const question = questions.find((q) => q.id === parseInt(questionId));
      const answer = question.answers.find((a) => a.id === answerId);
      if (answer) {
        totalScore += answer.score;
      }
    });
    return totalScore;
  };

  const getTier = (score) => {
    if (score >= 15) return "Well-Positioned";
    if (score >= 8) return "Building Foundation";
    return "At Risk";
  };

  // Check for URL parameters on initial load for direct results access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlAnswers = {};
    let hasValidAnswers = false;

    // Parse q1=1a, q2=2b, etc. format
    for (let i = 1; i <= totalQuestions; i++) {
      const paramKey = `q${i}`;
      const answerId = urlParams.get(paramKey);
      if (answerId) {
        // Validate answerId format (e.g., "1a", "2b")
        if (/^\d+[a-c]$/.test(answerId)) {
          urlAnswers[i] = answerId;
          hasValidAnswers = true;
        }
      }
    }

    if (hasValidAnswers && Object.keys(urlAnswers).length === totalQuestions) {
      // Valid complete answers in URL - populate state and show results
      setUserAnswers(urlAnswers);
      setShowResults(true);
      // Don't use localStorage when loading from URL
      return;
    }
  }, [totalQuestions]);

  // Handle page refresh - if we have partial answers, resume from last unanswered question
  useEffect(() => {
    // Check if URL has parameters first
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString()) {
      // URL params take precedence - skip localStorage
      return;
    }

    const savedAnswers = localStorage.getItem("aiAssessmentAnswers");

    if (savedAnswers) {
      const answers = JSON.parse(savedAnswers);

      // Find the next unanswered question
      let resumeIndex = 0;
      for (let i = 0; i < totalQuestions; i++) {
        const questionId = questions[i].id;
        if (!answers[questionId]) {
          resumeIndex = i;
          break;
        }
      }

      // If all questions answered, show results
      if (resumeIndex === totalQuestions) {
        setShowResults(true);
      } else {
        setCurrentQuestionIndex(resumeIndex);
      }
    }
  }, [questions, totalQuestions]);

  if (showResults) {
    const score = calculateScore();
    const tier = getTier(score);

    const results = Object.entries(userAnswers).map(
      ([questionId, answerId]) => {
        const question = questions.find((q) => q.id === parseInt(questionId));
        const answer = question.answers.find((a) => a.id === answerId);
        return {
          question: parseInt(questionId),
          selected: answerId,
          score: answer ? answer.score : 0,
          explanation: answer ? answer.explanation : "No explanation available",
        };
      }
    );

    // Generate shareable URL
    const shareUrlParams = new URLSearchParams();
    for (let i = 1; i <= totalQuestions; i++) {
      const answerId = userAnswers[i];
      if (answerId) {
        shareUrlParams.set(`q${i}`, answerId);
      }
    }
    const shareableUrl = `${window.location.origin}${
      window.location.pathname
    }?${shareUrlParams.toString()}`;

    return (
      <ResultsPage
        score={score}
        total={20}
        tier={tier}
        results={results}
        shareableUrl={shareableUrl}
      />
    );
  }

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
          <>
            {/* Progress Bar */}
            <ProgressBar
              current={currentQuestionIndex + 1}
              total={totalQuestions}
            />

            {/* Question Card */}
            <QuestionCard
              question={currentQuestion}
              onAnswerSelect={handleAnswerSelect}
              onPrevious={handlePrevious}
              showPrevious={currentQuestionIndex > 0}
              userAnswer={userAnswers[currentQuestion.id]}
            />
          </>
        </div>
      </div>
    </div>
  );
}

export default App;
