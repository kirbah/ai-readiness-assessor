import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Result } from "../types";

type ScoreStyle = {
  icon: string;
  color: string;
  borderClass: string;
};

const scoreStyles: Record<number, ScoreStyle> = {
  0: { icon: "🔴", color: "critical", borderClass: "border-danger" },
  1: { icon: "🟡", color: "issues", borderClass: "border-warning" },
  2: { icon: "🟢", color: "good", borderClass: "border-success" },
};

interface Props {
  results: Result[];
  onEditQuestion: (questionId: number) => void;
  initialFilter?: string;
}

const DetailedResults: React.FC<Props> = ({
  results,
  onEditQuestion,
  initialFilter,
}) => {
  const [filter, setFilter] = useState<string>(initialFilter || "all");
  const [expanded, setExpanded] = useState<number | false>(false);

  // Calculate counts for filters
  const criticalCount = results.filter((r) => r.score === 0).length;
  const issuesCount = results.filter((r) => r.score <= 1).length;
  const allCount = results.length;

  // Filtered results based on current filter
  const filteredResults = results.filter((result) => {
    if (filter === "critical") return result.score === 0;
    if (filter === "issues") return result.score <= 1;
    return true; // all
  });

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setExpanded(false); // Collapse accordion on filter change
  };

  return (
    <>
      <h3 className="mb-4">Detailed Assessment</h3>

      {/* Filter Tabs */}
      <ul className="nav nav-tabs justify-content-center mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${filter === "critical" ? "active" : ""}`}
            onClick={() => handleFilterChange("critical")}
            role="tab"
            aria-selected={filter === "critical"}
            aria-controls="critical-tab"
          >
            Critical ({criticalCount})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${filter === "issues" ? "active" : ""}`}
            onClick={() => handleFilterChange("issues")}
            role="tab"
            aria-selected={filter === "issues"}
            aria-controls="issues-tab"
          >
            Issues ({issuesCount})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${filter === "all" ? "active" : ""}`}
            onClick={() => handleFilterChange("all")}
            role="tab"
            aria-selected={filter === "all"}
            aria-controls="all-tab"
          >
            All ({allCount})
          </button>
        </li>
      </ul>

      {filteredResults.length === 0 ? (
        <p className="text-center text-muted">
          No results match the selected filter.
        </p>
      ) : (
        <div className="accordion" id="resultsAccordion">
          <AnimatePresence mode="popLayout">
            {filteredResults.map((result, index) => {
              const styles = scoreStyles[result.score] || scoreStyles[2];
              const icon = styles.icon;
              const iconClass = styles.color;
              const isExpanded = expanded === index;

              return (
                <motion.div
                  key={result.question}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="accordion-item"
                >
                  <h2 className="accordion-header" id={`heading${index}`}>
                    <button
                      className={`accordion-button ${!isExpanded ? "collapsed" : ""} border-start border-4 ${styles.borderClass}`}
                      type="button"
                      onClick={() => setExpanded(isExpanded ? false : index)}
                      aria-expanded={isExpanded}
                      aria-controls={`collapse${index}`}
                    >
                      <div className="d-flex align-items-center w-100">
                        <span className={`result-icon ${iconClass} me-3`}>
                          {icon}
                        </span>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">
                            Question {result.question}: {result.question_text}
                          </h6>
                          <p className="mb-0 small text-muted">
                            Your Answer: <strong>{result.selected_text}</strong>
                          </p>
                        </div>
                      </div>
                    </button>
                  </h2>
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                          open: { opacity: 1, height: "auto" },
                          collapsed: { opacity: 0, height: 0 },
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="accordion-collapse"
                        id={`collapse${index}`}
                        aria-labelledby={`heading${index}`}
                      >
                        <div className="accordion-body">
                          {result.question_clarification && (
                            <div className="mb-3">
                              <h6 className="fw-bold text-secondary mb-2">
                                Question Context
                              </h6>
                              <p className="small text-muted">
                                {result.question_clarification}
                              </p>
                            </div>
                          )}

                          {result.selected_clarification && (
                            <div className="mb-3">
                              <h6 className="fw-bold text-secondary mb-2">
                                Selection Context
                              </h6>
                              <p className="small text-muted">
                                {result.selected_clarification}
                              </p>
                            </div>
                          )}

                          {result.explanation && (
                            <div className="mb-3 info-box">
                              <h6 className="fw-bold mb-2 advisors-note-color">
                                Advisor's Note
                              </h6>
                              <p className="small">{result.explanation}</p>
                            </div>
                          )}

                          <div className="text-end mt-3">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => onEditQuestion(result.question)}
                              aria-label={`Change answer for Question ${result.question}`}
                            >
                              Change My Answer
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default DetailedResults;
