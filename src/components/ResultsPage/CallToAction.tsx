import React from "react";
import ReactGA from "react-ga4";

type Tier = "At Risk" | "Building Foundation" | "Well-Positioned";

interface CtaContent {
  headline: string;
  paragraph: string;
  buttonText: string;
}

interface Props {
  tier: Tier;
  ctaContent: CtaContent;
  shareableUrl: string;
}

const CallToAction: React.FC<Props> = ({ tier, ctaContent, shareableUrl }) => {
  const calendlyUrl = shareableUrl
    ? `https://calendly.com/kiryl-bahdanau/ai-readiness?a3=${encodeURIComponent(
        shareableUrl
      )}`
    : "https://calendly.com/kiryl-bahdanau/ai-readiness";

  return (
    <div className="cta-block mb-5">
      <h3 className="mb-3">{ctaContent.headline}</h3>
      <p
        data-testid="cta-paragraph"
        className="mb-4"
        dangerouslySetInnerHTML={{
          __html: ctaContent.paragraph,
        }}
      ></p>
      <a
        href={calendlyUrl}
        className="btn btn-primary btn-lg"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          ReactGA.event({
            category: "User",
            action: `Clicked ${ctaContent.buttonText}`,
            label: tier,
          });
        }}
      >
        <i className="bi bi-calendar3 me-2"></i>
        {ctaContent.buttonText}
      </a>
    </div>
  );
};

export default CallToAction;
