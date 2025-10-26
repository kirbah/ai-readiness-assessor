import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import DetailedResults from "./DetailedResults";
import { Result } from "../../types";

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

describe("DetailedResults", () => {
  it("renders the detailed assessment heading", () => {
    render(<DetailedResults results={[]} onEditQuestion={vi.fn()} />);
    expect(
      screen.getByRole("heading", { name: /Detailed Assessment/i })
    ).toBeInTheDocument();
  });

  it("displays 'No results match' when filtered results are empty", () => {
    render(<DetailedResults results={[]} onEditQuestion={vi.fn()} />);
    expect(
      screen.getByText(/No results match the selected filter./i)
    ).toBeInTheDocument();
  });

  it("should filter results correctly when filter buttons are clicked", async () => {
    const user = userEvent.setup();
    const onEditQuestionMock = vi.fn();

    render(
      <DetailedResults
        results={mockResults}
        onEditQuestion={onEditQuestionMock}
      />
    );

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

  it("calls onEditQuestion when 'Change My Answer' button is clicked", async () => {
    const user = userEvent.setup();
    const onEditQuestionMock = vi.fn();

    render(
      <DetailedResults
        results={mockResults}
        onEditQuestion={onEditQuestionMock}
      />
    );

    // Expand the first accordion item to make the button visible
    const firstAccordionButton = screen.getByRole("button", {
      name: /Question 1: Critical Question 1 Your Answer: A/i,
    });
    await user.click(firstAccordionButton);

    const changeAnswerButton = await screen.findByRole("button", {
      name: /Change answer for Question 1/i,
    });
    await user.click(changeAnswerButton);

    expect(onEditQuestionMock).toHaveBeenCalledTimes(1);
    expect(onEditQuestionMock).toHaveBeenCalledWith(mockResults[0].question);
  });
});
