import React from "react";

interface Props {
  current: number;
  total: number;
}

const ProgressBar: React.FC<Props> = ({ current, total }) => {
  const progress = Math.round((current / total) * 100);

  return (
    <div className="mb-4">
      <div className="mb-2 text-center">
        <small className="text-muted">
          Question {current} of {total}
        </small>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`Progress: ${progress}% complete`}
      >
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
