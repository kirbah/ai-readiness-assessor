import { beforeEach, vi, expect, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import questionsData from "../data/questions.json";

// Mocking window.location
const originalLocation = window.location;

export const mockLocation = (search: string) => {
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

export const mockReplaceState = vi.fn();
export const mockPushState = vi.fn();
Object.defineProperty(window, "history", {
  writable: true,
  value: {
    ...window.history,
    replaceState: mockReplaceState,
    pushState: mockPushState,
  },
});

export const setupUser = () => userEvent.setup({ delay: null });

// Helper function to complete the assessment
export const completeAssessment = async (
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

export const setupTests = () => {
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
};
