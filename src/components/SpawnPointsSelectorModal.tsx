// Spawn Points & Scenic Overlooks Modal
import React from 'react';
import { Landmark, SpawnPoint, getLandmarkSpawnPoints } from '../services/googleMapsService';
import { soundEngine } from '../services/soundEngine';

interface SpawnPointsSelectorModalProps {
  currentLandmark: Landmark;
  onSelectSpawnPoint: (spawn: SpawnPoint) => void;
  onRandomSpawn: () => void;
  onClose: () => void;
}

export const SpawnPointsSelectorModal: React.FC<SpawnPointsSelectorModalProps> = ({
  currentLandmark,
  onSelectSpawnPoint,
  onRandomSpawn,
  onClose
}) => {
  const spawnPoints = getLandmarkSpawnPoints(currentLandmark);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-stone-600 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b-2 border-stone-700 p-4 text-center relative">
          <div className="text-3xl mb-1">{currentLandmark.flag}</div>
          <h2 className="text-lg sm:text-xl font-minecraft text-amber-400 uppercase">
            CHOOSE SPAWN POINT
          </h2>
          <p className="text-xs font-pixel text-stone-300 mt-0.5">
            {currentLandmark.name} ({currentLandmark.country})
          </p>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 text-stone-400 hover:text-white text-base font-minecraft cursor-pointer"
            id="btn-close-spawn-selector"
          >
            ✕
          </button>
        </div>

        {/* Quick Randomize Spawn Button */}
        <div className="p-3 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between gap-2">
          <span className="text-xs font-pixel text-stone-400">Can't decide where to spawn?</span>
          <button
            onClick={() => {
              soundEngine.playTeleport();
              onRandomSpawn();
              onClose();
            }}
            className="mc-btn px-3 py-1.5 text-xs font-minecraft text-emerald-300 flex items-center gap-1.5 cursor-pointer hover:scale-105"
            id="btn-random-spawn-point"
          >
            🎲 Random Spawn Spot
          </button>
        </div>

        {/* Spawn Points List */}
        <div className="p-4 overflow-y-auto space-y-2.5 font-sans">
          {spawnPoints.map((sp, idx) => (
            <button
              key={sp.id}
              onClick={() => {
                soundEngine.playTeleport();
                onSelectSpawnPoint(sp);
                onClose();
              }}
              className="w-full text-left p-3 border border-stone-700 bg-stone-800/80 hover:bg-stone-750 hover:border-amber-400 transition-all flex items-start gap-3 cursor-pointer group shadow-md"
              id={`btn-spawn-${sp.id}`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{sp.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-minecraft text-white font-bold group-hover:text-amber-300">
                    {idx + 1}. {sp.name}
                  </span>
                  <span className="text-[10px] font-pixel text-emerald-400 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                    X:{sp.x} Y:{sp.y} Z:{sp.z}
                  </span>
                </div>
                <p className="text-[11px] font-pixel text-stone-300 mt-1 leading-relaxed">
                  {sp.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t-2 border-stone-700 bg-stone-950 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="mc-btn px-4 py-1.5 text-xs font-minecraft text-white cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
