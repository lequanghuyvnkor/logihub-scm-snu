"use client";

import { useState } from "react";
import { Upload, File, CheckCircle, AlertCircle } from "lucide-react";

export default function DataUpload({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [odFile, setOdFile] = useState<File | null>(null);
  const [whFile, setWhFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!odFile && !whFile) {
      setError("Please select at least one file to upload.");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (odFile) formData.append("od_file", odFile);
    if (whFile) formData.append("warehouse_file", whFile);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload data");
      }

      const data = await response.json();
      setResult(data.data);
      if (data.data.distance_matrix_computed) {
        onUploadSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-blue-600" /> Data Ingestion
      </h2>
      
      <div className="space-y-4">
        {/* O/D Data Upload */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
          <label className="cursor-pointer block">
            <span className="text-sm font-medium text-gray-700">Origin/Destination (O/D) Freight Data (CSV)</span>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={(e) => setOdFile(e.target.files?.[0] || null)}
            />
            {odFile && (
              <div className="mt-2 text-sm text-green-600 flex items-center justify-center gap-1">
                <File className="w-4 h-4" /> {odFile.name}
              </div>
            )}
          </label>
        </div>

        {/* Warehouse Data Upload */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
          <label className="cursor-pointer block">
            <span className="text-sm font-medium text-gray-700">Warehouse Candidates Data (CSV)</span>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={(e) => setWhFile(e.target.files?.[0] || null)}
            />
            {whFile && (
              <div className="mt-2 text-sm text-green-600 flex items-center justify-center gap-1">
                <File className="w-4 h-4" /> {whFile.name}
              </div>
            )}
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="p-3 bg-green-50 text-green-800 rounded-md flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4" /> Upload Successful
            </div>
            {result.od_records && <p>O/D Records processed: {result.od_records}</p>}
            {result.warehouse_records && <p>Warehouse Records processed: {result.warehouse_records}</p>}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || (!odFile && !whFile)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? "Processing..." : "Upload and Normalize"}
        </button>
      </div>
    </div>
  );
}
