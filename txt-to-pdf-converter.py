import sys
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.fonts import tt2ps
from reportlab.lib.colors import grey

def convert_txt_to_pdf(input_file, output_file):
    try:
        # Read the JavaScript file
        with open(input_file, 'r', encoding='utf-8') as file:
            content = file.read()

        # Create PDF document
        doc = SimpleDocTemplate(
            output_file,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )

        # Create custom style for code
        styles = getSampleStyleSheet()
        code_style = ParagraphStyle(
            'CodeStyle',
            parent=styles['Normal'],
            fontName='Courier',
            fontSize=10,
            leading=14,
            textColor=grey,
            spaceAfter=20
        )

        # Format content
        # Replace < and > with their HTML entities
        content = content.replace('&', '&amp;')\
                        .replace('<', '&lt;')\
                        .replace('>', '&gt;')\
                        .replace('\n', '<br/>')
        
        # Create the paragraph with the code
        story = []
        story.append(Paragraph(content, code_style))

        # Build PDF
        doc.build(story)
        print(f"Successfully created {output_file}")
        
    except FileNotFoundError:
        print(f"Error: Could not find the input file {input_file}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py input.txt output.pdf")
    else:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
        convert_txt_to_pdf(input_file, output_file)
