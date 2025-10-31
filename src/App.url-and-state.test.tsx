import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";
import { setupTests, mockLocation, mockReplaceState } from "./utils/testUtils";
import questionsData from "./data/questions.json";

describe("App URL and State Loading Tests", () => {
  setupTests();

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
        screen.getByText("Question 1 of 13", { exact: false })
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
        screen.getByText("Question 2 of 13", { exact: false })
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
          screen.getByText("Question 1 of 13", { exact: false })
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
});
