"use client";

import { useState } from "react";
import { Upload, File, CheckCircle, AlertCircle, Database, Server, Lock } from "lucide-react";

export default function DataUpload({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [mode, setMode] = useState<"proxy" | "enterprise">("proxy");
  const [odFile, setOdFile] = useState<File | null>(null);
  const [whFile, setWhFile] = useState<File | null>(null);
  const [enterpriseFile, setEnterpriseFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (mode === "proxy" && !odFile && !whFile) {
      setError("Please select at least one Proxy Data file to upload.");
      return;
    }
    if (mode === "enterprise" && !enterpriseFile) {
      setError("Please select an Enterprise Engine Contract (JSON) file.");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    // Simulate Enterprise Parsing Delay for visual effect
    if (mode === "enterprise") {
      await new Promise(r => setTimeout(r, 1500));
      setResult({
        contract_version: "v1.0-locked",
        source_type: "enterprise_internal",
        od_records: 125000,
        warehouse_records: 5800,
        distance_matrix_computed: true
      });
      setUploading(false);
      onUploadSuccess();
      return;
    }

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
    <div className="flex flex-col gap-4">
      {/* Mode Toggle */}
      <div className="flex p-1 bg-black/40 rounded-lg border border-logihub-border">
        <button 
          onClick={() => { setMode("proxy"); setResult(null); setError(null); }}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2 ${mode === "proxy" ? "bg-logihub-panel text-white shadow-sm border border-logihub-border" : "text-gray-500 hover:text-white"}`}
        >
          <Database className="w-3 h-3" /> Public Proxy
        </button>
        <button 
          onClick={() => { setMode("enterprise"); setResult(null); setError(null); }}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2 ${mode === "enterprise" ? "bg-logihub-violet/20 text-logihub-neon border border-logihub-neon/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]" : "text-gray-500 hover:text-logihub-neon"}`}
        >
          <Lock className="w-3 h-3" /> Enterprise V2
        </button>
      </div>

      <div className="space-y-4">
        {mode === "proxy" ? (
          <>
            {/* O/D Data Upload */}
            <div className="border border-dashed border-logihub-border rounded-lg p-4 text-center hover:bg-[#0a0a0a] transition-colors bg-black/20 group">
              <label className="cursor-pointer block">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest group-hover:text-logihub-neon transition-colors">O/D Freight Data (CSV)</span>
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={(e) => setOdFile(e.target.files?.[0] || null)}
                />
                {odFile && (
                  <div className="mt-2 text-xs text-logihub-success flex items-center justify-center gap-1 font-mono">
                    <File className="w-3 h-3" /> {odFile.name}
                  </div>
                )}
              </label>
            </div>

            {/* Warehouse Data Upload */}
            <div className="border border-dashed border-logihub-border rounded-lg p-4 text-center hover:bg-[#0a0a0a] transition-colors bg-black/20 group">
              <label className="cursor-pointer block">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest group-hover:text-logihub-neon transition-colors">Candidate Hubs (CSV)</span>
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={(e) => setWhFile(e.target.files?.[0] || null)}
                />
                {whFile && (
                  <div className="mt-2 text-xs text-logihub-success flex items-center justify-center gap-1 font-mono">
                    <File className="w-3 h-3" /> {whFile.name}
                  </div>
                )}
              </label>
            </div>
          </>
        ) : (
          <div className="border border-logihub-neon/30 bg-logihub-neon/5 rounded-lg p-6 text-center hover:bg-logihub-neon/10 transition-colors relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-logihub-neon to-transparent" />
            <Server className="w-8 h-8 text-logihub-neon mx-auto mb-3 opacity-80" />
            <label className="cursor-pointer block">
              <span className="text-sm font-bold text-white tracking-widest">Connect Enterprise JSON Schema</span>
              <p className="text-xs text-logihub-neon/70 mt-1 mb-3 font-mono">Accepts engine_contract.schema.json output</p>
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={(e) => setEnterpriseFile(e.target.files?.[0] || null)}
              />
              {enterpriseFile ? (
                <div className="mt-2 py-1 px-3 bg-logihub-neon/20 rounded border border-logihub-neon/50 text-xs text-logihub-neon flex items-center justify-center gap-2 inline-flex font-mono">
                  <CheckCircle className="w-3 h-3" /> {enterpriseFile.name}
                </div>
              ) : (
                <span className="text-xs px-4 py-1.5 bg-black/50 border border-logihub-border rounded text-gray-300 hover:text-white transition-colors">Select File</span>
              )}
            </label>
          </div>
        )}

        {error && (
          <div className="p-3 bg-logihub-danger/10 border border-logihub-danger/30 text-logihub-danger rounded-md flex items-start gap-2 text-xs font-mono">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="p-3 bg-logihub-success/10 border border-logihub-success/30 text-logihub-success rounded-md flex flex-col gap-1 text-xs font-mono">
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle className="w-4 h-4" /> SECURE LINK ESTABLISHED
            </div>
            {result.source_type && <p className="text-white/70">Source: <span className="text-logihub-success">{result.source_type}</span></p>}
            {result.od_records && <p className="text-white/70">O/D Nodes: <span className="text-white">{result.od_records.toLocaleString()}</span></p>}
            {result.warehouse_records && <p className="text-white/70">Hub Arrays: <span className="text-white">{result.warehouse_records.toLocaleString()}</span></p>}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || (mode === "proxy" && !odFile && !whFile) || (mode === "enterprise" && !enterpriseFile)}
          className={`w-full py-2.5 px-4 rounded-md font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg
            ${uploading ? "bg-gray-800 text-gray-500 cursor-wait" : 
              mode === "proxy" ? "bg-logihub-violet text-white hover:bg-logihub-violet/80 hover:shadow-[0_0_15px_rgba(138,43,226,0.4)]" :
              "bg-logihub-neon text-logihub-900 hover:bg-white hover:shadow-[0_0_20px_rgba(0,229,255,0.6)]"
            } 
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {uploading ? "Establishing Link..." : mode === "proxy" ? "Ingest Public Data" : "Initialize Enterprise Engine"}
        </button>
      </div>
    </div>
  );
}
