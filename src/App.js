import React, { useState, useEffect, useMemo, useCallback } from "react";
import questionsData from "./data/questions.json";
import ProgressBar from "./components/ProgressBar";
import QuestionCard from "./components/QuestionCard";
import ResultsPage from "./components/ResultsPage";
import "./styles/professional-theme.css";

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [editMode, setEditMode] = useState(false);
  const [urlError, setUrlError] = useState(null);

  const questions = questionsData;
  const questionsById = useMemo(() => {
    return questions.reduce((acc, q) => {
      acc[q.id] = q;
      return acc;
    }, {});
  }, [questions]);

  const maxScore = useMemo(() => {
    return questions.reduce((total, question) => {
      const highestAnswerScore = Math.max(
        ...question.answers.map((a) => a.score)
      );
      return total + highestAnswerScore;
    }, 0);
  }, [questions]);

  const totalQuestions = questions.length;

  useEffect(() => {
    const savedAnswers = localStorage.getItem("aiAssessmentAnswers");
    if (savedAnswers) {
      setUserAnswers(JSON.parse(savedAnswers));
    }

    const savedIndex = localStorage.getItem("aiAssessmentCurrentIndex");
    if (savedIndex) {
      const index = parseInt(savedIndex, 10);
      setCurrentQuestionIndex(Math.min(Math.max(0, index), totalQuestions - 1));
    }
  }, [totalQuestions]);

  useEffect(() => {
    localStorage.setItem("aiAssessmentAnswers", JSON.stringify(userAnswers));
  }, [userAnswers]);

  useEffect(() => {
    localStorage.setItem("aiAssessmentCurrentIndex", currentQuestionIndex);
  }, [currentQuestionIndex]);

  const goToQuestion = useCallback(
    (questionId) => {
      setEditMode(true);
      const index = questions.findIndex((q) => q.id === questionId);
      if (index !== -1) {
        setCurrentQuestionIndex(index);
      }
      setShowResults(false);
    },
    [questions]
  );

  const handleNext = useCallback(() => {
    if (editMode) {
      // In edit mode, always return to results
      setEditMode(false);
      setShowResults(true);
    } else if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  }, [editMode, currentQuestionIndex, totalQuestions]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);

  const handleRestart = useCallback(() => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setCurrentFilter("all");
    setEditMode(false);
    localStorage.removeItem("aiAssessmentCurrentIndex");
    localStorage.removeItem("aiAssessmentAnswers");
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  const handleAnswerSelect = useCallback(
    (answerId) => {
      setUserAnswers((prev) => ({
        ...prev,
        [questions[currentQuestionIndex].id]: answerId,
      }));

      if (editMode) {
        // In edit mode, return to results after answer change
        setEditMode(false);
        setShowResults(true);
      } else {
        handleNext();
      }
    },
    [currentQuestionIndex, editMode, questions, handleNext]
  );

  const calculateScore = useCallback(() => {
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
  }, [userAnswers, questionsById]);

  const getTier = useCallback((score) => {
    if (score >= 15) return "Well-Positioned";
    if (score >= 8) return "Building Foundation";
    return "At Risk";
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlAnswers = {};
    let hasAnyValidParam = false;

    // Step 1: Parse all potential valid answers from URL
    for (const q of questions) {
      const paramKey = `q${q.id}`;
      const answerId = urlParams.get(paramKey);
      if (answerId) {
        hasAnyValidParam = true;
        // Validate: Check if answerId matches expected format and belongs to question's answers
        if (
          questionsById[q.id] &&
          questionsById[q.id].answers.some((a) => a.id === answerId)
        ) {
          urlAnswers[q.id] = answerId;
        }
      }
    }

    const numAnsweredFromUrl = Object.keys(urlAnswers).length;
    const allQuestionsAnsweredInUrl = numAnsweredFromUrl === totalQuestions;
    const hasAnyUrlAnswer = numAnsweredFromUrl > 0;

    if (allQuestionsAnsweredInUrl) {
      // All questions correctly answered via URL
      setUserAnswers(urlAnswers);
      setShowResults(true);
      setUrlError(null);
    } else if (hasAnyUrlAnswer) {
      // Some valid answers from URL, but not all
      // Find the first unanswered question to redirect user
      let firstUnansweredQuestionId = null;
      for (const q of questions) {
        if (!urlAnswers[q.id]) {
          firstUnansweredQuestionId = q.id;
          break;
        }
      }

      if (firstUnansweredQuestionId !== null) {
        // Found a gap, redirect to the first missing question
        setUserAnswers(urlAnswers);
        const firstUnansweredIndex = questions.findIndex(
          (q) => q.id === firstUnansweredQuestionId
        );
        setCurrentQuestionIndex(firstUnansweredIndex);
        setShowResults(false);
        setUrlError(
          "The assessment link is incomplete. Please complete the remaining questions."
        );
      } else {
        // Fallback: treat as invalid
        setUrlError(
          "The assessment link contains invalid or incomplete data. Starting a new evaluation."
        );
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    } else if (hasAnyValidParam) {
      // No valid answers, but some q params were present (all invalid)
      setUrlError(
        "The assessment link contains invalid data. Starting a new evaluation."
      );
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // No URL parameters relevant to answers found
      setUrlError(null);
    }

    // Parse filter from URL
    const filterParam = urlParams.get("filter");
    if (filterParam && ["critical", "issues", "all"].includes(filterParam)) {
      setCurrentFilter(filterParam);
    }
  }, [questions, questionsById, totalQuestions]);

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
          total={maxScore}
          tier={tier}
          results={results}
          shareableUrl={shareableUrl}
          initialFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          onEditQuestion={goToQuestion}
          onRestart={handleRestart}
        />
        <footer className="text-center py-4 mt-5">
          <div className="container">
            <p className="mb-0 text-muted">
              &copy; 2025 AI Readiness Assessor.{" "}
              <a
                href="https://www.linkedin.com/in/kiryl-bahdanau/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Kiryl Bahdanau
              </a>
              . All Rights Reserved.
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
              className="alert alert-danger alert-dismissible fade show mb-4"
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
            <h1 className="h1 fw-bold mb-3">AI Readiness Assessment</h1>
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
            />
          </>
        </div>
      </div>
      <footer className="text-center py-4 mt-5">
        <div className="container">
          <p className="mb-0 text-muted">
            &copy; 2025 AI Readiness Assessor.{" "}
            <a
              href="https://www.linkedin.com/in/kiryl-bahdanau/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kiryl Bahdanau
            </a>
            . All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
