#!/bin/bash

# Script to install Meeting Minutes Generator dependencies, optionally generate documentation, and run tests

# --- Configuration ---
APP_DIR=$(pwd)
PYTHON_VENV_DIR="app_env_venv" # Default venv directory
PYTHON_UV_ENV_DIR="app_env_uv"   # Default uv venv directory
PYTHON_ENV_DIR="" # Will be set based on user choice
PYTHON_SCRIPTS_DIR="${APP_DIR}/scripts"
PDF_OUTPUT_DIR="${APP_DIR}/generated_docs"
PLAYWRIGHT_TEST_DIR="${APP_DIR}/tests/e2e"
PYTEST_DIR="${APP_DIR}/tests/python"

PYTHON_ENV_TYPE="venv" # Default, can be venv, uv, system

# --- Helper Functions ---

# Function to detect OS
get_os() {
  uname_out="$(uname -s)"
  case "${uname_out}" in
    Linux*)
      if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
      else
        OS=$(uname -s)
      fi
      ;;
    Darwin*)
      OS=MacOS
      ;;
    *)
      OS="UNKNOWN:${uname_out}"
      ;;
  esac
  echo "Detected OS: $OS"
}

# Function to install base system dependencies (Python3, pip, git, ffmpeg, curl)
install_base_system_dependencies() {
    echo "Installing base system dependencies (Python3, pip, git, ffmpeg, curl)..."
    if [[ "$OS" == "Ubuntu" || "$OS" == "Debian GNU/Linux" ]]; then
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip python3-venv git ffmpeg curl
    elif [[ "$OS" == "MacOS" ]]; then
        if ! command -v brew &> /dev/null; then echo "Homebrew not found. Please install Homebrew first: https://brew.sh/"; exit 1; fi
        brew install python@3.9 git ffmpeg # python3-venv is usually included or handled by brew's python
    else
        echo "Unsupported OS for automatic base dependency installation: $OS. Please install Python 3, pip, git, and ffmpeg manually."
        exit 1
    fi
}

# Function to install WeasyPrint system dependencies
install_weasyprint_system_dependencies() {
  echo "Installing WeasyPrint system dependencies..."
  if [[ "$OS" == "Ubuntu" || "$OS" == "Debian GNU/Linux" ]]; then
    sudo apt-get install -y build-essential python3-dev libffi-dev libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 shared-mime-info
  elif [[ "$OS" == "MacOS" ]]; then
    brew install pango cairo libffi gdk-pixbuf
  else
    echo "Unsupported OS for WeasyPrint system dependencies: $OS. Please refer to WeasyPrint documentation."
  fi
}

# Function to install Playwright system dependencies (Linux only for now)
install_playwright_system_dependencies() {
  if [[ "$OS" == "Ubuntu" || "$OS" == "Debian GNU/Linux" ]]; then
    echo "Installing Playwright system dependencies for Linux..."
    sudo apt-get install -y libnss3 libnspr4 libdbus-glib-1-2 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgbm1 libasound2 libx11-xcb1 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libxrender1 libxss1 libxtst6 libgtk-3-0
  elif [[ "$OS" == "MacOS" ]]; then
    echo "On macOS, Playwright browser dependencies are typically handled by 'npx playwright install --with-deps'."
  fi
}

