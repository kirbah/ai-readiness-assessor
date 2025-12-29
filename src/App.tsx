import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import LandingPage from "./components/LandingPage";
import { AnimatePresence } from "framer-motion";
import ReactGA from "react-ga4";
import CookieConsent from "react-cookie-consent";
import questionsData from "./data/questions.json";
import ProgressBar from "./components/ProgressBar";
import QuestionCard from "./components/QuestionCard";
import ResultsPage from "./components/ResultsPage/ResultsPage";
import { Question } from "./types";
import "./styles/professional-theme.css";

const TRACKING_ID = "G-6BMVBWLY6L";

const handleAcceptCookie = () => {
  ReactGA.initialize(TRACKING_ID);
};

type UserAnswers = { [key: string]: string };
type Tier = "At Risk" | "Building Foundation" | "Well-Positioned";

function App() {
  const isInitialMount = useRef(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [currentFilter, setCurrentFilter] = useState<string>("all");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [assessmentStarted, setAssessmentStarted] = useState<boolean>(false);
  const [initialUrlProcessed, setInitialUrlProcessed] = useState(false);

  const questions: Question[] = questionsData;
  const questionsById = useMemo(() => {
    return questions.reduce(
      (acc, q) => {
        acc[q.id] = q;
        return acc;
      },
      {} as { [key: number]: Question }
    );
  }, [questions]);

  const maxScore = useMemo(() => {
    return questions
      .filter((q) => q.type !== "contextual")
      .reduce((total, question) => {
        const highestAnswerScore = Math.max(
          ...question.answers.map((a) => a.score || 0)
        );
        return total + highestAnswerScore;
      }, 0);
  }, [questions]);

  const totalQuestions = questions.length;

  useEffect(() => {
    const savedAnswersStr = localStorage.getItem("aiAssessmentAnswers");

    if (savedAnswersStr) {
      try {
        const parsedAnswers = JSON.parse(savedAnswersStr);
        setUserAnswers(parsedAnswers);

        const numberOfAnswers = Object.keys(parsedAnswers).length;
        const isComplete = numberOfAnswers === totalQuestions;

        if (isComplete) {
          setShowResults(true);
        } else {
          // Find the first unanswered question
          let nextIndex = 0;
          for (let i = 0; i < totalQuestions; i++) {
            const questionId = questions[i].id;
            if (!parsedAnswers[questionId.toString()]) {
              nextIndex = i;
              break;
            }
          }
          setCurrentQuestionIndex(nextIndex);
        }
      } catch (e) {
        console.error("Failed to parse saved answers:", e);
        localStorage.removeItem("aiAssessmentAnswers");
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setAssessmentStarted(true); // Ensure assessment starts after clearing corrupted data
      }
    }
  }, [totalQuestions, questions]);

  useEffect(() => {
    // Skip saving on initial mount to avoid overwriting restored state
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Only save to localStorage if there are actual answers to save.
    // This prevents writing an empty object '{}' to storage on reset.
    if (Object.keys(userAnswers).length > 0) {
      localStorage.setItem("aiAssessmentAnswers", JSON.stringify(userAnswers));
    } else {
      // If the answers are empty, ensure the item is removed.
      localStorage.removeItem("aiAssessmentAnswers");
    }
  }, [userAnswers]);

  const goToQuestion = useCallback(
    (questionId: number) => {
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
    ReactGA.event({
      category: "User",
      action: "Clicked Restart Assessment",
    });
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setCurrentFilter("all");
    setEditMode(false);
    setAssessmentStarted(false); // <--- ADD THIS
    localStorage.removeItem("aiAssessmentAnswers");
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  const handleAnswerSelect = useCallback(
    (answerId: string) => {
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
      const question = questionsById[parseInt(questionId, 10)];
      if (question && question.type !== "contextual") {
        const answer = question.answers.find((a) => a.id === answerId);
        if (answer) {
          totalScore += answer.score || 0;
        }
      }
    });
    return totalScore;
  }, [userAnswers, questionsById]);

  const getTier = useCallback((score: number): Tier => {
    if (score >= 15) return "Well-Positioned";
    if (score >= 8) return "Building Foundation";
    return "At Risk";
  }, []);

  useEffect(() => {
    // If there are URL parameters for answers, or if there are saved answers,
    // we should bypass the landing page and start the assessment directly.
    const urlParams = new URLSearchParams(window.location.search);
    const savedAnswersStr = localStorage.getItem("aiAssessmentAnswers");
    const hasUrlParams = Array.from(urlParams.keys()).some((key) =>
      key.startsWith("q")
    );
    const hasSavedAnswers =
      savedAnswersStr && Object.keys(JSON.parse(savedAnswersStr)).length > 0;

    if (hasUrlParams || hasSavedAnswers) {
      setAssessmentStarted(true);
    }

    const urlAnswers: { [key: number]: string } = {};
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
    setInitialUrlProcessed(true); // Mark initial URL processing as complete
  }, [questions, questionsById, totalQuestions]);

  // Effect to handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // Avoid handling popstate until the initial URL has been processed
      // to prevent conflicts with the initial state setup logic.
      if (!initialUrlProcessed) {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const questionId = params.get("question");

      if (questionId) {
        const questionIndex = questions.findIndex(
          (q) => q.id === parseInt(questionId, 10)
        );
        if (questionIndex !== -1) {
          setShowResults(false);
          setCurrentQuestionIndex(questionIndex);
        }
      } else if (params.has("results")) {
        setShowResults(true);
      } else if (!window.location.search) {
        // If there are no params, it might mean going back to the landing page state
        handleRestart();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [initialUrlProcessed, questions, handleRestart]);

  useEffect(() => {
    if (showResults) {
      ReactGA.send({ hitType: "pageview", page: "/results" });
    } else {
      ReactGA.send({
        hitType: "pageview",
        page: `/question/${currentQuestionIndex + 1}`,
      });
    }
  }, [showResults, currentQuestionIndex]);

  useEffect(() => {
    if (showResults) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [showResults]);

  // Effect to push state to browser history
  useEffect(() => {
    // Only push to history after the initial URL has been processed to avoid
    // overwriting the initial state or creating unwanted history entries.
    if (!initialUrlProcessed) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const currentQuestionId = questions[currentQuestionIndex]?.id;

    if (showResults) {
      // If showing results, and we are not already on the results URL
      if (!params.has("results")) {
        window.history.pushState(
          { page: "results" },
          "",
          `?results=true` // A simple results marker
        );
      }
    } else if (assessmentStarted && currentQuestionId) {
      // If in the assessment, and we're not already on the correct question URL
      if (params.get("question") !== currentQuestionId.toString()) {
        window.history.pushState(
          { question: currentQuestionId },
          "",
          `?question=${currentQuestionId}`
        );
      }
    }
  }, [
    currentQuestionIndex,
    showResults,
    assessmentStarted,
    initialUrlProcessed,
    questions,
  ]);

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="App d-flex flex-column min-vh-100">
      {!assessmentStarted ? (
        <LandingPage onStart={() => setAssessmentStarted(true)} />
      ) : showResults ? (
        <div className="container-fluid py-4 flex-grow-1">
          <div className="container">
            <ResultsPage
              score={calculateScore()}
              total={maxScore}
              tier={getTier(calculateScore())}
              results={Object.entries(userAnswers).map(
                ([questionId, answerId]) => {
                  const question = questionsById[parseInt(questionId, 10)];
                  const answer = question
                    ? question.answers.find((a) => a.id === answerId)
                    : undefined;
                  return {
                    question: parseInt(questionId, 10),
                    question_text: question
                      ? question.question_text
                      : "Question unavailable",
                    question_clarification: question
                      ? question.question_clarification
                      : "",
                    selected_text: answer
                      ? answer.answer_text
                      : "Answer unavailable",
                    selected_clarification: answer
                      ? answer.answer_clarification
                      : "",
                    score:
                      question?.type === "contextual"
                        ? undefined
                        : (answer?.score ?? 0),
                    explanation: answer?.explanation ?? undefined, // Set to undefined for contextual questions or if no explanation
                    type: question?.type,
                  };
                }
              )}
              shareableUrl={`${window.location.origin}${
                window.location.pathname
              }?${new URLSearchParams(
                Object.entries(userAnswers).reduce(
                  (acc, [questionId, answerId]) => {
                    acc[`q${questionId}`] = answerId;
                    return acc;
                  },
                  { filter: currentFilter } as Record<string, string>
                )
              ).toString()}`}
              initialFilter={currentFilter}
              onFilterChange={setCurrentFilter}
              onEditQuestion={goToQuestion}
              onRestart={handleRestart}
            />
          </div>
        </div>
      ) : (
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
                Evaluate your organization's readiness for enterprise AI
                adoption
              </p>
            </div>

            <>
              <ProgressBar
                current={currentQuestionIndex + 1}
                total={totalQuestions}
              />

              <div className="animation-container">
                <AnimatePresence mode="wait" initial={false}>
                  <QuestionCard
                    key={currentQuestion.id}
                    question={currentQuestion}
                    onAnswerSelect={handleAnswerSelect}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    showPrevious={currentQuestionIndex > 0}
                    userAnswer={userAnswers[currentQuestion.id]}
                  />
                </AnimatePresence>
              </div>
            </>
          </div>
        </div>
      )}
      <CookieConsent
        location="bottom"
        buttonText="I understand"
        cookieName="aiReadinessAssessorCookieConsent"
        style={{ background: "#2B373B" }}
        buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
        expires={150}
        onAccept={handleAcceptCookie}
      >
        This website uses cookies for analytics purposes to understand how users
        interact with the assessment.{" "}
        <a
          aria-label="Privacy and Analytics details"
          href="https://github.com/kirbah/ai-readiness-assessor#privacy-and-analytics"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
        </a>
      </CookieConsent>
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
