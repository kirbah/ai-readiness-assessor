import React from "react";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="landing-page text-center py-5">
      <div className="container">
        {/* Header / H1 */}
        <h1 className="h1 fw-bold mb-4">
          Is your AI strategy built on a solid engineering foundation, or is it
          a multi-million dollar 'science project' waiting to fail?
        </h1>

        {/* Subheading / Lead Paragraph */}
        <p className="lead mb-5">
          In under 5 minutes, diagnose the critical risks in your data, team,
          and production strategy—before they derail your roadmap.
        </p>

        {/* Value Proposition Section */}
        <div className="value-proposition mb-5">
          <h3 className="h3 fw-bold mb-4">
            This assessment benchmarks your organization against the four
            critical pillars of enterprise AI readiness:
          </h3>
          <ul
            className="list-unstyled text-start mx-auto"
            style={{ maxWidth: "600px" }}
          >
            <li className="mb-3">
              <strong>Data & Infrastructure</strong>
              <p className="text-muted mb-0">
                <em>(Do we have the foundational platform to win?)</em>
              </p>
            </li>
            <li className="mb-3">
              <strong>Team & Talent</strong>
              <p className="text-muted mb-0">
                <em>
                  (Do we have the right people, and are they set up for
                  success?)
                </em>
              </p>
            </li>
            <li className="mb-3">
              <strong>MLOps & Production Readiness</strong>
              <p className="text-muted mb-0">
                <em>
                  (Can we ship and manage this reliably and safely at scale?)
                </em>
              </p>
            </li>
            <li className="mb-3">
              <strong>Business Value & Strategy</strong>
              <p className="text-muted mb-0">
                <em>
                  (Are we building the right thing, and can we prove its value?)
                </em>
              </p>
            </li>
          </ul>
        </div>

        {/* Call to Action Section */}
        <div className="cta-section">
          <button className="btn btn-primary btn-lg mb-3" onClick={onStart}>
            Start the Free Assessment
          </button>
          <p className="text-muted small">
            Takes under 5 minutes | 100% Confidential | Instant, Actionable
            Results
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
