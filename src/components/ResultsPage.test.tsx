import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ResultsPage from "./ResultsPage";
import { Result } from "../types";

const mockDefaultProps = {
  score: 10,
  total: 20,
  tier: "Building Foundation" as const,
  shareableUrl: "http://localhost:3000",
  initialFilter: "all",
  onFilterChange: vi.fn(),
  onEditQuestion: vi.fn(),
  onRestart: vi.fn(),
};

describe("ResultsPage", () => {
  it("should call onRestart when the restart button is clicked", async () => {
    const user = userEvent.setup();
    const handleRestartMock = vi.fn();

    render(
      <ResultsPage
        {...mockDefaultProps}
        results={[]}
        onRestart={handleRestartMock}
      />
    );

    const restartButton = screen.getByRole("button", {
      name: /Restart Assessment/i,
    });
    await user.click(restartButton);

    expect(handleRestartMock).toHaveBeenCalledTimes(1);
  });

  it("should filter results correctly when filter buttons are clicked", async () => {
    const user = userEvent.setup();
    const mockResults: Result[] = [
      {
        question: 1,
        question_text: "Critical Question 1",
        selected_text: "A",
        score: 0,
        explanation: "",
        question_clarification: "",
        selected_clarification: "",
      },
      {
        question: 2,
        question_text: "Issue Question 1",
        selected_text: "B",
        score: 1,
        explanation: "",
        question_clarification: "",
        selected_clarification: "",
      },
      {
        question: 3,
        question_text: "Good Question 1",
        selected_text: "C",
        score: 2,
        explanation: "",
        question_clarification: "",
        selected_clarification: "",
      },
      {
        question: 4,
        question_text: "Critical Question 2",
        selected_text: "D",
        score: 0,
        explanation: "",
        question_clarification: "",
        selected_clarification: "",
      },
    ];

    render(<ResultsPage {...mockDefaultProps} results={mockResults} />);

    // Initial state: All results should be visible
    expect(screen.getByText(/Critical Question 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Issue Question 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Good Question 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical Question 2/i)).toBeInTheDocument();

    // Find and click the "Critical" filter button
    const criticalFilterButton = screen.getByRole("tab", { name: /Critical/i });
    expect(criticalFilterButton.textContent).toBe("Critical (2)"); // Check count
    await user.click(criticalFilterButton);

    // Assert only critical results are visible
    expect(screen.getByText(/Critical Question 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical Question 2/i)).toBeInTheDocument();
    expect(screen.queryByText(/Issue Question 1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Good Question 1/i)).not.toBeInTheDocument();

    // Find and click the "All" filter button
    const allFilterButton = screen.getByRole("tab", { name: /All/i });
    expect(allFilterButton.textContent).toBe("All (4)"); // Check count
    await user.click(allFilterButton);

    // Assert all results are visible again
    expect(screen.getByText(/Critical Question 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Issue Question 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Good Question 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical Question 2/i)).toBeInTheDocument();

    // Bonus: Check "Issues" filter
    const issuesFilterButton = screen.getByRole("tab", { name: /Issues/i });
    expect(issuesFilterButton.textContent).toBe("Issues (3)"); // Score <= 1
    await user.click(issuesFilterButton);

    expect(screen.getByText(/Critical Question 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Issue Question 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Good Question 1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Critical Question 2/i)).toBeInTheDocument();
  });

  describe("Dynamic CTA Content based on Tier", () => {
    it('should display correct content for "At Risk" tier', () => {
      render(<ResultsPage {...mockDefaultProps} tier="At Risk" results={[]} />);

      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Your Results Indicate Critical Risks\. Let's Build a Plan\./i,
        })
      ).toBeInTheDocument();
      const atRiskParagraph = screen.getByTestId("cta-paragraph");
      expect(atRiskParagraph.textContent).toContain(
        "This report highlights foundational risks that likely require immediate attention."
      );
      expect(atRiskParagraph.textContent).toContain(
        "Architectural Sounding Board"
      );
      expect(atRiskParagraph.textContent).toContain(
        "call to prioritize these issues and build a pragmatic plan to de-risk your AI roadmap."
      );
      expect(
        screen.getByRole("link", { name: /Schedule Your De-Risking Call/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Your readiness level indicates critical gaps/i)
      ).toBeInTheDocument();
    });

    it('should display correct content for "Building Foundation" tier', () => {
      render(
        <ResultsPage
          {...mockDefaultProps}
          tier="Building Foundation"
          results={[]}
        />
      );

      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /You Have a Strong Foundation\. Let's Accelerate Your Progress\./i,
        })
      ).toBeInTheDocument();
      const buildingFoundationParagraph = screen.getByTestId("cta-paragraph");
      expect(buildingFoundationParagraph.textContent).toContain(
        "You have the groundwork in place, but there are clear opportunities to optimize."
      );
      expect(buildingFoundationParagraph.textContent).toContain(
        "Architectural Sounding Board"
      );
      expect(buildingFoundationParagraph.textContent).toContain(
        "call to identify the highest-impact improvements that will accelerate your AI initiatives and ensure long-term success."
      );
      expect(
        screen.getByRole("link", { name: /Book an Acceleration Session/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/You have some foundational elements in place/i)
      ).toBeInTheDocument();
    });

    it('should display correct content for "Well-Positioned" tier', () => {
      render(
        <ResultsPage
          {...mockDefaultProps}
          tier="Well-Positioned"
          results={[]}
        />
      );

      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /You're Well-Positioned\. Let's Solidify Your Competitive Advantage\./i,
        })
      ).toBeInTheDocument();
      const wellPositionedParagraph = screen.getByTestId("cta-paragraph");
      expect(wellPositionedParagraph.textContent).toContain(
        "Your organization is ahead of the curve, which is a powerful position."
      );
      expect(wellPositionedParagraph.textContent).toContain(
        "Architectural Sounding Board"
      );
      expect(wellPositionedParagraph.textContent).toContain(
        "call to discuss advanced strategies and ensure your architecture is truly future-proof."
      );
      expect(
        screen.getByRole("link", { name: /Book a Strategic Review/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/You have a strong foundation and can proceed/i)
      ).toBeInTheDocument();
    });
  });
});
