"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Tooltip, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icons in Leaflet with Next.js
const hubIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const regionIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [12, 20],
  iconAnchor: [6, 20],
  popupAnchor: [1, -15],
  shadowSize: [20, 20]
});

function ChangeView({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function Map({ result, candidateHubs = [] }: { result: any, candidateHubs?: any[] }) {
  const defaultCenter: [number, number] = [36.5, 127.5];

  let hubMarkers: any[] = [];
  let regionMarkers: any[] = [];
  let connections: any[] = [];
  let allPoints: L.LatLng[] = [];

  const fmtNum = (val: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(val);

  if (candidateHubs && candidateHubs.length > 0) {
    candidateHubs.forEach(hub => {
      allPoints.push(new L.LatLng(hub.lat, hub.lon));
    });
  }

  if (result && result.opened_hubs) {
    // 1. Calculate Hub Utilization
    const hubLoads: Record<string, number> = {};
    result.assignments.forEach((asg: any) => {
      const hId = asg.hub_id;
      const t = asg.demand_tons || asg.flow_tons || 0;
      hubLoads[hId] = (hubLoads[hId] || 0) + t;
    });

    // 2. Render Hubs
    result.opened_hubs.forEach((hub: any) => {
      const pos = new L.LatLng(hub.lat, hub.lon);
      allPoints.push(pos);
      const load = hubLoads[hub.id] || 0;
      const capacity = hub.capacity_tons || 50000;
      const utilPct = (load / capacity) * 100;
      
      hubMarkers.push(
        <Marker key={`hub-${hub.id}`} position={pos} icon={hubIcon}>
          <Popup className="maersk-popup">
            <div className="font-bold text-maersk-navy uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Selected Hub: {hub.id}</div>
            <div className="text-xs space-y-1 text-gray-700">
              <div className="flex justify-between"><span className="font-semibold">Role:</span> Regional Distribution</div>
              <div className="flex justify-between"><span className="font-semibold">Total Volume:</span> {fmtNum(load)} tons</div>
              <div className="flex justify-between"><span className="font-semibold">Max Capacity:</span> {fmtNum(capacity)} tons</div>
              <div className="flex justify-between items-center mt-1">
                <span className="font-semibold">Utilization:</span> 
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${utilPct > 90 ? 'bg-rose-500' : utilPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                  {utilPct.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500 italic">
                Selected by algorithm to minimize total weighted distance.
              </div>
            </div>
          </Popup>
        </Marker>
      );
    });

    // 3. Render Regions and Connections
    const addedRegions = new Set();
    result.assignments.forEach((asg: any, idx: number) => {
      const regionPos = new L.LatLng(asg.region_lat, asg.region_lon);
      const hubPos = new L.LatLng(asg.hub_lat, asg.hub_lon);
      allPoints.push(regionPos);

      const tons = asg.demand_tons || asg.flow_tons || 0;
      const dist = asg.distance_km || 0;
      const isHighRisk = dist > 200; // Arbitrary threshold for visual
      const lineColor = isHighRisk ? "#ef4444" : "#42B0D5"; // Red or Maersk Blue

      // Add connection line
      connections.push(
        <Polyline 
          key={`line-${idx}`} 
          positions={[regionPos, hubPos]} 
          color={lineColor} 
          weight={isHighRisk ? 3 : 2} 
          opacity={0.7}
          dashArray={isHighRisk ? "" : "5, 10"}
        >
          <Popup>
            <div className="font-bold text-xs uppercase tracking-wider mb-1">Lane Analytics</div>
            <div className="text-[10px] space-y-0.5">
              <div><span className="font-semibold">Route:</span> {asg.hub_id} → {asg.region_id}</div>
              <div><span className="font-semibold">Distance:</span> {fmtNum(dist)} km</div>
              <div><span className="font-semibold">Volume:</span> {fmtNum(tons)} tons</div>
              {isHighRisk && <div className="text-rose-500 font-bold mt-1 uppercase">High Distance Alert</div>}
            </div>
          </Popup>
        </Polyline>
      );

      // Add region marker if not already added
      if (!addedRegions.has(asg.region_id)) {
        addedRegions.add(asg.region_id);
        regionMarkers.push(
          <Marker key={`reg-${asg.region_id}`} position={regionPos} icon={regionIcon}>
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <div className="font-bold text-[10px] uppercase">{asg.region_id}</div>
            </Tooltip>
          </Marker>
        );
      }
    });
  }

  const bounds = allPoints.length > 0 ? L.latLngBounds(allPoints) : null;

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={7} 
      style={{ height: "100%", width: "100%", background: "#E1EDF2" }}
      preferCanvas={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      <ChangeView bounds={bounds} />

      {/* Render Candidate Hubs */}
      {candidateHubs && candidateHubs.length > 0 && candidateHubs.map((hub: any, idx: number) => {
        // Find if this hub is an opened hub to avoid rendering the tiny dot over it
        const isOpened = result && result.opened_hubs && result.opened_hubs.some((oh: any) => oh.id === hub.hub_id);
        if (isOpened) return null;

        return (
          <CircleMarker
            key={`cand-${idx}`}
            center={[hub.lat, hub.lon]}
            radius={3}
            pathOptions={{ color: '#94a3b8', weight: 1, fillColor: '#cbd5e1', fillOpacity: 0.5 }}
          >
            <Tooltip direction="top" offset={[0, -5]}>
              <div className="text-[10px]">
                <div className="font-bold text-maersk-navy">{hub.company_name || hub.hub_id}</div>
                <div className="text-gray-500 uppercase tracking-wider mt-0.5">{hub.storage_item}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}

      {hubMarkers}
      {regionMarkers}
      {connections}

      {!result && (!candidateHubs || candidateHubs.length === 0) && (
        <Marker position={defaultCenter} icon={regionIcon}>
          <Popup>South Korea Center</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

