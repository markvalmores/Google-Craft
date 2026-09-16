// Festive Calendar Celebrations & Occasion Teleportation Modal
import React from 'react';
import { FESTIVE_OCCASIONS, FestiveOccasion } from '../services/holidaysAndOccasionsService';
import { Landmark, FAMOUS_LANDMARKS } from '../services/googleMapsService';
import { soundEngine } from '../services/soundEngine';

interface OccasionsModalProps {
  currentLandmark: Landmark;
  onSelectOccasion: (landmark: Landmark) => void;
  onClose: () => void;
}

export const OccasionsModal: React.FC<OccasionsModalProps> = ({
  currentLandmark,
  onSelectOccasion,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-stone-900 border-2 border-stone-600 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden" id="occasions-modal-dialog">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b-2 border-stone-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h2 className="text-xl font-minecraft text-amber-400">GLOBAL FESTIVE OCCASIONS & HOLIDAYS</h2>
              <p className="text-xs font-pixel text-stone-400">
                Auto-teleport based on your calendar timezone or explore world celebrations anytime
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="mc-btn px-3 py-1.5 text-xs cursor-pointer text-stone-300 hover:text-white"
            id="btn-close-occasions"
          >
            ✕ Close
          </button>
        </div>

        {/* Occasions Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {FESTIVE_OCCASIONS.map((occasion) => {
            const landmark = FAMOUS_LANDMARKS.find(l => l.id === occasion.landmarkId) || FAMOUS_LANDMARKS[0];
            const isCurrent = currentLandmark.id === landmark.id;

            return (
              <div
                key={occasion.id}
                className={`p-4 border-2 transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-amber-400 bg-stone-850 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                    : 'border-stone-700 bg-stone-900/90 hover:border-stone-500'
                }`}
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{occasion.holidayIcon}</span>
                    <span className="text-[10px] font-minecraft bg-stone-800 px-2 py-0.5 border border-stone-600 text-stone-300">
                      📅 {occasion.dateRange}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-minecraft text-white font-bold mb-1">
                    {occasion.name}
                  </h3>
                  <div className="text-xs font-minecraft text-amber-300 mb-2">
                    📍 {occasion.occasionTitle}
                  </div>

                  {/* Description */}
                  <p className="text-xs font-pixel text-stone-300 leading-relaxed mb-3">
                    {occasion.themeDescription}
                  </p>

                  {/* Special Features Checklist */}
                  <div className="space-y-1 mb-4">
                    {occasion.specialFeatures.map((feat, idx) => (
                      <div key={idx} className="text-[11px] font-pixel text-emerald-400 flex items-center gap-1.5">
                        <span>✦</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teleport Button */}
                <button
                  onClick={() => {
                    soundEngine.playTeleport();
                    onSelectOccasion(landmark);
                    onClose();
                  }}
                  className={`w-full py-2 px-4 text-xs font-minecraft flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isCurrent
                      ? 'mc-btn-green text-white font-bold'
                      : 'mc-btn text-amber-300 hover:text-white'
                  }`}
                  id={`btn-teleport-occasion-${occasion.id}`}
                >
                  {isCurrent ? '✓ Currently Exploring' : `🚀 Teleport to ${occasion.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-950 border-t border-stone-800 px-6 py-3 flex items-center justify-between text-xs font-pixel text-stone-400">
          <span>Your local calendar & timezone automatically syncs holiday environments</span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="mc-btn px-4 py-1.5 text-xs font-minecraft"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
