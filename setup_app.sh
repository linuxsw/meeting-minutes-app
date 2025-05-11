#!/bin/bash

# Script to install Meeting Minutes Generator dependencies and optionally generate documentation

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
  echo "Installing dependencies for Ubuntu/Debian..."
  sudo apt-get update
  sudo apt-get install -y python3 python3-pip python3-venv git ffmpeg
  # WeasyPrint system dependencies (from WeasyPrint documentation)
  sudo apt-get install -y build-essential python3-dev libffi-dev libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info
}

# Function to install dependencies on macOS
install_macos_dependencies() {
  echo "Installing dependencies for macOS..."
  # Check for Homebrew
  if ! command -v brew &> /dev/null
  then
      echo "Homebrew not found. Please install Homebrew first: https://brew.sh/"
      exit 1
  fi
  echo "Updating Homebrew..."
  brew update
  echo "Installing Python, ffmpeg, and WeasyPrint dependencies via Homebrew..."
  brew install python@3.9 git ffmpeg pango cairo libffi gdk-pixbuf 
}

# Function to set up Python virtual environment and install packages
setup_python_environment() {
  echo "Setting up Python virtual environment 'app_env'..."
  python3 -m venv app_env
  if [ $? -ne 0 ]; then
    echo "Error: Failed to create Python virtual environment. Please check your Python3 installation."
    exit 1
  fi
  
  echo "Activating virtual environment..."
  source app_env/bin/activate
  if [ $? -ne 0 ]; then
    echo "Error: Failed to activate Python virtual environment."
    exit 1
  fi

  echo "Installing Python packages (WeasyPrint, Markdown)..."
  pip3 install --upgrade pip
  pip3 install wheel
  pip3 install WeasyPrint markdown
  if [ $? -ne 0 ]; then
    echo "Error: Failed to install Python packages. Please check your pip installation and internet connection."
    deactivate
    exit 1
  fi
  
  echo "Python environment setup complete. Deactivating virtual environment for now."
  deactivate
}

# Function to generate PDF documentation
generate_pdf_documentation() {
  echo ""
  echo "-----------------------------------------------------"
  echo "DOCUMENTATION GENERATION"
  echo "-----------------------------------------------------"
  echo "The application includes the following documentation generated from Markdown:"
  echo " - User Guide (from README.md)"
  echo " - IP and Privacy Document (from IP_AND_PRIVACY.md)"
  echo " - SSO/AD Integration Guide (from docs/SSO_AD_INTEGRATION_GUIDE.md)"
  echo ""

  # Default to 'yes' for automated environments or allow override via argument
  local generate_docs_param=${1:-yes} # Use first argument or default to 'yes'

  if [[ "$generate_docs_param" == "yes" || "$generate_docs_param" == "y" ]]; then
    echo "Generating PDF documentation (auto-confirmed or via parameter)..."
    echo "Activating Python virtual environment for PDF generation..."
    if [ ! -d "app_env" ]; then
        echo "Error: Python virtual environment 'app_env' not found. Please run the dependency installation first."
        return 1
    fi
    source app_env/bin/activate
    if [ $? -ne 0 ]; then
        echo "Error: Failed to activate Python virtual environment for PDF generation."
        return 1
    fi

    python_script_path="./scripts/generate_pdf.py"
    output_dir="./generated_docs"

    if [ ! -f "$python_script_path" ]; then
        echo "Error: Python script for PDF generation not found at $python_script_path"
        echo "Please ensure 'scripts/generate_pdf.py' exists."
        deactivate
        return 1
    fi

    if [ ! -d "$output_dir" ]; then
      mkdir -p "$output_dir"
      echo "Created directory $output_dir for PDF outputs."
    fi

    declare -A docs_to_generate
    docs_to_generate["User_Guide_README.pdf"]="./README.md"
    docs_to_generate["IP_and_Privacy_Considerations.pdf"]="./IP_AND_PRIVACY.md"
    docs_to_generate["SSO_AD_Integration_Guide.pdf"]="./docs/SSO_AD_INTEGRATION_GUIDE.md"

    for pdf_name in "${!docs_to_generate[@]}"
    do
        md_file=${docs_to_generate[$pdf_name]}
        pdf_file="$output_dir/$pdf_name"
        
        if [ -f "$md_file" ]; then
            echo "Generating $pdf_name (from $md_file) -> $pdf_file ..."
            python3 "$python_script_path" "$md_file" "$pdf_file"
            if [ $? -eq 0 ]; then
                echo "$pdf_name generated: $pdf_file"
            else
                echo "Error generating $pdf_name from $md_file"
            fi
        else
            echo "Markdown file $md_file not found. Cannot generate $pdf_name."
        fi
    done
    
    echo "PDF documentation generation process finished."
    deactivate
    echo "Deactivated Python virtual environment."
  else
    echo "Skipping PDF documentation generation based on parameter: $generate_docs_param."
  fi
}

# --- Main Script --- 
clear
echo "====================================================="
echo " AI Enhanced Meeting Minutes Generator Setup Script  "
echo "====================================================="

# Create necessary directories if they don't exist (moved earlier for clarity)
mkdir -p scripts
mkdir -p docs
mkdir -p generated_docs # Ensure generated_docs exists before script runs

