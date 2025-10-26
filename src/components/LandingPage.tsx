import React from "react";
import "../styles/LandingPage.css"; // Import the new CSS file

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="landing-page py-4">
      <div className="container">
        <div className="card">
          <div className="card-header text-center">
            <h1 className="h1 fw-bold">
              Is your AI strategy built on a solid engineering foundation, or is
              it a multi-million dollar "science project" waiting to fail?
            </h1>
          </div>
          <div className="card-body">
            <p className="lead text-center mb-5">
              In under 5 minutes, diagnose the critical risks in your data,
              team, and production strategy to secure your roadmap and prevent
              costly delays.
            </p>

            <div className="pillars-grid">
              <div className="pillar-item">
                <strong>Data & Infrastructure</strong>
                <p className="text-muted mb-0">
                  <em>Do we have the foundational platform to win?</em>
                </p>
              </div>
              <div className="pillar-item">
                <strong>Team & Talent</strong>
                <p className="text-muted mb-0">
                  <em>
                    Do we have the right people, and are they set up for
                    success?
                  </em>
                </p>
              </div>
              <div className="pillar-item">
                <strong>MLOps & Production Readiness</strong>
                <p className="text-muted mb-0">
                  <em>
                    Can we ship and manage this reliably and safely at scale?
                  </em>
                </p>
              </div>
              <div className="pillar-item">
                <strong>Business Value & Strategy</strong>
                <p className="text-muted mb-0">
                  <em>
                    Are we building the right thing, and can we prove its value?
                  </em>
                </p>
              </div>
            </div>

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
      </div>
    </div>
  );
};

export default LandingPage;
