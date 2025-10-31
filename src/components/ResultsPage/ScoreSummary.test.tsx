import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ScoreSummary from "./ScoreSummary";

describe("ScoreSummary", () => {
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
