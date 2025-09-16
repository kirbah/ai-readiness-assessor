import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const ResultsPage = ({
  score,
  total,
  tier,
  results,
  shareableUrl,
  initialFilter,
  onFilterChange,
  onEditQuestion,
  onRestart,
}) => {
  const [filter, setFilter] = useState(initialFilter || "all");
  const [isCopied, setIsCopied] = useState(false);

  const tierDescriptions = {
    "At Risk":
      "Your readiness level indicates critical gaps that pose a high risk of project failure.",
    "Building Foundation":
      "You have some foundational elements in place but also significant gaps to address.",
    "Well-Positioned":
      "You have a strong foundation and can proceed with new AI initiatives with a higher degree of confidence.",
  };

  const tierColor =
    tier === "Well-Positioned"
      ? "success"
      : tier === "Building Foundation"
      ? "warning"
      : "danger";

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

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  const handleRestart = () => {
    if (onRestart) {
      onRestart();
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl || window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const getIconForScore = (score) => {
    if (score === 0) return "🔴"; // Filled red circle for critical
    if (score === 1) return "🟡"; // Filled amber triangle for issues
    return "🟢"; // Filled green circle for good
  };

  const getColorForScore = (score) => {
    if (score === 0) return "critical";
    if (score === 1) return "issues";
    return "good";
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card">
            <div className="card-header text-center">
              <h1 className="h3 mb-0">Your AI Readiness Report</h1>
            </div>
            <div className="card-body p-4">
              {/* Score Summary */}
              <div className="text-center mb-5">
                <div className="mb-4">
                  <CircularProgressbar
                    value={score}
                    maxValue={total}
                    text={`${score}/20`}
                    styles={buildStyles({
                      pathColor: `var(--bs-primary)`,
                      textColor: `var(--bs-primary)`,
                      trailColor: `#e9ecef`,
                      backgroundColor: `#f8f9fa`,
                    })}
                  />
                </div>
                <h2 className={`text-${tierColor} mb-1`}>{tier}</h2>
                <p className="lead text-muted">{tierDescriptions[tier]}</p>
              </div>

              {/* CTA Section */}
              <div className="cta-block mb-5">
                <h3 className="mb-3">Ready to Take the Next Step?</h3>
                <p className="mb-4">
                  Schedule a free consultation to discuss your results and
                  create a customized AI roadmap for your organization.
                </p>
                <a href="#contact" className="btn btn-primary btn-lg">
                  <i className="bi bi-calendar3 me-2"></i>
                  Book Consultation Call
                </a>
              </div>

              {/* Detailed Results */}
              <h3 className="mb-4">Detailed Assessment</h3>

              {/* Filter Tabs */}
              <ul
                className="nav nav-tabs justify-content-center mb-4"
                role="tablist"
              >
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      filter === "critical" ? "active" : ""
                    }`}
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
                    className={`nav-link ${
                      filter === "issues" ? "active" : ""
                    }`}
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
                  {filteredResults.map((result, index) => {
                    const icon = getIconForScore(result.score);
                    const iconClass = getColorForScore(result.score);
                    const isExpanded = false; // Default collapsed

                    return (
                      <div key={result.question} className="accordion-item">
                        <h2 className="accordion-header" id={`heading${index}`}>
                          <button
                            className={`accordion-button collapsed border-start border-4 ${
                              result.score === 2
                                ? "border-success"
                                : result.score === 1
                                ? "border-warning"
                                : "border-danger"
                            }`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse${index}`}
                            aria-expanded={isExpanded}
                            aria-controls={`collapse${index}`}
                          >
                            <div className="d-flex align-items-center w-100">
                              <span className={`result-icon ${iconClass} me-3`}>
                                {icon}
                              </span>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">
                                  Question {result.question}:{" "}
                                  {result.question_text}
                                </h6>
                                <p className="mb-0 small text-muted">
                                  Your Answer:{" "}
                                  <strong>{result.selected_text}</strong>
                                </p>
                              </div>
                              <div className="ms-4">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onEditQuestion(result.question);
                                  }}
                                  aria-label={`Edit answer for Question ${result.question}`}
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          </button>
                        </h2>
                        <div
                          id={`collapse${index}`}
                          className="accordion-collapse collapse"
                          aria-labelledby={`heading${index}`}
                          data-bs-parent="#resultsAccordion"
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
                                <h6 className="fw-bold text-primary mb-2">
                                  Advisor's Note
                                </h6>
                                <p className="small">{result.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Share Section */}
              <div className="text-center mt-5">
                <h4 className="mb-3">Share Your Results</h4>
                <div
                  className="input-group mb-3"
                  style={{ maxWidth: "500px", margin: "0 auto" }}
                >
                  <input
                    type="text"
                    className="form-control"
                    value={shareableUrl || window.location.href}
                    readOnly
                    aria-label="Shareable results URL"
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleCopyToClipboard}
                    aria-label="Copy share link"
                  >
                    <i className="bi bi-copy"></i>{" "}
                    {isCopied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
                <small className="text-muted">
                  Anyone with this link can see your AI readiness assessment
                  results
                </small>
              </div>

              {/* Restart Section */}
              <div className="text-center mt-4">
                <button
                  className="btn btn-outline-primary btn-lg"
                  onClick={handleRestart}
                >
                  Restart Assessment
                </button>
                <p className="text-muted mt-2 small">
                  Start over to see how different choices affect your results
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
