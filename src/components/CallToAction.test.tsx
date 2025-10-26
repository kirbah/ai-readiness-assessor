import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CallToAction from "./CallToAction";
import ReactGA from "react-ga4";

vi.mock("react-ga4", async () => {
  const actual = await vi.importActual("react-ga4");
  return {
    ...actual,
    default: {
      ...actual,
      event: vi.fn(),
    },
  };
});

const mockCtaContent = {
  headline: "Test Headline",
  paragraph: "Test Paragraph",
  buttonText: "Test Button",
};

describe("CallToAction", () => {
  it("renders the headline, paragraph, and button", () => {
    render(
      <CallToAction
        tier="At Risk"
        ctaContent={mockCtaContent}
        shareableUrl="http://test.com"
      />
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Test Headline" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("cta-paragraph")).toHaveTextContent(
      "Test Paragraph"
    );
    expect(
      screen.getByRole("link", { name: "Test Button" })
    ).toBeInTheDocument();
  });

  it("constructs the calendlyUrl correctly with shareableUrl", () => {
    render(
      <CallToAction
        tier="At Risk"
        ctaContent={mockCtaContent}
        shareableUrl="http://test.com/results/123"
      />
    );

    const link = screen.getByRole("link", { name: "Test Button" });
    expect(link).toHaveAttribute(
      "href",
      "https://calendly.com/kiryl-bahdanau/ai-readiness?a3=http%3A%2F%2Ftest.com%2Fresults%2F123"
    );
  });

  it("constructs the calendlyUrl correctly without shareableUrl", () => {
    render(
      <CallToAction
        tier="At Risk"
        ctaContent={mockCtaContent}
        shareableUrl=""
      />
    );

    const link = screen.getByRole("link", { name: "Test Button" });
    expect(link).toHaveAttribute(
      "href",
      "https://calendly.com/kiryl-bahdanau/ai-readiness"
    );
  });

  it("tracks button click with ReactGA", async () => {
    const user = userEvent.setup();
    render(
      <CallToAction
        tier="At Risk"
        ctaContent={mockCtaContent}
        shareableUrl="http://test.com"
      />
    );

    const button = screen.getByRole("link", { name: "Test Button" });
    await user.click(button);

    expect(ReactGA.event).toHaveBeenCalledWith({
      category: "User",
      action: "Clicked Test Button",
      label: "At Risk",
    });
  });
});
