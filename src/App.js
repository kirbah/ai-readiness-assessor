import React, { useState, useEffect, useMemo } from "react";
import questionsData from "./data/questions.json";
import ProgressBar from "./components/ProgressBar";
import QuestionCard from "./components/QuestionCard";
import ResultsPage from "./components/ResultsPage";
import "./App.css";

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [editMode, setEditMode] = useState(false);
  const [urlError, setUrlError] = useState(null);

  const questions = useMemo(() => questionsData, []);
  const questionsById = useMemo(() => {
    return questions.reduce((acc, q) => {
      acc[q.id] = q;
      return acc;
    }, {});
  }, [questions]);
  const totalQuestions = questions.length;

  useEffect(() => {
    const savedAnswers = localStorage.getItem("aiAssessmentAnswers");
    if (savedAnswers) {
      setUserAnswers(JSON.parse(savedAnswers));
    }

    const savedIndex = localStorage.getItem("aiAssessmentCurrentIndex");
    if (savedIndex) {
      setCurrentQuestionIndex(parseInt(savedIndex, 10));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("aiAssessmentAnswers", JSON.stringify(userAnswers));
  }, [userAnswers]);

  useEffect(() => {
    localStorage.setItem("aiAssessmentCurrentIndex", currentQuestionIndex);
  }, [currentQuestionIndex]);

  const goToQuestion = (questionId) => {
    setEditMode(true);
    const index = questions.findIndex((q) => q.id === questionId);
    if (index !== -1) {
      setCurrentQuestionIndex(index);
    }
    setShowResults(false);
  };

  const handleAnswerSelect = (answerId) => {
    setUserAnswers({
      ...userAnswers,
      [questions[currentQuestionIndex].id]: answerId,
    });

    if (editMode) {
      // In edit mode, return to results after answer change
      setEditMode(false);
      setShowResults(true);
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    if (editMode) {
      // In edit mode, always return to results
      setEditMode(false);
      setShowResults(true);
    } else if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setCurrentFilter("all");
    setEditMode(false);
    localStorage.removeItem("aiAssessmentCurrentIndex");
    localStorage.removeItem("aiAssessmentAnswers");
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const calculateScore = () => {
    let totalScore = 0;
    Object.entries(userAnswers).forEach(([questionId, answerId]) => {
      const question = questionsById[questionId];
      if (question) {
        const answer = question.answers.find((a) => a.id === answerId);
        if (answer) {
          totalScore += answer.score;
        }
      }
    });
    return totalScore;
  };

  const getTier = (score) => {
    if (score >= 15) return "Well-Positioned";
    if (score >= 8) return "Building Foundation";
    return "At Risk";
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlAnswers = {};
    let hasValidAnswers = false;

    for (let i = 1; i <= totalQuestions; i++) {
      const paramKey = `q${i}`;
      const answerId = urlParams.get(paramKey);
      if (answerId) {
        if (/^\d+[a-c]$/.test(answerId)) {
          urlAnswers[i] = answerId;
          hasValidAnswers = true;
        }
      }
    }

    if (hasValidAnswers && Object.keys(urlAnswers).length === totalQuestions) {
      setUserAnswers(urlAnswers);
      setShowResults(true);
      setUrlError(null);
    } else if (
      Object.keys(urlAnswers).length > 0 &&
      Object.keys(urlAnswers).length < totalQuestions
    ) {
      setUrlError(
        "The assessment link is incomplete. Starting from the first unanswered question."
      );
      const firstUnansweredIndex = Math.min(
        ...Object.keys(urlAnswers).map(Number)
      );
      setUserAnswers(urlAnswers);
      setCurrentQuestionIndex(firstUnansweredIndex);
    } else if (hasValidAnswers) {
      setUrlError(
        "The assessment link contains invalid data. Starting a new evaluation."
      );
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setUrlError(null);
    }

    // Parse filter from URL
    const filterParam = urlParams.get("filter");
    if (filterParam && ["critical", "issues", "all"].includes(filterParam)) {
      setCurrentFilter(filterParam);
    }
  }, [totalQuestions]);

  if (showResults) {
    const score = calculateScore();
    const tier = getTier(score);

    const results = Object.entries(userAnswers).map(
      ([questionId, answerId]) => {
        const question = questionsById[questionId];
        const answer = question.answers.find((a) => a.id === answerId);
        return {
          question: parseInt(questionId),
          question_text: question
            ? question.question_text
            : "Question unavailable",
          question_clarification: question
            ? question.question_clarification
            : "",
          selected_text: answer ? answer.answer_text : "Answer unavailable",
          selected_clarification: answer ? answer.answer_clarification : "",
          score: answer ? answer.score : 0,
          explanation: answer ? answer.explanation : "No explanation available",
        };
      }
    );

    const shareUrlParams = new URLSearchParams();
    Object.entries(userAnswers).forEach(([questionId, answerId]) => {
      shareUrlParams.set(`q${questionId}`, answerId);
    });
    shareUrlParams.set("filter", currentFilter);
    const shareableUrl = `${window.location.origin}${
      window.location.pathname
    }?${shareUrlParams.toString()}`;

    return (
      <>
        <ResultsPage
          score={score}
          total={20}
          tier={tier}
          results={results}
          shareableUrl={shareableUrl}
          initialFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          onEditQuestion={goToQuestion}
          onRestart={handleRestart}
        />
        <footer className="bg-light py-3 mt-auto">
          <div className="container text-center">
            <p className="mb-0 text-muted">
              &copy; 2025 AI Readiness Assessor.{" "}
              <a
                href="https://www.linkedin.com/in/kiryl-bahdanau/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Kiryl Bahdanau
              </a>
            </p>
          </div>
        </footer>
      </>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="App d-flex flex-column min-vh-100">
      <div className="container-fluid py-4 flex-grow-1">
        <div className="container">
          {urlError && (
            <div
              className="alert alert-warning alert-dismissible fade show"
              role="alert"
            >
              {urlError}
              <button
                type="button"
                className="btn-close"
                onClick={() => setUrlError(null)}
              ></button>
            </div>
          )}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-primary mb-3">
              AI Readiness Assessment
            </h1>
            <p className="lead text-muted">
              Evaluate your organization's readiness for enterprise AI adoption
            </p>
          </div>

          <>
            <ProgressBar
              current={currentQuestionIndex + 1}
              total={totalQuestions}
            />

            <QuestionCard
              question={currentQuestion}
              onAnswerSelect={handleAnswerSelect}
              onNext={handleNext}
              onPrevious={handlePrevious}
              showPrevious={currentQuestionIndex > 0}
              userAnswer={userAnswers[currentQuestion.id]}
              isEditMode={editMode}
              onEditQuestion={goToQuestion}
            />
          </>
        </div>
      </div>
      <footer className="bg-light py-3 mt-auto">
        <div className="container text-center">
          <p className="mb-0 text-muted">
            &copy; 2025 AI Readiness Assessor.{" "}
            <a
              href="https://www.linkedin.com/in/kiryl-bahdanau/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kiryl Bahdanau
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
