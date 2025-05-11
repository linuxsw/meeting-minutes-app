## Testing Strategy for AI Enhanced Meeting Minutes Generator

### 1. Introduction

This document outlines the testing strategy for the AI Enhanced Meeting Minutes Generator. The goal is to ensure the application's reliability, functionality, and robustness through a combination of automated tests.

### 2. Chosen Testing Frameworks

After considering various options, including Cucumber for BDD, we have decided on the following frameworks to provide comprehensive test coverage:

*   **Playwright (for End-to-End and Frontend Testing)**:
    *   **Why Playwright?**: Playwright is a modern, powerful, and reliable framework developed by Microsoft for end-to-end testing of web applications. It offers cross-browser support (Chromium, Firefox, WebKit), auto-waits, and excellent debugging capabilities. Its ability to interact with the application as a user would makes it ideal for verifying user flows and UI interactions in our Next.js application.
    *   **Scope**: Testing user interface interactions, navigation, form submissions (e.g., file uploads, AI configuration), and overall application flow from the user's perspective.

*   **Pytest (for Python Backend/Script Testing)**:
    *   **Why Pytest?**: Pytest is a mature, feature-rich, and easy-to-use testing framework for Python. It supports simple unit tests as well as complex functional testing. It's well-suited for testing our Python-based audio processing and PDF generation scripts.
    *   **Scope**: Unit and integration tests for the Python scripts (`audio_processor.py`, `generate_pdf.py`), ensuring their individual components and overall functionality work correctly.

*   **Jest (for Next.js Component/Unit Testing - Future Consideration)**:
    *   While Playwright covers end-to-end scenarios, Jest can be added later for more granular unit testing of React components and utility functions within the Next.js application if deeper component-level testing becomes necessary. For now, Playwright and Pytest will provide a solid foundation.

### 3. Types of Tests to be Implemented

1.  **Installation Script Tests**:
    *   Verify that the `setup_app.sh` script correctly installs dependencies on supported platforms (simulated for macOS in the current environment).
    *   Check if the Python virtual environment is created and activated correctly.
    *   Confirm that PDF documentation generation can be triggered and completes successfully.

2.  **Frontend (Next.js) End-to-End Tests (using Playwright)**:
    *   **Basic Navigation**: Ensure all main pages (`/`, `/review-transcript`, `/ai-config`, `/test`, `/test-transcript`) load correctly.
    *   **File Upload**: Test the file uploader component on the `/review-transcript` page (mocking the actual upload process if necessary for CI environments but testing the UI flow).
    *   **AI Configuration**: Verify that AI provider selection and API key input fields on the `/ai-config` page are functional and that warnings appear as expected.
    *   **Transcript Review UI**: Test basic interactions with the speaker manager and transcript editor components (e.g., adding a speaker, editing text).
    *   **Responsive Design Checks**: Basic checks to ensure the layout adapts to different viewport sizes (if feasible within the scope).

3.  **Backend API Tests (Next.js - potentially using Playwright or Jest's `supertest`)**:
    *   Test API endpoints (`/api/upload`, `/api/process`, `/api/process-audio`, `/api/download/[documentId]`) with mock data to ensure they handle requests and responses correctly.
    *   Verify error handling for invalid inputs or scenarios.

4.  **Python Script Tests (using Pytest)**:
    *   **`audio_processor.py`**: Unit tests for individual functions (e.g., language detection, diarization logic if modularized). Integration tests for the script's main workflow with sample audio files (if feasible and not too time-consuming for CI).
    *   **`generate_pdf.py`**: Test PDF generation from sample Markdown files. Verify that the output PDF is created and, if possible, perform basic checks on its content or structure (e.g., page count, presence of key text).

5.  **Integration Tests (Conceptual for AI/SSO)**:
    *   **AI Provider Integration**: For cloud AI services (OpenAI, Together AI), tests will primarily focus on the application's ability to correctly format requests and handle responses (or errors) from mock API endpoints. Full integration tests would require live API keys and are generally out of scope for automated CI runs due to cost and external dependencies.
    *   **Ollama Integration**: If Ollama is set up (e.g., via Docker), tests can verify basic connectivity and API interaction.
    *   **SSO/AD Integration**: As this is a future enhancement, tests will focus on the UI elements related to authentication (e.g., login button presence). Actual SSO flows are complex to automate without a live IdP setup.

### 4. Test Execution

*   Tests will be runnable locally by developers.
*   The `setup_app.sh` script will be enhanced with an option to install testing dependencies and run the test suite.
*   Future consideration: Integration with a CI/CD pipeline for automated testing on each commit/PR.

### 5. Why not Cucumber?

While Cucumber is excellent for Behavior-Driven Development (BDD) and facilitating communication between technical and non-technical stakeholders, for this project's current stage and technical nature, Playwright and Pytest offer a more direct and efficient approach for testing the web UI and Python backend components. Playwright's features like auto-waits and its close integration with browser automation are particularly beneficial for testing modern web applications like this Next.js app. Pytest's simplicity and power make it ideal for Python scripting tests. We can always integrate BDD with Cucumber later if the project scales and requires more formal BDD practices.

This strategy aims to provide a good balance of test coverage, maintainability, and development efficiency.
