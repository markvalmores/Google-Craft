// Creative Inventory Block Palette Modal

import React from 'react';
import { BLOCK_PALETTE, BlockTypeInfo } from './VoxelWorld';
import { soundEngine } from '../services/soundEngine';

interface InventoryModalProps {
  onSelectBlock: (blockIndex: number) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  onSelectBlock,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none" id="inventory-modal">
      <div className="w-full max-w-xl bg-stone-900 border-3 border-stone-600 shadow-2xl p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎒</span>
            <h2 className="font-minecraft text-xs text-amber-400">
              BUILDING BLOCK PALETTE
            </h2>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="mc-btn px-2.5 py-1 text-xs text-stone-300 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Grid */}
        <div className="py-4 grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-96 overflow-y-auto">
          {BLOCK_PALETTE.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => {
                soundEngine.playBlockPlace(b.id);
                onSelectBlock(idx);
                onClose();
              }}
              className="mc-slot p-2 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer group"
              id={`palette-slot-${b.id}`}
              title={b.name}
            >
              <span className="text-2xl">{b.icon}</span>
              <span className="text-[10px] font-pixel text-stone-900 group-hover:text-black mt-1 text-center truncate w-full font-bold">
                {b.name}
              </span>
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-stone-800 text-[11px] font-pixel text-stone-400 text-center">
          Click any block to place it into your primary hotbar slot [1-9]. Press [E] anytime to return.
        </div>
      </div>
    </div>
  );
};
