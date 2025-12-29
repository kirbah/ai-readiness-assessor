import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
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

describe("Browser Navigation (Back/Forward) Event Handling", () => {
  setupTests();

  it("should ignore popstate events until the initial URL is processed", async () => {
    // Arrange: Set up a URL, but don't process it yet.
    mockLocation("?q1=1a");
    const { rerender } = render(<App />);

    // Act: Fire a popstate event BEFORE the app has processed the initial URL.
    // We can't directly control the 'initialUrlProcessed' state, so we'll
    // rely on the fact it's false on the very first render.
    act(() => {
      fireEvent(window, new PopStateEvent("popstate"));
    });

    // Let the app process the initial URL by re-rendering
    rerender(<App />);

    // Assert: The app should be on Question 2, as determined by the initial URL,
    // not by the popstate event.
    await waitFor(() => {
      expect(
        screen.getByText(questionsData[1].question_text)
      ).toBeInTheDocument();
    });
  });

  it("should show the results page when navigating back to a results URL", async () => {
    // Arrange: Start the app and complete the assessment to get to the results page.
    render(<App />);
    fireEvent.click(screen.getByText("Start the Free Assessment"));

    // Answer all questions
    for (const q of questionsData) {
      const firstAnswer = q.answers[0];
      fireEvent.click(screen.getByText(firstAnswer.answer_text));
      // The last question will automatically go to the results page.
      if (q.id !== questionsData[questionsData.length - 1].id) {
        await screen.findByText(
          `Question ${q.id + 1} of ${questionsData.length}`
        );
      }
    }

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Your AI Readiness Report/i })
      ).toBeInTheDocument();
    });

    // Act 1: Edit an answer
    const accordionButton = screen.getAllByRole("button", {
      name: /Question 1:/i,
    })[0];
    fireEvent.click(accordionButton);
    const editButton = screen.getAllByText("Change My Answer")[0];
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(
        screen.getByText(questionsData[0].question_text)
      ).toBeInTheDocument();
    });

    // Act 2: Simulate Browser Back Button
    act(() => {
      // FIX: Manually update the mock location because pushState mock won't do it
      mockLocation("?results=true");
      fireEvent(window, new PopStateEvent("popstate"));
    });

    // Assert
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Your AI Readiness Report/i })
      ).toBeInTheDocument();
    });
  });

  it("should return to the landing page when navigating back to the root URL", async () => {
    // Arrange: Start the assessment.
    render(<App />);
    fireEvent.click(screen.getByText("Start the Free Assessment"));
    await waitFor(() => {
      expect(
        screen.getByText("Question 1 of 13", { exact: false })
      ).toBeInTheDocument();
    });

    // Act: Simulate Browser Back Button to Root
    act(() => {
      // FIX: Manually update the mock location to root
      mockLocation("");
      fireEvent(window, new PopStateEvent("popstate"));
    });

    // Assert
    await waitFor(() => {
      // FIX: Update text to match actual LandingPage content
      expect(
        screen.getByRole("heading", {
          name: /Is your AI strategy built on a solid engineering foundation/i,
        })
      ).toBeInTheDocument();
    });
  });
});
