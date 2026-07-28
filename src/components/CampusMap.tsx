"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { UMAT_CAMPUS_HOTSPOTS, UMAT_CENTER, UMAT_DEFAULT_ZOOM, type CampusLocation } from "@/lib/supabase";

// ─── Custom Marker Icons ───
function createIcon(color: string, size: number = 12): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
    popupAnchor: [0, -size],
    html: `<div style="
      width: ${size * 2}px; height: ${size * 2}px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px ${color}40;
    "></div>`,
  });
}

function createPulsingIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="position:relative;width:28px;height:28px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:${color}40;
        animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
      "></div>
      <div style="
        position:absolute;inset:6px;border-radius:50%;
        background:${color};border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
      "></div>
    </div>
    <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>`,
  });
}

const HOTSPOT_ICON = createIcon("#6b7280", 8);
const PICKUP_ICON = createPulsingIcon("#10b981");
const DROPOFF_ICON = createPulsingIcon("#ef4444");
const USER_ICON = createPulsingIcon("#3b82f6");
const DRIVER_ICON = createIcon("#f59e0b", 10);

interface CampusMapProps {
  pickup?: CampusLocation | null;
  dropoff?: CampusLocation | null;
  onSelectLocation?: (location: CampusLocation, type: "pickup" | "dropoff") => void;
  selectionMode?: "pickup" | "dropoff";
  driverLocations?: Array<{ id: string; lat: number; lng: number; name: string }>;
  showUserLocation?: boolean;
  height?: string;
  className?: string;
}

export default function CampusMap({
  pickup,
  dropoff,
  onSelectLocation,
  selectionMode = "pickup",
  driverLocations = [],
  showUserLocation = true,
  height = "320px",
  className = "",
}: CampusMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  // ─── Get User Location ───
  useEffect(() => {
    if (!showUserLocation || typeof navigator === "undefined") return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Geolocation permission denied"),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [showUserLocation]);

  // ─── Initialize Map ───
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [UMAT_CENTER.lat, UMAT_CENTER.lng],
      zoom: UMAT_DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark-friendly tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Re-add attribution in corner
    L.control.attribution({ position: "bottomright", prefix: false })
      .addAttribution('© <a href="https://www.openstreetmap.org/copyright">OSM</a>')
      .addTo(map);

    // Zoom control on right
    L.control.zoom({ position: "topright" }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ─── Render Markers ───
  const renderMarkers = useCallback(() => {
    if (!mapRef.current || !markersRef.current) return;
    markersRef.current.clearLayers();

    // Campus hotspot markers
    UMAT_CAMPUS_HOTSPOTS.forEach((spot) => {
      const isPickup = pickup?.id === spot.id;
      const isDropoff = dropoff?.id === spot.id;
      const icon = isPickup ? PICKUP_ICON : isDropoff ? DROPOFF_ICON : HOTSPOT_ICON;

      const marker = L.marker([spot.lat, spot.lng], { icon }).addTo(markersRef.current!);

      const label = isPickup ? "📍 PICKUP" : isDropoff ? "🏁 DROPOFF" : spot.category.toUpperCase();

      marker.bindPopup(`
        <div style="font-family:Inter,system-ui,sans-serif;min-width:160px;">
          <div style="font-size:9px;font-weight:800;color:#10b981;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:2px;">${label}</div>
          <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:3px;">${spot.name}</div>
          <div style="font-size:10px;color:#9ca3af;">${spot.description}</div>
        </div>
      `, { className: "yenko-popup" });

      marker.on("click", () => {
        if (onSelectLocation) {
          onSelectLocation(spot, selectionMode);
        }
      });
    });

    // Driver markers
    driverLocations.forEach((driver) => {
      const marker = L.marker([driver.lat, driver.lng], { icon: DRIVER_ICON }).addTo(markersRef.current!);
      marker.bindPopup(`
        <div style="font-family:Inter,system-ui,sans-serif;">
          <div style="font-size:9px;font-weight:800;color:#f59e0b;letter-spacing:0.05em;text-transform:uppercase;">DRIVER</div>
          <div style="font-size:12px;font-weight:700;color:#fff;">${driver.name}</div>
        </div>
      `, { className: "yenko-popup" });
    });

    // User location marker
    if (userPos) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userPos.lat, userPos.lng]);
      } else {
        userMarkerRef.current = L.marker([userPos.lat, userPos.lng], { icon: USER_ICON }).addTo(markersRef.current);
        userMarkerRef.current.bindPopup(`
          <div style="font-family:Inter,system-ui,sans-serif;">
            <div style="font-size:9px;font-weight:800;color:#3b82f6;text-transform:uppercase;">YOUR LOCATION</div>
          </div>
        `, { className: "yenko-popup" });
      }
    }
  }, [pickup, dropoff, driverLocations, userPos, onSelectLocation, selectionMode]);

  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  // ─── Route Line ───
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeRef.current) {
      routeRef.current.remove();
      routeRef.current = null;
    }

    if (pickup && dropoff) {
      routeRef.current = L.polyline(
        [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]],
        {
          color: "#10b981",
          weight: 3,
          opacity: 0.8,
          dashArray: "8 8",
          className: "animate-pulse",
        }
      ).addTo(mapRef.current);

      // Fit map to show both markers
      const bounds = L.latLngBounds(
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng]
      );
      mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 });
    }
  }, [pickup, dropoff]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border-mute ${className}`} style={{ height }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Selection Mode Indicator */}
      {onSelectLocation && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 border border-border-mute backdrop-blur-md">
          <span className={`w-2 h-2 rounded-full ${selectionMode === "pickup" ? "bg-emerald-500" : "bg-red-500"} animate-pulse`} />
          <span className="text-[10px] font-mono font-bold uppercase text-text-muted">
            Tap map to set {selectionMode}
          </span>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-3 px-3 py-1.5 rounded-full bg-background/90 border border-border-mute backdrop-blur-md">
        <span className="flex items-center gap-1 text-[9px] font-mono text-text-muted">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Pickup
        </span>
        <span className="flex items-center gap-1 text-[9px] font-mono text-text-muted">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Dropoff
        </span>
        <span className="flex items-center gap-1 text-[9px] font-mono text-text-muted">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Drivers
        </span>
      </div>

      {/* Custom popup styles */}
      <style jsx global>{`
        .yenko-popup .leaflet-popup-content-wrapper {
          background: rgba(24, 24, 27, 0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          backdrop-filter: blur(12px);
        }
        .yenko-popup .leaflet-popup-tip {
          background: rgba(24, 24, 27, 0.95);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .yenko-popup .leaflet-popup-close-button {
          color: #9ca3af !important;
        }
      `}</style>
    </div>
  );
}
