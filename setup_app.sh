#!/bin/bash

# Script to install Meeting Minutes Generator dependencies, optionally generate documentation, and run tests

# --- Configuration ---
APP_DIR=$(pwd)
PYTHON_ENV_DIR="app_env"
PYTHON_SCRIPTS_DIR="${APP_DIR}/scripts"
PDF_OUTPUT_DIR="${APP_DIR}/generated_docs"
PLAYWRIGHT_TEST_DIR="${APP_DIR}/tests/e2e"
PYTEST_DIR="${APP_DIR}/tests/python"

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

# Function to install dependencies on Ubuntu/Debian
install_ubuntu_dependencies() {
  echo "Installing base dependencies for Ubuntu/Debian..."
  sudo apt-get update
  sudo apt-get install -y python3 python3-pip python3-venv git ffmpeg curl
  echo "Installing WeasyPrint system dependencies..."
  sudo apt-get install -y build-essential python3-dev libffi-dev libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 shared-mime-info
  echo "Installing Playwright system dependencies..."
  sudo apt-get install -y libnss3 libnspr4 libdbus-glib-1-2 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgbm1 libasound2 libx11-xcb1 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libxrender1 libxss1 libxtst6 libgtk-3-0
}

# Function to install dependencies on macOS
install_macos_dependencies() {
  echo "Installing dependencies for macOS..."
  if ! command -v brew &> /dev/null; then
      echo "Homebrew not found. Please install Homebrew first: https://brew.sh/"
      exit 1
  fi
  echo "Updating Homebrew..."
  brew update
  echo "Installing Python, Git, ffmpeg, and WeasyPrint dependencies via Homebrew..."
  brew install python@3.9 git ffmpeg pango cairo libffi gdk-pixbuf
  echo "For Playwright, browser binaries will be installed via npx playwright install --with-deps."
}

# Function to set up Python virtual environment and install core packages
setup_python_environment() {
  echo "Setting up Python virtual environment '${PYTHON_ENV_DIR}'..."
  if [ ! -d "${PYTHON_ENV_DIR}" ]; then
    python3 -m venv "${PYTHON_ENV_DIR}"
    if [ $? -ne 0 ]; then echo "Error: Failed to create Python virtual environment."; exit 1; fi
  else
    echo "Python virtual environment '${PYTHON_ENV_DIR}' already exists."
  fi
  
  source "${PYTHON_ENV_DIR}/bin/activate"
  if [ $? -ne 0 ]; then echo "Error: Failed to activate Python virtual environment."; exit 1; fi

  echo "Installing/upgrading core Python packages (pip, wheel, WeasyPrint, Markdown)..."
  pip3 install --upgrade pip wheel
  pip3 install WeasyPrint markdown
  if [ $? -ne 0 ]; then echo "Error: Failed to install core Python packages."; deactivate; exit 1; fi
  
  echo "Core Python environment setup complete."
  deactivate
}

# Function to install Node.js dependencies and Playwright
setup_node_environment_and_playwright() {
  echo "Installing Node.js dependencies (using --legacy-peer-deps)..."
  if [ -f "package-lock.json" ] || [ -f "package.json" ]; then # Ensure package.json exists for npm install
    npm install --legacy-peer-deps
  elif [ -f "yarn.lock" ]; then
    yarn install
  elif [ -f "pnpm-lock.yaml" ]; then
    pnpm install
  else
    echo "No lock file or package.json found. Cannot install Node.js dependencies."
    return 1 # Indicate failure
  fi
  if [ $? -ne 0 ]; then echo "Error: Failed to install Node.js base dependencies."; exit 1; fi

  echo "Installing Playwright test runner (@playwright/test)..."
  npm install --save-dev @playwright/test --legacy-peer-deps
  if [ $? -ne 0 ]; then 
    echo "Warning: Failed to install @playwright/test with --legacy-peer-deps. Trying with --force..."
    npm install --save-dev @playwright/test --force
    if [ $? -ne 0 ]; then 
      echo "Error: Failed to install @playwright/test even with --force. Playwright tests may not run."
      return 1 # Indicate failure
    fi
  fi
  echo "@playwright/test installed."

  echo "Installing Playwright browser binaries..."
  if [ -f "./node_modules/.bin/playwright" ]; then
    ./node_modules/.bin/playwright install --with-deps
  else 
    echo "Playwright CLI not found in node_modules/.bin, trying npx..."
    npx playwright install --with-deps
  fi
  if [ $? -ne 0 ]; then echo "Error: Failed to install Playwright browser dependencies."; return 1; fi
  echo "Node.js and Playwright setup complete."
  return 0
}