# Create dummy files if they don't exist for testing purposes
# In a real scenario, these files would be part of the project
[ -f README.md ] || echo "# README Content" > README.md
[ -f IP_AND_PRIVACY.md ] || echo "# IP and Privacy Content" > IP_AND_PRIVACY.md
[ -f docs/SSO_AD_INTEGRATION_GUIDE.md ] || echo "# SSO/AD Guide Content" > docs/SSO_AD_INTEGRATION_GUIDE.md

# Save the Python script for PDF generation
cat << 'EOF' > ./scripts/generate_pdf.py
import sys
from weasyprint import HTML, CSS
from markdown import markdown
import os

def create_pdf(markdown_file_path, pdf_file_path):
    try:
        with open(markdown_file_path, 'r', encoding='utf-8') as f:
            md_content = f.read()

        html_content = markdown(md_content, extensions=['tables', 'fenced_code', 'footnotes', 'attr_list', 'md_in_html', 'sane_lists', 'toc'])

        css_style = """
        @page {
            size: A4;
            margin: 1cm;
        }
        body {
            font-family: 'DejaVu Sans', 'Arial Unicode MS', Arial, sans-serif;
            font-size: 10pt; 
            line-height: 1.3;
            color: #333333;
        }
        h1, h2, h3, h4, h5, h6 {
            font-family: 'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-weight: bold;
            margin-top: 1.2em;
            margin-bottom: 0.4em;
            color: #1a1a1a;
        }
        h1 { font-size: 22pt; border-bottom: 1px solid #aaaaaa; padding-bottom: 0.2em; margin-top: 0;}
        h2 { font-size: 18pt; border-bottom: 1px solid #bbbbbb; padding-bottom: 0.15em; }
        h3 { font-size: 15pt; }
        h4 { font-size: 12pt; }
        p {
            margin-bottom: 0.5em;
            text-align: justify;
        }
        a {
            color: #0056b3;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        code {
            font-family: 'Courier New', Courier, monospace;
            background-color: #f0f0f0;
            padding: 0.1em 0.2em;
            border: 1px solid #e0e0e0;
            border-radius: 2px;
            font-size: 0.85em;
            color: #c7254e;
        }
        pre {
            font-family: 'Courier New', Courier, monospace;
            background-color: #f6f8fa;
            padding: 8px;
            border: 1px solid #ced4da;
            border-radius: 3px;
            font-size: 0.85em;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.2;
        }
        pre code {
            background-color: transparent;
            border: none;
            padding: 0;
            color: inherit;
        }
        blockquote {
            border-left: 3px solid #007bff;
            padding-left: 10px;
            margin-left: 0;
            font-style: italic;
            color: #444444;
            background-color: #f9f9f9;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1em;
            border: 1px solid #dee2e6;
        }
        th, td {
            border: 1px solid #dee2e6;
            padding: 0.5rem;
            text-align: left;
        }
        th {
            background-color: #e9ecef;
            font-weight: bold;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0.5em auto;
        }
        ul, ol {
            margin-left: 1.5em;
            padding-left: 0;
            margin-bottom: 0.5em;
        }
        li {
            margin-bottom: 0.25em;
        }
        /* Table of Contents Styling */
        .toc {
            border: 1px solid #ced4da;
            background-color: #f8f9fa;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        .toc ul {
            list-style-type: none;
            padding-left: 5px;
        }
        .toc ul li a {
            text-decoration: none;
            color: #333;
        }
        .toc ul li a:hover {
            color: #0056b3;
        }
        """

        html_doc = HTML(string=html_content, base_url=os.path.dirname(os.path.abspath(markdown_file_path)))
        css_doc = CSS(string=css_style)
        html_doc.write_pdf(pdf_file_path, stylesheets=[css_doc])
        # print(f"Successfully converted 	'{markdown_file_path}	' to 	'{pdf_file_path}	'") # Silenced for this execution

    except FileNotFoundError:
        print(f"Error: Markdown file not found at 	'{markdown_file_path}	'")
        sys.exit(1) # Exit if a critical file is missing
    except Exception as e:
        print(f"An error occurred during PDF generation: {e}")
        sys.exit(1) # Exit on other errors

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_pdf_from_markdown.py <input_markdown_file> <output_pdf_file>")
        sys.exit(1)
    
    markdown_file = sys.argv[1]
    pdf_file = sys.argv[2]
    create_pdf(markdown_file, pdf_file)
EOF

# Make the python script executable
chmod +x ./scripts/generate_pdf.py

get_os

# Default to 'yes' for PDF generation if no argument is provided
PDF_GENERATION_CHOICE=${1:-yes}

if [[ "$OS" == "Ubuntu" || "$OS" == "Debian GNU/Linux" ]]; then
  install_ubuntu_dependencies
elif [[ "$OS" == "MacOS" ]]; then 
  install_macos_dependencies
else
  echo "Unsupported OS: $OS. This script supports Ubuntu/Debian and macOS (with Homebrew)."
  exit 1
fi

setup_python_environment

# Call generate_pdf_documentation with the choice
generate_pdf_documentation "$PDF_GENERATION_CHOICE"

echo ""
echo "Setup script finished."
echo "To run Python scripts for the application (like the PDF generator manually),"
echo "remember to activate the virtual environment first: source app_env/bin/activate"

exit 0

