import React from "react";
import { motion, easeOut } from "framer-motion"; // Import motion
import "../styles/LandingPage.css"; // Import the new CSS file

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };

  const pillarVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <div className="landing-page py-4">
      <div className="container">
        <motion.div
          className="card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
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

            <motion.div
              className="pillars-grid"
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.div className="pillar-item" variants={pillarVariants}>
                <strong>Data & Infrastructure</strong>
                <p className="text-muted mb-0">
                  <em>Do we have the foundational platform to win?</em>
                </p>
              </motion.div>
              <motion.div className="pillar-item" variants={pillarVariants}>
                <strong>Team & Talent</strong>
                <p className="text-muted mb-0">
                  <em>
                    Do we have the right people, and are they set up for
                    success?
                  </em>
                </p>
              </motion.div>
              <motion.div className="pillar-item" variants={pillarVariants}>
                <strong>MLOps & Production Readiness</strong>
                <p className="text-muted mb-0">
                  <em>
                    Can we ship and manage this reliably and safely at scale?
                  </em>
                </p>
              </motion.div>
              <motion.div className="pillar-item" variants={pillarVariants}>
                <strong>Business Value & Strategy</strong>
                <p className="text-muted mb-0">
                  <em>
                    Are we building the right thing, and can we prove its value?
                  </em>
                </p>
              </motion.div>
            </motion.div>

            <div className="cta-section">
              <motion.button
                className="btn btn-primary btn-lg mb-3"
                onClick={onStart}
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                Start the Free Assessment
              </motion.button>
              <p className="text-muted small">
                Takes under 5 minutes | 100% Confidential | Instant, Actionable
                Results
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
