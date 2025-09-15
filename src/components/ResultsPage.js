import React from "react";

const ResultsPage = ({ score, total, tier, results }) => {
  // Static placeholder - will receive actual results data later
  const mockScore = 14;
  const mockTotal = 20;
  const mockTier = "Building Foundation";
  const mockResults = [
    {
      question: 1,
      selected: "1b",
      score: 1,
      explanation: "This is common but carries risk.",
    },
    {
      question: 2,
      selected: "2a",
      score: 2,
      explanation: "Excellent. Easy access to high-quality data.",
    },
    {
      question: 3,
      selected: "3c",
      score: 0,
      explanation: "This is a critical weakness.",
    },
    {
      question: 4,
      selected: "4a",
      score: 2,
      explanation: "Excellent. A realistic understanding.",
    },
    {
      question: 5,
      selected: "5b",
      score: 1,
      explanation:
        "This model can work, but requires strong project management.",
    },
    {
      question: 6,
      selected: "6a",
      score: 2,
      explanation: "Ideal. This aligns the technical team's goals.",
    },
    {
      question: 7,
      selected: "7c",
      score: 0,
      explanation: "This is a critical oversight.",
    },
    {
      question: 8,
      selected: "8b",
      score: 1,
      explanation:
        "This is better than nothing, but a manual process may be too slow.",
    },
    {
      question: 9,
      selected: "9a",
      score: 2,
      explanation: "Perfect. This ensures your project is aligned.",
    },
    {
      question: 10,
      selected: "10b",
      score: 1,
      explanation: "Awareness is the first step, but it is not enough.",
    },
  ];

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
                    value={
                      window.location.origin +
                      window.location.pathname +
                      "?score=14"
                    }
                    readOnly
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(window.location.href)
                    }
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
