# Meeting Minutes App Setup Requirements

## System Requirements

### Node.js and npm
- **Node.js**: v22.13.0
- **npm**: v10.9.2

### Operating System Compatibility
- **Windows**: Windows 10 or later
- **macOS**: macOS 10.15 (Catalina) or later
- **Linux**: Ubuntu 20.04 or later, Debian 10 or later

### Browser Compatibility
- **Chrome**: Version 90 or later
- **Firefox**: Version 88 or later
- **Safari**: Version 14 or later
- **Edge**: Version 90 or later

## Installation Requirements

### Required Dependencies
The application requires the following key dependencies:
- Next.js 15.1.4
- React 19.0.0
- TypeScript 5.3.3
- Tailwind CSS 3.4.1
- React Beautiful DnD 13.1.1 (critical for speaker merging functionality)
- React Dropzone 14.3.8

### Installation Steps
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. If you encounter any build errors related to missing dependencies, specifically run:
   ```bash
   npm install react-beautiful-dnd @types/react-beautiful-dnd --legacy-peer-deps
   ```

### Development Tools
- Git
- A code editor (VS Code recommended)
- Terminal/Command Prompt

## Hardware Requirements
- **CPU**: Dual-core processor or better
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 1GB free space for the application and dependencies

## Network Requirements
- Internet connection for initial setup and dependency installation
- Local network access for development server

## Verification Steps

### Verify Node.js and npm Versions
```bash
node -v
# Should output: v22.13.0

npm -v
# Should output: 10.9.2
```

### Verify Application Setup
After installation, verify the application is working correctly by:
1. Starting the development server: `npm run dev`
2. Accessing the application at: http://localhost:3000
3. Uploading a test VTT file to confirm transcript parsing works
4. Testing the speaker merging functionality
5. Verifying the "Add Participants" button works in the result page

## Troubleshooting Common Issues

### Node.js Version Mismatch
If you encounter errors related to Node.js version:
1. Install nvm (Node Version Manager)
2. Run: `nvm install 22.13.0`
3. Run: `nvm use 22.13.0`

### npm Dependency Issues
If you encounter dependency conflicts:
1. Delete the `node_modules` directory
2. Delete the `package-lock.json` file
3. Run: `npm install --legacy-peer-deps`

### Missing react-beautiful-dnd Error
If you see an error about missing react-beautiful-dnd:
1. Run: `npm install react-beautiful-dnd @types/react-beautiful-dnd --legacy-peer-deps`
2. Restart the development server

### Port Already in Use
If port 3000 is already in use:
1. Change the port in `package.json`: 
   ```json
   "dev": "next dev -p 3001"
   ```
2. Or terminate the process using port 3000 and restart the application

### VTT Parsing Issues
If VTT files are not parsing correctly:
1. Ensure the VTT file is in Microsoft Teams format or standard WebVTT format
2. Check browser console for parsing errors
3. Try a different VTT file to isolate the issue
