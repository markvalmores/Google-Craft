// Weather and Season Control Dashboard Modal
import React, { useState, useEffect } from 'react';
import { weatherSeasonService, WeatherType, WeatherSeasonState } from '../services/weatherSeasonService';
import { soundEngine } from '../services/soundEngine';

interface WeatherModalProps {
  onClose: () => void;
  onWeatherChanged: (state: WeatherSeasonState) => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({ onClose, onWeatherChanged }) => {
  const [weatherState, setWeatherState] = useState<WeatherSeasonState>(weatherSeasonService.getCurrentState());

  useEffect(() => {
    setWeatherState(weatherSeasonService.getCurrentState());
  }, []);

  const handleSelectWeather = (weather: WeatherType | null) => {
    soundEngine.playClick();
    weatherSeasonService.setOverrideWeather(weather);
    const updated = weatherSeasonService.getCurrentState();
    setWeatherState(updated);
    onWeatherChanged(updated);
    if (weather === 'thunder') {
      soundEngine.playThunder();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-stone-900 border-2 border-stone-600 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden" id="weather-modal-dialog">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b-2 border-stone-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{weatherState.weatherIcon}</span>
            <div>
              <h2 className="text-xl font-minecraft text-amber-400">TIMEZONE WEATHER & SEASONS</h2>
              <p className="text-xs font-pixel text-stone-400">
                Synced dynamically with your local device timezone and calendar
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="mc-btn px-3 py-1.5 text-xs cursor-pointer text-stone-300 hover:text-white"
            id="btn-close-weather"
          >
            ✕ Close
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-minecraft text-stone-200">
          {/* Current Local Status Card */}
          <div className="bg-stone-950 border border-stone-700 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] font-pixel text-stone-400 block">LOCAL TIMEZONE</span>
              <span className="text-sm font-bold text-cyan-300 truncate block">{weatherState.timezone}</span>
            </div>
            <div>
              <span className="text-[10px] font-pixel text-stone-400 block">CURRENT SEASON</span>
              <span className="text-sm font-bold text-amber-300">{weatherState.seasonIcon} {weatherState.season}</span>
            </div>
            <div>
              <span className="text-[10px] font-pixel text-stone-400 block">ESTIMATED TEMP</span>
              <span className="text-sm font-bold text-emerald-300">{weatherState.temperatureCelsius}°C / {Math.round(weatherState.temperatureCelsius * 9/5 + 32)}°F</span>
            </div>
            <div>
              <span className="text-[10px] font-pixel text-stone-400 block">CURRENT WEATHER</span>
              <span className="text-sm font-bold text-white uppercase">{weatherState.weatherIcon} {weatherState.weather}</span>
            </div>
          </div>

          <p className="text-xs font-pixel text-stone-300 bg-stone-850 p-3 border border-stone-700">
            {weatherState.description}
          </p>

          {/* Weather Selector Buttons */}
          <div>
            <label className="block text-sm text-stone-300 mb-2">CHOOSE WEATHER OVERRIDE OR AUTO-SYNC:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleSelectWeather(null)}
                className="mc-btn py-3 px-3 text-xs flex items-center justify-center gap-2 cursor-pointer col-span-2 sm:col-span-3 text-emerald-300 font-bold"
              >
                🌐 Auto-Sync with Real Local Timezone
              </button>

              <button
                onClick={() => handleSelectWeather('sunny')}
                className={`p-3 border-2 text-center transition-all cursor-pointer ${
                  weatherState.weather === 'sunny'
                    ? 'border-amber-400 bg-stone-750 text-amber-300'
                    : 'border-stone-700 bg-stone-850 text-stone-300 hover:border-stone-500'
                }`}
              >
                <div className="text-lg">☀️</div>
                <div className="text-xs font-minecraft mt-1">Clear Sunny</div>
              </button>

              <button
                onClick={() => handleSelectWeather('rain')}
                className={`p-3 border-2 text-center transition-all cursor-pointer ${
                  weatherState.weather === 'rain'
                    ? 'border-cyan-400 bg-stone-750 text-cyan-300'
                    : 'border-stone-700 bg-stone-850 text-stone-300 hover:border-stone-500'
                }`}
              >
                <div className="text-lg">🌧️</div>
                <div className="text-xs font-minecraft mt-1">Rainfall</div>
              </button>

              <button
                onClick={() => handleSelectWeather('thunder')}
                className={`p-3 border-2 text-center transition-all cursor-pointer ${
                  weatherState.weather === 'thunder'
                    ? 'border-indigo-400 bg-stone-750 text-indigo-300'
                    : 'border-stone-700 bg-stone-850 text-stone-300 hover:border-stone-500'
                }`}
              >
                <div className="text-lg">⛈️</div>
                <div className="text-xs font-minecraft mt-1">Thunderstorm</div>
              </button>

              <button
                onClick={() => handleSelectWeather('snow')}
                className={`p-3 border-2 text-center transition-all cursor-pointer ${
                  weatherState.weather === 'snow'
                    ? 'border-sky-300 bg-stone-750 text-sky-200'
                    : 'border-stone-700 bg-stone-850 text-stone-300 hover:border-stone-500'
                }`}
              >
                <div className="text-lg">❄️</div>
                <div className="text-xs font-minecraft mt-1">Winter Snow</div>
              </button>

              <button
                onClick={() => handleSelectWeather('autumn')}
                className={`p-3 border-2 text-center transition-all cursor-pointer ${
                  weatherState.weather === 'autumn'
                    ? 'border-amber-500 bg-stone-750 text-amber-400'
                    : 'border-stone-700 bg-stone-850 text-stone-300 hover:border-stone-500'
                }`}
              >
                <div className="text-lg">🍁</div>
                <div className="text-xs font-minecraft mt-1">Autumn Leaves</div>
              </button>

              <button
                onClick={() => handleSelectWeather('starry')}
                className={`p-3 border-2 text-center transition-all cursor-pointer ${
                  weatherState.weather === 'starry'
                    ? 'border-purple-400 bg-stone-750 text-purple-300'
                    : 'border-stone-700 bg-stone-850 text-stone-300 hover:border-stone-500'
                }`}
              >
                <div className="text-lg">✨</div>
                <div className="text-xs font-minecraft mt-1">Starry Night</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-950 border-t border-stone-800 px-6 py-3 flex items-center justify-between text-xs font-pixel text-stone-400">
          <span>Weather particles and atmospheric fog adjust automatically</span>
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
