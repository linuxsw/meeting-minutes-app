#!/bin/bash

# AI Enhanced Meeting Minutes Generator Setup Script
# This script sets up the environment for the Meeting Minutes Generator application

set -e

# Default values
INTERACTIVE_MODE=true
INSTALL_DEPS_FLAG=false
GENERATE_DOCS_FLAG=false
RUN_TESTS_FLAG=false
PYTHON_ENV_TYPE="venv"  # Default to venv
PYTHON_ENV_CHOICE_CLI=""
PYTHON_VENV_DIR="app_env_venv"
PYTHON_UV_ENV_DIR="app_env_uv"

# Function to detect OS
get_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS_TYPE="macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS_TYPE="linux"
    else
        echo "Unsupported OS: $OSTYPE"
        exit 1
    fi
    echo "Detected OS: $OS_TYPE"
}

# Function to install base system dependencies
install_base_system_dependencies() {
    echo "Installing base system dependencies..."
    if [[ "$OS_TYPE" == "linux" ]]; then
        sudo apt-get update
        sudo apt-get install -y python3-pip python3-venv build-essential
    elif [[ "$OS_TYPE" == "macos" ]]; then
        # Check if Homebrew is installed
        if ! command -v brew &> /dev/null; then
            echo "Homebrew not found. Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install python@3.11
    fi
    echo "Base system dependencies installed."
}

# Function to install WeasyPrint system dependencies
install_weasyprint_system_dependencies() {
    echo "Installing WeasyPrint system dependencies..."
    if [[ "$OS_TYPE" == "linux" ]]; then
        sudo apt-get install -y libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0 libffi-dev
    elif [[ "$OS_TYPE" == "macos" ]]; then
        brew install pango harfbuzz
    fi
    echo "WeasyPrint system dependencies installed."
}

# Function to install Playwright system dependencies
install_playwright_system_dependencies() {
    echo "Installing Playwright system dependencies..."
    if [[ "$OS_TYPE" == "linux" ]]; then
        # Playwright will install its own dependencies via npm
        echo "Playwright dependencies will be installed via npm."
    elif [[ "$OS_TYPE" == "macos" ]]; then
        # Playwright will install its own dependencies via npm
        echo "Playwright dependencies will be installed via npm."
    fi
}

# Function to install Python packages
install_python_packages() {
    local env_type=$1
    echo "Installing Python packages using environment type: $env_type"
    
    if [[ "$env_type" == "venv" ]]; then
        echo "Creating Python virtual environment using venv..."
        python3 -m venv "$PYTHON_VENV_DIR"
        
        # Activate the virtual environment
        source "$PYTHON_VENV_DIR/bin/activate"
        
        # Upgrade pip
        pip install --upgrade pip
        
        # Install required packages
        echo "Installing packages: wheel WeasyPrint markdown pytest python-pptx"
        pip install wheel WeasyPrint markdown pytest python-pptx
        
        if [ $? -ne 0 ]; then
            echo "Error: Failed to install Python packages with venv. Trying with uv instead."
            deactivate
            install_python_packages "uv"
            return
        fi
        
        echo "Python packages installation complete for 'venv' environment."
        
    elif [[ "$env_type" == "uv" ]]; then
        echo "Creating Python virtual environment using uv..."
        
        # Check if uv is installed
        if ! command -v uv &> /dev/null; then
            echo "uv not found. Installing uv..."
            if [[ "$OS_TYPE" == "linux" ]]; then
                curl -LsSf https://astral.sh/uv/install.sh | sh
            elif [[ "$OS_TYPE" == "macos" ]]; then
                brew install uv
            fi
        fi
        
        # Create virtual environment with uv
        uv venv "$PYTHON_UV_ENV_DIR"
        
        # Activate the virtual environment
        source "$PYTHON_UV_ENV_DIR/bin/activate"
        
        # Install required packages with uv
        echo "Installing packages: wheel WeasyPrint markdown pytest python-pptx"
        uv pip install wheel WeasyPrint markdown pytest python-pptx
        
        if [ $? -ne 0 ]; then
            echo "Error: Failed to install Python packages with uv."
            exit 1
        fi
        
        echo "Python packages installation complete for 'uv' environment."
        
    elif [[ "$env_type" == "system" ]]; then
        echo "Installing Python packages globally (not recommended)..."
        
        # Install required packages globally
        pip3 install wheel WeasyPrint markdown pytest python-pptx
        
        if [ $? -ne 0 ]; then
            echo "Error: Failed to install Python packages globally."
            exit 1
        fi
        
        echo "Python packages installation complete for 'system' environment."
    fi
}

