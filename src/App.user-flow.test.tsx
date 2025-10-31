import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ReactGA from "react-ga4";
import App from "./App";
import questionsData from "./data/questions.json";
import { setupTests, completeAssessment, setupUser } from "./utils/testUtils";

vi.mock("react-ga4");

describe("App User Flow Tests", () => {
  setupTests();

  describe("User Interaction and Navigation Scenarios", () => {
    it("should allow user to change their answer from the results page and see the score update", async () => {
      const user = setupUser();
      render(<App />);

      // Arrange: Complete the assessment to get to the results page
      await completeAssessment(user);

      // Assert: We are on the results page with the initial score
      expect(screen.getByText("20/20")).toBeInTheDocument(); // 10 questions * 2 score
      expect(screen.getByText("Well-Positioned")).toBeInTheDocument();

      // Act: Click "Change My Answer" for the first question
      const accordionButtons = screen.getAllByRole("button", {
        name: /Question \d+: /i,
      });
      await user.click(accordionButtons[0]);

      const changeButton = await screen.findByLabelText(
        /Change answer for Question 1/i
      );
      await user.click(changeButton);

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
      const user = setupUser();
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
        expect(screen.getByText(/Question 2 of 13/i)).toBeInTheDocument();
      });

      // Click "Previous"
      const previousButton = screen.getByRole("button", { name: /Previous/i });
      await user.click(previousButton);

      // We should be back on question 1
      await waitFor(() => {
        expect(screen.getByText(/Question 1 of 13/i)).toBeInTheDocument();
      });
      // And the original answer should still be selected
      const selectedAnswer = screen.getAllByRole("radio")[0];
      expect(selectedAnswer).toBeChecked();
    });

    it("should restart the assessment from the results page", async () => {
      const user = setupUser();
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
        expect(screen.getByText(/Question 1 of 13/i)).toBeInTheDocument();
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

  describe("Contextual Questions Logic", () => {
    it("should not include contextual answers in the initial score calculation", async () => {
      const user = setupUser();
      render(<App />);

      // Act: Start assessment and answer all scorable questions for a perfect score
      const startButton = screen.getByRole("button", {
        name: /Start the Free Assessment/i,
      });
      await user.click(startButton);

      const scorableQuestions = questionsData.filter(
        (q) => q.type !== "contextual"
      );
      for (const question of scorableQuestions) {
        await waitFor(() =>
          expect(screen.getByText(question.question_text)).toBeInTheDocument()
        );
        const firstAnswer = screen.getAllByRole("radio")[0];
        await user.click(firstAnswer); // Assuming first answer gives max score
      }

      // Assert: We are now on the first contextual question
      await waitFor(() =>
        expect(
          screen.getByText(questionsData[10].question_text)
        ).toBeInTheDocument()
      );

      // Act: Answer all contextual questions
      const contextualQuestions = questionsData.filter(
        (q) => q.type === "contextual"
      );
      for (const question of contextualQuestions) {
        await waitFor(() =>
          expect(screen.getByText(question.question_text)).toBeInTheDocument()
        );
        const firstAnswer = screen.getAllByRole("radio")[0];
        await user.click(firstAnswer);
      }

      // Assert: The final score on the results page should only reflect the scorable questions
      await waitFor(() =>
        expect(
          screen.getByRole("heading", { name: /Your AI Readiness Report/i })
        ).toBeInTheDocument()
      );
      expect(screen.getByText("20/20")).toBeInTheDocument();
      expect(screen.getByText("Well-Positioned")).toBeInTheDocument();
    });

    it("should not change the score when a contextual answer is edited from the results page", async () => {
      const user = setupUser();
      render(<App />);

      // Arrange: Complete the entire assessment to get to the results page
      await completeAssessment(user);
      await waitFor(() =>
        expect(
          screen.getByRole("heading", { name: /Your AI Readiness Report/i })
        ).toBeInTheDocument()
      );
      expect(screen.getByText("20/20")).toBeInTheDocument(); // Verify initial state

      // Act: Find a contextual question (e.g., Question 11) and change the answer
      const accordionButtons = screen.getAllByRole("button", {
        name: /Question \d+:/i,
      });
      await user.click(accordionButtons[10]); // Open Question 11 accordion

      const changeButton = await screen.findByLabelText(
        /Change answer for Question 11/i
      );
      await user.click(changeButton);

      // Assert: We are taken back to the question card for Question 11
      await waitFor(() =>
        expect(
          screen.getByText(questionsData[10].question_text)
        ).toBeInTheDocument()
      );

      // Act: Select a *different* answer (the second option)
      const secondAnswer = screen.getAllByRole("radio")[1];
      await user.click(secondAnswer);

      // Assert: The app should return to the results page, and the score must remain unchanged
      await waitFor(() =>
        expect(
          screen.getByRole("heading", { name: /Your AI Readiness Report/i })
        ).toBeInTheDocument()
      );
      expect(screen.getByText("20/20")).toBeInTheDocument();
      expect(screen.getByText("Well-Positioned")).toBeInTheDocument();
    });
  });
});
