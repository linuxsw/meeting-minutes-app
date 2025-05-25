# Meeting Minutes Generator - Cross-Platform Setup Guide

## Overview

The Meeting Minutes Generator is a web application that helps you create professional meeting minutes from Microsoft Teams recordings and transcripts. This guide provides detailed setup instructions for Windows, Linux, and macOS environments.

## System Requirements

### Node.js and npm
- **Node.js**: v22.13.0
- **npm**: v10.9.2

### Operating System Compatibility
- **Windows**: Windows 10 or later
- **macOS**: macOS 10.15 (Catalina) or later
- **Linux**: Ubuntu 20.04 or later, Debian 10 or later, CentOS 8 or later

### Browser Compatibility
- **Chrome**: Version 90 or later
- **Firefox**: Version 88 or later
- **Safari**: Version 14 or later
- **Edge**: Version 90 or later

## Setup Options

### Option 1: Running with Docker (Recommended for All Platforms)

This method includes Ollama for local AI processing without requiring external API keys and provides the most consistent experience across platforms.

#### Prerequisites
- Docker Desktop installed:
  - [Windows Docker Installation](https://docs.docker.com/desktop/install/windows-install/)
  - [macOS Docker Installation](https://docs.docker.com/desktop/install/mac-install/)
  - [Linux Docker Installation](https://docs.docker.com/desktop/install/linux-install/)
- At least 8GB of RAM available for Docker

#### Steps (Same for All Platforms)

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/linuxsw/meeting-minutes-app.git
   cd meeting-minutes-app
   ```

2. Start the application with Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. The application will be available at http://localhost:3000
4. Ollama will be available at http://localhost:11434

#### Downloading Models for Ollama

The first time you use Ollama, you'll need to download the models:

```bash
# Connect to the Ollama container
docker exec -it meeting-minutes-app_ollama_1 bash

# Download a model (e.g., Llama 2)
ollama pull llama2
```

### Option 2: Running Directly on Your Machine

#### Windows Setup

1. **Install Node.js and npm**:
   - Download the Node.js installer (v22.13.0) from [nodejs.org](https://nodejs.org/)
   - Run the installer and follow the installation wizard
   - Ensure "Add to PATH" is checked during installation
   - Verify installation by opening Command Prompt and running:
     ```
     node -v
     npm -v
     ```

2. **Install Git**:
   - Download Git from [git-scm.com](https://git-scm.com/download/win)
   - Run the installer with default options
   - Verify installation: `git --version`

3. **Clone and Setup the Application**:
   - Open Command Prompt as Administrator
   - Navigate to your desired directory:
     ```
     cd C:\Projects
     ```
   - Clone the repository:
     ```
     git clone https://github.com/linuxsw/meeting-minutes-app.git
     cd meeting-minutes-app
     ```
   - Install dependencies:
     ```
     npm install
     npm install @hello-pangea/dnd --legacy-peer-deps
     ```
   - Build and start the application:
     ```
     npm run build
     npm start
     ```
   - Access the application at http://localhost:3000

#### macOS Setup

1. **Install Node.js and npm**:
   - Option A: Using Homebrew (recommended):
     ```
     # Install Homebrew if not already installed
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     
     # Install Node.js
     brew install node@22
     
     # Add to PATH if needed
     echo 'export PATH="/usr/local/opt/node@22/bin:$PATH"' >> ~/.zshrc
     source ~/.zshrc
     ```
   
   - Option B: Using the installer:
     - Download the macOS installer from [nodejs.org](https://nodejs.org/)
     - Run the installer and follow the instructions
   
   - Verify installation:
     ```
     node -v
     npm -v
     ```

2. **Install Git** (if not already installed):
   ```
   brew install git
   ```

3. **Clone and Setup the Application**:
   - Open Terminal
   - Navigate to your desired directory:
     ```
     cd ~/Projects
     ```
   - Clone the repository:
     ```
     git clone https://github.com/linuxsw/meeting-minutes-app.git
     cd meeting-minutes-app
     ```
   - Install dependencies:
     ```
     npm install
     npm install @hello-pangea/dnd --legacy-peer-deps
     ```
   - Build and start the application:
     ```
     npm run build
     npm start
     ```
   - Access the application at http://localhost:3000

#### Linux Setup

1. **Install Node.js and npm**:
   
   **Ubuntu/Debian**:
   ```bash
   # Add NodeSource repository
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   
   # Install Node.js
   sudo apt-get install -y nodejs
   
   # Verify installation
   node -v
   npm -v
   ```
   
   **CentOS/RHEL**:
   ```bash
   # Add NodeSource repository
   curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
   
   # Install Node.js
   sudo yum install -y nodejs
   
   # Verify installation
   node -v
   npm -v
   ```

2. **Install Git** (if not already installed):
   
   **Ubuntu/Debian**:
   ```bash
   sudo apt-get install git
   ```
   
   **CentOS/RHEL**:
   ```bash
   sudo yum install git
   ```

3. **Clone and Setup the Application**:
   - Open Terminal
   - Navigate to your desired directory:
     ```
     cd ~/projects
     ```
   - Clone the repository:
     ```
     git clone https://github.com/linuxsw/meeting-minutes-app.git
     cd meeting-minutes-app
     ```
   - Install dependencies:
     ```
     npm install
     npm install @hello-pangea/dnd --legacy-peer-deps
     ```
   - Build and start the application:
     ```
     npm run build
     npm start
     ```
   - Access the application at http://localhost:3000

## Handling Pre-existing Node.js/npm Installations

If you already have Node.js and npm installed but with different versions, you have several options:

### Using Node Version Manager (recommended)

#### Windows (nvm-windows)
1. Install nvm-windows from [GitHub](https://github.com/coreybutler/nvm-windows/releases)
2. Open Command Prompt as Administrator
3. Install and use the required Node.js version:
   ```
   nvm install 22.13.0
   nvm use 22.13.0
   ```

#### macOS/Linux (nvm)
1. Install nvm:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   ```
2. Close and reopen your terminal
3. Install and use the required Node.js version:
   ```bash
   nvm install 22.13.0
   nvm use 22.13.0
   ```

### Using Docker (alternative)
If you don't want to change your system's Node.js version, use the Docker setup option which isolates the application environment.

### Temporary PATH Modification

#### Windows
```
set PATH=C:\path\to\nodejs22;%PATH%
```

#### macOS/Linux
```
export PATH=/path/to/nodejs22/bin:$PATH
```

## Development Mode

To run the application in development mode with hot reloading:

```bash
npm run dev
# or
pnpm dev
```

The application will be available at http://localhost:3000 and will automatically reload when you make changes to the code.

## User Guide

For detailed usage instructions, please refer to the [User Guide](./USER_GUIDE.md).

## Troubleshooting

For common issues and their solutions, please refer to the [Troubleshooting Guide](./SETUP_TROUBLESHOOTING.md).
