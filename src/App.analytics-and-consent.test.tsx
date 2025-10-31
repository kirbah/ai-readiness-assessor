import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ReactGA from "react-ga4";
import App from "./App";
import { setupTests, setupUser } from "./utils/testUtils";

vi.mock("react-ga4");

describe("App Analytics and Cookie Consent Tests", () => {
  setupTests();

  describe("Analytics and Cookie Consent", () => {
    it("should initialize Google Analytics only after cookie consent is given", async () => {
      const user = setupUser();
      // Arrange
      render(<App />);

      // Assert: GA should not be initialized on first render
      expect(ReactGA.initialize).not.toHaveBeenCalled();

      // Act: Find and click the cookie consent button
      const consentButton = screen.getByText(/I understand/i, {
        selector: "button",
      });
      await user.click(consentButton);

      // Assert: GA should be initialized now
      await waitFor(() => {
        expect(ReactGA.initialize).toHaveBeenCalledWith("G-6BMVBWLY6L");
      });
      expect(ReactGA.initialize).toHaveBeenCalledTimes(1);
    });
  });
});