# Function to install Python packages (core and test)
install_python_packages() {
  local env_type=$1
  local packages_to_install=("wheel" "WeasyPrint" "markdown" "pytest" "python-pptx")
  local python_executable="python3"
  local pip_executable="pip3"

  echo "Installing Python packages: ${packages_to_install[*]} using ${env_type} environment..."

  if [[ "$env_type" == "venv" ]]; then
    PYTHON_ENV_DIR="${PYTHON_VENV_DIR}"
    if [ ! -d "${PYTHON_ENV_DIR}" ]; then
      echo "Creating Python virtual environment (venv) at '${PYTHON_ENV_DIR}'..."
      python3 -m venv "${PYTHON_ENV_DIR}"
      if [ $? -ne 0 ]; then echo "Error: Failed to create Python venv."; exit 1; fi
    else echo "Python venv '${PYTHON_ENV_DIR}' already exists."; fi
    source "${PYTHON_ENV_DIR}/bin/activate"
    if [ $? -ne 0 ]; then echo "Error: Failed to activate Python venv."; exit 1; fi
    python_executable="python"
    pip_executable="pip"

  elif [[ "$env_type" == "uv" ]]; then
    PYTHON_ENV_DIR="${PYTHON_UV_ENV_DIR}"
    if ! command -v uv &> /dev/null; then
      echo "'uv' command not found. Attempting to install 'uv' globally via pip..."
      pip3 install uv # Or use curl -LsSf https://astral.sh/uv/install.sh | sh
      if ! command -v uv &> /dev/null; then echo "Error: Failed to install 'uv'. Please install it manually."; exit 1; fi
    fi
    if [ ! -d "${PYTHON_ENV_DIR}" ]; then
      echo "Creating Python virtual environment (uv) at '${PYTHON_ENV_DIR}'..."
      uv venv "${PYTHON_ENV_DIR}" -p python3 # Specify python interpreter if needed
      if [ $? -ne 0 ]; then echo "Error: Failed to create Python uv venv."; exit 1; fi
    else echo "Python uv venv '${PYTHON_ENV_DIR}' already exists."; fi
    source "${PYTHON_ENV_DIR}/bin/activate"
    if [ $? -ne 0 ]; then echo "Error: Failed to activate Python uv venv."; exit 1; fi
    python_executable="python"
    pip_executable="uv pip"

  elif [[ "$env_type" == "system" ]]; then
    echo "WARNING: Installing Python packages directly into the system environment."
    echo "This is generally not recommended as it can lead to conflicts."
    echo "Consider using 'venv' or 'uv' for isolated environments."
    read -p "Are you sure you want to proceed with system installation? (yes/no) [no]: " confirm_system_install
    if [[ "${confirm_system_install,,}" != "yes" && "${confirm_system_install,,}" != "y" ]]; then
      echo "System installation aborted by user."
      exit 1
    fi
    # No activation needed for system
  else
    echo "Error: Unknown Python environment type '$env_type'."
    exit 1
  fi

  echo "Upgrading pip (if applicable for the environment)..."
  $pip_executable install --upgrade pip
  
  echo "Installing packages: ${packages_to_install[*]}"
  for pkg in "${packages_to_install[@]}"; do
    $pip_executable install "$pkg"
    if [ $? -ne 0 ]; then echo "Error: Failed to install Python package '$pkg'."; if [[ "$env_type" != "system" ]]; then deactivate; fi; exit 1; fi
  done
  
  echo "Python packages installation complete for '${env_type}' environment."
  if [[ "$env_type" != "system" ]]; then deactivate; fi
}

# Function to install Node.js dependencies and Playwright
setup_node_environment_and_playwright() {
  echo "Installing Node.js dependencies (using --legacy-peer-deps)..."
  if [ -f "package-lock.json" ] || [ -f "package.json" ]; then
    npm install --legacy-peer-deps
  elif [ -f "yarn.lock" ]; then yarn install
  elif [ -f "pnpm-lock.yaml" ]; then pnpm install
  else echo "No lock file or package.json found. Cannot install Node.js dependencies."; return 1; fi
  if [ $? -ne 0 ]; then echo "Error: Failed to install Node.js base dependencies."; exit 1; fi

  echo "Installing Playwright test runner (@playwright/test)..."
  npm install --save-dev @playwright/test --legacy-peer-deps || npm install --save-dev @playwright/test --force
  if [ $? -ne 0 ]; then echo "Error: Failed to install @playwright/test. Playwright tests may not run."; return 1; fi
  echo "@playwright/test installed."

  echo "Installing Playwright browser binaries..."
  if [ -f "./node_modules/.bin/playwright" ]; then ./node_modules/.bin/playwright install --with-deps; else npx playwright install --with-deps; fi
  if [ $? -ne 0 ]; then echo "Error: Failed to install Playwright browser dependencies."; return 1; fi
  echo "Node.js and Playwright setup complete."
  return 0
}

