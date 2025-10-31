import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
const mockPushState = vi.fn();
Object.defineProperty(window, "history", {
  writable: true,
  value: {
    ...window.history,
    replaceState: mockReplaceState,
    pushState: mockPushState,
  },
});

describe("App Results Page Tests", () => {
  const scrollToMock = vi.fn();

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

  describe("Results Page Conditional Logic", () => {
    const testData = [
      {
        tier: "At Risk",
        answersToGive: {
          "1": "1c",
          "2": "2c",
          "3": "3c",
          "4": "4c",
          "5": "5c",
          "6": "6c",
          "7": "7c",
          "8": "8c",
          "9": "9c",
          "10": "10c",
        }, // Score: 0
        expectedTierText: "At Risk",
        expectedColorClass: "text-danger",
        expectedDescription:
          "Your readiness level indicates critical gaps that pose a high risk of project failure.",
        expectedCtaButtonText: "Schedule Your De-Risking Call",
      },
      {
        tier: "Building Foundation",
        answersToGive: {
          "1": "1a",
          "2": "2b",
          "3": "3b",
          "4": "4a",
          "5": "5b",
          "6": "6a",
          "7": "7b",
          "8": "8a",
          "9": "9b",
          "10": "10c",
        }, // Score: 2+1+1+2+1+2+1+2+1+0 = 13
        expectedTierText: "Building Foundation",
        expectedColorClass: "text-warning",
        expectedDescription:
          "You have some foundational elements in place but also significant gaps to address.",
        expectedCtaButtonText: "Book an Acceleration Session",
      },
      {
        tier: "Well-Positioned",
        answersToGive: {
          "1": "1a",
          "2": "2a",
          "3": "3a",
          "4": "4a",
          "5": "5a",
          "6": "6a",
          "7": "7a",
          "8": "8a",
          "9": "9a",
          "10": "10a",
        }, // Score: 20
        expectedTierText: "Well-Positioned",
        expectedColorClass: "text-success",
        expectedDescription:
          "You have a strong foundation and can proceed with new AI initiatives with a higher degree of confidence.",
        expectedCtaButtonText: "Book a Strategic Review",
      },
    ];

    it.each(testData)(
      "should display the correct content for the $tier tier",
      async ({
        answersToGive,
        expectedTierText,
        expectedColorClass,
        expectedDescription,
        expectedCtaButtonText,
      }) => {
        const user = userEvent.setup();
        render(<App />);

        // 1. Arrange: Start assessment and give specific answers to achieve the target score
        const startButton = screen.getByRole("button", {
          name: /Start the Free Assessment/i,
        });
        await user.click(startButton);

        for (const question of questionsData) {
          await waitFor(() =>
            expect(screen.getByText(question.question_text)).toBeInTheDocument()
          );

          const answerIdToSelect =
            answersToGive[question.id.toString()] ?? question.answers[0].id;

          const answer = question.answers.find(
            (a) => a.id === answerIdToSelect
          );
          if (!answer)
            throw new Error(
              `Answer ${answerIdToSelect} not found for question ${question.id}`
            );

          const answerElement = screen.getByText(answer.answer_text);
          const answerListItem = answerElement.closest("li");
          if (!answerListItem)
            throw new Error(
              `Could not find list item for answer: ${answer.answer_text}`
            );

          await user.click(answerListItem);
        }

        // 2. Assert: Verify all conditional content on the results page
        await waitFor(() => {
          expect(
            screen.getByRole("heading", { name: /Your AI Readiness Report/i })
          ).toBeInTheDocument();
        });

        // Assert tier title and color
        const tierTitleElement = screen.getByText(expectedTierText);
        expect(tierTitleElement).toBeInTheDocument();
        expect(tierTitleElement).toHaveClass(expectedColorClass);

        // Assert description
        expect(screen.getByText(expectedDescription)).toBeInTheDocument();

        // Assert CTA button text
        const ctaElement = screen.getByText(expectedCtaButtonText);
        expect(ctaElement).toBeInTheDocument();
      }
    );
  });
});
