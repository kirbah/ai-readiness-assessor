import React from "react";

const ResultsPage = ({
  score,
  total,
  tier,
  results,
  shareableUrl,
  onRestart,
}) => {
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

  const handleRestart = () => {
    if (onRestart) {
      onRestart();
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white text-center">
              <h1 className="mb-0">AI Readiness Assessment Results</h1>
            </div>
            <div className="card-body p-4">
              {/* Score Summary */}
              <div className="text-center mb-5">
                <div className="display-4 fw-bold text-{tierColor} mb-3">
                  {score}/{total}
                </div>
                <h2 className="text-{tierColor} mb-1">{tier}</h2>
                <p className="lead text-muted">{tierDescriptions[tier]}</p>

                <div className="progress mt-4" style={{ height: "20px" }}>
                  <div
                    className={`progress-bar bg-${tierColor}`}
                    style={{ width: `${(score / total) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="alert alert-success text-center mb-5">
                <h4 className="mb-3">Ready to Take the Next Step?</h4>
                <p className="mb-4">
                  Schedule a free consultation to discuss your results and
                  create a customized AI roadmap for your organization.
                </p>
                <a href="#contact" className="btn btn-success btn-lg">
                  Book Consultation Call
                </a>
              </div>

              {/* Detailed Results */}
              <h3 className="mb-4">Detailed Assessment</h3>
              <div className="accordion" id="resultsAccordion">
                {results.map((result, index) => (
                  <div key={index} className="accordion-item">
                    <h2 className="accordion-header" id={`heading${index}`}>
                      <button
                        className={`accordion-button collapsed ${
                          result.score === 2
                            ? "border-start border-success border-4"
                            : result.score === 1
                            ? "border-start border-warning border-4"
                            : "border-start border-danger border-4"
                        }`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${index}`}
                        aria-expanded="false"
                        aria-controls={`collapse${index}`}
                      >
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">
                              Question {result.question}: {result.question_text}
                            </h6>
                            <p className="mb-1 small text-muted">
                              Selected: <strong>{result.selected_text}</strong>
                            </p>
                            <div
                              className={`badge fs-6 ${
                                result.score === 2
                                  ? "bg-success"
                                  : result.score === 1
                                  ? "bg-warning text-dark"
                                  : "bg-danger"
                              }`}
                            >
                              Score: {result.score}/2
                            </div>
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
                          <div className="mb-3">
                            <h6 className="fw-bold text-primary mb-2">
                              Assessment
                            </h6>
                            <p className="small">{result.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Share Section */}
              <div className="text-center mt-5">
                <h4 className="mb-3">Share Your Results</h4>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    value={shareableUrl || window.location.href}
                    readOnly
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        shareableUrl || window.location.href
                      )
                    }
                  >
                    Copy Link
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
