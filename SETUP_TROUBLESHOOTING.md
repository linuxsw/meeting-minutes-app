# Meeting Minutes Generator - Troubleshooting Guide

## Common Installation Issues

### Node.js Version Conflicts

#### Symptoms
- Error messages about incompatible Node.js versions
- Unexpected behavior during npm install
- Build failures with cryptic error messages

#### Solutions

##### Windows
1. **Check current version**:
   ```
   node -v
   npm -v
   ```

2. **Using nvm-windows (recommended)**:
   ```
   # Install nvm-windows from https://github.com/coreybutler/nvm-windows/releases
   nvm install 22.13.0
   nvm use 22.13.0
   ```

3. **Clean installation**:
   - Uninstall existing Node.js from Control Panel
   - Delete any remaining folders:
     - `C:\Program Files\nodejs`
     - `C:\Program Files (x86)\nodejs`
     - `%APPDATA%\npm`
     - `%APPDATA%\npm-cache`
   - Install the correct version from nodejs.org

##### macOS
1. **Check current version**:
   ```
   node -v
   npm -v
   ```

2. **Using nvm (recommended)**:
   ```
   # Install nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   
   # Restart terminal or source profile
   source ~/.zshrc  # or ~/.bash_profile
   
   # Install and use correct version
   nvm install 22.13.0
   nvm use 22.13.0
   ```

3. **Using Homebrew**:
   ```
   # If installed with Homebrew
   brew unlink node
   brew install node@22
   brew link node@22
   
   # Add to PATH if needed
   echo 'export PATH="/usr/local/opt/node@22/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

##### Linux
1. **Check current version**:
   ```
   node -v
   npm -v
   ```

2. **Using nvm (recommended)**:
   ```
   # Install nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   
   # Restart terminal or source profile
   source ~/.bashrc
   
   # Install and use correct version
   nvm install 22.13.0
   nvm use 22.13.0
   ```

3. **Using package manager**:
   ```
   # Remove existing Node.js
   sudo apt remove nodejs npm  # Ubuntu/Debian
   sudo yum remove nodejs npm  # CentOS/RHEL
   
   # Install correct version using NodeSource
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs  # Ubuntu/Debian
   
   # Or for CentOS/RHEL
   curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
   sudo yum install -y nodejs
   ```

### npm Dependency Conflicts

#### Symptoms
- Errors about peer dependencies
- Failed installations with dependency tree errors
- Missing modules errors when starting the application

#### Solutions

1. **Use legacy peer deps flag**:
   ```
   npm install --legacy-peer-deps
   ```

2. **Clear npm cache**:
   ```
   npm cache clean --force
   ```

3. **Delete node_modules and reinstall**:
   ```
   rm -rf node_modules
   rm package-lock.json
   npm install --legacy-peer-deps
   ```

4. **Specific @hello-pangea/dnd installation**:
   ```
   npm install @hello-pangea/dnd --legacy-peer-deps
   ```

### Permission Issues

#### Windows
1. **Run Command Prompt as Administrator** for global npm installations

2. **Check folder permissions**:
   - Right-click on project folder
   - Properties → Security → Edit
   - Ensure your user has Full Control

#### macOS/Linux
1. **Fix npm permissions**:
   ```
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) /usr/local/lib/node_modules
   ```

2. **Use nvm to avoid permission issues** (recommended)

3. **Fix project folder permissions**:
   ```
   sudo chown -R $(whoami) /path/to/meeting-minutes-app
   ```

## Sandbox Deployment Limitations

### Why the Sandbox Environment Has Deployment Issues

The Meeting Minutes App couldn't be deployed in the sandbox environment due to several technical constraints:

1. **Resource Limitations**:
   - The sandbox environment has limited memory and CPU resources
   - Next.js builds require significant memory, especially for larger applications
   - The build process was timing out or failing due to resource constraints

2. **Dependency Resolution Issues**:
   - The sandbox environment had conflicts with some required dependencies
   - Specifically, `@hello-pangea/dnd` and `next-i18next` had compatibility issues
   - These dependencies are critical for the drag-and-drop functionality and internationalization

3. **Network Constraints**:
   - Some required packages couldn't be downloaded due to network restrictions
   - This prevented complete installation of all dependencies

4. **Port Binding Restrictions**:
   - The sandbox environment has limitations on which ports can be bound
   - This affected the Next.js server's ability to start properly

5. **File System Permissions**:
   - The sandbox has restricted file system permissions
   - This affected the build process which requires writing to various directories

### Workarounds for Sandbox Environments

If you need to deploy in a restricted environment similar to the sandbox:

1. **Use Docker Containerization**:
   - Docker provides isolation and consistent environments
   - Use the provided docker-compose.yml file
   - This avoids dependency and permission issues

2. **Reduce Build Resource Requirements**:
   - Set NODE_OPTIONS environment variable:
     ```
     export NODE_OPTIONS="--max-old-space-size=2048"
     ```
   - Use production-only builds:
     ```
     npm run build --production
     ```

3. **Pre-build the Application**:
   - Build the application on a more powerful machine
   - Deploy only the built artifacts to the restricted environment

4. **Use Static Export**:
   - For simpler deployments, use Next.js static export:
     ```
     next build && next export
     ```
   - This creates a static version that can be served by any web server

5. **Serverless Deployment**:
   - Consider deploying to serverless platforms like Vercel or Netlify
   - These handle the build process in their environments

## Browser-Specific Issues

### Chrome
- Ensure you have the latest version (90+)
- Try disabling extensions if you encounter issues
- Check console for specific error messages

### Firefox
- Some drag-and-drop animations may be slower
- Ensure you have the latest version (88+)
- Try safe mode if extensions might be causing issues

### Safari
- WebKit rendering differences may affect some UI elements
- Ensure you have the latest version (14+)
- Check privacy settings if uploads aren't working

### Edge
- Should work similarly to Chrome
- Ensure you have the latest version (90+)

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/latest-v22.x/api/)
- [npm Troubleshooting](https://docs.npmjs.com/cli/v10/using-npm/troubleshooting)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com/)
