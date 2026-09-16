import React, { useEffect, useRef, useState } from 'react';
import { Landmark, voxelToCoordinates, loadGoogleMaps } from '../services/googleMapsService';

interface MiniMapHUDProps {
  landmark: Landmark;
  playerPos: { x: number; y: number; z: number };
  cameraYaw: number;
  isFlying: boolean;
  currentChunk: { x: number; z: number };
  loadedChunksCount: number;
  memorySavedMb: number;
  onTeleportToCoord?: (x: number, z: number) => void;
}

export const MiniMapHUD: React.FC<MiniMapHUDProps> = ({
  landmark,
  playerPos,
  cameraYaw,
  isFlying,
  currentChunk,
  loadedChunksCount,
  memorySavedMb,
}) => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const playerMarkerRef = useRef<any>(null);
  const playerArrowRef = useRef<any>(null);
  const [mapType, setMapType] = useState<'satellite' | 'hybrid' | 'roadmap'>('satellite');
  const [zoomLevel, setZoomLevel] = useState<number>(18);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Compute player's real-world GPS coordinates
  const currentCoords = voxelToCoordinates(landmark.lat, landmark.lng, playerPos.x, playerPos.z);
  const headingDeg = Math.round(((-cameraYaw * 180) / Math.PI) % 360 + 360) % 360;

  // Cardinal direction label
  const getCardinalDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(deg / 45) % 8;
    return directions[idx];
  };

  // Initialize Google Maps instance
  useEffect(() => {
    let isCancelled = false;

    loadGoogleMaps().then(() => {
      if (isCancelled || !mapDivRef.current) return;
      const win = window as any;
      if (!win.google?.maps) return;

      try {
        const centerPos = { lat: currentCoords.lat, lng: currentCoords.lng };
        const map = new win.google.maps.Map(mapDivRef.current, {
          center: centerPos,
          zoom: zoomLevel,
          mapTypeId: mapType,
          disableDefaultUI: true,
          gestureHandling: 'none',
          zoomControl: false,
          tilt: 45,
          styles: [
            { elementType: 'geometry', stylers: [{ saturation: 10 }] },
            { featureType: 'poi', stylers: [{ visibility: 'on' }] }
          ]
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
      } catch (err) {
        console.warn("Could not create Google Maps instance for minimap", err);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Sync player position with map center & marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const centerPos = { lat: currentCoords.lat, lng: currentCoords.lng };

    // Pan map smoothly to player's GPS position
    mapInstanceRef.current.panTo(centerPos);

    if (mapInstanceRef.current.getZoom() !== zoomLevel) {
      mapInstanceRef.current.setZoom(zoomLevel);
    }

    if (mapInstanceRef.current.getMapTypeId() !== mapType) {
      mapInstanceRef.current.setMapTypeId(mapType);
    }
  }, [currentCoords.lat, currentCoords.lng, zoomLevel, mapType]);

  // Adjust zoom for creative flight high-altitude view
  useEffect(() => {
    if (isFlying && playerPos.y > 25) {
      // Zoom out to view 347km regional landscape
      setZoomLevel(12);
    } else {
      setZoomLevel(18);
    }
  }, [isFlying, playerPos.y > 25]);

  return (
    <div
      className={`absolute bottom-4 right-4 z-20 flex flex-col items-end transition-all duration-300 font-pixel select-none ${
        isExpanded ? 'w-80' : 'w-56'
      }`}
      id="hud-minimap-container"
    >
      {/* Top Controls Bar */}
      <div className="w-full bg-stone-900/90 border-t-2 border-l-2 border-r-2 border-stone-600 px-2 py-1 flex items-center justify-between text-[10px] text-stone-200">
        <div className="flex items-center gap-1.5 font-minecraft text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
          <span>GPS RADAR</span>
          <span className="text-[9px] text-amber-400 ml-1">[{getCardinalDirection(headingDeg)} {headingDeg}°]</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel(z => Math.min(20, z + 1))}
            className="w-5 h-5 bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center border border-stone-600 text-xs cursor-pointer"
            title="Zoom In"
            id="btn-minimap-zoomin"
          >
            +
          </button>
          <button
            onClick={() => setZoomLevel(z => Math.max(9, z - 1))}
            className="w-5 h-5 bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center border border-stone-600 text-xs cursor-pointer"
            title="Zoom Out"
            id="btn-minimap-zoomout"
          >
            -
          </button>
          <button
            onClick={() => setMapType(t => t === 'satellite' ? 'hybrid' : (t === 'hybrid' ? 'roadmap' : 'satellite'))}
            className="px-1.5 h-5 bg-stone-800 hover:bg-stone-700 text-amber-300 flex items-center justify-center border border-stone-600 text-[9px] uppercase cursor-pointer"
            title="Toggle Map Style"
            id="btn-minimap-layer"
          >
            {mapType === 'satellite' ? 'SAT' : (mapType === 'hybrid' ? 'HYB' : 'MAP')}
          </button>
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="w-5 h-5 bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center border border-stone-600 text-[10px] cursor-pointer"
            title={isExpanded ? "Collapse Minimap" : "Expand Minimap"}
            id="btn-minimap-expand"
          >
            {isExpanded ? '⤢' : '⤡'}
          </button>
        </div>
      </div>

      {/* Minimap Viewport Frame */}
      <div
        className={`w-full relative border-2 border-stone-600 bg-stone-950 overflow-hidden shadow-2xl transition-all duration-300 ${
          isExpanded ? 'h-64' : 'h-44'
        }`}
      >
        {/* Google Maps Real-time Canvas */}
        <div ref={mapDivRef} className="w-full h-full" id="google-minimap-canvas" />

        {/* Fallback Grid View if Maps is loading / offline */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center p-3 text-center">
            <div className="text-amber-400 font-minecraft text-xs mb-1 animate-pulse">Initializing Satellite Feed...</div>
            <div className="text-[10px] text-stone-400">Google Maps Ground Truth: {landmark.name}</div>
            <div className="text-[9px] text-emerald-400 mt-1">{currentCoords.lat.toFixed(4)}°N, {currentCoords.lng.toFixed(4)}°E</div>
          </div>
        )}

        {/* Radar Reticle Crosshair & Concentric Grid */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
          <div className="w-24 h-24 border border-emerald-400/50 rounded-full"></div>
          <div className="w-40 h-40 border border-emerald-400/30 rounded-full absolute"></div>
          <div className="w-full h-[1px] bg-emerald-400/30 absolute"></div>
          <div className="h-full w-[1px] bg-emerald-400/30 absolute"></div>
        </div>

        {/* Player Cursor Indicator (Rotated with CameraYaw) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className="relative flex items-center justify-center transition-transform duration-75"
            style={{ transform: `rotate(${headingDeg}deg)` }}
            title="Player Direction"
            id="minimap-player-arrow"
          >
            {/* Minecraft-styled Player Arrow Indicator */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[14px] border-b-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter"></div>
            {/* Pulsing Center Anchor */}
            <div className="absolute w-2 h-2 rounded-full bg-white border border-red-700 top-2"></div>
          </div>
        </div>

        {/* North Compass Indicator */}
        <div className="absolute top-2 left-2 bg-stone-900/80 px-1.5 py-0.5 border border-stone-700 text-[9px] font-minecraft text-red-400">
          ▲ N
        </div>

        {/* Chunk Streaming / Horizon Badge */}
        <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 border border-stone-800 text-[9px] font-pixel text-cyan-300">
          Chunk: {currentChunk.x},{currentChunk.z}
        </div>

        {/* Flight Horizon Badge (When flying) */}
        {isFlying && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/85 backdrop-blur-sm px-2 py-1 border border-amber-500/80 text-[9px] text-amber-300 flex items-center justify-between">
            <span className="font-bold flex items-center gap-1">🪽 347km Horizon Vista</span>
            <span className="text-emerald-400">Auto-Stream Active</span>
          </div>
        )}
      </div>

      {/* Bottom Info Bar: Real-world GPS & Memory Optimization */}
      <div className="w-full bg-stone-900/95 border-b-2 border-l-2 border-r-2 border-stone-600 px-2 py-1.5 text-[9px] text-stone-300 space-y-0.5">
        <div className="flex justify-between items-center">
          <span className="text-stone-400">Geo Location:</span>
          <span className="text-amber-400 font-mono">
            {currentCoords.lat.toFixed(5)}°, {currentCoords.lng.toFixed(5)}°
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-stone-400">Alt / Dist:</span>
          <span className="text-emerald-400">
            {Math.round(playerPos.y + landmark.altitudeMeters)}m / {Math.round(Math.hypot(playerPos.x, playerPos.z))}m from origin
          </span>
        </div>
        <div className="flex justify-between items-center text-[8.5px] border-t border-stone-800 pt-0.5">
          <span className="text-cyan-400">Chunks: {loadedChunksCount} active (Seamless Path)</span>
          <span className="text-purple-300 font-mono">RAM Saved: ~{memorySavedMb}MB</span>
        </div>
      </div>
    </div>
  );
};