# Function to setup Node.js environment and Playwright
setup_node_environment_and_playwright() {
    echo "Installing Node.js dependencies (using --legacy-peer-deps)..."
    npm install --legacy-peer-deps
    
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install Node.js dependencies."
        exit 1
    fi
    
    echo "Installing Playwright browsers..."
    npx playwright install
    
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install Playwright browsers."
        exit 1
    fi
    
    echo "Node.js and Playwright setup complete."
}

# Function to generate PDF documentation
generate_pdf_documentation() {
    local generate_docs=$1
    
    if [[ "$generate_docs" == "yes" ]]; then
        echo "Generating PDF documentation..."
        
        # Create directory for generated docs
        mkdir -p generated_docs
        
        # Activate the appropriate Python environment
        if [[ "$PYTHON_ENV_TYPE" == "venv" ]]; then
            source "$PYTHON_VENV_DIR/bin/activate"
        elif [[ "$PYTHON_ENV_TYPE" == "uv" ]]; then
            source "$PYTHON_UV_ENV_DIR/bin/activate"
        fi
        
        # Generate PDFs from Markdown files
        python3 -c "
import markdown
from weasyprint import HTML
import os

def md_to_pdf(md_file, pdf_file):
    with open(md_file, 'r') as f:
        md_content = f.read()
    
    html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])
    html_content = f'<html><head><style>body {{ font-family: Arial, sans-serif; margin: 2cm; }} pre {{ background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }} code {{ font-family: monospace; }}</style></head><body>{html_content}</body></html>'
    
    HTML(string=html_content).write_pdf(pdf_file)
    print(f'Generated {pdf_file}')

# List of Markdown files to convert
md_files = ['README.md', 'SETUP_AND_USER_GUIDE.md', 'Business_Value_Proposition.md']

for md_file in md_files:
    if os.path.exists(md_file):
        pdf_file = os.path.join('generated_docs', os.path.splitext(md_file)[0] + '.pdf')
        md_to_pdf(md_file, pdf_file)
    else:
        print(f'Warning: {md_file} not found')
"
        
        echo "PDF documentation generation complete."
    else
        echo "Skipping PDF documentation generation."
    fi
}

# Function to run tests in non-interactive mode
run_tests_non_interactive() {
    echo "Running automated tests..."
    
    # Activate the appropriate Python environment
    if [[ "$PYTHON_ENV_TYPE" == "venv" ]]; then
        source "$PYTHON_VENV_DIR/bin/activate"
    elif [[ "$PYTHON_ENV_TYPE" == "uv" ]]; then
        source "$PYTHON_UV_ENV_DIR/bin/activate"
    fi
    
    # Run Python tests
    echo "Running Python tests..."
    python -m pytest tests/python
    
    # Run Playwright tests
    echo "Running Playwright tests..."
    npx playwright test
    
    echo "Automated tests complete."
}

# Display banner
echo "====================================================="
echo " AI Enhanced Meeting Minutes Generator Setup Script  "
echo "====================================================="

# Parse command-line arguments
if [ $# -gt 0 ]; then
    INTERACTIVE_MODE=false
    while [ $# -gt 0 ]; do
        case "$1" in
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
