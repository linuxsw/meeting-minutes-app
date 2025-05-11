# Meeting Minutes Generator

A web application for generating meeting minutes from Microsoft Teams recordings and transcripts, with AI-enhanced features for language detection and speaker identification.

## Features

- Upload Microsoft Teams recordings (MP4, M4A, WAV, etc.) and/or transcript files (VTT, TXT, DOCX).
- **AI-Powered Audio Processing**:
  - Automatic language detection for uploaded audio/video.
  - Speaker diarization to identify and label different speakers (e.g., Speaker 1, Speaker 2).
- **Interactive Transcript Review**:
  - View segmented transcript with speaker labels and timestamps.
  - Manually assign or correct speaker names.
  - (Future: Play audio snippets for each speaker/segment for verification).
- Support for multiple input scenarios:
  - Audio/Video file only (transcription and speaker identification performed by the app).
  - Audio/Video file with existing transcript.
  - Transcript file only.
- Multiple meeting minute templates:
  - Regular team meetings
  - Project status meetings
  - Training sessions
  - Agile scrum meetings (daily stand-up)
  - Agile planning meetings
  - Agile retrospect meetings
- Multiple output formats:
  - PDF
  - Word (DOCX)
  - HTML
  - Plain text
- Flexible AI Provider Integration (for summarization, action items - future enhancement):
  - Ollama (self-hosted)
  - OpenAI
  - Together AI
  - Option for "No AI" processing.
- Guest mode for testing.
- Designed for future integration with Active Directory or SSO.

## Getting Started

This project now includes a comprehensive setup script (`setup_app.sh`) to simplify the installation process on Linux (Ubuntu/Debian) and macOS.

### Prerequisites

Before running the setup script, ensure you have the following basic tools installed:

- **For Linux (Ubuntu/Debian)**:
  - `git`, `curl` (usually pre-installed or easily installable with `sudo apt-get install git curl`).
