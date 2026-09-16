import React from 'react';
import { BlockArchitecturalInfo } from '../services/googleMapsService';

interface VoxelTooltipHUDProps {
  info: BlockArchitecturalInfo | null;
  blockType: string;
  blockCoords: { x: number; y: number; z: number } | null;
}

export const VoxelTooltipHUD: React.FC<VoxelTooltipHUDProps> = ({
  info,
  blockType,
  blockCoords
}) => {
  if (!info || !blockCoords) return null;

  return (
    <div
      className="absolute top-20 right-4 z-20 w-84 bg-stone-900/95 border-2 border-amber-600/90 shadow-[0_8px_30px_rgba(0,0,0,0.85)] p-3 text-stone-200 select-none animate-in fade-in zoom-in-95 duration-150 font-pixel"
      id="voxel-architectural-tooltip"
    >
      {/* Header with Minecraft/Architectural aesthetic */}
      <div className="flex items-start justify-between border-b border-stone-700 pb-1.5 mb-2">
        <div>
          <div className="text-[10px] font-minecraft text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
            <span>🏛️ ARCHITECTURAL DOSSIER</span>
          </div>
          <h3 className="text-sm font-minecraft font-bold text-white mt-0.5 leading-snug">
            {info.componentName}
          </h3>
        </div>
        <div className="bg-stone-800 border border-stone-700 px-1.5 py-0.5 text-[9px] font-mono text-cyan-300">
          [{blockCoords.x}, {blockCoords.y}, {blockCoords.z}]
        </div>
      </div>

      {/* Grid of details */}
      <div className="space-y-1.5 text-[11px] leading-relaxed">
        <div className="flex items-baseline justify-between border-b border-stone-800/80 pb-1">
          <span className="text-stone-400 text-[10px]">Monument:</span>
          <span className="text-amber-300 font-minecraft text-right">{info.landmarkName}</span>
        </div>

        <div className="flex items-baseline justify-between border-b border-stone-800/80 pb-1">
          <span className="text-stone-400 text-[10px]">Construction Era:</span>
          <span className="text-emerald-400 text-right">{info.yearBuilt}</span>
        </div>

        <div className="flex items-baseline justify-between border-b border-stone-800/80 pb-1">
          <span className="text-stone-400 text-[10px]">Architect / Guild:</span>
          <span className="text-cyan-300 text-right">{info.architectOrCulture}</span>
        </div>

        <div className="flex items-baseline justify-between border-b border-stone-800/80 pb-1">
          <span className="text-stone-400 text-[10px]">Voxel Material:</span>
          <span className="text-purple-300 text-right font-mono capitalize">
            {blockType.replace(/_/g, ' ')} • {info.materialComposition}
          </span>
        </div>

        <div className="pt-1">
          <div className="text-amber-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">
            Engineering Function:
          </div>
          <p className="text-stone-300 text-[10.5px] bg-black/40 p-1.5 border border-stone-800">
            {info.engineeringRole}
          </p>
        </div>

        <div className="pt-1">
          <div className="text-cyan-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">
            Google Maps Historical Heritage:
          </div>
          <p className="text-stone-300 text-[10.5px] bg-black/40 p-1.5 border border-stone-800 leading-snug">
            {info.historicalContext}
          </p>
        </div>

        <div className="text-[9px] text-stone-400 pt-1 text-right font-mono border-t border-stone-800">
          {info.googleMapsPlaceData}
        </div>
      </div>
    </div>
  );
};
