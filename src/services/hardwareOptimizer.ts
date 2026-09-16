// CPU & GPU Hardware Optimization & Uncapped High Refresh Rate Engine (60Hz to 1000Hz)
import * as THREE from 'three';

export interface HardwareInfo {
  cpuCores: number;
  deviceMemoryGb: number;
  gpuVendor: string;
  gpuRenderer: string;
  maxTextureSize: number;
  detectedRefreshRateHz: number;
  isTouchDevice: boolean;
  isMobileBrowser: boolean;
}

export type TargetFpsMode = 60 | 120 | 144 | 240 | 360 | 1000;

export interface PerformanceSettings {
  targetFps: TargetFpsMode;
  renderDistanceChunks: number;
  pixelRatio: number;
  enableDynamicFog: boolean;
  enableShadows: boolean;
  weatherParticlesDensity: number;
  gpuPowerPreference: 'high-performance' | 'default';
}

export class HardwareOptimizer {
  private hardwareInfo: HardwareInfo = {
    cpuCores: 8,
    deviceMemoryGb: 8,
    gpuVendor: 'Detecting...',
    gpuRenderer: 'High-Performance WebGL 2.0 Engine',
    maxTextureSize: 4096,
    detectedRefreshRateHz: 60,
    isTouchDevice: false,
    isMobileBrowser: false
  };

  private settings: PerformanceSettings = {
    targetFps: 60,
    renderDistanceChunks: 2,
    pixelRatio: 1.0,
    enableDynamicFog: true,
    enableShadows: true,
    weatherParticlesDensity: 1.0,
    gpuPowerPreference: 'high-performance'
  };

  private frameTimes: number[] = [];
  private lastFrameTimestamp: number = performance.now();
  private sampleFrameCount: number = 0;
  private currentFps: number = 60;
  private currentFrameTimeMs: number = 16.6;

  constructor() {
    this.detectHardware();
    this.benchmarkRefreshRate();
  }

  private detectHardware() {
    if (typeof window === 'undefined') return;

    // CPU Cores & Memory
    const cores = navigator.hardwareConcurrency || 4;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8;

    // Mobile / Touch detection
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // WebGL GPU info
    let vendor = 'Generic GPU';
    let renderer = 'Hardware Accelerated GPU';
    let maxTex = 4096;

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl) {
        maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || vendor;
          renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || renderer;
        }
      }
    } catch (_) {}

    this.hardwareInfo = {
      cpuCores: cores,
      deviceMemoryGb: mem,
      gpuVendor: vendor,
      gpuRenderer: renderer,
      maxTextureSize: maxTex,
      detectedRefreshRateHz: 60,
      isTouchDevice: isTouch,
      isMobileBrowser: isMobile
    };

    // Auto-tune baseline settings for high performance
    if (cores >= 8 && mem >= 8) {
      this.settings.renderDistanceChunks = 3;
      this.settings.pixelRatio = Math.min(window.devicePixelRatio || 1.0, 1.5);
    } else if (isMobile) {
      this.settings.renderDistanceChunks = 2;
      this.settings.pixelRatio = Math.min(window.devicePixelRatio || 1.0, 1.0);
    }
  }

  // Detect monitor refresh rate (60Hz, 75Hz, 120Hz, 144Hz, 240Hz, 360Hz, 1000Hz)
  private benchmarkRefreshRate() {
    if (typeof window === 'undefined') return;

    let frames = 0;
    let startTime = performance.now();

    const sample = (now: number) => {
      frames++;
      const elapsed = now - startTime;
      if (frames < 30) {
        requestAnimationFrame(sample);
      } else {
        const measuredHz = Math.round((frames / elapsed) * 1000);
        let normalizedHz = 60;
        if (measuredHz > 450) normalizedHz = 1000;
        else if (measuredHz > 300) normalizedHz = 360;
        else if (measuredHz > 200) normalizedHz = 240;
        else if (measuredHz > 135) normalizedHz = 144;
        else if (measuredHz > 105) normalizedHz = 120;
        else if (measuredHz > 70) normalizedHz = 75;
        else normalizedHz = 60;

        this.hardwareInfo.detectedRefreshRateHz = normalizedHz;
      }
    };

    requestAnimationFrame(sample);
  }

  // Tick called on every render frame
  public recordFrame(): { fps: number; frameTimeMs: number } {
    const now = performance.now();
    const delta = now - this.lastFrameTimestamp;
    this.lastFrameTimestamp = now;

    if (delta > 0) {
      this.frameTimes.push(delta);
      if (this.frameTimes.length > 30) {
        this.frameTimes.shift();
      }

      this.sampleFrameCount++;
      if (this.sampleFrameCount % 10 === 0) {
        const avgDelta = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        this.currentFrameTimeMs = Math.round(avgDelta * 10) / 10;
        this.currentFps = Math.min(1000, Math.round(1000 / Math.max(avgDelta, 0.5)));
      }
    }

    return {
      fps: this.currentFps,
      frameTimeMs: this.currentFrameTimeMs
    };
  }

  public getHardwareInfo(): HardwareInfo {
    return this.hardwareInfo;
  }

  public getSettings(): PerformanceSettings {
    return this.settings;
  }

  public updateSettings(partial: Partial<PerformanceSettings>) {
    this.settings = { ...this.settings, ...partial };
  }

  // Optimize WebGL Renderer configuration for Three.js
  public applyToRenderer(renderer: THREE.WebGLRenderer) {
    renderer.setPixelRatio(this.settings.pixelRatio);
    renderer.shadowMap.enabled = this.settings.enableShadows;
    if (this.settings.enableShadows) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
  }
}

export const hardwareOptimizer = new HardwareOptimizer();
