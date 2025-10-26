import React, { useState, useEffect } from "react";
import { animate } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type Tier = "At Risk" | "Building Foundation" | "Well-Positioned";

interface Props {
  score: number;
  total: number;
  tier: Tier;
  tierDescription: string;
  tierColor: "success" | "warning" | "danger";
}

const ScoreSummary: React.FC<Props> = ({
  score,
  total,
  tier,
  tierDescription,
  tierColor,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => {
        setAnimatedScore(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [score]);

  return (
    <div className="text-center mb-5">
      <div className="mb-4">
        <CircularProgressbar
          value={animatedScore}
          maxValue={total}
          text={`${animatedScore}/${total}`}
          styles={buildStyles({
            pathColor: `var(--bs-primary)`,
            textColor: `var(--bs-primary)`,
            trailColor: `#e9ecef`,
            backgroundColor: `#f8f9fa`,
          })}
        />
      </div>
      <h2 className={`text-${tierColor} mb-1`}>{tier}</h2>
      <p className="lead text-muted">{tierDescription}</p>
    </div>
  );
};

export default ScoreSummary;
