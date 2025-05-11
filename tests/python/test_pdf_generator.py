import pytest
import os
import subprocess

# Define the path to the script and test files
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..')) # Assumes tests/python is two levels down from project root
PDF_GENERATOR_SCRIPT = os.path.join(PROJECT_ROOT, "scripts", "generate_pdf.py")
TEST_MD_FILE = os.path.join(SCRIPT_DIR, "test_input.md")
TEST_PDF_OUTPUT = os.path.join(SCRIPT_DIR, "test_output.pdf")

@pytest.fixture(scope="module", autouse=True)
def setup_test_environment():
    # Create a dummy markdown file for testing
    with open(TEST_MD_FILE, "w") as f:
        f.write("# Test Markdown\n\nThis is a test paragraph.")
    yield
    # Clean up: remove the dummy markdown and generated PDF file
    if os.path.exists(TEST_MD_FILE):
        os.remove(TEST_MD_FILE)
    if os.path.exists(TEST_PDF_OUTPUT):
        os.remove(TEST_PDF_OUTPUT)

def test_pdf_generation():
    """Test if the PDF generation script runs and creates an output file."""
    # Ensure the script is executable (though we call it with python3)
    # In a real CI, ensure the venv is activated or python3 points to the venv's python
    # For simplicity here, we assume generate_pdf.py can be run with the system's python3
    # if WeasyPrint and Markdown are installed in a way accessible to it.
    # A more robust test would activate the venv created by setup_app.sh
    
    # For now, let's assume the script is run within an environment where dependencies are met
    # or we are testing the script's logic assuming dependencies are handled by the setup script.

    # Check if the script exists
    assert os.path.exists(PDF_GENERATOR_SCRIPT), f"PDF generator script not found at {PDF_GENERATOR_SCRIPT}"

    # Run the PDF generation script
    # In a CI/test environment, you might need to ensure the venv is activated first
    # For this example, we'll call it directly assuming dependencies are globally available or in PATH
    # This might need adjustment based on how the setup_app.sh configures the environment for execution
    
    # Command to run, assuming generate_pdf.py is in the PATH or called with python3
    # If using a venv, the command would be: "source app_env/bin/activate && python3 scripts/generate_pdf.py ..."
    # For simplicity, we'll assume direct python3 execution with installed libraries.
    command = ["python3", PDF_GENERATOR_SCRIPT, TEST_MD_FILE, TEST_PDF_OUTPUT]
    
    result = subprocess.run(command, capture_output=True, text=True, cwd=PROJECT_ROOT)
    
    print("STDOUT:", result.stdout)
    print("STDERR:", result.stderr)
    
    assert result.returncode == 0, f"PDF generation script failed with error: {result.stderr}"
    assert os.path.exists(TEST_PDF_OUTPUT), "PDF file was not created."
    assert os.path.getsize(TEST_PDF_OUTPUT) > 0, "Generated PDF file is empty."

# To run this test, navigate to the `tests/python` directory and run `pytest`
# Ensure pytest is installed in your environment: pip install pytest

