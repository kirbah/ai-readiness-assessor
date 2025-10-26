import React, { useState } from "react";
import ReactGA from "react-ga4";

interface Props {
  shareableUrl: string;
}

const ShareResults: React.FC<Props> = ({ shareableUrl }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl || window.location.href);
      setIsCopied(true);
      ReactGA.event({
        category: "User",
        action: "Copied Shareable URL",
      });
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="text-center mt-5">
      <h4 className="mb-3">Share Your Results</h4>
      <div
        className="input-group mb-3"
        style={{ maxWidth: "500px", margin: "0 auto" }}
      >
        <input
          type="text"
          className="form-control readonly-url-input"
          value={shareableUrl || window.location.href}
          readOnly
          aria-label="Shareable results URL"
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={handleCopyToClipboard}
          aria-label="Copy share link"
        >
          <i className="bi bi-copy"></i> {isCopied ? "Copied!" : "Copy Link"}
        </button>
      </div>
      <small className="text-muted">
        Anyone with this link can see your AI readiness assessment results
      </small>
    </div>
  );
};

export default ShareResults;
