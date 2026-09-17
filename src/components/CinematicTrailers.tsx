// 30-Second Gameplay Trailer & 21-Second Opening Cinematic Trailer with Sound Effects & VFX

import React, { useEffect, useState, useRef } from 'react';
import { soundEngine } from '../services/soundEngine';
import { Landmark } from '../services/googleMapsService';
import { GameServer } from '../services/serverNetwork';

interface GameplayTrailerProps {
  onClose?: () => void;
  isBackground?: boolean;
}

export const GameplayTrailer30s: React.FC<GameplayTrailerProps> = ({ onClose, isBackground = false }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const DURATION = 30.0;

  useEffect(() => {
    startTimeRef.current = performance.now();
    soundEngine.playCinematicBooms();

    const loop = (now: number) => {
      if (isPlaying) {
        const elapsed = (now - startTimeRef.current) / 1000;
        const currentProgress = elapsed % DURATION;
        setCurrentTime(currentProgress);

        // Periodic trailer SFX cues at key chapter milestones
        if (Math.floor(currentProgress) === 5 && Math.abs(currentProgress - 5) < 0.05) {
          soundEngine.playLevelUp();
        } else if (Math.floor(currentProgress) === 15 && Math.abs(currentProgress - 15) < 0.05) {
          soundEngine.playBlockPlace('diamond');
        } else if (Math.floor(currentProgress) === 25 && Math.abs(currentProgress - 25) < 0.05) {
          soundEngine.playCinematicBooms();
        }
      }
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  // Determine current cinematic scene
  const getScene = (t: number) => {
    if (t < 5) {
      return {
        chapter: 'ACT I • THE EARTH SATELLITE SCAN',
        title: 'GOOGLE MAPS 1:1 GLOBAL COORDINATES',
        sub: 'Mapping the entire planet directly into interactive Minecraft voxels',
        bgGradient: 'from-blue-950 via-slate-900 to-black',
        landmark: 'Eiffel Tower, Paris (48.8584° N, 2.2945° E)',
        icon: '🛰️',
        accentColor: '#00e5ff'
      };
    } else if (t < 10) {
      return {
        chapter: 'ACT II • ANCIENT ARCHITECTURE',
        title: 'GREAT PYRAMID & SPHINX VOXELIZED',
        sub: 'Explore and re-sculpt 4,500-year-old architectural wonders block by block',
        bgGradient: 'from-amber-950 via-orange-950 to-stone-950',
        landmark: 'Giza Necropolis, Egypt (29.9792° N, 31.1342° E)',
        icon: '🏛️',
        accentColor: '#ffb300'
      };
    } else if (t < 16) {
      return {
        chapter: 'ACT III • MODERN MARVELS',
        title: 'SKYSCRAPERS & SUSPENSION BRIDGES',
        sub: 'Burj Khalifa, Golden Gate Bridge, and Sydney Opera House with real-time day/night physics',
        bgGradient: 'from-indigo-950 via-purple-950 to-slate-950',
        landmark: 'Burj Khalifa & Golden Gate (Global Satellites)',
        icon: '🏙️',
        accentColor: '#e040fb'
      };
    } else if (t < 22) {
      return {
        chapter: 'ACT IV • ULTRA LOW LATENCY MULTIPLAYER',
        title: '34 DEDICATED GLOBAL SERVERS',
        sub: 'Proximity matchmaking connects you to sub-15ms regional servers instantly',
        bgGradient: 'from-emerald-950 via-teal-950 to-stone-950',
        landmark: 'Server 1 Alpha • Server 2 Delta • Server 3 Gamma',
        icon: '⚡',
        accentColor: '#00e676'
      };
    } else {
      return {
        chapter: 'ACT V • BUILD WITH NO BOUNDARIES',
        title: 'GOOGLE CRAFT • OUT NOW',
        sub: 'Real-time collaborative sandbox on real-world satellite ground',
        bgGradient: 'from-red-950 via-amber-950 to-black',
        landmark: 'All 7 Continents • 100% Real-Time Multiplayer',
        icon: '⛏️',
        accentColor: '#ffea00'
      };
    }
  };

  const scene = getScene(currentTime);
  const progressPercent = (currentTime / DURATION) * 100;

  if (isBackground) {
    // Subtle looping ambient background mode on Title Screen
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" id="trailer-background">
        <div className={`w-full h-full bg-gradient-to-br ${scene.bgGradient} transition-colors duration-1000 opacity-90`} />
        
        {/* Animated 3D Voxel Graphic Representation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="relative w-96 h-96 border-2 border-amber-400/20 rotate-12 animate-pulse flex items-center justify-center">
            <div className="text-8xl select-none">{scene.icon}</div>
          </div>
        </div>

        {/* Cinematic Scanlines & Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
      </div>
    );
  }

  // Fullscreen Gameplay Trailer Modal
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-6 select-none" id="trailer-fullscreen-view">
      {/* Top Header */}
      <div className="flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-bounce">🎬</span>
          <div>
            <div className="text-xs font-minecraft text-amber-400">
              OFFICIAL 30-SECOND GAMEPLAY TRAILER
            </div>
            <div className="text-xs font-pixel text-stone-400">
              Google Craft: Global Maps Voxel Adventure • Real-Time Multiplayer
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsMuted(prev => !prev);
              soundEngine.setMuted(!isMuted);
            }}
            className="mc-btn px-3 py-1.5 text-xs cursor-pointer"
            id="btn-trailer-mute"
          >
            {isMuted ? '🔇 Unmute' : '🔊 SFX ON'}
          </button>

          {onClose && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="mc-btn px-3 py-1.5 text-xs text-red-300 cursor-pointer"
              id="btn-trailer-close"
            >
              ✕ Exit Trailer
            </button>
          )}
        </div>
      </div>

      {/* Main Cinematic Video Stage */}
      <div className={`relative flex-1 my-4 rounded-xl border-3 border-stone-700 overflow-hidden bg-gradient-to-br ${scene.bgGradient} flex flex-col items-center justify-center p-8 transition-colors duration-700 shadow-2xl`}>
        {/* Floating Landmark Badge */}
        <div className="absolute top-6 left-6 bg-black/70 border border-stone-600 px-3 py-1.5 rounded text-xs font-pixel text-stone-300 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span>REC | 4K 60FPS VOXEL ENGINE</span>
          <span className="text-amber-400">[{scene.landmark}]</span>
        </div>

        {/* Central Animated Scene Graphic */}
        <div className="text-center max-w-2xl space-y-4">
          <div className="text-7xl mb-2 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] animate-bounce">
            {scene.icon}
          </div>
          <div
            className="text-xs font-minecraft tracking-widest px-3 py-1 bg-black/60 inline-block rounded"
            style={{ color: scene.accentColor }}
          >
            {scene.chapter}
          </div>
          <h1 className="text-2xl md:text-4xl font-minecraft text-white tracking-wide mc-title-shadow">
            {scene.title}
          </h1>
          <p className="text-sm md:text-base font-pixel text-stone-200 leading-relaxed max-w-xl mx-auto">
            {scene.sub}
          </p>
        </div>

        {/* Live Server Latency HUD graphic */}
        <div className="absolute bottom-6 right-6 bg-black/75 border border-stone-700 px-3 py-2 text-[11px] font-pixel text-stone-300">
          <div className="text-emerald-400 font-minecraft text-[10px]">LOW LATENCY SYNC: 14MS</div>
          <div>SERVER NODES: 34 ONLINE</div>
          <div>NET CODE: ZERO LOSS TICK 20</div>
        </div>
      </div>

      {/* Bottom Timeline & Controls */}
      <div className="space-y-2 z-20">
        {/* Progress Bar */}
        <div className="w-full bg-stone-800 h-3 border border-stone-600 relative overflow-hidden rounded">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-pixel text-stone-300">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsPlaying(prev => !prev);
              }}
              className="mc-btn px-2.5 py-1 text-[10px] cursor-pointer"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <span>
              {currentTime.toFixed(1)}s / {DURATION.toFixed(1)}s
            </span>
          </div>

          <div className="text-stone-400 text-[11px]">
            Google Craft Official Gameplay Trailer • Built with Google Maps API
          </div>
        </div>
      </div>
    </div>
  );
};

