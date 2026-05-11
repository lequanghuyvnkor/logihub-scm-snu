"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the actual map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#0a0a0a] border rounded-lg">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <span className="ml-2 text-gray-400">Loading Map...</span>
    </div>
  ),
});

export default function MapViewer({ result, candidateHubs = [] }: { result: any, candidateHubs?: any[] }) {
  return (
    <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden border shadow-sm relative z-0">
      <MapComponent result={result} candidateHubs={candidateHubs} />
    </div>
  );
}
