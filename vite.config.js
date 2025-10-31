// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this 'base' property for GitHub Pages
  base: "/ai-readiness-assessor/",
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    testTimeout: 10000,
    coverage: {
      provider: "v8", // or 'istanbul'
      reporter: ["text", "lcov"], // Change to lcov for Codecov
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/setupTests.ts",
        "src/types.ts",
        "**/*.test.tsx",
      ],
      // Optional: Set coverage thresholds
      // lines: 80,
      // functions: 80,
      // branches: 80,
      // statements: 80,
    },
  },
});
