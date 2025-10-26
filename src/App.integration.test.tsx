import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ReactGA from "react-ga4";
import App from "./App";
import questionsData from "./data/questions.json";

// Mocking external dependencies
vi.mock("react-ga4");

// Mocking window.location
const originalLocation = window.location;

const mockLocation = (search: string) => {
  Object.defineProperty(window, "location", {
    writable: true,
    value: {
      ...originalLocation,
      search: search,
      href: `http://localhost:3000/${search}`,
      origin: "http://localhost:3000",
      pathname: "/",
    },
  });
};

const mockReplaceState = vi.fn();
Object.defineProperty(window, "history", {
  writable: true,
  value: {
    ...window.history,
    replaceState: mockReplaceState,
  },
});

describe("App Integration Tests", () => {
  const scrollToMock = vi.fn();

  // Helper function to complete the assessment
  const completeAssessment = async (
    user: ReturnType<typeof userEvent.setup>
  ) => {
    // Ensure the assessment starts by clicking the button if the landing page is present
    const startButton = screen.queryByRole("button", {
      name: /Start the Free Assessment/i,
    });
    if (startButton) {
      await user.click(startButton);
    }

    for (const question of questionsData) {
      await waitFor(() =>
        expect(screen.getByText(question.question_text)).toBeInTheDocument()
      );
      // Select the FIRST answer for every question (score: 2)
      const answerOptions = screen.getAllByRole("radio");
      await user.click(answerOptions[0]);
    }
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Your AI Readiness Report/i })
      ).toBeInTheDocument();
    });
  };

  beforeEach(() => {
    window.scrollTo = scrollToMock;
    localStorage.clear();
    vi.clearAllMocks();
    mockLocation(""); // Reset URL search params for each test
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  describe("URL and State Loading Scenarios", () => {
    it("should show an error and start a fresh assessment if URL parameters are invalid", async () => {
      // Arrange: Set URL with an invalid answer ID for a valid question
      mockLocation("?q1=invalid-answer");

      // Act
      render(<App />);

      // Assert: An error message should be displayed
      await waitFor(() => {
        expect(
          screen.getByText(
            "The assessment link contains invalid data. Starting a new evaluation."
          )
        ).toBeInTheDocument();
      });

      // The app should have started from the beginning
      expect(
        screen.getByText("Question 1 of 10", { exact: false })
      ).toBeInTheDocument();

      // And the invalid URL should be cleared
      expect(mockReplaceState).toHaveBeenCalledWith(
        {},
        document.title,
        window.location.pathname
      );
    });

    it("should load partial answers from URL and go to the first unanswered question", async () => {
      // Arrange: Set URL with answers for Q1 and Q3, leaving Q2 unanswered
      mockLocation("?q1=1a&q3=3b");

      // Act
      render(<App />);

      // Assert: An informational message should be displayed
      await waitFor(() => {
        expect(
          screen.getByText(
            "The assessment link is incomplete. Please complete the remaining questions."
          )
        ).toBeInTheDocument();
      });

      // The app should navigate to the first unanswered question (Question 2)
      expect(
        screen.getByText("Question 2 of 10", { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(questionsData[1].question_text)
      ).toBeInTheDocument();
    });

    it("should load a complete assessment from URL with a filter and go directly to the results page", async () => {
      // Arrange: Create a URL with all answers and a filter parameter
      const allAnswers = questionsData.reduce(
        (acc, q) => {
          acc[`q${q.id}`] = q.answers[0].id;
          return acc;
        },
        {} as Record<string, string>
      );

      const params = new URLSearchParams({
        ...allAnswers,
        filter: "critical",
      }).toString();
      mockLocation(`?${params}`);

      // Act
      render(<App />);

      // Assert: The results page should be displayed
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /Your AI Readiness Report/i })
        ).toBeInTheDocument();
      });

      // And the 'Critical' filter button should be active
      const criticalFilterButton = await screen.findByRole("tab", {
        name: /Critical \(\d+\)/,
      });
      expect(criticalFilterButton).toHaveClass("active");
    });
  });

  describe("User Interaction and Navigation Scenarios", () => {
    it("should allow user to change their answer from the results page and see the score update", async () => {
      const user = userEvent.setup();
      render(<App />);

      // Arrange: Complete the assessment to get to the results page
      await completeAssessment(user);

      // Assert: We are on the results page with the initial score
      expect(screen.getByText("20/20")).toBeInTheDocument(); // 10 questions * 2 score
      expect(screen.getByText("Well-Positioned")).toBeInTheDocument();

      // Act: Click "Change My Answer" for the first question
      const changeButtons = screen.getAllByLabelText(
        /Change answer for Question/i
      );
      await user.click(changeButtons[0]);

      // Assert: We are back on the first question card
      await waitFor(() => {
        expect(
          screen.getByText(questionsData[0].question_text)
        ).toBeInTheDocument();
      });

      // Act: Select the THIRD answer (score: 0)
      const thirdAnswerText = "Ad-hoc / Not Formally Designed";
      const thirdAnswerElement = screen
        .getByText(thirdAnswerText)
        .closest("li");
      if (!thirdAnswerElement) {
        throw new Error(
          `Could not find answer element with text: ${thirdAnswerText}`
        );
      }
      await user.click(thirdAnswerElement);

      // Assert: The app should immediately return to the results page with the updated score
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /Your AI Readiness Report/i })
        ).toBeInTheDocument();
      });
      expect(screen.getByText("18/20")).toBeInTheDocument(); // (9 * 2) + 0 = 18
      expect(screen.getByText("Well-Positioned")).toBeInTheDocument(); // Tier remains the same
    });

    it('should navigate to the previous question using the "Previous" button', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Click the "Start the Free Assessment" button on the landing page
      const startButton = screen.getByRole("button", {
        name: /Start the Free Assessment/i,
      });
      await user.click(startButton);

      // Answer first question to enable "Previous" button on the next one
      const firstAnswer = screen.getAllByRole("radio")[0];
      await user.click(firstAnswer);

      // We are on question 2
      await waitFor(() => {
        expect(screen.getByText(/Question 2 of 10/i)).toBeInTheDocument();
      });

      // Click "Previous"
      const previousButton = screen.getByRole("button", { name: /Previous/i });
      await user.click(previousButton);

      // We should be back on question 1
      await waitFor(() => {
        expect(screen.getByText(/Question 1 of 10/i)).toBeInTheDocument();
      });
      // And the original answer should still be selected
      const selectedAnswer = screen.getAllByRole("radio")[0];
      expect(selectedAnswer).toBeChecked();
    });

    it("should restart the assessment from the results page", async () => {
      const user = userEvent.setup();
      render(<App />);

      // Go to results page first
      await completeAssessment(user);

      // Click restart
      const restartButton = screen.getByRole("button", {
        name: /Restart Assessment/i,
      });
      await user.click(restartButton);

      // Should be back to question 1
      await waitFor(() => {
        expect(screen.getByText(/Question 1 of 10/i)).toBeInTheDocument();
      });

      // Local storage should be cleared
      expect(localStorage.getItem("aiAssessmentAnswers")).toBeNull();

      // Check GA event
      expect(ReactGA.event).toHaveBeenCalledWith({
        category: "User",
        action: "Clicked Restart Assessment",
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle corrupted data in localStorage gracefully", async () => {
      // Arrange: Put malformed JSON into localStorage
      localStorage.setItem("aiAssessmentAnswers", "{'invalid-json':}");

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      render(<App />);

      // Assert: The app should not crash and should start a fresh assessment
      await waitFor(() => {
        expect(
          screen.getByText("Question 1 of 10", { exact: false })
        ).toBeInTheDocument();
      });

      // It should have logged the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to parse saved answers:",
        expect.any(Error)
      );

      // And it should have cleared the corrupted item from localStorage
      expect(localStorage.getItem("aiAssessmentAnswers")).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Analytics and Cookie Consent", () => {
    it("should initialize Google Analytics only after cookie consent is given", async () => {
      const user = userEvent.setup();
      // Arrange
      render(<App />);

      // Assert: GA should not be initialized on first render
      expect(ReactGA.initialize).not.toHaveBeenCalled();

      // Act: Find and click the cookie consent button
      const consentButton = screen.getByText(/I understand/i, {
        selector: "button",
      });
      await user.click(consentButton);

      // Assert: GA should be initialized now
      await waitFor(() => {
        expect(ReactGA.initialize).toHaveBeenCalledWith("G-6BMVBWLY6L");
      });
      expect(ReactGA.initialize).toHaveBeenCalledTimes(1);
    });
  });
});
