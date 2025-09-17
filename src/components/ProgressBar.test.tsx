import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProgressBar from "./ProgressBar";

// A test suite for the ProgressBar component
describe("ProgressBar", () => {
  // Test case 1: Check if it renders the correct text for the current step
  it("should render the correct question progress text", () => {
    // Arrange: Set up the component with specific props
    render(<ProgressBar current={5} total={10} />);

    // Act & Assert: Check if the expected text is in the document
    // We use a regular expression to make the test more resilient to whitespace changes
    expect(screen.getByText(/Question 5 of 10/i)).toBeInTheDocument();
  });

  // Test case 2: Check accessibility attributes
  it("should have the correct ARIA attributes for accessibility", () => {
    // Arrange
    render(<ProgressBar current={3} total={10} />);

    // Act: Get the progress bar element by its accessibility role
    const progressBarElement = screen.getByRole("progressbar");

    // Assert: Verify that the ARIA attributes are calculated correctly
    expect(progressBarElement).toBeInTheDocument();
    expect(progressBarElement).toHaveAttribute("aria-valuenow", "30");
    expect(progressBarElement).toHaveAttribute(
      "aria-label",
      "Progress: 30% complete"
    );
  });
});