# Function to generate PDF documentation
generate_pdf_documentation() {
  echo ""
  echo "-----------------------------------------------------"
  echo "DOCUMENTATION GENERATION"
  echo "-----------------------------------------------------"
  local generate_choice=${1:-no}
  if [[ "$generate_choice" != "yes" && "$generate_choice" != "y" ]]; then echo "Skipping PDF documentation generation."; return 0; fi

  echo "Generating PDF documentation..."
  local python_exec_path="python3"
  if [[ "$PYTHON_ENV_TYPE" == "venv" && -d "${PYTHON_VENV_DIR}" ]]; then
    source "${PYTHON_VENV_DIR}/bin/activate"; python_exec_path="python"
  elif [[ "$PYTHON_ENV_TYPE" == "uv" && -d "${PYTHON_UV_ENV_DIR}" ]]; then
    source "${PYTHON_UV_ENV_DIR}/bin/activate"; python_exec_path="python"
  elif [[ "$PYTHON_ENV_TYPE" == "system" ]]; then
    echo "Using system Python for PDF generation."
  else
    echo "Error: Python environment for PDF generation not properly configured or found for type '${PYTHON_ENV_TYPE}'."
    return 1
  fi
  
  python_script_path="${PYTHON_SCRIPTS_DIR}/generate_pdf.py"
  if [ ! -f "$python_script_path" ]; then echo "Error: PDF generation script not found: $python_script_path"; if [[ "$PYTHON_ENV_TYPE" != "system" ]]; then deactivate; fi; return 1; fi
  mkdir -p "${PDF_OUTPUT_DIR}"; echo "PDFs will be saved in ${PDF_OUTPUT_DIR}"
  declare -A docs_to_generate=( ["User_Guide_README.pdf"]="${APP_DIR}/README.md" ["IP_and_Privacy_Considerations.pdf"]="${APP_DIR}/IP_AND_PRIVACY.md" ["SSO_AD_Integration_Guide.pdf"]="${APP_DIR}/docs/SSO_AD_INTEGRATION_GUIDE.md" ["Testing_Strategy.pdf"]="${APP_DIR}/TESTING_STRATEGY.md" )
  for pdf_name in "${!docs_to_generate[@]}"; do
      md_file=${docs_to_generate[$pdf_name]}; pdf_file="${PDF_OUTPUT_DIR}/$pdf_name"
      if [ -f "$md_file" ]; then
          echo "Generating $pdf_name (from $md_file) -> $pdf_file ..."
          $python_exec_path "$python_script_path" "$md_file" "$pdf_file"; if [ $? -eq 0 ]; then echo "Successfully generated: $pdf_file"; else echo "Error generating $pdf_name"; fi
      else echo "Markdown file $md_file not found. Cannot generate $pdf_name."; fi
  done
  echo "PDF documentation generation process finished."; if [[ "$PYTHON_ENV_TYPE" != "system" ]]; then deactivate; fi
}

