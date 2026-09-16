// Minecraft Avatar & Skin Selector Modal

import React, { useState } from 'react';
import { MinecraftSkin, MINECRAFT_SKINS } from '../services/skins';
import { soundEngine } from '../services/soundEngine';

interface SkinSelectorModalProps {
  currentSkin: MinecraftSkin;
  onSelectSkin: (skin: MinecraftSkin) => void;
  onClose: () => void;
}

export const SkinSelectorModal: React.FC<SkinSelectorModalProps> = ({
  currentSkin,
  onSelectSkin,
  onClose
}) => {
  const [selected, setSelected] = useState<MinecraftSkin>(currentSkin);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none" id="skin-selector-modal">
      <div className="w-full max-w-3xl h-[80vh] bg-stone-900 border-3 border-stone-600 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-stone-950 px-4 py-3 border-b-2 border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👕</span>
            <div>
              <h2 className="text-sm font-minecraft text-amber-400">
                MINECRAFT AVATARS & SKINS CATALOG
              </h2>
              <p className="text-xs font-pixel text-stone-400">
                Select your 3D avatar skin to explore real-world landmarks across Google Maps
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="mc-btn px-3 py-1 text-xs text-red-300 cursor-pointer"
            id="btn-close-skins"
          >
            ✕ Close
          </button>
        </div>

        {/* Skins Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {MINECRAFT_SKINS.map((skin) => {
            const isEquipped = skin.id === selected.id;
            return (
              <button
                key={skin.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelected(skin);
                }}
                className={`p-3 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isEquipped
                    ? 'border-amber-400 bg-amber-950/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                    : 'border-stone-800 bg-stone-850 hover:bg-stone-800'
                }`}
                id={`skin-card-${skin.id}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{skin.avatarIcon}</span>
                    <span className={`text-[9px] font-minecraft px-1.5 py-0.5 rounded ${
                      skin.rarity === 'Legendary' ? 'bg-amber-500 text-black font-bold' :
                      skin.rarity === 'Epic' ? 'bg-purple-600 text-white' :
                      skin.rarity === 'Rare' ? 'bg-blue-600 text-white' :
                      'bg-stone-700 text-stone-300'
                    }`}>
                      {skin.rarity}
                    </span>
                  </div>

                  <div className="font-minecraft text-xs text-amber-300 mt-2">
                    {skin.name}
                  </div>
                  <div className="font-pixel text-xs text-stone-400">
                    {skin.title}
                  </div>
                </div>

                {/* Color Swatch Preview */}
                <div className="flex items-center gap-1 mt-3 pt-2 border-t border-stone-800">
                  <div className="w-3.5 h-3.5 rounded-xs" style={{ backgroundColor: skin.headColor }} title="Head" />
                  <div className="w-3.5 h-3.5 rounded-xs" style={{ backgroundColor: skin.bodyColor }} title="Body" />
                  <div className="w-3.5 h-3.5 rounded-xs" style={{ backgroundColor: skin.legsColor }} title="Pants" />
                  {skin.capeColor && (
                    <div className="w-3.5 h-3.5 rounded-xs border border-white/40" style={{ backgroundColor: skin.capeColor }} title="Cape" />
                  )}
                  {isEquipped && (
                    <span className="ml-auto text-[10px] font-minecraft text-emerald-400">
                      EQUIPPED
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <div className="font-pixel text-xs text-stone-400">
            Selected: <strong className="text-amber-300">{selected.name}</strong> • 3D articulating limbs, dynamic cape physics
          </div>

          <button
            onClick={() => {
              soundEngine.playLevelUp();
              onSelectSkin(selected);
              onClose();
            }}
            className="mc-btn-green px-6 py-2 font-minecraft text-xs cursor-pointer"
            id="btn-confirm-skin"
          >
            Apply Skin ➔
          </button>
        </div>
      </div>
    </div>
  );
};
