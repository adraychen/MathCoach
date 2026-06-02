"""
Crop individual question images from G7gauss1-problem.pdf.

Uses dotted line detection to find question boundaries.

Outputs:
- question-crops/G7gauss1/q01.png through q25.png
- question-crops/G7gauss1/contact_sheet.png
- question-crops/G7gauss1/crop_manifest.json
- question-crops/G7gauss1/debug_page_01.png through debug_page_06.png

Requirements:
    pip install pymupdf Pillow numpy opencv-python
"""

import json
from pathlib import Path

import cv2
import fitz  # PyMuPDF
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ============================================
# Configuration
# ============================================

DPI = 200
SCALE = DPI / 72  # PDF points to pixels at target DPI

# Paths
SCRIPT_DIR = Path(__file__).parent
BASE_DIR = SCRIPT_DIR.parent
INPUT_PDF = BASE_DIR / "source-pdfs" / "G7gauss1-problem.pdf"
OUTPUT_DIR = BASE_DIR / "question-crops" / "G7gauss1"

# Question distribution per page (0-indexed page: list of question numbers)
QUESTIONS_PER_PAGE = {
    0: [1, 2, 3, 4, 5],
    1: [6, 7, 8, 9, 10, 11],
    2: [12, 13, 14, 15, 16, 17],
    3: [18, 19, 20, 21],
    4: [22, 23, 24],
    5: [25],
}

# Crop parameters (in pixels at target DPI) - easy to adjust
LEFT_MARGIN = 100       # Left edge of content area
RIGHT_MARGIN = 100      # Right edge margin from page width
TOP_MARGIN = 150        # Top of first question on each page
BOTTOM_MARGIN = 100     # Bottom margin from page height
PADDING_TOP = 15        # Extra padding above each question
PADDING_BOTTOM = 15     # Extra padding below each question
PADDING_LEFT = 20       # Extra padding on left
PADDING_RIGHT = 20      # Extra padding on right

# Dotted line detection parameters
LINE_DETECTION_THRESHOLD = 200  # Grayscale threshold for line detection
MIN_LINE_WIDTH_RATIO = 0.4      # Minimum line width as ratio of page width
HORIZONTAL_KERNEL_WIDTH = 100   # Kernel width for detecting horizontal lines
MIN_GAP_BETWEEN_LINES = 50      # Minimum pixels between separate lines


def render_page(doc: fitz.Document, page_num: int) -> np.ndarray:
    """Render a PDF page as a numpy array at target DPI."""
    page = doc[page_num]
    mat = fitz.Matrix(SCALE, SCALE)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
    return img


