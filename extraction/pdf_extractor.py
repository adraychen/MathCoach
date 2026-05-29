"""
PDF Extraction for MathCoach.
Extracts text and renders pages as images for vision model processing.
"""

import fitz  # PyMuPDF
import base64
import io
from pathlib import Path


def extract_text_from_pdf(pdf_path: str | Path) -> dict:
    """
    Extract text from a PDF file.

    Args:
        pdf_path: Path to the PDF file

    Returns:
        dict with:
            - filename: Original filename
            - num_pages: Number of pages
            - pages: List of {page_num, text} dicts
            - full_text: Combined text from all pages
    """
    pdf_path = Path(pdf_path)

    doc = fitz.open(pdf_path)

    pages = []
    full_text_parts = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()

        pages.append({
            "page_num": page_num + 1,
            "text": text
        })
        full_text_parts.append(text)

    doc.close()

    return {
        "filename": pdf_path.name,
        "num_pages": len(pages),
        "pages": pages,
        "full_text": "\n\n".join(full_text_parts)
    }


def extract_text_from_bytes(pdf_bytes: bytes, filename: str = "uploaded.pdf") -> dict:
    """
    Extract text from PDF bytes (for file uploads).

    Args:
        pdf_bytes: PDF file content as bytes
        filename: Original filename for reference

    Returns:
        dict with filename, num_pages, pages, full_text
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    pages = []
    full_text_parts = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()

        pages.append({
            "page_num": page_num + 1,
            "text": text
        })
        full_text_parts.append(text)

    doc.close()

    return {
        "filename": filename,
        "num_pages": len(pages),
        "pages": pages,
        "full_text": "\n\n".join(full_text_parts)
    }


def render_pdf_pages_as_images(
    pdf_bytes: bytes,
    filename: str = "uploaded.pdf",
    dpi: int = 150
) -> dict:
    """
    Render PDF pages as images for vision model processing.

    Args:
        pdf_bytes: PDF file content as bytes
        filename: Original filename for reference
        dpi: Resolution for rendering (150 is good balance of quality/size)

    Returns:
        dict with:
            - filename: Original filename
            - num_pages: Number of pages
            - pages: List of {page_num, image_base64, text} dicts
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    # Calculate zoom factor for desired DPI (default PDF is 72 DPI)
    zoom = dpi / 72
    matrix = fitz.Matrix(zoom, zoom)

    pages = []

    for page_num in range(len(doc)):
        page = doc[page_num]

        # Render page to pixmap (image)
        pixmap = page.get_pixmap(matrix=matrix)

        # Convert to PNG bytes
        png_bytes = pixmap.tobytes("png")

        # Encode as base64 for API transmission
        image_base64 = base64.b64encode(png_bytes).decode("utf-8")

        # Also extract text as backup
        text = page.get_text()

        pages.append({
            "page_num": page_num + 1,
            "image_base64": image_base64,
            "image_bytes": png_bytes,
            "text": text,
            "width": pixmap.width,
            "height": pixmap.height
        })

    doc.close()

    return {
        "filename": filename,
        "num_pages": len(pages),
        "pages": pages
    }


def render_pdf_page_from_bytes(
    pdf_bytes: bytes,
    page_num: int,
    dpi: int = 150
) -> dict:
    """
    Render a single PDF page as an image.

    Args:
        pdf_bytes: PDF file content as bytes
        page_num: Page number (1-indexed)
        dpi: Resolution for rendering

    Returns:
        dict with image_base64, image_bytes, width, height, text
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    if page_num < 1 or page_num > len(doc):
        doc.close()
        raise ValueError(f"Page {page_num} out of range (1-{len(doc)})")

    page = doc[page_num - 1]  # Convert to 0-indexed

    zoom = dpi / 72
    matrix = fitz.Matrix(zoom, zoom)

    pixmap = page.get_pixmap(matrix=matrix)
    png_bytes = pixmap.tobytes("png")
    image_base64 = base64.b64encode(png_bytes).decode("utf-8")
    text = page.get_text()

    doc.close()

    return {
        "page_num": page_num,
        "image_base64": image_base64,
        "image_bytes": png_bytes,
        "text": text,
        "width": pixmap.width,
        "height": pixmap.height
    }


def get_pdf_page_count(pdf_bytes: bytes) -> int:
    """Get the number of pages in a PDF."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    count = len(doc)
    doc.close()
    return count