interface OpeningTrailerProps {
  currentLandmark: Landmark;
  server: GameServer;
  onComplete: () => void;
}

export const OpeningTrailer21s: React.FC<OpeningTrailerProps> = ({
  currentLandmark,
  server,
  onComplete,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [activeLayer, setActiveLayer] = useState(1);
  const [blocksStacked, setBlocksStacked] = useState(0);
  const [phaseStatus, setPhaseStatus] = useState('INITIALIZING SATELLITE TELEMETRY & STRATUM LAYERS...');
  const DURATION = 15;

  const MESH_LAYERS = [
    {
      id: 1,
      name: 'LAYER 1: BEDROCK & FOUNDATION STRATUM',
      range: 'y = -1 to 0',
      description: 'Solid bedrock sub-base, subterranean support matrix, and impervious baseline mesh',
      blocks: 1024,
      icon: '🪨',
      color: 'text-stone-400',
      bgColor: 'bg-stone-700',
    },
    {
      id: 2,
      name: 'LAYER 2: SATELLITE TERRAIN & BIOME PLAZAS',
      range: 'y = 0 to 2',
      description: 'Google Maps elevation topology, pedestrian promenades, river channels, and roads',
      blocks: 2048,
      icon: '🌿',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-600',
    },
    {
      id: 3,
      name: 'LAYER 3: LOAD-BEARING ARCHITECTURE & COLUMNS',
      range: 'y = 2 to 14',
      description: 'Primary structural framing, archways, reinforced stone pillars, and monument core',
      blocks: 3200,
      icon: '🏛️',
      color: 'text-amber-400',
      bgColor: 'bg-amber-600',
    },
    {
      id: 4,
      name: 'LAYER 4: UPPER ELEVATIONS, SPIRES & ROOF ART',
      range: 'y = 15 to 45',
      description: 'Tiered cantilever decks, towers, gothic cornices, cupolas, and aerial pinnacles',
      blocks: 4120,
      icon: '🗼',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-600',
    },
    {
      id: 5,
      name: 'LAYER 5: EMISSIVE ART, LIGHTING & SHADER MESH',
      range: 'All Levels',
      description: 'Dynamic redstone lamps, stained glass, glowing gold accents, and atmospheric shaders',
      blocks: 4890,
      icon: '✨',
      color: 'text-purple-400',
      bgColor: 'bg-purple-600',
    },
  ];

  useEffect(() => {
    soundEngine.playCinematicBooms();
    soundEngine.playTeleport();

    const interval = window.setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          soundEngine.playLevelUp();
          onComplete();
          return 0;
        }

        const next = prev - 1;
        const progress = (DURATION - next) / DURATION;
        
        // Calculate current active layer based on progression (1 to 5)
        const currentLayerIdx = Math.min(5, Math.max(1, Math.ceil(progress * 5)));
        setActiveLayer(currentLayerIdx);

        // Sound effect on layer stacking
        if (currentLayerIdx === 1) {
          soundEngine.playBlockPlace('stone');
          setPhaseStatus('STACKING LAYER 1: Geological Bedrock & Subterranean Foundation...');
        } else if (currentLayerIdx === 2) {
          soundEngine.playBlockPlace('grass');
          setPhaseStatus(`STACKING LAYER 2: Satellite Elevation [${currentLandmark.name}] & Plaza Ground...`);
        } else if (currentLayerIdx === 3) {
          soundEngine.playBlockPlace('stone');
          setPhaseStatus('STACKING LAYER 3: Monument Core Columns & Heavy Structural Framing...');
        } else if (currentLayerIdx === 4) {
          soundEngine.playBlockPlace('diamond');
          setPhaseStatus('STACKING LAYER 4: High-Altitude Spires, Roofs & Observation Platforms...');
        } else {
          soundEngine.playBlockPlace('gold');
          setPhaseStatus('STACKING LAYER 5: Dynamic Emissive Lighting, Shader Maps & Final Voxel Bake...');
        }

        // Animated block counter
        const targetBlocks = MESH_LAYERS[currentLayerIdx - 1]?.blocks || 4890;
        setBlocksStacked(Math.round(progress * targetBlocks));

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentLandmark, onComplete]);

  const elapsed = DURATION - secondsRemaining;
  const progressPercent = Math.min(100, Math.round((elapsed / DURATION) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-center p-4 md:p-8 select-none overflow-y-auto" id="opening-trailer-modal">
      {/* Background Animated Warp Matrix Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />

      {/* Main Cinematic Mesh Loading Stage */}
      <div className="relative z-10 max-w-3xl w-full text-center space-y-5 my-auto">
        {/* Top Header & Landmark Metadata */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-stone-900/90 border-2 border-stone-700 rounded-lg shadow-2xl backdrop-blur-md">
          <span className="text-3xl animate-bounce">{currentLandmark.flag}</span>
          <div className="text-left">
            <div className="text-sm font-minecraft text-amber-400 font-bold flex items-center gap-2">
              <span>{currentLandmark.name}</span>
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">
                {currentLandmark.category}
              </span>
            </div>
            <div className="text-xs font-pixel text-stone-300">
              {currentLandmark.lat.toFixed(4)}°N, {currentLandmark.lng.toFixed(4)}°E • {currentLandmark.location}
            </div>
          </div>
        </div>

        {/* Big Countdown & Live Status Title */}
        <div className="relative flex flex-col items-center">
          <div className="text-5xl md:text-7xl font-minecraft text-amber-400 mc-title-shadow tracking-tighter">
            {progressPercent}%
          </div>
          <div className="text-xs font-minecraft text-emerald-400 mt-1 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>BUILDING WORLD MESH & STACKING GRAPHIC LAYERS ({secondsRemaining}s)</span>
          </div>
          <p className="text-xs font-pixel text-stone-400 max-w-lg mt-1">
            Synthesizing high-precision voxel topology directly onto Google Maps 1:1 coordinates before entering gameplay.
          </p>
        </div>

        {/* 5-Layer Stacking Architecture Diagram */}
        <div className="bg-stone-900/95 border-2 border-stone-700 p-4 rounded-xl shadow-2xl text-left space-y-3 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-minecraft border-b border-stone-800 pb-2">
            <span className="text-amber-400">STACKED MESH ARCHITECTURE PIPELINE</span>
            <span className="text-stone-400 font-pixel">
              VOXELS LOADED: <strong className="text-amber-300">{blocksStacked.toLocaleString()}</strong> / 4,890+
            </span>
          </div>

          {/* 5 Stacked Graphic Layers Display */}
          <div className="space-y-2">
            {MESH_LAYERS.map((layer) => {
              const isLoaded = activeLayer > layer.id;
              const isCurrent = activeLayer === layer.id;
              
              return (
                <div
                  key={layer.id}
                  className={`p-2.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-950/40 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                      : isLoaded
                      ? 'border-emerald-700/60 bg-emerald-950/20'
                      : 'border-stone-800 bg-stone-900/40 opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{layer.icon}</span>
                    <div>
                      <div className="text-xs font-minecraft flex items-center gap-2">
                        <span className={layer.color}>{layer.name}</span>
                        <span className="text-[10px] text-stone-500 font-pixel">[{layer.range}]</span>
                      </div>
                      <div className="text-[11px] font-pixel text-stone-300">
                        {layer.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right shrink-0">
                    <span className="text-[11px] font-minecraft">
                      {isLoaded ? (
                        <span className="text-emerald-400">✓ STACKED</span>
                      ) : isCurrent ? (
                        <span className="text-amber-400 animate-pulse">⚙️ COMPILING...</span>
                      ) : (
                        <span className="text-stone-500">QUEUED</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Global Mesh Progress Bar */}
          <div className="pt-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-minecraft">
              <span className="text-stone-300 text-[11px]">{phaseStatus}</span>
              <span className="text-emerald-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-stone-950 h-3 border border-stone-700 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Network and Node Telemetry */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-pixel text-stone-400 pt-2 border-t border-stone-800">
            <span>Mesh Server Node: <strong className="text-amber-300">{server.name}</strong></span>
            <span>Target Tick Latency: <strong className="text-emerald-400">{server.pingMs}ms</strong></span>
            <span>Draw Calls: <strong className="text-cyan-300">Batched (Zero Lag)</strong></span>
            <span>Physics Engine: <strong className="text-purple-300">3D Voxel Raycaster</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