def detect_dotted_lines(page_img: np.ndarray) -> list[int]:
    """
    Detect horizontal dotted separator lines in a page image.
    Returns list of y-coordinates where lines were detected.
    """
    # Convert to grayscale
    gray = cv2.cvtColor(page_img, cv2.COLOR_RGB2GRAY)

    # Threshold to binary (inverted so lines are white)
    _, binary = cv2.threshold(gray, LINE_DETECTION_THRESHOLD, 255, cv2.THRESH_BINARY_INV)

    # Create horizontal kernel to detect horizontal lines
    kernel_width = HORIZONTAL_KERNEL_WIDTH
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_width, 1))

    # Apply morphological operations to detect horizontal lines
    detected_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)

    # Find contours of detected lines
    contours, _ = cv2.findContours(detected_lines, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    page_width = page_img.shape[1]
    min_line_width = int(page_width * MIN_LINE_WIDTH_RATIO)

    line_y_coords = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        # Filter: must be wide enough and thin (horizontal line)
        if w >= min_line_width and h < 20:
            # Use the center y-coordinate of the line
            line_y = y + h // 2
            line_y_coords.append(line_y)

    # Sort by y-coordinate and remove duplicates that are too close
    line_y_coords.sort()
    filtered_lines = []
    for y in line_y_coords:
        if not filtered_lines or y - filtered_lines[-1] > MIN_GAP_BETWEEN_LINES:
            filtered_lines.append(y)

    return filtered_lines


def compute_crop_regions(
    page_img: np.ndarray,
    page_num: int,
    dotted_lines: list[int],
    question_numbers: list[int],
) -> list[dict]:
    """
    Compute crop regions for questions on a page.
    Returns list of crop region dicts.
    """
    page_height, page_width = page_img.shape[:2]

    # Content area boundaries
    content_left = LEFT_MARGIN
    content_right = page_width - RIGHT_MARGIN
    content_top = TOP_MARGIN
    content_bottom = page_height - BOTTOM_MARGIN

    # We need (num_questions) boundaries
    # First question starts at content_top
    # Each subsequent question starts after a dotted line
    # Last question ends at content_bottom or last dotted line

    num_questions = len(question_numbers)

    # Build list of boundaries: [top of q1, top of q2, ..., bottom of last q]
    boundaries = [content_top]

    # Use dotted lines as boundaries between questions
    for line_y in dotted_lines:
        if line_y > content_top and line_y < content_bottom:
            boundaries.append(line_y)

    # Add bottom boundary
    boundaries.append(content_bottom)

    # If we don't have enough boundaries, distribute evenly
    if len(boundaries) < num_questions + 1:
        # Fall back to even distribution
        boundaries = []
        step = (content_bottom - content_top) / num_questions
        for i in range(num_questions + 1):
            boundaries.append(int(content_top + i * step))

    # Create crop regions
    crops = []
    for i, q_num in enumerate(question_numbers):
        if i < len(boundaries) - 1:
            top = boundaries[i]
            bottom = boundaries[i + 1] if i + 1 < len(boundaries) else content_bottom
        else:
            # Fallback for extra questions
            top = boundaries[-2] if len(boundaries) >= 2 else content_top
            bottom = content_bottom

        # Apply padding
        crop_top = max(0, top - PADDING_TOP)
        crop_bottom = min(page_height, bottom + PADDING_BOTTOM)
        crop_left = max(0, content_left - PADDING_LEFT)
        crop_right = min(page_width, content_right + PADDING_RIGHT)

        crops.append({
            "question_number": q_num,
            "page_num": page_num,
            "crop_x": crop_left,
            "crop_y": crop_top,
            "crop_width": crop_right - crop_left,
            "crop_height": crop_bottom - crop_top,
            "boundary_top": top,
            "boundary_bottom": bottom,
        })

    return crops


def create_debug_overlay(
    page_img: np.ndarray,
    page_num: int,
    dotted_lines: list[int],
    crop_regions: list[dict],
) -> Image.Image:
    """Create a debug overlay showing detected lines and crop boxes."""
    # Convert to PIL Image
    img = Image.fromarray(page_img)
    draw = ImageDraw.Draw(img)

    # Try to load a font
    try:
        font = ImageFont.truetype("arial.ttf", 24)
        small_font = ImageFont.truetype("arial.ttf", 16)
    except:
        font = ImageFont.load_default()
        small_font = font

    # Draw detected dotted lines in red
    page_width = page_img.shape[1]
    for y in dotted_lines:
        draw.line([(0, y), (page_width, y)], fill="red", width=3)
        draw.text((10, y - 20), f"line @ y={y}", fill="red", font=small_font)

    # Draw crop regions
    colors = ["blue", "green", "purple", "orange", "cyan", "magenta"]
    for i, region in enumerate(crop_regions):
        color = colors[i % len(colors)]
        x = region["crop_x"]
        y = region["crop_y"]
        w = region["crop_width"]
        h = region["crop_height"]

        # Draw rectangle
        draw.rectangle([x, y, x + w, y + h], outline=color, width=3)

        # Draw label
        label = f"Q{region['question_number']}"
        draw.text((x + 10, y + 10), label, fill=color, font=font)

    # Add page number
    draw.text((50, 50), f"Page {page_num + 1}", fill="black", font=font)

    return img


def create_contact_sheet(crops: list[Image.Image], labels: list[str]) -> Image.Image:
    """Create a contact sheet showing all cropped questions."""
    if not crops:
        return Image.new("RGB", (100, 100), "white")

    # Layout: 5 columns
    cols = 5
    rows = (len(crops) + cols - 1) // cols

    # Scale down crops to fit
    max_thumb_width = 300
    max_thumb_height = 400

    thumbnails = []
    for img in crops:
        # Scale to fit within max dimensions
        ratio = min(max_thumb_width / img.width, max_thumb_height / img.height)
        new_size = (int(img.width * ratio), int(img.height * ratio))
        thumbnails.append(img.resize(new_size, Image.Resampling.LANCZOS))

    # Calculate cell size
    label_height = 30
    cell_width = max_thumb_width + 20
    cell_height = max_thumb_height + label_height + 20

    # Create sheet
    sheet_width = cols * cell_width
    sheet_height = rows * cell_height
    sheet = Image.new("RGB", (sheet_width, sheet_height), "white")
    draw = ImageDraw.Draw(sheet)

    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except:
        font = ImageFont.load_default()

    for i, (thumb, label) in enumerate(zip(thumbnails, labels)):
        row = i // cols
        col = i % cols

        x = col * cell_width + 10
        y = row * cell_height + label_height

        # Draw label
        draw.text((x, y - label_height + 5), label, fill="black", font=font)

        # Paste thumbnail
        sheet.paste(thumb, (x, y))

        # Draw border
        draw.rectangle(
            [x - 2, y - 2, x + thumb.width + 2, y + thumb.height + 2],
            outline="gray",
            width=1
        )

    return sheet


def main():
    # Check input PDF exists
    if not INPUT_PDF.exists():
        print(f"ERROR: Input PDF not found: {INPUT_PDF}")
        print("Please add the question PDF to source-pdfs/")
        return False

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Open PDF
    print(f"Opening: {INPUT_PDF}")
    doc = fitz.open(INPUT_PDF)
    print(f"PDF has {len(doc)} pages")

    # Process each page
    all_crops = []
    all_crop_images = []
    all_labels = []

    for page_num in range(len(doc)):
        if page_num not in QUESTIONS_PER_PAGE:
            continue

        question_numbers = QUESTIONS_PER_PAGE[page_num]
        print(f"\nPage {page_num + 1}: Questions {question_numbers[0]}-{question_numbers[-1]}")

        # Render page
        print(f"  Rendering at {DPI} DPI...")
        page_img = render_page(doc, page_num)
        print(f"  Page size: {page_img.shape[1]}x{page_img.shape[0]}")

        # Detect dotted lines
        print(f"  Detecting dotted lines...")
        dotted_lines = detect_dotted_lines(page_img)
        print(f"  Found {len(dotted_lines)} separator lines at y={dotted_lines}")

        # Compute crop regions
        crop_regions = compute_crop_regions(page_img, page_num, dotted_lines, question_numbers)

        # Create debug overlay
        debug_img = create_debug_overlay(page_img, page_num, dotted_lines, crop_regions)
        debug_path = OUTPUT_DIR / f"debug_page_{page_num + 1:02d}.png"
        debug_img.save(debug_path, "PNG")
        print(f"  Saved: {debug_path.name}")

        # Crop each question
        for region in crop_regions:
            q_num = region["question_number"]
            x = region["crop_x"]
            y = region["crop_y"]
            w = region["crop_width"]
            h = region["crop_height"]

            # Crop from numpy array
            cropped_arr = page_img[y:y+h, x:x+w]
            cropped_img = Image.fromarray(cropped_arr)

            # Save
            output_path = OUTPUT_DIR / f"q{q_num:02d}.png"
            cropped_img.save(output_path, "PNG")
            print(f"  q{q_num:02d}.png ({cropped_img.width}x{cropped_img.height})")

            # Store for manifest and contact sheet
            all_crops.append({
                "practice_question_number": q_num,
                "image_path": f"q{q_num:02d}.png",
                "source_pdf_page": page_num + 1,
                "crop_x": round(x / SCALE, 2),  # Convert back to PDF points
                "crop_y": round(y / SCALE, 2),
                "crop_width": round(w / SCALE, 2),
                "crop_height": round(h / SCALE, 2),
            })
            all_crop_images.append(cropped_img)
            all_labels.append(f"q{q_num:02d}")

    doc.close()

    # Sort by question number
    all_crops.sort(key=lambda x: x["practice_question_number"])

    # Create contact sheet
    print("\nCreating contact sheet...")
    contact_sheet = create_contact_sheet(all_crop_images, all_labels)
    contact_sheet_path = OUTPUT_DIR / "contact_sheet.png"
    contact_sheet.save(contact_sheet_path, "PNG")
    print(f"  contact_sheet.png ({contact_sheet.width}x{contact_sheet.height})")

    # Save manifest
    manifest_path = OUTPUT_DIR / "crop_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(all_crops, f, indent=2)
    print(f"  crop_manifest.json ({len(all_crops)} entries)")

    print(f"\nDone!")
    print(f"Output: {OUTPUT_DIR}")
    print(f"  - {len(all_crop_images)} question crops (q01.png - q25.png)")
    print(f"  - contact_sheet.png")
    print(f"  - crop_manifest.json")
    print(f"  - 6 debug page overlays")

    return True


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
