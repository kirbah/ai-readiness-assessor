import React from "react";

const ResultsPage = ({ score, total, tier, results, shareableUrl }) => {
  // Remove mock data - use actual props
  const mockScore = score;
  const mockTotal = total;
  const mockTier = tier;
  const mockResults = results;

  const tierDescriptions = {
    "At Risk":
      "Your readiness level indicates critical gaps that pose a high risk of project failure.",
    "Building Foundation":
      "You have some foundational elements in place but also significant gaps to address.",
    "Well-Positioned":
      "You have a strong foundation and can proceed with new AI initiatives with a higher degree of confidence.",
  };

  const tierColor =
    mockTier === "Well-Positioned"
      ? "success"
      : mockTier === "Building Foundation"
      ? "warning"
      : "danger";

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
                  {mockScore}/{mockTotal}
                </div>
                <h2 className="text-{tierColor} mb-1">{mockTier}</h2>
                <p className="lead text-muted">{tierDescriptions[mockTier]}</p>

                <div className="progress mt-4" style={{ height: "20px" }}>
                  <div
                    className={`progress-bar bg-${tierColor}`}
                    style={{ width: `${(mockScore / mockTotal) * 100}%` }}
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
              <div className="row g-3">
                {mockResults.map((result, index) => (
                  <div key={index} className="col-md-6">
                    <div
                      className={`card ${
                        result.score === 2
                          ? "border-success"
                          : result.score === 1
                          ? "border-warning"
                          : "border-danger"
                      } h-100`}
                    >
                      <div className="card-body">
                        <h6 className="card-title mb-2">
                          Question {result.question}
                        </h6>
                        <p className="card-text small text-muted mb-2">
                          Selected: <strong>{result.selected}</strong>
                        </p>
                        <div
                          className={`badge fs-6 mb-2 ${
                            result.score === 2
                              ? "bg-success"
                              : result.score === 1
                              ? "bg-warning"
                              : "bg-danger"
                          }`}
                        >
                          Score: {result.score}
                        </div>
                        <p className="card-text small">{result.explanation}</p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