# Function to install Python test dependencies
install_python_test_dependencies() {
  echo "Activating Python virtual environment for test dependencies..."
  if [ ! -d "${PYTHON_ENV_DIR}" ]; then
      echo "Error: Python virtual environment '${PYTHON_ENV_DIR}' not found. Run core Python setup first."
      return 1
  fi
  source "${PYTHON_ENV_DIR}/bin/activate"
  if [ $? -ne 0 ]; then echo "Error: Failed to activate Python virtual environment."; return 1; fi

  echo "Installing Pytest..."
  pip3 install pytest
  if [ $? -ne 0 ]; then echo "Error: Failed to install Pytest."; deactivate; return 1; fi

  echo "Pytest installation complete."
  deactivate
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
  if [ ! -d "${PYTHON_ENV_DIR}" ]; then echo "Error: Python venv '${PYTHON_ENV_DIR}' not found."; return 1; fi
  source "${PYTHON_ENV_DIR}/bin/activate"
  if [ $? -ne 0 ]; then echo "Error: Failed to activate Python venv."; return 1; fi
  python_script_path="${PYTHON_SCRIPTS_DIR}/generate_pdf.py"
  if [ ! -f "$python_script_path" ]; then echo "Error: PDF generation script not found: $python_script_path"; deactivate; return 1; fi
  mkdir -p "${PDF_OUTPUT_DIR}"; echo "PDFs will be saved in ${PDF_OUTPUT_DIR}"
  declare -A docs_to_generate=( ["User_Guide_README.pdf"]="${APP_DIR}/README.md" ["IP_and_Privacy_Considerations.pdf"]="${APP_DIR}/IP_AND_PRIVACY.md" ["SSO_AD_Integration_Guide.pdf"]="${APP_DIR}/docs/SSO_AD_INTEGRATION_GUIDE.md" ["Testing_Strategy.pdf"]="${APP_DIR}/TESTING_STRATEGY.md" )
  for pdf_name in "${!docs_to_generate[@]}"; do
      md_file=${docs_to_generate[$pdf_name]}; pdf_file="${PDF_OUTPUT_DIR}/$pdf_name"
      if [ -f "$md_file" ]; then
          echo "Generating $pdf_name (from $md_file) -> $pdf_file ..."
          python3 "$python_script_path" "$md_file" "$pdf_file"; if [ $? -eq 0 ]; then echo "Successfully generated: $pdf_file"; else echo "Error generating $pdf_name"; fi
      else echo "Markdown file $md_file not found. Cannot generate $pdf_name."; fi
  done
  echo "PDF documentation generation process finished."; deactivate
}

# Function to run tests (interactive prompt)
run_tests_interactive() {
  echo ""
  echo "-----------------------------------------------------"
  echo "RUNNING AUTOMATED TESTS"
  echo "-----------------------------------------------------"
  echo "Do you want to run the automated tests? (yes/no)"
  read -r run_tests_choice
  if [[ "$run_tests_choice" != "yes" && "$run_tests_choice" != "y" ]]; then echo "Skipping tests."; return 0; fi
  run_tests_non_interactive
  return $?
}

