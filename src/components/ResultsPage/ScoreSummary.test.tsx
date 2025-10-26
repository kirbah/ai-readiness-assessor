import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ScoreSummary from "./ScoreSummary";

describe("ScoreSummary", () => {
  it("renders the score, total, tier, and description", () => {
    render(
      <ScoreSummary
        score={15}
        total={20}
        tier="Well-Positioned"
        tierDescription="You have a strong foundation."
        tierColor="success"
      />
    );

    expect(screen.getByText("15/20")).toBeInTheDocument();
    expect(screen.getByText("Well-Positioned")).toBeInTheDocument();
    expect(
      screen.getByText("You have a strong foundation.")
    ).toBeInTheDocument();
  });

  it("applies the correct tier color class", () => {
    render(
      <ScoreSummary
        score={5}
        total={20}
        tier="At Risk"
        tierDescription="Critical gaps."
        tierColor="danger"
      />
    );

    expect(screen.getByText("At Risk")).toHaveClass("text-danger");
  });
});
