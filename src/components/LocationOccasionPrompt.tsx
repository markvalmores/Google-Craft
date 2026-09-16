// Real Location & Holiday Celebration Entry Prompt
import React from 'react';
import { holidaysService, FestiveOccasion } from '../services/holidaysAndOccasionsService';
import { Landmark, FAMOUS_LANDMARKS } from '../services/googleMapsService';
import { soundEngine } from '../services/soundEngine';

interface LocationOccasionPromptProps {
  onConfirmLocation: (lat: number, lng: number, customName?: string) => void;
  onSelectOccasion: (landmark: Landmark) => void;
  onDefaultTimesSquare: () => void;
  onClose: () => void;
}

export const LocationOccasionPrompt: React.FC<LocationOccasionPromptProps> = ({
  onConfirmLocation,
  onSelectOccasion,
  onDefaultTimesSquare,
  onClose
}) => {
  const activeOccasion: FestiveOccasion = holidaysService.detectActiveOccasion();
  const occasionLandmark = FAMOUS_LANDMARKS.find(l => l.id === activeOccasion.landmarkId) || FAMOUS_LANDMARKS[0];
  const timesSquareLandmark = FAMOUS_LANDMARKS.find(l => l.id === 'times_square') || FAMOUS_LANDMARKS[0];

  const handleRequestGeolocation = () => {
    soundEngine.playClick();
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          soundEngine.playLevelUp();
          onConfirmLocation(pos.coords.latitude, pos.coords.longitude, 'My Local Area');
          onClose();
        },
        () => {
          // If denied, fallback to active holiday or Times Square
          soundEngine.playClick();
          onDefaultTimesSquare();
          onClose();
        }
      );
    } else {
      onDefaultTimesSquare();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-stone-900 border-2 border-stone-600 w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn" id="location-prompt-dialog">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b-2 border-stone-700 p-5 text-center">
          <div className="text-4xl mb-2">{activeOccasion.holidayIcon}</div>
          <h2 className="text-xl font-minecraft text-amber-400">WHERE WOULD YOU LIKE TO SPAWN?</h2>
          <p className="text-xs font-pixel text-stone-300 mt-1">
            Choose your starting world destination based on real-time calendar celebrations or your location
          </p>
        </div>

        {/* Choices */}
        <div className="p-6 space-y-3">
          {/* Option 1: Festive Celebration Auto-Detect */}
          <button
            onClick={() => {
              soundEngine.playTeleport();
              onSelectOccasion(occasionLandmark);
              onClose();
            }}
            className="w-full p-4 border-2 border-amber-500 bg-amber-950/40 hover:bg-amber-950/70 text-left cursor-pointer transition-all flex items-start gap-3 shadow-lg group"
            id="prompt-btn-active-occasion"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">{activeOccasion.holidayIcon}</span>
            <div>
              <div className="text-xs font-minecraft text-amber-400 font-bold uppercase tracking-wider">
                TODAY'S CELEBRATION ({activeOccasion.name})
              </div>
              <div className="text-sm font-minecraft text-white font-bold">
                {activeOccasion.occasionTitle}
              </div>
              <div className="text-[11px] font-pixel text-stone-300 mt-1">
                {activeOccasion.themeDescription}
              </div>
            </div>
          </button>

          {/* Option 2: Real Geolocation */}
          <button
            onClick={handleRequestGeolocation}
            className="w-full p-3.5 border-2 border-cyan-600 bg-cyan-950/40 hover:bg-cyan-950/70 text-left cursor-pointer transition-all flex items-center gap-3"
            id="prompt-btn-geolocation"
          >
            <span className="text-2xl">📍</span>
            <div>
              <div className="text-xs font-minecraft text-cyan-300 font-bold">
                Use My Real Location (GPS Coordinates)
              </div>
              <div className="text-[11px] font-pixel text-stone-400">
                Spawns in your city/country grid with local timezone weather & seasons
              </div>
            </div>
          </button>

          {/* Option 3: Times Square Default */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onSelectOccasion(timesSquareLandmark);
              onClose();
            }}
            className="w-full p-3.5 border border-stone-700 bg-stone-850 hover:bg-stone-800 text-left cursor-pointer transition-all flex items-center gap-3"
            id="prompt-btn-default-times-square"
          >
            <span className="text-2xl">🏙️</span>
            <div>
              <div className="text-xs font-minecraft text-stone-200">
                Default Map: Times Square, New York City
              </div>
              <div className="text-[11px] font-pixel text-stone-400">
                Explore Midtown Manhattan with neon billboards and skyscrapers
              </div>
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div className="bg-stone-950 px-6 py-3 border-t border-stone-800 flex justify-between items-center text-[10px] font-pixel text-stone-500">
          <span>You can change destination or switch occasions anytime via HUD</span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="text-stone-400 hover:text-white cursor-pointer underline"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};
