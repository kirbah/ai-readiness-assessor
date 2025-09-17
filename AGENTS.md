# AGENTS.md for AI Readiness Assessor

This document provides instructions for an AI agent to effectively contribute to the AI Readiness Assessor project.

## Project Philosophy

1.  **Clarity and User Experience First:** The primary goal is to provide a clear, intuitive, and professional diagnostic tool for technology leaders. All UI/UX changes should prioritize simplicity and readability.
2.  **Client-Side Simplicity:** This is a self-contained, client-side React application with no backend. The architecture should remain simple, relying on component state, props, and `localStorage` for persistence. Avoid adding unnecessary complexity or libraries.
3.  **Data-Driven Content:** All questions, answers, and scoring logic are centralized in `src/data/questions.json`. This makes the assessment's content easy to update by non-developers and ensures a single source of truth.

## Key Commands

| Command                | Description                                                                       |
| :--------------------- | :-------------------------------------------------------------------------------- |
| `npm install`          | Installs all project dependencies. Run this first.                                |
| `npm start`            | Starts the Vite development server for local development.                         |
| `npm run build`        | Compiles the application for production into the `/dist` directory.               |
| `npm test`             | Executes the entire Vitest test suite. **All tests must pass before committing.** |
| `npm run lint`         | Checks the code for linting errors according to ESLint rules.                     |
| `npm run lint:fix`     | Automatically fixes all fixable ESLint errors.                                    |
| `npm run format`       | Automatically formats all code using Prettier.                                    |
| `npm run format:check` | Checks for formatting issues without modifying files.                             |

## Project Architecture

- **Entry Point**: `src/index.tsx` renders the main `App` component into the DOM.
- **Main Component & State Management**: `src/App.tsx` is the core of the application. It manages all application state, including the current question, user answers, and the display of the results page. State is managed with `useState` and `useEffect` hooks and is persisted to `localStorage`.
- **Assessment Data**: `src/data/questions.json` is the single source of truth for all questions, answers, clarifications, scores, and explanations. **Most content changes will happen in this file.**
- **Reusable Components (`src/components/`)**:
  - `QuestionCard.tsx`: Displays a single question and its answer options.
  - `ResultsPage.tsx`: Displays the final score, tier, detailed breakdown, and sharing options.
  - `ProgressBar.tsx`: Shows the user's progress through the assessment.
- **Typescript Definitions**: `src/types.ts` contains all shared TypeScript interfaces for `Question`, `Answer`, and `Result`.
- **Styling**: The application uses Bootstrap 5, with custom overrides and styles defined in `src/styles/professional-theme.css`.

## Common Tasks

### How to Add or Modify a Question

1.  **Edit the Data File**: Open `src/data/questions.json`.
2.  **Find the Question**: Locate the question object you wish to modify, or copy an existing object to create a new one.
3.  **Make Changes**:
    - To add a question, add a new JSON object to the array, ensuring its `id` is unique.
    - To modify text, edit the `question_text`, `question_clarification`, `answer_text`, or `explanation` fields.
    - To change scoring, adjust the `score` value for any given answer. The scoring is typically `2` for the best practice, `1` for a partial solution, and `0` for a critical issue.
4.  **Verify Types**: No code changes are needed in TypeScript files as long as the new/modified object conforms to the `Question` interface defined in `src/types.ts`.
5.  **Test**: Run the application (`npm start`) and navigate through the assessment to ensure the new question appears and functions correctly.

### How to Change the Scoring Tiers

1.  **Locate the Logic**: Open the main application file: `src/App.tsx`.
2.  **Find the `getTier` Function**: This function takes the final score as input and returns one of the three tiers ("At Risk", "Building Foundation", "Well-Positioned").
3.  **Adjust Thresholds**: Modify the score thresholds within the `if` statements to change the tiering logic.
4.  **Update Tier Descriptions**: If you change the logic, ensure the corresponding text descriptions in `src/components/ResultsPage.tsx` (in the `tierDescriptions` object) still make sense.

## Testing Instructions

- Run all tests with `npm test`.
- To run tests for a single file (which is faster during development), use: `npm test -- <path_to_test_file>`.
  - Example: `npm test -- src/components/ResultsPage.test.tsx`
- To run a specific test within a file, use the `-t` flag: `npm test -- -t "should filter results correctly"`.
- Always add or update tests in the relevant `*.test.tsx` file to reflect your code changes.

## Commit Message and PR Guidelines

- **Commit Messages**: Use the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format.
  - `feat: Add share by email functionality to results page`
  - `fix: Correctly calculate progress bar percentage`
  - `docs(agents): Update instructions for modifying scoring tiers`
  - `refactor: Simplify state management in App.tsx`
  - `style: Adjust card padding on mobile devices`
- **Pull Requests**:
  - The PR title should follow the Conventional Commits format.
  - Before submitting, ensure all local checks pass by running `npm run lint`, `npm test`, and `npm run build`.

## Privacy and Analytics Considerations

- **GA4 Tracking**: This project uses Google Analytics 4 (GA4) for anonymized usage tracking, as detailed in the `README.md`.
- **No Sensitive Data**: Be extremely careful not to send any personally identifiable information (PII) or specific user answers/scores to GA4. Tracking is limited to aggregate events like page views and button clicks (e.g., "Clicked Restart," "Copied URL").
- **Consent is Key**: Analytics are only initialized after the user accepts the cookie consent banner. The logic for this is in `App.tsx`. Do not alter this behavior.
