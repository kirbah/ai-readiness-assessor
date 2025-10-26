import React from "react";
import { Result } from "../../types";
import ScoreSummary from "./ScoreSummary";
import CallToAction from "./CallToAction";
import DetailedResults from "./DetailedResults";
import ShareResults from "./ShareResults";

type Tier = "At Risk" | "Building Foundation" | "Well-Positioned";

interface CtaContent {
  headline: string;
  paragraph: string;
  buttonText: string;
}

interface TierConfigData {
  description: string;
  color: "success" | "warning" | "danger";
  cta: CtaContent;
}

const tierConfigs: Record<Tier, TierConfigData> = {
  "At Risk": {
    description:
      "Your readiness level indicates critical gaps that pose a high risk of project failure.",
    color: "danger",
    cta: {
      headline: "Your Results Indicate Critical Risks. Let's Build a Plan.",
      paragraph: `This report highlights foundational risks that likely require immediate attention. The next step is a complimentary <strong>Architectural Sounding Board</strong> call to prioritize these issues and build a pragmatic plan to de-risk your AI roadmap.`,
      buttonText: "Schedule Your De-Risking Call",
    },
  },
  "Building Foundation": {
    description:
      "You have some foundational elements in place but also significant gaps to address.",
    color: "warning",
    cta: {
      headline: "You Have a Strong Foundation. Let's Accelerate Your Progress.",
      paragraph: `You have the groundwork in place, but there are clear opportunities to optimize. The next step is a complimentary <strong>Architectural Sounding Board</strong> call to identify the highest-impact improvements that will accelerate your AI initiatives and ensure long-term success.`,
      buttonText: "Book an Acceleration Session",
    },
  },
  "Well-Positioned": {
    description:
      "You have a strong foundation and can proceed with new AI initiatives with a higher degree of confidence.",
    color: "success",
    cta: {
      headline:
        "You're Well-Positioned. Let's Solidify Your Competitive Advantage.",
      paragraph: `Your organization is ahead of the curve, which is a powerful position. To maintain and extend this advantage, the next step is a complimentary <strong>Architectural Sounding Board</strong> call to discuss advanced strategies and ensure your architecture is truly future-proof.`,
      buttonText: "Book a Strategic Review",
    },
  },
};

interface Props {
  score: number;
  total: number;
  tier: Tier;
  results: Result[];
  shareableUrl: string;
  onEditQuestion: (questionId: number) => void;
  onRestart: () => void;
  initialFilter?: string;
  onFilterChange?: (newFilter: string) => void;
}

const ResultsPage: React.FC<Props> = ({
  score,
  total,
  tier,
  results,
  shareableUrl,
  onEditQuestion,
  onRestart,
  initialFilter,
  onFilterChange,
}) => {
  const currentTierConfig = tierConfigs[tier];

  const handleRestart = () => {
    if (onRestart) {
      onRestart();
    }
  };

  return (
    <div className="mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header text-center">
              <h1 className="h3 mb-0">Your AI Readiness Report</h1>
            </div>
            <div className="card-body p-4">
              <ScoreSummary
                score={score}
                total={total}
                tier={tier}
                tierDescription={currentTierConfig.description}
                tierColor={currentTierConfig.color}
              />

              <CallToAction
                tier={tier}
                ctaContent={currentTierConfig.cta}
                shareableUrl={shareableUrl}
              />

              <DetailedResults
                results={results}
                onEditQuestion={onEditQuestion}
                initialFilter={initialFilter}
                onFilterChange={onFilterChange}
              />

              <ShareResults shareableUrl={shareableUrl} />

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
