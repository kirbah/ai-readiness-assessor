import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import App from "./App";
import questionsData from "./data/questions.json";

// Mocking external dependencies
vi.mock("react-ga4");

describe("App Navigation Tests", () => {
  const scrollToMock = vi.fn();

  beforeEach(() => {
    window.scrollTo = scrollToMock;
    localStorage.clear();
    vi.clearAllMocks();
    // Reset history state for each test
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should handle browser back and forward navigation correctly", async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Arrange: Progress Through Several Questions
    const startButton = screen.getByRole("button", {
      name: /Start the Free Assessment/i,
    });
    await user.click(startButton);

    // Answer Question 1 (e.g., select the first option)
    await waitFor(() =>
      expect(
        screen.getByText(questionsData[0].question_text)
      ).toBeInTheDocument()
    );
    const q1Answers = screen.getAllByRole("radio");
    await user.click(q1Answers[0]);

    // You are now on Question 2
    await waitFor(() =>
      expect(
        screen.getByText(questionsData[1].question_text)
      ).toBeInTheDocument()
    );
    const q2Answers = screen.getAllByRole("radio");
    await user.click(q2Answers[1]);

    // You are now on Question 3
    await waitFor(() =>
      expect(
        screen.getByText(questionsData[2].question_text)
      ).toBeInTheDocument()
    );

    // 2. Act: Simulate Browser "Back" Button
    act(() => {
      window.history.back();
      // Manually dispatch popstate because JSDOM doesn't do it automatically
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    // 3. Assert: State After First "Back" Action
    await waitFor(() => {
      // The application should now display Question 2
      expect(
        screen.getByText("Question 2 of 13", { exact: false })
      ).toBeInTheDocument();
      // Crucially, verify that the second answer option for Question 2 is still selected
      const q2AnswerOptions = screen.getAllByRole("radio");
      expect(q2AnswerOptions[1]).toBeChecked();
    });

    // 4. Act: Simulate a Second "Back" Action
    act(() => {
      window.history.back();
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    // 5. Assert: State After Second "Back" Action
    await waitFor(() => {
      // The application should now display Question 1
      expect(
        screen.getByText("Question 1 of 13", { exact: false })
      ).toBeInTheDocument();
      // Verify that the first answer option for Question 1 is still selected
      const q1AnswerOptions = screen.getAllByRole("radio");
      expect(q1AnswerOptions[0]).toBeChecked();
    });

    // 6. Act: Simulate Browser "Forward" Button
    act(() => {
      window.history.forward();
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    // 7. Assert: State After "Forward" Action
    await waitFor(() => {
      // The application should return to displaying Question 2
      expect(
        screen.getByText("Question 2 of 13", { exact: false })
      ).toBeInTheDocument();
      // The second answer option should still be selected
      const q2AnswerOptions = screen.getAllByRole("radio");
      expect(q2AnswerOptions[1]).toBeChecked();
    });
  });
});
