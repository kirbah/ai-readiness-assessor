import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ResultsPage from "./ResultsPage";

describe("ResultsPage", () => {
  it("should call onRestart when the restart button is clicked", async () => {
    // Arrange: Create a mock function to track calls
    const handleRestartMock = vi.fn();
    const user = userEvent.setup();

    render(
      <ResultsPage
        score={15}
        total={20}
        tier="Well-Positioned"
        results={[]}
        shareableUrl=""
        initialFilter="all"
        onFilterChange={() => {}}
        onEditQuestion={() => {}}
        onRestart={handleRestartMock} // Pass the mock function as a prop
      />
    );

    // Act: Find the button by its accessible name and simulate a click
    const restartButton = screen.getByRole("button", {
      name: /Restart Assessment/i,
    });
    await user.click(restartButton);

    // Assert: Check if our mock function was called exactly once
    expect(handleRestartMock).toHaveBeenCalledTimes(1);
  });
});
