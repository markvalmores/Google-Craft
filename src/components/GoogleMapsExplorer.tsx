// Interactive Google Maps Explorer with Real-World Landmark Teleportation & Voxel Mapping

import React, { useEffect, useRef, useState } from 'react';
import { Landmark, FAMOUS_LANDMARKS, GOOGLE_MAPS_API_KEY, loadGoogleMaps } from '../services/googleMapsService';
import { soundEngine } from '../services/soundEngine';

// Safe types for Google Maps objects
type GoogleMap = any;
type GoogleMarker = any;
type GoogleMapMouseEvent = any;

interface GoogleMapsExplorerProps {
  currentLandmark: Landmark;
  onSelectLandmark: (landmark: Landmark) => void;
  onClose?: () => void;
  isMiniMap?: boolean;
}

export const GoogleMapsExplorer: React.FC<GoogleMapsExplorerProps> = ({
  currentLandmark,
  onSelectLandmark,
  onClose,
  isMiniMap = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const [mapType, setMapType] = useState<'satellite' | 'hybrid' | 'roadmap' | 'terrain'>('satellite');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [customLat, setCustomLat] = useState(currentLandmark.lat.toString());
  const [customLng, setCustomLng] = useState(currentLandmark.lng.toString());

  // Initialize Google Maps
  useEffect(() => {
    let isMounted = true;

    loadGoogleMaps().then(() => {
      if (!isMounted || !mapContainerRef.current) return;

      const google = (window as unknown as { google?: any }).google;
      if (!google?.maps) {
        setIsMapLoaded(false);
        return;
      }

      setIsMapLoaded(true);

      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: currentLandmark.lat, lng: currentLandmark.lng },
        zoom: isMiniMap ? 14 : 17,
        mapTypeId: mapType,
        disableDefaultUI: isMiniMap,
        zoomControl: !isMiniMap,
        mapTypeControl: false,
        streetViewControl: !isMiniMap,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });
      mapInstanceRef.current = map;

      // Add markers for all famous landmarks
      FAMOUS_LANDMARKS.forEach((lm) => {
        const isCurrent = lm.id === currentLandmark.id;
        const marker = new google.maps.Marker({
          position: { lat: lm.lat, lng: lm.lng },
          map,
          title: `${lm.flag} ${lm.name} (${lm.country})`,
          animation: isCurrent ? google.maps.Animation.BOUNCE : undefined,
          icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: isCurrent ? 7 : 5,
            fillColor: isCurrent ? '#00e5ff' : '#ff9100',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#000000'
          }
        });

        marker.addListener('click', () => {
          soundEngine.playLevelUp();
          onSelectLandmark(lm);
        });

        markersRef.current.push(marker);
      });

      // Allow clicking on map to set custom coordinates
      map.addListener('click', (e: GoogleMapMouseEvent) => {
        if (e.latLng) {
          const lat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
          const lng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
          setCustomLat(lat.toFixed(5));
          setCustomLng(lng.toFixed(5));
        }
      });
    });

    return () => {
      isMounted = false;
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    };
  }, [isMiniMap]);

  // Center map when currentLandmark changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: currentLandmark.lat, lng: currentLandmark.lng });
      mapInstanceRef.current.setZoom(isMiniMap ? 15 : 18);
    }
  }, [currentLandmark, isMiniMap]);

  // Handle map type changes
  const switchMapType = (type: 'satellite' | 'hybrid' | 'roadmap' | 'terrain') => {
    setMapType(type);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type);
    }
    soundEngine.playClick();
  };

  // Custom Coordinate Teleport
  const handleTeleportCustomCoords = () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng)) return;

    soundEngine.playTeleport();

    const customLandmark: Landmark = {
      id: `custom_${lat.toFixed(2)}_${lng.toFixed(2)}`,
      name: `Custom Coordinate (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
      location: 'Real-World Geolocation',
      country: 'Global Grid',
      flag: '🌐',
      lat,
      lng,
      altitudeMeters: 45,
      category: 'Modern Wonder',
      description: 'Player specified geographic location mapped directly into Google Craft voxel terrain.',
      historicalFact: 'Converted in real time from Google Maps global coordinate projections.',
      recommendedTime: 'day',
      voxelPalette: ['grass', 'stone', 'quartz', 'glass']
    };

    onSelectLandmark(customLandmark);
  };

  // Mini-map widget view
  if (isMiniMap) {
    return (
      <div className="relative w-44 h-44 rounded border-2 border-stone-600 bg-stone-900 shadow-xl overflow-hidden" id="minimap-container">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-1 left-1 bg-black/70 px-1.5 py-0.5 text-[9px] font-minecraft text-emerald-400">
          MAP: {currentLandmark.name.slice(0, 10)}..
        </div>
      </div>
    );
  }

  // Full Screen / Modal Google Maps Explorer
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" id="google-maps-explorer-modal">
      <div className="w-full max-w-5xl h-[85vh] bg-stone-900 border-3 border-stone-600 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-stone-950 px-4 py-3 border-b-2 border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗺️</span>
            <div>
              <h2 className="text-base font-minecraft text-amber-400 tracking-wide">
                GOOGLE MAPS SATELLITE TELEPORT
              </h2>
              <p className="text-xs font-pixel text-stone-400">
                Key: {GOOGLE_MAPS_API_KEY.slice(0, 10)}... | Real-World Global Coordinate Projection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Map Types */}
            <div className="flex border border-stone-700 rounded overflow-hidden text-[10px] font-minecraft">
              {(['satellite', 'hybrid', 'roadmap', 'terrain'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => switchMapType(t)}
                  className={`px-2.5 py-1 uppercase cursor-pointer ${
                    mapType === t ? 'bg-amber-600 text-white font-bold' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {onClose && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="mc-btn px-3 py-1 text-xs text-red-300 cursor-pointer ml-2"
                id="btn-close-map-modal"
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* Content Body: Map + Landmark Drawer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Main Map Canvas */}
          <div className="flex-1 h-full relative bg-stone-950">
            <div ref={mapContainerRef} className="w-full h-full" id="google-maps-full-canvas" />

            {!isMapLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/90 text-center p-6 space-y-3">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <div className="font-minecraft text-sm text-stone-200">Connecting to Google Maps API...</div>
                <div className="font-pixel text-stone-400 text-xs">Mapping global satellite layers with API Key {GOOGLE_MAPS_API_KEY.slice(0, 12)}...</div>
              </div>
            )}

            {/* Floating Quick Teleport Bar on Map */}
            <div className="absolute bottom-4 left-4 right-4 bg-stone-950/90 border border-stone-700 p-2.5 flex flex-wrap items-center gap-2 text-xs font-pixel">
              <span className="text-amber-400 font-minecraft text-[10px]">WARP COORDS:</span>
              <input
                type="text"
                placeholder="Latitude (e.g. 48.8584)"
                value={customLat}
                onChange={e => setCustomLat(e.target.value)}
                className="bg-stone-800 border border-stone-600 px-2 py-1 text-stone-100 w-32 focus:border-amber-400 outline-none"
              />
              <input
                type="text"
                placeholder="Longitude (e.g. 2.2945)"
                value={customLng}
                onChange={e => setCustomLng(e.target.value)}
                className="bg-stone-800 border border-stone-600 px-2 py-1 text-stone-100 w-32 focus:border-amber-400 outline-none"
              />
              <button
                onClick={handleTeleportCustomCoords}
                className="mc-btn-green px-3 py-1 font-minecraft text-[10px] cursor-pointer"
                id="btn-teleport-coords"
              >
                🚀 Warp Here
              </button>
            </div>
          </div>

          {/* Right Side: Architectural Landmarks Selector */}
          <div className="w-full md:w-80 bg-stone-900 border-t-2 md:border-t-0 md:border-l-2 border-stone-700 flex flex-col overflow-hidden">
            <div className="p-3 bg-stone-950 border-b border-stone-800">
              <div className="text-xs font-minecraft text-stone-300 mb-1">
                ARCHITECTURAL SITES ({FAMOUS_LANDMARKS.length})
              </div>
              <p className="text-[11px] font-pixel text-stone-400">
                Click any landmark to teleport your avatar and voxelize the world.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5" id="landmark-list-scroll">
              {FAMOUS_LANDMARKS.map((landmark) => {
                const isCurrent = landmark.id === currentLandmark.id;
                return (
                  <button
                    key={landmark.id}
                    onClick={() => {
                      soundEngine.playLevelUp();
                      onSelectLandmark(landmark);
                      if (onClose) onClose();
                    }}
                    className={`w-full text-left p-2.5 border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isCurrent
                        ? 'border-amber-400 bg-amber-950/40 text-amber-200'
                        : 'border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-300'
                    }`}
                    id={`landmark-card-${landmark.id}`}
                  >
                    <span className="text-2xl mt-0.5">{landmark.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-minecraft text-xs truncate text-amber-300">
                          {landmark.name}
                        </div>
                        {isCurrent && (
                          <span className="text-[9px] bg-emerald-600 px-1 text-white font-minecraft">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-pixel text-stone-400 truncate">
                        {landmark.location}
                      </div>
                      <div className="text-[9px] font-minecraft text-cyan-400 mt-1">
                        {landmark.lat.toFixed(3)}°, {landmark.lng.toFixed(3)}° • {landmark.altitudeMeters}m
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
