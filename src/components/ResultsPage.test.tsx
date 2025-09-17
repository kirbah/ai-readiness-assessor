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
});
