import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("framer-motion", async () => {
  const React = await vi.importActual("react");
  const actual = await vi.importActual("framer-motion");

  return {
    __esModule: true,
    ...actual,
    AnimatePresence: ({ children }) => children,
    motion: new Proxy(actual.motion, {
      get: (target, key) => {
        const component = target[key];
        if (typeof component === "function") {
          return React.forwardRef((props, ref) => {
            const { ...rest } = props;
            return React.createElement(component, { ...rest, ref });
          });
        }
        return component;
      },
    }),
    animate: vi.fn((from, to, options) => {
      if (options && typeof options.onUpdate === "function") {
        options.onUpdate(to);
      }
      if (options && typeof options.onComplete === "function") {
        options.onComplete();
      }
      return { stop: vi.fn() };
    }),
  };
});
