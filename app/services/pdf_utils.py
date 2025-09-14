import pdfplumber
from typing import List, Dict
import re

def extract_pdf_pages(path: str) -> List[Dict]:
    pages = []
    total_chars = 0
    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            pages.append({"page": i + 1, "text": text})
            total_chars += len(text)
    is_scanned = total_chars < 1000  # heuristic
    return pages, is_scanned

def find_relevant_pages(pages: List[Dict], query: str, k: int = 4) -> List[int]:
    query_words = set(re.findall(r'\b\w+\b', query.lower()))
    scores = []
    for page in pages:
        text = page["text"].lower()
        score = sum(1 for word in query_words if word in text)
        scores.append((page["page"], score))
    scores.sort(key=lambda x: x[1], reverse=True)
    return [page for page, score in scores[:k] if score > 0]