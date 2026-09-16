// Developer Credits Modal - Honoring Solo Developer Mark David V. Valmores
import React from 'react';
import { soundEngine } from '../services/soundEngine';

interface DeveloperCreditsModalProps {
  onClose: () => void;
}

export const DeveloperCreditsModal: React.FC<DeveloperCreditsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-stone-900 border-2 border-stone-600 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b-2 border-stone-700 p-4 text-center relative">
          <div className="text-3xl mb-1">👨‍💻</div>
          <h2 className="text-xl sm:text-2xl font-minecraft text-amber-400">
            DEVELOPER CREDITS
          </h2>
          <p className="text-xs font-pixel text-stone-300 mt-0.5">
            Google Craft — Solo Developed by 1 Developer
          </p>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 text-stone-400 hover:text-white text-base font-minecraft cursor-pointer"
            id="btn-close-credits"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-sans text-stone-200">
          {/* Main Developer Spotlight Badge */}
          <div className="bg-gradient-to-br from-amber-950/60 via-stone-900 to-stone-950 border-2 border-amber-500/80 p-4 text-center shadow-xl">
            <div className="inline-block px-2.5 py-0.5 bg-amber-400 text-stone-950 font-minecraft font-bold text-[10px] uppercase rounded mb-2">
              ⭐ Lead Creator & Solo Developer
            </div>
            <h3 className="text-2xl sm:text-3xl font-minecraft text-white font-bold tracking-wide">
              Mark David V. Valmores
            </h3>
            <div className="text-xs sm:text-sm font-pixel text-amber-300 mt-1">
              Architect, Full-Stack Engineer, 3D Voxel Engine & Gameplay Designer
            </div>
            <p className="text-xs font-pixel text-stone-300 max-w-lg mx-auto mt-2 leading-relaxed">
              Google Craft was meticulously designed, coded, and engineered from scratch by 1 solo developer: <span className="text-white font-bold">Mark David V. Valmores</span>.
            </p>
          </div>

          {/* Dedication & Faith Statement */}
          <div className="bg-stone-950/80 border border-stone-700 p-3.5 text-center">
            <div className="text-amber-400 text-sm font-minecraft mb-1">
              ✝️ DEDICATION & THANKS
            </div>
            <p className="text-xs font-pixel text-stone-300 leading-relaxed italic">
              "Praise God Yahusha / Yahua, the Holy Spirit, and Lord Jesus Christ for wisdom, strength, and grace in bringing this 3D voxel adventure to life. Amen."
            </p>
          </div>

          {/* Key Systems Engineered by Mark David V. Valmores */}
          <div>
            <h4 className="text-xs font-minecraft text-stone-400 uppercase tracking-wider mb-2">
              🛠️ Core Systems Engineered by Mark David V. Valmores:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-pixel">
              <div className="bg-stone-800/80 border border-stone-700 p-2.5">
                <div className="text-emerald-400 font-minecraft font-bold mb-0.5">⚡ 1000 FPS Turbo Engine</div>
                <div className="text-stone-300 text-[11px]">Hardware optimizer benchmarking CPU threads, GPU renderer, and WebGL 2.0 with ultra high-refresh rate displays.</div>
              </div>

              <div className="bg-stone-800/80 border border-stone-700 p-2.5">
                <div className="text-cyan-400 font-minecraft font-bold mb-0.5">🗺️ Google Maps Procedural Voxels</div>
                <div className="text-stone-300 text-[11px]">Dynamic 3D voxelization of real-world global landmarks with architectural dossiers and GPS coordinates.</div>
              </div>

              <div className="bg-stone-800/80 border border-stone-700 p-2.5">
                <div className="text-amber-400 font-minecraft font-bold mb-0.5">🎉 Holiday & Sacred Celebrations</div>
                <div className="text-stone-300 text-[11px]">Holy Week Mount Calvary with 3 Crosses, North Pole Christmas, Tokyo New Year, Paris Valentine's, and Gothic Halloween.</div>
              </div>

              <div className="bg-stone-800/80 border border-stone-700 p-2.5">
                <div className="text-rose-400 font-minecraft font-bold mb-0.5">🎥 3-Perspective Camera Rig</div>
                <div className="text-stone-300 text-[11px]">1st Person, 3rd Person Back, and 3rd Person Front Selfie view modes with dynamic avatar animation.</div>
              </div>

              <div className="bg-stone-800/80 border border-stone-700 p-2.5">
                <div className="text-purple-400 font-minecraft font-bold mb-0.5">🌦️ Timezone Weather & Seasons</div>
                <div className="text-stone-300 text-[11px]">Live atmospheric particle physics supporting rain, snow, thunderstorms, and autumn leaves tied to real timezones.</div>
              </div>

              <div className="bg-stone-800/80 border border-stone-700 p-2.5">
                <div className="text-blue-400 font-minecraft font-bold mb-0.5">🌐 34 Global Multiplayer Servers</div>
                <div className="text-stone-300 text-[11px]">Proximity low-latency matchmaking network across Asia, Americas, Europe, and Oceania.</div>
              </div>
            </div>
          </div>

          {/* Technology Stack Info */}
          <div className="bg-stone-950 border border-stone-800 p-3 text-[11px] font-pixel text-stone-400 flex flex-wrap justify-between items-center gap-2">
            <span>Tech: React 18 • TypeScript • Three.js • Web Audio API • Tailwind CSS</span>
            <span className="text-amber-400 font-minecraft">Solo Developer: Mark David V. Valmores</span>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="p-3 border-t-2 border-stone-700 bg-stone-950 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="mc-btn px-6 py-2 text-xs font-minecraft text-white cursor-pointer hover:scale-102"
            id="btn-credits-done"
          >
            ✓ Done
          </button>
        </div>
      </div>
    </div>
  );
};
