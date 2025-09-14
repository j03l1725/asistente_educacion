from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import markdown
from io import BytesIO

def generate_pdf_from_markdown(markdown_text):
    # Convert markdown to HTML
    html = markdown.markdown(markdown_text)
    # Simple text extraction (basic, can be improved)
    import re
    text = re.sub(r'<[^>]+>', '', html)  # Remove HTML tags
    text = text.replace('&nbsp;', ' ').replace('&', '&').replace('<', '<').replace('>', '>')

    # Generate PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    for line in text.split('\n'):
        line = line.strip()
        if line:
            if line.startswith('# '):
                story.append(Paragraph(line[2:], styles['Heading1']))
            elif line.startswith('## '):
                story.append(Paragraph(line[3:], styles['Heading2']))
            elif line.startswith('### '):
                story.append(Paragraph(line[4:], styles['Heading3']))
            elif line.startswith('- '):
                story.append(Paragraph(line[2:], styles['Normal']))
            else:
                story.append(Paragraph(line, styles['Normal']))
            story.append(Spacer(1, 12))

    doc.build(story)
    buffer.seek(0)
    return buffer

def generate_pdf_from_text(text):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    for line in text.split('\n'):
        line = line.strip()
        if line:
            story.append(Paragraph(line, styles['Normal']))
            story.append(Spacer(1, 12))

    doc.build(story)
    buffer.seek(0)
    return buffer