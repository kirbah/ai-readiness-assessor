import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import LandingPage from "./LandingPage";

describe("LandingPage", () => {
  it("should render the main heading and subheading", () => {
    const onStartMock = vi.fn();
    render(<LandingPage onStart={onStartMock} />);

    expect(
      screen.getByRole("heading", {
        name: /Is your AI strategy built on a solid engineering foundation, or is it a multi-million dollar "science project" waiting to fail?/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /In under 5 minutes, diagnose the critical risks in your data, team, and production strategy to secure your roadmap and prevent costly delays./i
      )
    ).toBeInTheDocument();
  });

  it("should render all four pillar sections", () => {
    const onStartMock = vi.fn();
    render(<LandingPage onStart={onStartMock} />);

    expect(screen.getByText(/Data & Infrastructure/i)).toBeInTheDocument();
    expect(screen.getByText(/Team & Talent/i)).toBeInTheDocument();
    expect(
      screen.getByText(/MLOps & Production Readiness/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Business Value & Strategy/i)).toBeInTheDocument();
  });

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
