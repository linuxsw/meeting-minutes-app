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