# Function to run tests (non-interactive execution)
run_tests_non_interactive() {
  echo "Preparing to run tests..."
  local all_tests_passed=true
  local python_exec_path_for_pytest="python3"
  local pytest_command="pytest"

  echo "Running Python tests (Pytest)..."
  if [[ "$PYTHON_ENV_TYPE" == "venv" && -d "${PYTHON_VENV_DIR}" ]]; then
    source "${PYTHON_VENV_DIR}/bin/activate"; pytest_command="${PYTHON_VENV_DIR}/bin/pytest"
  elif [[ "$PYTHON_ENV_TYPE" == "uv" && -d "${PYTHON_UV_ENV_DIR}" ]]; then
    source "${PYTHON_UV_ENV_DIR}/bin/activate"; pytest_command="${PYTHON_UV_ENV_DIR}/bin/pytest"
  elif [[ "$PYTHON_ENV_TYPE" == "system" ]]; then
    echo "Using system Python for Pytest."
    if ! command -v pytest &> /dev/null; then echo "Pytest not found in system PATH. Skipping Python tests."; all_tests_passed=false; fi
  else
    echo "Error: Python environment for Pytest not properly configured or found for type '${PYTHON_ENV_TYPE}'. Skipping Python tests."; all_tests_passed=false;
  fi

  if $all_tests_passed && command -v $pytest_command &> /dev/null; then # Check if pytest command is valid before running
      if [ -d "${PYTEST_DIR}" ]; then
        $pytest_command "${PYTEST_DIR}"; if [ $? -ne 0 ]; then echo "Pytest tests failed."; all_tests_passed=false; fi
      else echo "Pytest directory not found: ${PYTEST_DIR}. Skipping Python tests."; fi
  elif $all_tests_passed; then # if all_tests_passed is still true, but pytest command was not found for system
      echo "Pytest command '$pytest_command' not found. Skipping Python tests."
  fi
  if [[ "$PYTHON_ENV_TYPE" != "system" && ( -d "${PYTHON_VENV_DIR}" || -d "${PYTHON_UV_ENV_DIR}" ) ]]; then deactivate; fi # Deactivate if venv/uv was used

  echo "Running E2E tests (Playwright)..."
  if [ -d "${PLAYWRIGHT_TEST_DIR}" ] && [ -f "playwright.config.ts" ]; then
    if ! npm list --depth=0 @playwright/test > /dev/null 2>&1; then
        echo "Playwright test runner not found. Ensure Node.js dependencies were installed."; all_tests_passed=false
    else
        echo "Attempting to start Next.js dev server for E2E tests..."
        NEXT_PORT=3000 # Default port
        # Attempt to find an available port for Next.js dev server
        for port_to_try in {3000..3005}; do
            if ! lsof -i:$port_to_try -t >/dev/null; then
                NEXT_PORT=$port_to_try
                echo "Next.js will attempt to start on port $NEXT_PORT"
                break
            fi
        done
        if [ "$NEXT_PORT" -eq 3000 ] && lsof -i:3000 -t >/dev/null; then
             echo "Port 3000 is in use, and no other ports in 3000-3005 are free. Check server logs."
        fi 

        PORT=$NEXT_PORT npm run dev > playwright_server.log 2>&1 &
        DEV_SERVER_PID=$!
        echo "Waiting for Next.js dev server to start (PID: $DEV_SERVER_PID) on port $NEXT_PORT..."
        timeout=60; server_ready=false
        while [ $timeout -gt 0 ]; do
            if curl -s --head http://localhost:$NEXT_PORT | head -n 1 | grep "HTTP/1.[01] [23].." > /dev/null; then server_ready=true; break; fi
            sleep 1; timeout=$((timeout-1))
        done
        if ! $server_ready; then 
            echo "Next.js dev server failed to start or is not responding on port $NEXT_PORT within $timeout seconds."
            echo "Server logs (playwright_server.log): START"; cat playwright_server.log; echo "Server logs: END"
            echo "Skipping Playwright tests."; kill $DEV_SERVER_PID 2>/dev/null; wait $DEV_SERVER_PID 2>/dev/null; all_tests_passed=false
        else 
            echo "Next.js dev server started on port $NEXT_PORT. Running Playwright tests..."
            # Update Playwright config to use the dynamic port
            sed -i.bak "s|baseURL: 'http://localhost:3000'|baseURL: 'http://localhost:${NEXT_PORT}'|" playwright.config.ts
            if [ -f "./node_modules/.bin/playwright" ]; then ./node_modules/.bin/playwright test; else npx playwright test; fi
            PLAYWRIGHT_EXIT_CODE=$?
            mv playwright.config.ts.bak playwright.config.ts # Restore original config
            echo "Stopping Next.js dev server (PID: $DEV_SERVER_PID)..."
            kill $DEV_SERVER_PID; wait $DEV_SERVER_PID 2>/dev/null
            echo "Playwright tests finished with exit code: $PLAYWRIGHT_EXIT_CODE"
            if [ $PLAYWRIGHT_EXIT_CODE -ne 0 ]; then echo "Playwright tests failed."; all_tests_passed=false; fi
        fi
    fi
  else echo "Playwright test directory or playwright.config.ts not found. Skipping E2E tests."; fi

  if $all_tests_passed; then echo "All tests passed or were skipped."; return 0; else echo "Some tests failed."; return 1; fi
}

