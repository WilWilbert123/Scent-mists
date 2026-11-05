"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Search, CheckCircle2, Loader2 } from "lucide-react";
import type { DeliveryLocation } from "@/types/order";

interface LeafletDeliveryMapProps {
  location: DeliveryLocation;
  onChange: (location: DeliveryLocation) => void;
  className?: string;
}

interface LeafletMapLike {
  panTo: (coords: [number, number]) => void;
  setView: (coords: [number, number], zoom: number) => void;
  remove: () => void;
  on: (event: string, fn: (e: { latlng: { lat: number; lng: number } }) => void) => void;
}

interface LeafletMarkerLike {
  setLatLng: (coords: [number, number]) => void;
  openPopup: () => void;
  bindPopup: (content: string) => LeafletMarkerLike;
  addTo: (map: LeafletMapLike) => LeafletMarkerLike;
  on: (event: string, fn: (e: { target: { getLatLng: () => { lat: number; lng: number } } }) => void) => void;
}

export function LeafletDeliveryMap({
  location,
  onChange,
  className = "",
}: LeafletDeliveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMapLike | null>(null);
  const markerRef = useRef<LeafletMarkerLike | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [addressDisplay, setAddressDisplay] = useState(
    location.address_text || "Metro Manila, Philippines"
  );

  const currentLat = location.lat || 14.5995;
  const currentLng = location.lng || 120.9842;

  const handlePositionChange = useCallback(
    async (lat: number, lng: number, map?: LeafletMapLike) => {
      let resolvedAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          {
            headers: {
              "Accept-Language": "en",
              "User-Agent": "ScentsAndMistsApp/1.0",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.display_name) {
            resolvedAddress = data.display_name;
            setAddressDisplay(resolvedAddress);
          }
        }
      } catch {
        // ignore
      }

      onChange({
        lat,
        lng,
        address_text: resolvedAddress,
      });

      if (map) {
        map.panTo([lat, lng]);
      }
    },
    [onChange]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      if (isCancelled) return;

      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const customPinIcon = L.divIcon({
        className: "custom-delivery-pin",
        html: `
          <div style="position: relative; width: 42px; height: 50px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="background: linear-gradient(135deg, #e11d48, #be185d); width: 38px; height: 38px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.5); border: 2.5px solid #ffffff;">
              <div style="transform: rotate(45deg); color: #ffffff; font-weight: bold; font-size: 15px;">📍</div>
            </div>
            <div style="width: 14px; height: 5px; background: rgba(0,0,0,0.3); border-radius: 50%; margin-top: 2px;"></div>
          </div>
        `,
        iconSize: [42, 50],
        iconAnchor: [21, 48],
      });

      const map = (L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 15,
        scrollWheelZoom: true,
      }) as unknown) as LeafletMapLike;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map as unknown as import("leaflet").Map);

      const marker = (L.marker([currentLat, currentLng], {
        icon: customPinIcon,
        draggable: true,
        autoPan: true,
      }).addTo(map as unknown as import("leaflet").Map) as unknown) as LeafletMarkerLike;

      marker.bindPopup("<b>Your Delivery Pin</b><br>Rider will deliver right here.").openPopup();

      marker.on("dragend", async (e: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
        const position = e.target.getLatLng();
        await handlePositionChange(position.lat, position.lng, map);
      });

      map.on("click", async (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        marker.openPopup();
        await handlePositionChange(lat, lng, map);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    void initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentLat, currentLng, handlePositionChange]);

  // Search Address / Landmark
  const handleSearch = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current || !markerRef.current) return;

    setIsSearching(true);
    try {
      const query = encodeURIComponent(`${searchQuery}, Philippines`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "ScentsAndMistsApp/1.0",
          },
        }
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);

          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 16);
          setAddressDisplay(results[0].display_name);

          onChange({
            lat,
            lng,
            address_text: results[0].display_name,
          });
        }
      }
    } catch (err) {
      console.warn("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Current Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (markerRef.current && mapInstanceRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 16);
          await handlePositionChange(lat, lng, mapInstanceRef.current);
        }
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        console.warn("Geolocation error:", error);
        alert("Could not retrieve your location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search & Location Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            placeholder="Search barangay, street, subdivision, or landmark..."
            className="w-full pl-9 pr-20 py-2.5 text-xs bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground text-xs font-medium rounded-md transition-colors"
          >
            {isSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : "Search"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-surface border border-border hover:border-accent text-xs font-medium rounded-lg text-foreground hover:text-accent transition-colors shrink-0 cursor-pointer"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
          ) : (
            <Navigation className="h-4 w-4 text-accent" />
          )}
          <span>Locate Me</span>
        </button>
      </div>

      {/* Leaflet Map Frame */}
      <div className="relative w-full h-[260px] sm:h-[320px] rounded-xl overflow-hidden border border-border shadow-inner bg-surface">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top Hint Overlay */}
        <div className="absolute top-2 left-2 right-2 pointer-events-none z-[1000] flex justify-center">
          <div className="bg-background/90 backdrop-blur-md border border-border/80 px-3 py-1.5 rounded-full shadow-md text-[11px] font-medium text-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
            <span>Drag pin or click map to set exact delivery drop-off</span>
          </div>
        </div>

        {/* Live Coordinates Pill */}
        <div className="absolute bottom-2 right-2 pointer-events-none z-[1000]">
          <div className="bg-background/90 backdrop-blur-md border border-border px-2.5 py-1 rounded text-[10px] font-mono text-muted-foreground shadow-sm">
            Lat: {location.lat?.toFixed(5) || currentLat.toFixed(5)}, Lng: {location.lng?.toFixed(5) || currentLng.toFixed(5)}
          </div>
        </div>
      </div>

      {/* Resolved Pinned Location Display */}
      <div className="p-3 bg-surface border border-border/80 rounded-lg flex items-start gap-2.5">
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5 min-w-0">
          <p className="text-[11px] font-medium text-foreground truncate">
            {addressDisplay}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Exact GPS coordinates recorded for the delivery courier rider
          </p>
        </div>
      </div>
    </div>
  );
}
