import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import App from "./App";
import questionsData from "./data/questions.json";

// Mocking external dependencies
vi.mock("react-ga4");

describe("App", () => {
  // Mock scrollTo as it's not implemented in JSDOM
  const scrollToMock = vi.fn();
  beforeEach(() => {
    window.scrollTo = scrollToMock;
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should load state from localStorage and start on the correct question", async () => {
    // Arrange: Mock localStorage to simulate a user having answered the first 3 questions
    const partialAnswers = {
      "1": "1a", // Question ID 1, Answer 'a'
      "2": "2b", // Question ID 2, Answer 'b'
      "3": "3c", // Question ID 3, Answer 'c'
    };
    localStorage.setItem("aiAssessmentAnswers", JSON.stringify(partialAnswers));

    // Act: Render the App
    render(<App />);

    // Assert: The app should start on Question 4 (index 3)
    await waitFor(() => {
      expect(
        screen.getByText("Question 4 of 13", { exact: false })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(questionsData[3].question_text)
    ).toBeInTheDocument();

    // Ensure we are not on the results page
    expect(
      screen.queryByRole("heading", { name: /Your AI Readiness Report/i })
    ).not.toBeInTheDocument();
  });

  it("should load completed state from localStorage and show the results page immediately", async () => {
    // Arrange: Mock localStorage to simulate a user having answered all 10 questions
    const completeAnswers = questionsData.reduce(
      (acc, q) => {
        acc[q.id.toString()] = q.answers[0].id; // Answer the first option for every question
        return acc;
      },
      {} as Record<string, string>
    );

    localStorage.setItem(
      "aiAssessmentAnswers",
      JSON.stringify(completeAnswers)
    );

    // Act: Render the App
    render(<App />);

    // Assert: The results page should be displayed immediately
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Your AI Readiness Report/i })
      ).toBeInTheDocument();
    });

    // Ensure no question card is rendered
    expect(screen.queryByText(/Question \d+ of \d+/)).not.toBeInTheDocument();
  });
});
