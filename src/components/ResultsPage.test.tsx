import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ResultsPage from "./ResultsPage";

const mockDefaultProps = {
  score: 10,
  total: 20,
  tier: "Building Foundation" as const,
  shareableUrl: "http://localhost:3000",
  onEditQuestion: vi.fn(),
  onRestart: vi.fn(),
};

describe("ResultsPage", () => {
  it("should call onRestart when the restart button is clicked", async () => {
    const user = userEvent.setup();
    const handleRestartMock = vi.fn();

    render(
      <ResultsPage
        {...mockDefaultProps}
        results={[]}
        onRestart={handleRestartMock}
      />
    );

    const restartButton = screen.getByRole("button", {
      name: /Restart Assessment/i,
    });
    await user.click(restartButton);

    expect(handleRestartMock).toHaveBeenCalledTimes(1);
  });
});
