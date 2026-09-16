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
  onSkip: () => void;
}

export const OpeningTrailer21s: React.FC<OpeningTrailerProps> = ({
  currentLandmark,
  server,
  onComplete,
  onSkip
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(21);
  const [phaseText, setPhaseText] = useState('LOCKING SATELLITE GRID...');
  const DURATION = 21;

  useEffect(() => {
    soundEngine.playCinematicBooms();
    soundEngine.playTeleport();

    const interval = window.setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }

        const next = prev - 1;
        // Phase changes
        if (next > 16) {
          setPhaseText('PHASE 1: PROXIMITY MATCHMAKING TO 34 SERVERS...');
        } else if (next > 11) {
          setPhaseText(`PHASE 2: DOWNLOADING GOOGLE MAPS SATELLITE TELEMETRY [${currentLandmark.name}]...`);
        } else if (next > 6) {
          setPhaseText('PHASE 3: VOXELIZING REAL-WORLD ELEVATION & ARCHITECTURE...');
          soundEngine.playBlockPlace('stone');
        } else {
          setPhaseText('PHASE 4: AVATAR DEPLOYMENT & LOW-LATENCY TICK HANDSHAKE...');
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentLandmark, onComplete]);

  const elapsed = DURATION - secondsRemaining;
  const progressPercent = (elapsed / DURATION) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden" id="opening-trailer-modal">
      {/* Background Animated Warp Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-25 animate-pulse" />

      {/* Top Bar with Skip */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => {
            soundEngine.playClick();
            onSkip();
          }}
          className="mc-btn px-4 py-2 text-xs font-minecraft text-amber-300 hover:text-white cursor-pointer"
          id="btn-skip-opening-trailer"
        >
          SKIP INTRO [ESC] ➔
        </button>
      </div>

      {/* Main Cinematic Visual Stage */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-6">
        {/* Flag & Target Landmark */}
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-stone-900/90 border-2 border-stone-700 rounded shadow-xl">
          <span className="text-3xl">{currentLandmark.flag}</span>
          <div className="text-left">
            <div className="text-xs font-minecraft text-amber-400">{currentLandmark.name}</div>
            <div className="text-xs font-pixel text-stone-400">
              {currentLandmark.lat.toFixed(4)}°N, {currentLandmark.lng.toFixed(4)}°E • {currentLandmark.location}
            </div>
          </div>
        </div>

        {/* Big Countdown */}
        <div className="relative flex flex-col items-center">
          <div className="text-6xl md:text-8xl font-minecraft text-amber-400 mc-title-shadow tracking-tighter">
            {secondsRemaining}s
          </div>
          <div className="text-xs font-minecraft text-stone-400 mt-2 uppercase tracking-widest">
            ENTERING GOOGLE CRAFT
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="bg-stone-900 border border-stone-700 p-4 rounded text-left space-y-2">
          <div className="text-xs font-minecraft text-emerald-400 flex items-center justify-between">
            <span>{phaseText}</span>
            <span className="text-stone-400 text-[10px]">{Math.round(progressPercent)}%</span>
          </div>

          <div className="w-full bg-stone-850 h-3 border border-stone-700 rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Real-time server ping telemetry */}
          <div className="flex items-center justify-between text-[11px] font-pixel text-stone-400 pt-1">
            <span>Assigned Node: <strong className="text-amber-300">{server.name}</strong></span>
            <span>Target Latency: <strong className="text-emerald-400">{server.pingMs}ms</strong></span>
            <span>Server Net: 34 Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