- **For macOS**:
  - **Homebrew**: If not installed, visit [https://brew.sh/](https://brew.sh/).
  - `git`, `curl` (usually pre-installed or installable with `brew install git curl`).
- **Node.js**: While the script can install some Node.js dependencies, having Node.js (v20.x or higher) and npm/pnpm pre-installed is recommended for managing the frontend part of the application if you intend to do development.

The `setup_app.sh` script will attempt to install Python 3, pip, Python virtual environment tools, ffmpeg, and other necessary system dependencies for WeasyPrint and Playwright.

### Using the Setup Script (`setup_app.sh`)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/linuxsw/meeting-minutes-app.git
    cd meeting-minutes-app
    ```

2.  **Make the script executable**:
    ```bash
    chmod +x setup_app.sh
    ```

3.  **Run the script**:

    *   **Interactive Mode (Recommended for first-time setup)**:
        ```bash
        ./setup_app.sh
        ```
        The script will guide you through:
        *   Operating System detection.
        *   Installation of base system dependencies (Python, pip, ffmpeg, etc.).
        *   **Python Environment Setup**: You will be prompted to choose your preferred Python environment management:
            *   **venv (Recommended)**: Uses Python's built-in `venv` module to create an isolated environment (default: `app_env_venv/`).
            *   **uv**: Uses Astral's `uv` tool for faster environment creation and package installation. `uv` will be installed if not found (default: `app_env_uv/`).
            *   **system**: Installs Python packages globally. **NOT RECOMMENDED** due to potential conflicts with other system Python packages.
        *   Installation of Python packages (WeasyPrint, Markdown, Pytest, python-pptx) into the chosen environment.
        *   Installation of Node.js dependencies (for the Next.js app) and Playwright (for E2E tests).
        *   An option to generate PDF documentation from Markdown files (e.g., README, IP_AND_PRIVACY.md).
        *   An option to run automated tests (Pytest for Python scripts, Playwright for E2E web app tests).

    *   **Non-Interactive Mode (Using Flags)**:
        You can also run the script with flags for automated setups:
        ```bash
        ./setup_app.sh [options]
        ```
        Available options:
        *   `--install-deps`: Installs all system and project dependencies (Python, Node.js, Playwright).
        *   `--python-env [venv|uv|system]`: Specify the Python environment type. If not provided with `--install-deps`, defaults to `venv`.
        *   `--generate-docs`: Generates PDF versions of key documentation files into the `generated_docs/` directory.
        *   `--run-tests`: Runs the automated test suite (Pytest and Playwright).

        **Examples**:
        *   Install all dependencies using `uv` for Python, generate docs, and run tests:
            ```bash
            ./setup_app.sh --install-deps --python-env uv --generate-docs --run-tests
            ```
        *   Only install dependencies using the default `venv` for Python:
            ```bash
            ./setup_app.sh --install-deps
            ```
        *   Only generate PDF documents (assumes Python environment is already set up or will use system Python if no venv found):
            ```bash
            ./setup_app.sh --generate-docs --python-env system # Or your chosen env type
            ```

### Manual Setup (Alternative to `setup_app.sh`)

If you prefer a manual setup or need more control:

1.  **Clone the repository** (as above).

2.  **Install System Dependencies Manually**:
    *   **Node.js**: Version 20.x or higher.
    *   **npm** (comes with Node.js) or **pnpm**.
    *   **Python**: Version 3.9 or higher.
    *   **pip** (Python package installer).
    *   **ffmpeg**: `sudo apt install ffmpeg` (Linux) or `brew install ffmpeg` (macOS).
    *   **WeasyPrint System Dependencies**: See [WeasyPrint Documentation](https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#installation) for your OS (e.g., pango, cairo, libffi, gdk-pixbuf).
    *   **Playwright System Dependencies**: For Linux, run `npx playwright install-deps`. For macOS, usually handled by `npx playwright install --with-deps`.

3.  **Install Frontend Dependencies**:
    ```bash
    npm install --legacy-peer-deps
    # or
    # pnpm install --legacy-peer-deps 
    ```

4.  **Setup Python Environment (Manual - Example with venv)**:
    ```bash
    # Create a virtual environment (e.g., in the project root or src/python_services)
    python3 -m venv app_env_manual
    source app_env_manual/bin/activate # (macOS/Linux)
    # On Windows: app_env_manual\Scripts\activate
    
    # Install Python dependencies
    pip3 install --upgrade pip wheel
    pip3 install WeasyPrint markdown pytest python-pptx
    # For audio processing (if not handled by a separate service in your setup):
    # pip3 install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
    # pip3 install speechbrain
    ```

5.  **Install Playwright Browsers**:
    ```bash
    npx playwright install --with-deps
    ```

6.  **Environment Variables (Optional - for AI Providers)**:
    If you plan to use OpenAI or Together AI, create a `.env.local` file in the root of the `meeting-minutes-app` project:
    ```env
    NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
    NEXT_PUBLIC_TOGETHER_AI_API_KEY=your_together_ai_api_key
    # OLLAMA_BASE_URL=http://localhost:11434 (if Ollama runs on a different port/host)
    ```

### Running the Application (Development)

1.  **Activate Python Environment** (if you used venv/uv and it's not active):
    ```bash
    # Example for venv created by setup_app.sh
    # source app_env_venv/bin/activate 
    # Or for uv
    # source app_env_uv/bin/activate
    ```
2.  **Start the Next.js Frontend Development Server**:
    From the root `meeting-minutes-app` directory:
    ```bash
    npm run dev
    # or
    # pnpm dev
    ```
    This will typically start the application on `http://localhost:3000`.

### macOS Specific Setup (M1/M2/M3/M4 Apple Silicon)

The `setup_app.sh` script handles macOS specifics. If setting up manually:

1.  **Homebrew**: Ensure Homebrew is installed.
2.  **Python**: Use Python installed via Homebrew (`brew install python`).
3.  **ffmpeg**: `brew install ffmpeg`.
4.  **WeasyPrint Dependencies**: `brew install pango cairo libffi gdk-pixbuf`.
5.  **Python Virtual Environment and Dependencies (Apple Silicon)**:
    When installing PyTorch manually, ensure you get the correct version for macOS ARM64.
    ```bash
    # Inside your activated virtual environment
    pip3 install torch torchaudio --index-url https://download.pytorch.org/whl/cpu 
    pip3 install speechbrain
    ```

### Docker Setup (Recommended for Ollama and Consistent Environment)

This project includes a `docker-compose.yml` and `Dockerfile`.

1.  **Prerequisites**: Docker Desktop installed and running.
2.  **Build and Run with Docker Compose**:
    ```bash
    docker-compose up --build
    ```
    The Next.js app will typically be available at `http://localhost:3000`. The Python audio processing runs within the Next.js application container.

3.  **Using Ollama with Docker Setup**:
    Ollama will be accessible from the Next.js app container at `http://ollama:11434`.
    Pull models: `docker-compose exec ollama ollama pull mistral`.

4.  **Stopping Docker Compose**:
    ```bash
    docker-compose down
    ```

## Usage

1.  Navigate to the application in your browser (e.g., `http://localhost:3000`).
2.  **For Audio Processing**: Go to the `/review-transcript` page.
3.  **For Meeting Minutes Generation**: (Workflow to be fully connected) Select a template, provide transcript data, fill details, choose format, and generate.

## Testing

Automated tests are included. You can run them using the `setup_app.sh` script or manually.

-   **Run with setup script**:
    ```bash
    ./setup_app.sh --run-tests --python-env [venv|uv|system] # Ensure dependencies are installed first or use --install-deps
    ```
-   **Run Manually**:
    1.  Ensure all dependencies (Python, Node.js, Playwright) are installed and Python environment is active.
    2.  **Python Tests (Pytest)**:
        ```bash
        # From the project root, assuming pytest is in your PATH (e.g., from activated venv)
        pytest tests/python
        ```
    3.  **E2E Tests (Playwright)**:
        ```bash
        # Start the Next.js dev server first
        npm run dev &
        # Wait for server to be ready, then run tests
        npx playwright test tests/e2e
        # Stop the dev server afterwards
        ```

Refer to `TESTING_STRATEGY.md` for more details on the testing approach.

## AI Provider Configuration

Navigate to the `/ai-config` page to select AI providers (OpenAI, Together AI, Ollama, No AI) and configure API keys.

## Intellectual Property and Data Privacy

Core audio processing is performed **locally**. Optional AI enhancements (summarization) using cloud providers (OpenAI, Together AI) send **text-based transcripts**. You can use local Ollama or no AI for these features.

Review these documents:
-   **[Intellectual Property and Data Privacy Considerations](./IP_AND_PRIVACY.md)**
-   **[Privacy Policy](./PRIVACY.md)**

## License

This project is licensed under the MIT License.
