// Credits Modal - Minecraft End Poem / Credits Style
// Dedicated credit to: 1 Developer Mark David V. Valmores

import React, { useEffect, useRef } from 'react';
import { soundEngine } from '../services/soundEngine';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    soundEngine.playLevelUp();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn"
      id="credits-modal-overlay"
    >
      <div
        className="w-full max-w-2xl bg-stone-900 border-4 border-stone-600 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[85vh] overflow-hidden"
        id="credits-modal-card"
      >
        {/* Header */}
        <div className="bg-stone-950 px-5 py-3 border-b-2 border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">📜</span>
            <div>
              <h2 className="text-sm md:text-base font-minecraft text-amber-400">
                GOOGLE CRAFT • CREDITS
              </h2>
              <p className="text-[11px] font-pixel text-stone-400">
                Created with passion, voxel geometry, and Google Maps
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="mc-btn px-3 py-1.5 text-xs text-rose-300 hover:text-white cursor-pointer"
            id="btn-close-credits"
            title="Close [ESC]"
          >
            ✕ Close [ESC]
          </button>
        </div>

        {/* Scrollable Credits Body */}
        <div
          ref={scrollContainerRef}
          className="p-6 md:p-8 overflow-y-auto space-y-8 text-center scrollbar-thin scrollbar-thumb-stone-600 scrollbar-track-stone-900"
        >
          {/* Main Title Badge */}
          <div className="space-y-2">
            <div className="text-3xl md:text-5xl font-minecraft text-white mc-title-shadow">
              GOOGLE <span className="text-amber-400">CRAFT</span>
            </div>
            <div className="text-xs font-minecraft text-stone-400 tracking-widest">
              MINECRAFT REAL-WORLD MAP ADVENTURE
            </div>
          </div>

          {/* Core Developer Credit Highlight */}
          <div className="bg-gradient-to-b from-stone-800/90 to-stone-900/90 border-2 border-amber-500/80 p-6 rounded-none shadow-2xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 font-minecraft text-[10px] px-3 py-0.5 tracking-wider font-bold uppercase shadow">
              ★ SOLE ARCHITECT & CREATOR ★
            </div>

            <div className="text-xs font-minecraft text-stone-300 uppercase tracking-wider mb-2">
              MADE BY 1 DEVELOPER
            </div>

            <div className="text-xl md:text-3xl font-minecraft text-amber-300 tracking-wide mc-title-shadow my-2">
              Mark David V. Valmores
            </div>

            <p className="text-xs md:text-sm font-pixel text-stone-300 leading-relaxed max-w-lg mx-auto mt-3">
              Solo visionary responsible for full-stack engineering, 3D WebGL Three.js voxel rendering,
              Google Maps 1:1 planetary coordinate projection, 3rd-person orbital camera systems,
              multiplayer network synchronization, and sound architecture.
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-pixel text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Dedicated Solo Production • 1 Developer Excellence</span>
            </div>
          </div>

          {/* Technology & Architectural Credits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-stone-950/80 border border-stone-800 p-4 space-y-1.5">
              <div className="text-[11px] font-minecraft text-cyan-400 flex items-center gap-1.5">
                <span>🗺️</span> GOOGLE MAPS PLATFORM
              </div>
              <p className="text-xs font-pixel text-stone-300 leading-normal">
                Real-world GPS coordinates, satellite aerial imaging, elevation altitude data,
                and architectural dossiers for 1:1 landmark fidelity.
              </p>
            </div>

            <div className="bg-stone-950/80 border border-stone-800 p-4 space-y-1.5">
              <div className="text-[11px] font-minecraft text-emerald-400 flex items-center gap-1.5">
                <span>🧊</span> THREE.JS VOXEL ENGINE
              </div>
              <p className="text-xs font-pixel text-stone-300 leading-normal">
                Real-time procedural mesh instancing, 3-mode perspective camera (1st Person, 3rd Person Behind, 3rd Person Front), raycast voxel mining & block placement.
              </p>
            </div>

            <div className="bg-stone-950/80 border border-stone-800 p-4 space-y-1.5">
              <div className="text-[11px] font-minecraft text-purple-400 flex items-center gap-1.5">
                <span>🌐</span> DYNAMIC CHUNK STREAMING
              </div>
              <p className="text-xs font-pixel text-stone-300 leading-normal">
                Infinite procedural chunk loading and memory culling engine conserving GPU memory with sub-orbital 347km horizon vistas.
              </p>
            </div>

            <div className="bg-stone-950/80 border border-stone-800 p-4 space-y-1.5">
              <div className="text-[11px] font-minecraft text-amber-400 flex items-center gap-1.5">
                <span>⚡</span> LOW-LATENCY NETWORKING
              </div>
              <p className="text-xs font-pixel text-stone-300 leading-normal">
                34 dedicated global regional servers, proximity matchmaking, and multi-tab verified human crafter synchronization.
              </p>
            </div>
          </div>

          {/* Minecraft Inspiration Note */}
          <div className="bg-black/60 border border-stone-800 p-4 text-center">
            <p className="text-xs font-pixel text-stone-400 italic">
              "And the player was a creator. And the player created. And the universe was full of light."
            </p>
            <div className="text-[11px] font-minecraft text-stone-500 mt-2">
              Inspired by Minecraft • Built on Google Maps Technology
            </div>
          </div>

          {/* Back button */}
          <div className="pt-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="mc-btn-green py-2.5 px-8 text-xs font-minecraft text-white cursor-pointer shadow-lg hover:scale-105 transition-transform"
              id="btn-return-credits"
            >
              ✔ Return to Google Craft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
