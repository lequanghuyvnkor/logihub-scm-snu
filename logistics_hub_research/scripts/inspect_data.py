import pandas as pd
import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"C:\Users\PC\Downloads\20260430173444\ton_2023\배포용 (기준년도 2023년) 화물물동량OD_2026.04.xlsx"

try:
    print(f"Reading file: {file_path}")
    excel_file = pd.ExcelFile(file_path)
    print("Sheet names:", excel_file.sheet_names)
    
    for sheet in excel_file.sheet_names:
        print(f"\n--- Sheet: {sheet} ---")
        df = pd.read_excel(excel_file, sheet_name=sheet, skiprows=1, nrows=10)
        print("Shape (first 10 rows loaded):", df.shape)
        print("Columns:", df.columns.tolist())
        print(df.head())
except Exception as e:
    print(f"Error reading file: {e}")
