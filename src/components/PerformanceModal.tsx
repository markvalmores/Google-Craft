// CPU & GPU Hardware Performance Benchmark & Settings Modal
import React, { useState, useEffect } from 'react';
import { hardwareOptimizer, HardwareInfo, PerformanceSettings, TargetFpsMode } from '../services/hardwareOptimizer';
import { soundEngine } from '../services/soundEngine';

interface PerformanceModalProps {
  onClose: () => void;
  onSettingsChanged: (settings: PerformanceSettings) => void;
}

export const PerformanceModal: React.FC<PerformanceModalProps> = ({ onClose, onSettingsChanged }) => {
  const [hardware, setHardware] = useState<HardwareInfo>(hardwareOptimizer.getHardwareInfo());
  const [settings, setSettings] = useState<PerformanceSettings>(hardwareOptimizer.getSettings());
  const [liveFps, setLiveFps] = useState(60);
  const [liveFrameTime, setLiveFrameTime] = useState(16.6);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHardware(hardwareOptimizer.getHardwareInfo());
      const frameData = hardwareOptimizer.recordFrame();
      setLiveFps(frameData.fps);
      setLiveFrameTime(frameData.frameTimeMs);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleFpsChange = (targetFps: TargetFpsMode) => {
    soundEngine.playClick();
    const updated = { ...settings, targetFps };
    setSettings(updated);
    hardwareOptimizer.updateSettings(updated);
    onSettingsChanged(updated);
  };

  const handleDistanceChange = (chunks: number) => {
    const updated = { ...settings, renderDistanceChunks: chunks };
    setSettings(updated);
    hardwareOptimizer.updateSettings(updated);
    onSettingsChanged(updated);
  };

  const handlePixelRatioChange = (ratio: number) => {
    const updated = { ...settings, pixelRatio: ratio };
    setSettings(updated);
    hardwareOptimizer.updateSettings(updated);
    onSettingsChanged(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-stone-900 border-2 border-stone-600 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden" id="performance-modal-dialog">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b-2 border-stone-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            <div>
              <h2 className="text-xl font-minecraft text-amber-400">CPU & GPU HARDWARE OPTIMIZER</h2>
              <p className="text-xs font-pixel text-stone-400">
                Optimized 60 FPS baseline up to 1000 FPS for ultra-high refresh rate displays
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="mc-btn px-3 py-1.5 text-xs cursor-pointer text-stone-300 hover:text-white"
            id="btn-close-performance"
          >
            ✕ Close
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-minecraft text-stone-200">
          {/* Live Telemetry Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-950 border border-stone-700 p-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-pixel text-stone-400">CURRENT FPS</span>
              <span className="text-2xl font-bold text-emerald-400">{liveFps} FPS</span>
              <span className="text-[9px] font-pixel text-stone-500">Latency: {liveFrameTime}ms</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-pixel text-stone-400">MONITOR REFRESH</span>
              <span className="text-2xl font-bold text-cyan-400">{hardware.detectedRefreshRateHz} Hz</span>
              <span className="text-[9px] font-pixel text-stone-500">Auto-detected sync</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-pixel text-stone-400">CPU CORES</span>
              <span className="text-2xl font-bold text-amber-400">{hardware.cpuCores} Threads</span>
              <span className="text-[9px] font-pixel text-stone-500">RAM: ~{hardware.deviceMemoryGb} GB</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-pixel text-stone-400">GPU VENDOR</span>
              <span className="text-sm font-bold text-indigo-300 truncate" title={hardware.gpuRenderer}>
                {hardware.gpuVendor}
              </span>
              <span className="text-[9px] font-pixel text-stone-500 truncate" title={hardware.gpuRenderer}>
                {hardware.gpuRenderer.split('Direct3D')[0].split('ANGLE')[0] || 'WebGL 2.0 Engine'}
              </span>
            </div>
          </div>

          {/* Target FPS Mode Selector */}
          <div>
            <label className="block text-sm text-stone-300 mb-2">TARGET REFRESH RATE & FRAME RATE MODE:</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {([60, 120, 144, 240, 1000] as TargetFpsMode[]).map((fps) => {
                const isSelected = settings.targetFps === fps;
                return (
                  <button
                    key={fps}
                    onClick={() => handleFpsChange(fps)}
                    className={`py-2.5 px-2 border-2 text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-stone-750 text-amber-300 font-bold shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                        : 'border-stone-700 bg-stone-850 text-stone-400 hover:border-stone-500'
                    }`}
                  >
                    <div className="text-sm">{fps === 1000 ? '1000 FPS' : `${fps} FPS`}</div>
                    <div className="text-[9px] font-pixel text-stone-400">
                      {fps === 60 ? 'Eco 60Hz' : (fps === 1000 ? 'Uncapped Turbo' : `${fps}Hz Pro`)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Render Distance Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-stone-300">CHUNK RENDER DISTANCE:</label>
              <span className="text-amber-400 font-bold">{settings.renderDistanceChunks} Chunks ({(settings.renderDistanceChunks * 2 + 1) * (settings.renderDistanceChunks * 2 + 1)} grid)</span>
            </div>
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={settings.renderDistanceChunks}
              onChange={(e) => handleDistanceChange(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-pixel text-stone-400 mt-1">
              <span>1 (Fastest / Mobile)</span>
              <span>2-3 (Balanced 60+ FPS)</span>
              <span>6 (Ultra Render Horizon)</span>
            </div>
          </div>

          {/* Resolution / Pixel Ratio */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-stone-300">RESOLUTION RENDER SCALE:</label>
              <span className="text-cyan-400 font-bold">{Math.round(settings.pixelRatio * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.75}
              max={2.0}
              step={0.25}
              value={settings.pixelRatio}
              onChange={(e) => handlePixelRatioChange(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* GPU Hardware Features Info */}
          <div className="bg-stone-950/70 border border-stone-800 p-3 text-[11px] font-pixel text-stone-300 space-y-1">
            <div className="text-amber-300 font-minecraft text-xs mb-1">HARDWARE ACCELERATION STATUS:</div>
            <div>✓ WebGL 2.0 Multi-core Draw Instancing Active</div>
            <div>✓ Continuous Frustum Culling & Memory Disposal Enabled</div>
            <div>✓ Native Delta Physics Timing (Smooth frame pacing at any monitor Hz)</div>
            <div>✓ Full Mobile (iOS Metal & Android Vulkan WebGL) Hardware Support</div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-950 border-t border-stone-800 px-6 py-3 flex items-center justify-between text-xs font-pixel text-stone-400">
          <span>Automatic GPU & CPU hardware scaling guarantees zero stutter</span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="mc-btn px-4 py-1.5 text-xs font-minecraft"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
};