# --- Main Script Execution ---
clear
echo "====================================================="
echo " AI Enhanced Meeting Minutes Generator Setup Script  "
echo "====================================================="

# Create necessary directories if they don't exist
mkdir -p "${PYTHON_SCRIPTS_DIR}" "${APP_DIR}/docs" "${PDF_OUTPUT_DIR}" "${PLAYWRIGHT_TEST_DIR}" "${PYTEST_DIR}"
# Create placeholder files if they don't exist to prevent errors in later steps
[ -f "${APP_DIR}/README.md" ] || echo "# README" > "${APP_DIR}/README.md"
[ -f "${APP_DIR}/IP_AND_PRIVACY.md" ] || echo "# IP_AND_PRIVACY" > "${APP_DIR}/IP_AND_PRIVACY.md"
[ -f "${APP_DIR}/docs/SSO_AD_INTEGRATION_GUIDE.md" ] || echo "# SSO_AD_GUIDE" > "${APP_DIR}/docs/SSO_AD_INTEGRATION_GUIDE.md"
[ -f "${APP_DIR}/TESTING_STRATEGY.md" ] || echo "# TESTING_STRATEGY" > "${APP_DIR}/TESTING_STRATEGY.md"
[ -f "${PYTHON_SCRIPTS_DIR}/generate_pdf.py" ] || echo -e "import sys\ndef create_pdf(md, pdf): print(f'Placeholder: Would generate {pdf} from {md}')\nif __name__ == '__main__': create_pdf(sys.argv[1], sys.argv[2])" > "${PYTHON_SCRIPTS_DIR}/generate_pdf.py"
chmod +x "${PYTHON_SCRIPTS_DIR}/generate_pdf.py"
[ -f "${APP_DIR}/package.json" ] || echo 	'{ "name": "meeting-minutes-app", "scripts": { "dev": "next dev" } }' > "${APP_DIR}/package.json"

INSTALL_DEPS_FLAG=false; GENERATE_DOCS_FLAG=false; RUN_TESTS_FLAG=false; INTERACTIVE_MODE=false
PYTHON_ENV_CHOICE_CLI=""

if [ "$#" -eq 0 ]; then INTERACTIVE_MODE=true; else
    while [[ "$#" -gt 0 ]]; do
        case $1 in
            --install-deps) INSTALL_DEPS_FLAG=true; shift ;; 
            --generate-docs) GENERATE_DOCS_FLAG=true; shift ;; 
            --run-tests) RUN_TESTS_FLAG=true; shift ;; 
            --python-env) PYTHON_ENV_CHOICE_CLI="$2"; shift 2; if [[ ! "$PYTHON_ENV_CHOICE_CLI" =~ ^(venv|uv|system)$ ]]; then echo "Invalid --python-env value. Must be venv, uv, or system."; exit 1; fi ;; 
            *) echo "Unknown option: $1"; exit 1 ;;
        esac
    done
fi

get_os # Detect OS early

if [ "$INTERACTIVE_MODE" = true ]; then
    echo "Running in interactive mode."
    echo ""
    echo "Choose Python environment management type:"
    echo "  1) venv (Recommended, uses Python's built-in venv)"
    echo "  2) uv (Faster, uses Astral's 'uv' tool - will be installed if not present)"
    echo "  3) system (Installs packages globally - NOT RECOMMENDED)"
    read -p "Enter your choice (1-3) [1]: " py_env_choice_interactive
    case "$py_env_choice_interactive" in
        2) PYTHON_ENV_TYPE="uv" ;; 
        3) PYTHON_ENV_TYPE="system" ;; 
        *) PYTHON_ENV_TYPE="venv" ;; # Default to venv
    esac
    echo "Selected Python environment type: $PYTHON_ENV_TYPE"

    install_base_system_dependencies
    install_weasyprint_system_dependencies
    install_playwright_system_dependencies
    install_python_packages "$PYTHON_ENV_TYPE"
    setup_node_environment_and_playwright
    if [ $? -ne 0 ]; then echo "Critical dependency installation failed. Exiting."; exit 1; fi
    
    echo "Do you want to generate PDF documentation? (yes/no) [yes]: "
    read -r gen_docs_choice_interactive
    if [[ "${gen_docs_choice_interactive,,}" == "no" || "${gen_docs_choice_interactive,,}" == "n" ]]; then
        generate_pdf_documentation "no"
    else
        generate_pdf_documentation "yes"
    fi

    echo "Do you want to run the automated tests? (yes/no) [yes]: "
    read -r run_tests_choice_interactive
    if [[ "${run_tests_choice_interactive,,}" != "no" && "${run_tests_choice_interactive,,}" != "n" ]]; then
        run_tests_non_interactive; if [ $? -ne 0 ]; then echo "Automated tests failed."; fi
    else
        echo "Skipping tests."
    fi
