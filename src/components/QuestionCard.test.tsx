import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import QuestionCard from "./QuestionCard";
import { Question } from "../types";
import questionsData from "../data/questions.json";

// Mock data for a single question
const mockQuestion: Question = questionsData[0];

describe("QuestionCard", () => {
  it('should have a disabled "Next" button when no answer is selected, and enable it after selection', async () => {
    const user = userEvent.setup();
    const onAnswerSelectMock = vi.fn();

    // Render the component without an answer selected
    const { rerender } = render(
      <QuestionCard
        question={mockQuestion}
        onAnswerSelect={onAnswerSelectMock}
        onNext={() => {}}
        onPrevious={() => {}}
        userAnswer={null}
      />
    );

    // Assert the "Next" button is disabled
    const nextButton = screen.getByRole("button", { name: /Next/i });
    expect(nextButton).toBeDisabled();

    // Simulate selecting an answer by clicking the first option
    const firstAnswerOption = screen.getAllByRole("radio")[0];
    await user.click(firstAnswerOption);

    // Check that the onAnswerSelect callback was called
    expect(onAnswerSelectMock).toHaveBeenCalledWith(mockQuestion.answers[0].id);

    // To check if the button becomes enabled, we need to simulate the parent component's state update
    // We re-render the component with the new `userAnswer` prop
    rerender(
      <QuestionCard
        question={mockQuestion}
        onAnswerSelect={onAnswerSelectMock}
        onNext={() => {}}
        onPrevious={() => {}}
        userAnswer={mockQuestion.answers[0].id} // Pass the selected answer
      />
    );

    // Assert the "Next" button is now enabled
    expect(nextButton).toBeEnabled();
  });

  it('should not show the "Previous" button for the first question', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        onAnswerSelect={() => {}}
        onNext={() => {}}
        onPrevious={() => {}}
        userAnswer={null}
        showPrevious={false} // Explicitly set to false
      />
    );

    // Assert the "Previous" button is not in the document
    const previousButton = screen.queryByRole("button", { name: /Previous/i });
    expect(previousButton).not.toBeInTheDocument();
  });

  it('should show the "Previous" button when showPrevious is true and call onPrevious when clicked', async () => {
    const user = userEvent.setup();
    const onPreviousMock = vi.fn();

    render(
      <QuestionCard
        question={questionsData[1]} // A question other than the first
        onAnswerSelect={() => {}}
        onNext={() => {}}
        onPrevious={onPreviousMock}
        userAnswer={null}
        showPrevious={true}
      />
    );

    // Assert the "Previous" button is visible
    const previousButton = screen.getByRole("button", { name: /Previous/i });
    expect(previousButton).toBeInTheDocument();

    // Act: Click the button
    await user.click(previousButton);

    // Assert: The mock function was called
    expect(onPreviousMock).toHaveBeenCalledTimes(1);
  });
});
