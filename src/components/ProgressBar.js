import React from "react";

const ProgressBar = ({ current, total }) => {
  // Static placeholder - will receive props later
  const progress = Math.round((current / total) * 100);

  return (
    <div className="progress mb-4" style={{ height: "12px" }}>
      <div
        className="progress-bar d-flex align-items-center px-2"
        role="progressbar"
        style={{ width: `${progress}%` }}
        aria-valuenow={progress}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        Question {current} of {total}
      </div>
    </div>
  );
};

export default ProgressBar;
