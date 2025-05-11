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

### Prerequisites

- **Node.js**: Version 20.x or higher.
- **npm** (comes with Node.js) or **pnpm**.
- **Python**: Version 3.9 or higher (for audio processing backend).
- **pip** (Python package installer).
- **Docker Desktop**: Required if you plan to use Ollama for local AI processing, or for a containerized setup.
- **ffmpeg**: A command-line tool for audio/video operations. SpeechBrain/torchaudio relies on it.
    - On macOS: `brew install ffmpeg`
    - On Linux: `sudo apt update && sudo apt install ffmpeg`

### General Installation (All Platforms)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/linuxsw/meeting-minutes-app.git
    cd meeting-minutes-app
    ```

2.  **Install Frontend Dependencies**:
    ```bash
    npm install --legacy-peer-deps
    # or
    # pnpm install --legacy-peer-deps 
    ```
    *Note: `--legacy-peer-deps` is used to resolve potential peer dependency conflicts often found in complex React projects.*

3.  **Setup Python Backend for Audio Processing**:
    The audio processing service uses Python and SpeechBrain. It is recommended to set this up in a virtual environment.
    ```bash
    cd src/python_services # Navigate to the python services directory
    python3 -m venv venv   # Create a virtual environment
    source venv/bin/activate # Activate the virtual environment (on macOS/Linux)
    # On Windows: venv\Scripts\activate
    
    # Install Python dependencies
    # PyTorch installation might vary based on your OS and if you have a CUDA-enabled GPU.
    # For CPU-only (common for local development, especially on Macs without NVIDIA GPUs):
    pip3 install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
    pip3 install speechbrain
    # If you encounter issues, ensure you have the necessary build tools for your OS.
    ```

4.  **Environment Variables (Optional - for AI Providers)**:
    If you plan to use OpenAI or Together AI for future AI features (like summarization, which is not fully integrated with the audio processor yet but the framework is there), create a `.env.local` file in the root of the `meeting-minutes-app` project:
    ```env
    NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
    NEXT_PUBLIC_TOGETHER_AI_API_KEY=your_together_ai_api_key
    # OLLAMA_BASE_URL=http://localhost:11434 (if Ollama runs on a different port/host)
    ```

### Running the Application (Development)

1.  **Start the Next.js Frontend Development Server**:
    From the root `meeting-minutes-app` directory:
    ```bash
    npm run dev
    # or
    # pnpm dev
    ```
    This will typically start the application on `http://localhost:3000`.

2.  The Python audio processing script (`src/python_services/audio_processor.py`) is called directly by the Next.js backend API. Ensure your Python virtual environment (with SpeechBrain, PyTorch, etc.) is set up correctly as the script will use the system's `python3` or the one in the active path.

### macOS Specific Setup (M1/M2/M3/M4 Apple Silicon)

Setting up the Python environment for audio processing (SpeechBrain, PyTorch) on Apple Silicon (ARM64) requires careful attention to ensure compatibility.

