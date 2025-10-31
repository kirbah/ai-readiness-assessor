import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import LandingPage from "./LandingPage";

describe("LandingPage", () => {
  it("should call onStart when the 'Start the Free Assessment' button is clicked", async () => {
    const user = userEvent.setup();
    const onStartMock = vi.fn();
    render(<LandingPage onStart={onStartMock} />);

    const startButton = screen.getByRole("button", {
      name: /Start the Free Assessment/i,
    });
    await user.click(startButton);

    expect(onStartMock).toHaveBeenCalledTimes(1);
  });
});
