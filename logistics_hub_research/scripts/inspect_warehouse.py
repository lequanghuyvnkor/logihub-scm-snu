import pandas as pd
import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"C:\Users\PC\Downloads\물류창고정보_260508.xls"

print(f"Inspecting file: {file_path}")
try:
    df = pd.read_excel(file_path, engine='xlrd', nrows=10)
    print("Read as Excel successfully.")
    print("Columns:", df.columns.tolist())
    print("First 2 rows:")
    print(df.head(2).to_string())
except Exception as e:
    print(f"Failed to read as Excel: {e}")