else # Non-interactive mode (flags)
    if [ -n "$PYTHON_ENV_CHOICE_CLI" ]; then
        PYTHON_ENV_TYPE="$PYTHON_ENV_CHOICE_CLI"
    fi # Otherwise, default PYTHON_ENV_TYPE="venv" is used
    echo "Using Python environment type: $PYTHON_ENV_TYPE (determined by --python-env or default)"

    if [ "$INSTALL_DEPS_FLAG" = true ]; then
        echo "Full dependency installation requested."
        install_base_system_dependencies
        install_weasyprint_system_dependencies
        install_playwright_system_dependencies
        install_python_packages "$PYTHON_ENV_TYPE"
        setup_node_environment_and_playwright
        if [ $? -ne 0 ]; then echo "Critical dependency installation failed during --install-deps. Exiting."; exit 1; fi
    fi

    if [ "$GENERATE_DOCS_FLAG" = true ]; then
        echo "PDF documentation generation requested."
        # Ensure Python packages are installed if only --generate-docs is passed without --install-deps
        if ! ( [[ "$PYTHON_ENV_TYPE" == "system" ]] || 
               [[ "$PYTHON_ENV_TYPE" == "venv" && -f "${PYTHON_VENV_DIR}/bin/activate" ]] || 
               [[ "$PYTHON_ENV_TYPE" == "uv" && -f "${PYTHON_UV_ENV_DIR}/bin/activate" ]] ); then 
            echo "Python environment for '${PYTHON_ENV_TYPE}' not found. Running Python package installation first."
            install_python_packages "$PYTHON_ENV_TYPE"
            if [ $? -ne 0 ]; then echo "Failed to install Python packages for PDF generation."; exit 1; fi
        fi
        generate_pdf_documentation "yes"
    fi

    if [ "$RUN_TESTS_FLAG" = true ]; then
        echo "Test execution requested."
        echo "Ensuring all test dependencies are installed..."
        # Ensure Python packages (including pytest) are installed
        if ! ( [[ "$PYTHON_ENV_TYPE" == "system" && -x "$(command -v pytest)" ]] || 
               [[ "$PYTHON_ENV_TYPE" == "venv" && -f "${PYTHON_VENV_DIR}/bin/pytest" ]] || 
               [[ "$PYTHON_ENV_TYPE" == "uv" && -f "${PYTHON_UV_ENV_DIR}/bin/pytest" ]] ); then 
            echo "Python test dependencies for '${PYTHON_ENV_TYPE}' not found. Running Python package installation first."
            install_python_packages "$PYTHON_ENV_TYPE"
            if [ $? -ne 0 ]; then echo "Failed to install Python packages for testing."; exit 1; fi
        fi
        # Ensure Node.js/Playwright dependencies are installed
        if ! npm list --depth=0 @playwright/test > /dev/null 2>&1; then 
            echo "Playwright not found. Running Node.js/Playwright setup..."
            setup_node_environment_and_playwright
            if [ $? -ne 0 ]; then echo "Failed to setup Playwright for testing."; exit 1; fi
        fi
        
        echo "Proceeding to run tests (non-interactive mode)..."
        run_tests_non_interactive; if [ $? -ne 0 ]; then echo "Automated tests failed."; fi 
    fi
fi

echo ""
echo "Setup script finished."
exit 0

