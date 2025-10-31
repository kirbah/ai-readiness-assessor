import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import App from "./App";
import questionsData from "./data/questions.json";
import { setupTests } from "./utils/testUtils";

describe("App Edit Mode Tests", () => {
  setupTests();

  describe("Edit Mode Navigation", () => {
    it("should return to the results page immediately when clicking 'Next' in edit mode", async () => {
      const user = userEvent.setup();
      render(<App />);

      // 1. ARRANGE: Complete the assessment to get to the results page
      const startButton = screen.getByRole("button", {
        name: /Start the Free Assessment/i,
      });
      await user.click(startButton);

      for (const question of questionsData) {
        await waitFor(() =>
          expect(screen.getByText(question.question_text)).toBeInTheDocument()
        );
        // Select the first answer for every question
        const answerOptions = screen.getAllByRole("radio");
        await user.click(answerOptions[0]);
      }

      // We are now on the results page
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /Your AI Readiness Report/i })
        ).toBeInTheDocument();
      });

      // 2. ARRANGE: Enter "edit mode" by clicking "Change My Answer" for an early question (e.g., Question 2)
      const questionToEdit = questionsData[1]; // Question 2
      const accordionButton = screen.getByRole("button", {
        name: new RegExp(
          `Question ${questionToEdit.id}: ${questionToEdit.question_text}`
        ),
      });
      await user.click(accordionButton);

      const changeButton = await screen.findByLabelText(
        `Change answer for Question ${questionToEdit.id}`
      );
      await user.click(changeButton);

      // Assert we are on the correct question card and in edit mode
      await waitFor(() => {
        expect(
          screen.getByText(questionToEdit.question_text)
        ).toBeInTheDocument();
      });
      // The previously selected answer should still be checked, so the "Next" button is enabled
      const nextButton = screen.getByRole("button", { name: /Next/i });
      expect(nextButton).toBeEnabled();

      // 3. ACT: Click the "Next" button without changing the answer
      await user.click(nextButton);

      // 4. ASSERT: The app should immediately return to the results page, NOT go to Question 3
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /Your AI Readiness Report/i })
        ).toBeInTheDocument();
      });

      // Also, assert that we are NOT on the next question
      const nextQuestion = questionsData[2]; // Question 3
      expect(
        screen.queryByText(nextQuestion.question_text)
      ).not.toBeInTheDocument();
    });
  });
});
