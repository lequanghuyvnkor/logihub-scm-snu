from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

from utils import compute_distance_matrix
from models import run_p_median, run_cflp, run_baseline, run_uflp, run_mclp

app = FastAPI(title="LogiHub Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for MVP (should use DB in prod)
DATA_STORE = {
    "demand": None,
    "hubs": None,
    "distances": None
}

@app.get("/")
def read_root():
    return {"message": "Welcome to LogiHub Intelligence API"}

@app.post("/api/upload")
async def upload_data(od_file: UploadFile = File(None), warehouse_file: UploadFile = File(None)):
    if not od_file and not warehouse_file:
        raise HTTPException(status_code=400, detail="No files provided")
    
    result = {}
    
    if od_file:
        content = await od_file.read()
        try:
            try:
                decoded_content = content.decode('utf-8-sig')
            except UnicodeDecodeError:
                decoded_content = content.decode('cp949', errors='replace')
            df_od = pd.read_csv(io.StringIO(decoded_content))
            DATA_STORE["demand"] = df_od
            result["od_records"] = len(df_od)
            result["od_columns"] = df_od.columns.tolist()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing O/D file: {str(e)}")
            
    if warehouse_file:
        content = await warehouse_file.read()
        try:
            try:
                decoded_content = content.decode('utf-8-sig')
            except UnicodeDecodeError:
                decoded_content = content.decode('cp949', errors='replace') # Fallback for Excel-saved CSVs in Korea with replacement for bad bytes
            df_wh = pd.read_csv(io.StringIO(decoded_content))
            DATA_STORE["hubs"] = df_wh
            result["warehouse_records"] = len(df_wh)
            result["warehouse_columns"] = df_wh.columns.tolist()
        except Exception as e:
            return {"status": "error", "message": f"Error parsing Warehouse file: {str(e)}"}
            
    # Auto-compute distance matrix if both are available
    if DATA_STORE["demand"] is not None and DATA_STORE["hubs"] is not None:
        try:
            df_dist = compute_distance_matrix(DATA_STORE["demand"], DATA_STORE["hubs"])
            DATA_STORE["distances"] = df_dist
            result["distance_matrix_computed"] = True
        except Exception as e:
            result["distance_matrix_error"] = str(e)
            
    return {"status": "success", "data": result}

@app.get("/api/network/baseline")
async def get_baseline():
    if DATA_STORE["demand"] is None or DATA_STORE["hubs"] is None or DATA_STORE["distances"] is None:
        raise HTTPException(status_code=400, detail="Please upload data first")
        
    try:
        result = run_baseline(DATA_STORE["demand"], DATA_STORE["hubs"], DATA_STORE["distances"])
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/network/hubs")
async def get_all_hubs():
    if DATA_STORE["hubs"] is None:
        raise HTTPException(status_code=400, detail="Please upload data first")
    try:
        # Return lightweight representation
        df = DATA_STORE["hubs"]
        hubs_list = df[['hub_id', 'lat', 'lon', 'company_name', 'storage_item']].to_dict('records')
        return {"status": "success", "data": {"hubs": hubs_list}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def filter_hubs(df_hubs, storage_type):
    if storage_type and storage_type != "All":
        filtered = df_hubs[df_hubs['storage_item'] == storage_type]
        if len(filtered) == 0:
            raise ValueError(f"No hubs found for storage type: {storage_type}")
        return filtered
    return df_hubs

@app.post("/api/optimize/p-median")
async def optimize_p_median(p: int = Form(...), storage_type: str = Form(None)):
    if DATA_STORE["demand"] is None or DATA_STORE["hubs"] is None or DATA_STORE["distances"] is None:
        raise HTTPException(status_code=400, detail="Please upload data first")
        
    try:
        hubs_to_use = filter_hubs(DATA_STORE["hubs"], storage_type)
        result = run_p_median(DATA_STORE["demand"], hubs_to_use, DATA_STORE["distances"], p)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/optimize/cflp")
async def optimize_cflp(storage_type: str = Form(None)):
    if DATA_STORE["demand"] is None or DATA_STORE["hubs"] is None or DATA_STORE["distances"] is None:
        raise HTTPException(status_code=400, detail="Please upload data first")
        
    try:
        hubs_to_use = filter_hubs(DATA_STORE["hubs"], storage_type)
        result = run_cflp(DATA_STORE["demand"], hubs_to_use, DATA_STORE["distances"])
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/optimize/uflp")
async def optimize_uflp(storage_type: str = Form(None)):
    if DATA_STORE["demand"] is None or DATA_STORE["hubs"] is None or DATA_STORE["distances"] is None:
        raise HTTPException(status_code=400, detail="Please upload data first")
        
    try:
        hubs_to_use = filter_hubs(DATA_STORE["hubs"], storage_type)
        result = run_uflp(DATA_STORE["demand"], hubs_to_use, DATA_STORE["distances"])
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/optimize/mclp")
async def optimize_mclp(p: int = Form(...), radius: int = Form(...), storage_type: str = Form(None)):
    if DATA_STORE["demand"] is None or DATA_STORE["hubs"] is None or DATA_STORE["distances"] is None:
        raise HTTPException(status_code=400, detail="Please upload data first")
        
    try:
        hubs_to_use = filter_hubs(DATA_STORE["hubs"], storage_type)
        result = run_mclp(DATA_STORE["demand"], hubs_to_use, DATA_STORE["distances"], p, radius)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