# Function to run tests (non-interactive execution)
run_tests_non_interactive() {
  echo "Preparing to run tests..."
  local all_tests_passed=true

  echo "Running Python tests (Pytest)..."
  if [ ! -d "${PYTHON_ENV_DIR}" ]; then echo "Error: Python venv not found."; all_tests_passed=false; else
    source "${PYTHON_ENV_DIR}/bin/activate"
    if [ $? -ne 0 ]; then echo "Error: Failed to activate Python venv."; all_tests_passed=false; else
      if [ -d "${PYTEST_DIR}" ]; then
        pytest "${PYTEST_DIR}"; if [ $? -ne 0 ]; then echo "Pytest tests failed."; all_tests_passed=false; fi
      else echo "Pytest directory not found: ${PYTEST_DIR}. Skipping Python tests."; fi
      deactivate
    fi
  fi

  echo "Running E2E tests (Playwright)..."
  if [ -d "${PLAYWRIGHT_TEST_DIR}" ] && [ -f "playwright.config.ts" ]; then
    if ! npm list --depth=0 @playwright/test > /dev/null 2>&1; then
        echo "Playwright test runner not found. Ensure Node.js dependencies were installed."
        all_tests_passed=false
    else
        echo "Attempting to start Next.js dev server for E2E tests..."
        npm run dev > playwright_server.log 2>&1 &
        DEV_SERVER_PID=$!
        echo "Waiting for Next.js dev server to start (PID: $DEV_SERVER_PID)..."
        timeout=45; server_ready=false
        while [ $timeout -gt 0 ]; do
            if curl -s --head http://localhost:3000 | head -n 1 | grep "HTTP/1.[01] [23].." > /dev/null; then server_ready=true; break; fi
            sleep 1; timeout=$((timeout-1))
        done
        if ! $server_ready; then 
            echo "Next.js dev server failed to start or is not responding on port 3000 within 45 seconds."
            echo "Server logs (playwright_server.log): START"; cat playwright_server.log; echo "Server logs: END"
            echo "Skipping Playwright tests."; kill $DEV_SERVER_PID 2>/dev/null; wait $DEV_SERVER_PID 2>/dev/null; all_tests_passed=false
        else 
            echo "Next.js dev server started. Running Playwright tests..."
            if [ -f "./node_modules/.bin/playwright" ]; then ./node_modules/.bin/playwright test; else npx playwright test; fi
            PLAYWRIGHT_EXIT_CODE=$?
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

mkdir -p "${PYTHON_SCRIPTS_DIR}" "${APP_DIR}/docs" "${PDF_OUTPUT_DIR}" "${PLAYWRIGHT_TEST_DIR}" "${PYTEST_DIR}"
[ -f "${APP_DIR}/README.md" ] || echo "# README" > "${APP_DIR}/README.md"
[ -f "${APP_DIR}/IP_AND_PRIVACY.md" ] || echo "# IP_AND_PRIVACY" > "${APP_DIR}/IP_AND_PRIVACY.md"
[ -f "${APP_DIR}/docs/SSO_AD_INTEGRATION_GUIDE.md" ] || echo "# SSO_AD_GUIDE" > "${APP_DIR}/docs/SSO_AD_INTEGRATION_GUIDE.md"
[ -f "${APP_DIR}/TESTING_STRATEGY.md" ] || echo "# TESTING_STRATEGY" > "${APP_DIR}/TESTING_STRATEGY.md"
[ -f "${PYTHON_SCRIPTS_DIR}/generate_pdf.py" ] || echo -e "import sys\ndef create_pdf(md, pdf): print(f'Placeholder: Would generate {pdf} from {md}')\nif __name__ == '__main__': create_pdf(sys.argv[1], sys.argv[2])" > "${PYTHON_SCRIPTS_DIR}/generate_pdf.py"
chmod +x "${PYTHON_SCRIPTS_DIR}/generate_pdf.py"
[ -f "${APP_DIR}/package.json" ] || echo 	'{ "name": "meeting-minutes-app", "scripts": { "dev": "echo Mock dev server" } }' > "${APP_DIR}/package.json"

INSTALL_DEPS_FLAG=false; GENERATE_DOCS_FLAG=false; RUN_TESTS_FLAG=false

if [ "$#" -eq 0 ]; then # Interactive mode
    echo "Running in interactive mode."
    get_os
    if [[ "$OS" == "Ubuntu" || "$OS" == "Debian GNU/Linux" ]]; then install_ubuntu_dependencies; elif [[ "$OS" == "MacOS" ]]; then install_macos_dependencies; else echo "Unsupported OS: $OS."; exit 1; fi
    setup_python_environment && install_python_test_dependencies && setup_node_environment_and_playwright
    if [ $? -ne 0 ]; then echo "Critical dependency installation failed. Exiting."; exit 1; fi
    generate_pdf_documentation "yes"
    run_tests_interactive
else # Non-interactive mode
    while [[ "$#" -gt 0 ]]; do
        case $1 in
            --install-deps) INSTALL_DEPS_FLAG=true; shift ;; 
            --generate-docs) GENERATE_DOCS_FLAG=true; shift ;; 
            --run-tests) RUN_TESTS_FLAG=true; shift ;; 
            *) echo "Unknown option: $1"; exit 1 ;;
        esac
    done

    if [ "$INSTALL_DEPS_FLAG" = true ]; then
        echo "Full dependency installation requested."; get_os
        if [[ "$OS" == "Ubuntu" || "$OS" == "Debian GNU/Linux" ]]; then install_ubuntu_dependencies; elif [[ "$OS" == "MacOS" ]]; then install_macos_dependencies; else echo "Unsupported OS: $OS."; exit 1; fi
        setup_python_environment && install_python_test_dependencies && setup_node_environment_and_playwright
        if [ $? -ne 0 ]; then echo "Critical dependency installation failed during --install-deps. Exiting."; exit 1; fi
    fi

    if [ "$GENERATE_DOCS_FLAG" = true ]; then
        if [ ! -d "${PYTHON_ENV_DIR}/bin" ]; then echo "Python env needed for PDF generation. Setting up..."; setup_python_environment; fi
        generate_pdf_documentation "yes"
    fi

    if [ "$RUN_TESTS_FLAG" = true ]; then
        echo "Test execution requested."
        echo "Ensuring all test dependencies are installed..."
        if [ ! -f "${PYTHON_ENV_DIR}/bin/pytest" ]; then echo "Pytest not found. Setting up Python test dependencies..."; setup_python_environment && install_python_test_dependencies; if [ $? -ne 0 ]; then echo "Failed to setup Python test deps."; exit 1; fi; fi
        if ! npm list --depth=0 @playwright/test > /dev/null 2>&1; then echo "Playwright not found. Setting up Node.js/Playwright..."; setup_node_environment_and_playwright; if [ $? -ne 0 ]; then echo "Failed to setup Playwright."; exit 1; fi; fi
        
        echo "Proceeding to run tests (non-interactive mode)..."
        run_tests_non_interactive; if [ $? -ne 0 ]; then echo "Automated tests failed."; fi 
    fi
fi

echo ""
echo "Setup script finished."
exit 0

