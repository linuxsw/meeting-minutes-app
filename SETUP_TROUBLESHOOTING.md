# Meeting Minutes Generator - Setup Troubleshooting Guide

## Environment Setup Issues and Solutions

### Python Environment Setup

The Meeting Minutes Generator application supports three different Python environment management options:

1. **venv** (default): Uses Python's built-in virtual environment module
2. **uv**: Uses Astral's 'uv' tool for faster environment creation and package installation
3. **system**: Installs packages globally (not recommended)

### Known Issues and Solutions

#### Issue: pip Module Error with venv

When using the default `venv` environment, you might encounter the following error:

```
ModuleNotFoundError: No module named 'pip._internal.operations.build'
```

This error occurs during the installation of Python packages and prevents the setup from completing successfully.

**Solution:**

The setup script has been updated to automatically handle this issue by:

1. Detecting the pip module error when using `venv`
2. Automatically falling back to the `uv` environment manager
3. Continuing the installation process with `uv` instead

You can also manually specify the `uv` environment from the start:

```bash
./setup_app.sh --install-deps --python-env uv
```

Or in interactive mode, select option 2 when prompted for the Python environment type.

#### Why uv Works Better

The `uv` tool is a modern Python package installer and environment manager that:

- Has better dependency resolution
- Is more reliable across different platforms
- Handles complex package installations more effectively
- Is generally faster than pip

For the Meeting Minutes Generator application, `uv` has proven to be more reliable, especially when installing packages with complex dependencies like WeasyPrint.

### npm Dependency Conflicts

When installing Node.js dependencies, you might encounter peer dependency conflicts, especially with React versions. The setup script handles this by using the `--legacy-peer-deps` flag with npm install.

If you're installing dependencies manually, use:

```bash
npm install --legacy-peer-deps
```

### Troubleshooting Steps

If you encounter issues during setup:

1. **Try using uv instead of venv**:
   ```bash
   ./setup_app.sh --install-deps --python-env uv
   ```

2. **Check system dependencies**:
   Ensure all required system packages are installed:
   - For Ubuntu/Debian: `sudo apt-get install python3-pip python3-venv build-essential libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0 libffi-dev`
   - For macOS: `brew install python@3.11 pango harfbuzz`

3. **Manual environment setup**:
   If the script fails, you can set up the environment manually:
   ```bash
   # Install uv if not already installed
   curl -LsSf https://astral.sh/uv/install.sh | sh
   
   # Create and activate environment
   uv venv app_env_uv
   source app_env_uv/bin/activate
   
   # Install Python packages
   uv pip install wheel WeasyPrint markdown pytest python-pptx
   
   # Install Node.js dependencies
   npm install --legacy-peer-deps
   
   # Install Playwright
   npx playwright install
   ```

4. **Clean and retry**:
   If you've attempted installation before, try removing previous environment directories:
   ```bash
   rm -rf app_env_venv app_env_uv
   ./setup_app.sh --install-deps --python-env uv
   ```

### Running the Application

After successful setup:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Or build and start the production version:
   ```bash
   npm run build
   npm start
   ```

3. Access the application at http://localhost:3000

## Additional Resources

- [uv Documentation](https://github.com/astral-sh/uv)
- [Next.js Documentation](https://nextjs.org/docs)
- [WeasyPrint Documentation](https://doc.courtbouillon.org/weasyprint/stable/)
