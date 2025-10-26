import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ShareResults from "./ShareResults";
import ReactGA from "react-ga4";

vi.mock("react-ga4", () => {
  return {
    __esModule: true,
    default: {
      event: vi.fn(),
    },
  };
});

describe("ShareResults", () => {
  let mockWriteText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Initialize mockWriteText here, but spy on clipboard within the test where userEvent.setup() is called
    mockWriteText = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the shareable URL input and copy button", () => {
    const shareableUrl = "http://test.com/share/123";
    render(<ShareResults shareableUrl={shareableUrl} />);

    const input = screen.getByRole("textbox", {
      name: /Shareable results URL/i,
    });
    expect(input).toHaveValue(shareableUrl);
    expect(input).toHaveAttribute("readOnly");

    expect(
      screen.getByRole("button", { name: /Copy share link/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Share Your Results/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Anyone with this link can see your AI readiness assessment results/i
      )
    ).toBeInTheDocument();
  });

  it("copies the shareable URL to clipboard and shows 'Copied!' feedback", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockImplementation(
      mockWriteText
    ); // Spy after userEvent.setup()
    const shareableUrl = "http://test.com/share/123";
    render(<ShareResults shareableUrl={shareableUrl} />);

    const copyButton = screen.getByRole("button", { name: /Copy share link/i });
    await user.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledTimes(1);
    expect(mockWriteText).toHaveBeenCalledWith(shareableUrl);

    await waitFor(() => {
      expect(copyButton).toHaveTextContent("Copied!");
    });

    // After timeout, it should revert to "Copy Link"
    await waitFor(
      () => {
        expect(copyButton).toHaveTextContent("Copy Link");
      },
      { timeout: 3000 }
    );
  });

  it("tracks copy event with ReactGA", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockImplementation(
      mockWriteText
    ); // Spy after userEvent.setup()
    const shareableUrl = "http://test.com/share/123";
    render(<ShareResults shareableUrl={shareableUrl} />);

    const copyButton = screen.getByRole("button", { name: /Copy share link/i });
    await user.click(copyButton);

    expect(ReactGA.event).toHaveBeenCalledWith({
      category: "User",
      action: "Copied Shareable URL",
    });
  });

  it("uses window.location.href if shareableUrl is empty", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockImplementation(
      mockWriteText
    ); // Spy after userEvent.setup()
    // Mock window.location.href
    Object.defineProperty(window, "location", {
      value: {
        href: "http://mock-window-location.com",
      },
      writable: true,
    });

    render(<ShareResults shareableUrl="" />);

    const input = screen.getByRole("textbox", {
      name: /Shareable results URL/i,
    });
    expect(input).toHaveValue("http://mock-window-location.com");

    const copyButton = screen.getByRole("button", { name: /Copy share link/i });
    await user.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith(
      "http://mock-window-location.com"
    );
  });
});