1.  **Homebrew**: Ensure Homebrew is installed. If not, visit [https://brew.sh/](https://brew.sh/).

2.  **Python**: It's recommended to use Python installed via Homebrew or a version manager like `pyenv` to ensure you have an ARM64 version of Python.
    ```bash
    brew install python
    ```

3.  **ffmpeg**: Install via Homebrew:
    ```bash
    brew install ffmpeg
    ```

4.  **Python Virtual Environment and Dependencies (Apple Silicon)**:
    Navigate to `src/python_services` and create/activate your virtual environment as described in the general setup.
    When installing PyTorch, ensure you are getting the correct version for macOS ARM64 (CPU is typical for PyTorch on Mac unless specific Metal Performance Shaders (MPS) builds are targeted and supported by all libraries).
    ```bash
    # Inside your activated virtual environment (e.g., ./src/python_services/venv)
    pip3 install torch torchaudio --index-url https://download.pytorch.org/whl/cpu 
    # Or, for nightly builds that might have better MPS support (more experimental):
    # pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cpu
    
    pip3 install speechbrain
    ```
    *   **Troubleshooting PyTorch on Apple Silicon**: If you encounter issues, refer to the official PyTorch installation guide ([https://pytorch.org/get-started/locally/](https://pytorch.org/get-started/locally/)) and select the appropriate options for macOS, Pip, Python, and CPU.
    *   SpeechBrain should generally work once PyTorch and Torchaudio are correctly installed.

### Docker Setup (Recommended for Ollama and Consistent Environment)

This project includes a `docker-compose.yml` and `Dockerfile` to run the application and an Ollama instance in containers. This is particularly useful for macOS users wanting to use Ollama or for ensuring a consistent environment.

1.  **Prerequisites**: Docker Desktop installed and running on your Mac (M-series compatible version).

2.  **Build and Run with Docker Compose**:
    From the root of the `meeting-minutes-app` directory:
    ```bash
    docker-compose up --build
    ```
    This command will:
    *   Build the Next.js application image as defined in `Dockerfile`.
    *   Pull the Ollama image (if not already present) and configure it to run a model (e.g., Llama 2, Mistral - you might need to adjust `docker-compose.yml` or run Ollama commands post-startup to pull specific models if not pre-configured).
    *   Start both services. The Next.js app will typically be available at `http://localhost:3000` (or as configured in `docker-compose.yml`).
    *   The Python audio processing will run within the Next.js application container, which includes Python and the necessary dependencies.

3.  **Using Ollama with Docker Setup**:
    *   Once the Docker containers are running, Ollama will be accessible from the Next.js application container at `http://ollama:11434` (as per typical Docker Compose networking).
    *   You may need to pull models into Ollama after it starts. You can do this by exec-ing into the Ollama container or using Ollama's API:
        ```bash
        docker-compose exec ollama ollama pull mistral # Example: pulls the mistral model
        ```
    *   The application's AI configuration page (`/ai-config`) should be set to use the Ollama provider with the default URL (`http://localhost:11434` if accessing from your host browser to Ollama directly, or the service name if Next.js backend calls Ollama within Docker network).

4.  **Stopping Docker Compose**:
    ```bash
    docker-compose down
    ```

## Usage

1.  Navigate to the application in your browser (e.g., `http://localhost:3000`).
2.  **For Audio Processing**: Go to the `/review-transcript` page.
    *   Upload an audio or video file.
    *   The system will process it (language detection, transcription, speaker diarization).
    *   Review the transcript and assign names to speakers using the "Manage Speaker Names" section.
3.  **For Meeting Minutes Generation (using processed transcript)**:
    *   (Workflow to be fully connected) Select a meeting template on the main page.
    *   Provide the processed transcript data (from the review page or other sources).
    *   Fill in other meeting details (title, date, attendees - some can be auto-filled).
    *   Choose an output format (PDF, DOCX, HTML, TXT).
    *   Generate and download the meeting minutes.

## Testing

The application includes a test mode that allows you to try some functionality without uploading actual files:

1.  Navigate to `/test` in your browser for general app flow testing.
2.  Navigate to `/test-transcript` for testing with pre-defined transcript data.

## Deployment

### Production Build

To build the application for production:
```bash
npm run build
```

### Starting Production Server
```bash
npm start
```
This uses the Next.js production server.

## AI Provider Configuration

Navigate to the `/ai-config` page in the application to:
- Select your preferred AI provider for features like summarization (OpenAI, Together AI, Ollama, or No AI).
- Enter API keys if required (these are stored in browser local storage for client-side use or should be configured as environment variables for backend use).

## Intellectual Property and Data Privacy

We take your data privacy and intellectual property seriously. The core audio processing (transcription, speaker identification) is performed **locally** on the server where this application is hosted, without sending your audio to third-party services.

For optional AI enhancements (like summarization) using cloud-based providers (OpenAI, Together AI), only the **text-based transcript** is sent. You have the option to use locally hosted AI (Ollama) or no AI for these enhancements to keep all data within your environment.

Please review the following documents for detailed information:

-   **[Intellectual Property and Data Privacy Considerations](./IP_AND_PRIVACY.md)**: Explains how data is handled with different AI services and IP implications.
-   **[Privacy Policy](./PRIVACY.md)**: General privacy policy for the application.

It is crucial to understand these policies, especially if you choose to use cloud-based AI providers for enhanced features.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details (if one exists, otherwise assume MIT or check with the author).

