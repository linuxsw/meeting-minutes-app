# Meeting Minutes Generator with i18n Support - Installation Guide

This guide provides comprehensive instructions for setting up and running the Meeting Minutes Generator application with internationalization (i18n) support on macOS (including M-series chips) and Docker environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation on macOS](#installation-on-macos)
3. [Installation with Docker](#installation-with-docker)
4. [Running the Application](#running-the-application)
5. [i18n Configuration](#i18n-configuration)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### For macOS Installation

- macOS 10.15 or later (including macOS with Apple Silicon M1/M2/M3/M4)
- Node.js 18.x or later
- npm 8.x or later (or yarn/pnpm if preferred)
- Git

### For Docker Installation

- Docker Desktop for Mac/Windows or Docker Engine for Linux
- Git

## Installation on macOS

### 1. Clone the Repository

```bash
git clone https://github.com/linuxsw/meeting-minutes-app.git
cd meeting-minutes-app
```

### 2. Install Dependencies

#### For Intel-based Macs

```bash
npm install
```

#### For Apple Silicon (M1/M2/M3/M4)

Apple Silicon Macs may require special handling for some native dependencies:

```bash
# Install Rosetta 2 if you haven't already
softwareupdate --install-rosetta

# Install dependencies with architecture-specific flags
npm install --legacy-peer-deps
```

If you encounter issues with specific packages, try:

```bash
# For specific problematic packages
arch -x86_64 npm install [package-name]
```

### 3. Fix Dependency Conflicts (if needed)

If you encounter dependency conflicts between date-fns and react-day-picker:

```bash
# Edit package.json to use date-fns v3.x
npm install date-fns@^3.0.0 --save
npm install
```

## Installation with Docker

### 1. Clone the Repository

```bash
git clone https://github.com/linuxsw/meeting-minutes-app.git
cd meeting-minutes-app
```

### 2. Build and Run with Docker

Create a `Dockerfile` in the root directory if it doesn't exist:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

Create a `docker-compose.yml` file:

```yaml
version: '3'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./:/app
      - /app/node_modules
```

Build and run the Docker container:

```bash
docker-compose up --build
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Production Mode

```bash
npm run build
npm start
```

## i18n Configuration

The application supports internationalization with English, Korean, and Japanese languages.

### Key Files and Directories

- `next-i18next.config.js`: Main i18n configuration
- `public/locales/`: Contains translation files for each language
  - `en/`: English translations
  - `ko/`: Korean translations
  - `ja/`: Japanese translations
- `src/components/language-switcher.tsx`: Language switcher component
- `src/app/layout.tsx`: App layout with i18n provider integration

### Adding New Languages

1. Create a new directory in `public/locales/` for your language (e.g., `fr/` for French)
2. Copy the structure from an existing language directory
3. Translate all JSON files
4. Add the new language to the language switcher component:

```typescript
// In src/components/language-switcher.tsx
const languages = [
  { code: 'en', name: 'English' },
  { code: 'ko', name: '한국어' },
  { code: 'ja', name: '日本語' },
  { code: 'fr', name: 'Français' }, // Add your new language
];
```

5. Update the i18n configuration:

```javascript
// In next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko', 'ja', 'fr'], // Add your new language code
  },
  // ...
}
```

### Audio Language Selection

The application also supports language selection for audio processing:

1. When uploading audio files, you can select the language of the audio content
2. The "Auto" option will attempt to automatically detect the language
3. For best results, select the specific language if you know it

## Troubleshooting

### Common Issues and Solutions

#### 1. Missing Dependencies or "Module not found" Errors

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
npm install --legacy-peer-deps
```

#### 2. Issues with Next.js Binary Not Found

```bash
# Install Next.js globally
npm install -g next

# Or use npx to run Next.js commands
npx next dev
```

#### 3. Memory Issues During Installation

If you encounter memory issues during installation:

```bash
# Install dependencies in smaller batches
npm install react react-dom next --no-save
npm install next-i18next react-i18next i18next --no-save
npm install --legacy-peer-deps
```

#### 4. Apple Silicon (M1/M2/M3/M4) Specific Issues

For native dependencies that have issues on Apple Silicon:

```bash
# Use Rosetta terminal
arch -x86_64 zsh
npm install
```

#### 5. Docker Container Not Starting

Check logs for errors:

```bash
docker-compose logs
```

Ensure ports are not in use:

```bash
lsof -i :3000
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [next-i18next Documentation](https://github.com/i18next/next-i18next)
- [i18next Documentation](https://www.i18next.com/)
- [Docker Documentation](https://docs.docker.com/)

---

For more information, please refer to the project's [GitHub repository](https://github.com/linuxsw/meeting-minutes-app).
