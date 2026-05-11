import os
from pypdf import PdfReader

pdfs = [
    r"C:\Users\PC\Downloads\Ch06_Descriptive Statistics.pdf",
    r"C:\Users\PC\Downloads\Ch07_Point Estimation of Parameters and Sampling Distribution_v2.pdf",
    r"C:\Users\PC\Downloads\Ch08_Statistical Intervals for a Single Sample.pdf"
]

os.makedirs("scratch", exist_ok=True)

for pdf_path in pdfs:
    try:
        reader = PdfReader(pdf_path)
        text = []
        for i, page in enumerate(reader.pages):
            text.append(f"--- Page {i+1} ---")
            text.append(page.extract_text())
        
        out_name = os.path.basename(pdf_path).replace(".pdf", ".txt")
        out_path = os.path.join("scratch", out_name)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("\n".join(text))
        print(f"Extracted {out_name}")
    except Exception as e:
        print(f"Error extracting {pdf_path}: {e}")
