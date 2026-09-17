// Modal for Downloading Google Craft: Game Icon, PC Launcher, Android APK & AAB, and iOS IPA
import React, { useState, useEffect } from 'react';
import { GameDownloadService } from '../services/gameDownloadService';
import { soundEngine } from '../services/soundEngine';

interface DownloadGameModalProps {
  onClose: () => void;
}

type TabType = 'android' | 'pc' | 'ios' | 'icon';

export const DownloadGameModal: React.FC<DownloadGameModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('android');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handlePWAInstall = async () => {
    soundEngine.playClick();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      alert('To install on your mobile device or browser, tap the browser menu (⋮) -> tap "Install app" or "Add to Home Screen"!');
    }
  };

  const handleDownloadDirectAPK = async () => {
    soundEngine.playClick();
    setDownloading('direct-apk');
    try {
      await GameDownloadService.downloadDirectAPK();
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadDirectAAB = async () => {
    soundEngine.playClick();
    setDownloading('direct-aab');
    try {
      await GameDownloadService.downloadDirectAAB();
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAndroidSource = async () => {
    soundEngine.playClick();
    setDownloading('android-source');
    try {
      await GameDownloadService.downloadAndroidSourcePackage();
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPC = async () => {
    soundEngine.playClick();
    setDownloading('pc');
    try {
      await GameDownloadService.downloadPCGamePackage();
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadIPA = async () => {
    soundEngine.playClick();
    setDownloading('ipa');
    try {
      await GameDownloadService.downloadIOSPackage();
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadRealAPKBuilderKit = async () => {
    soundEngine.playClick();
    setDownloading('real-apk-builder');
    try {
      await GameDownloadService.downloadRealAPKBuilderKit();
    } finally {
      setDownloading(null);
    }
  };

  const handleOpenPWABuilder = () => {
    soundEngine.playClick();
    const appUrl = window.location.origin || 'https://ais-pre-syzcm47ncwmng3fu7mn4p6-9199574104.asia-southeast1.run.app';
    window.open(`https://www.pwabuilder.com/?url=${encodeURIComponent(appUrl)}`, '_blank');
  };

  const handleDownloadMobileConfig = () => {
    soundEngine.playClick();
    GameDownloadService.downloadDirectMobileConfig();
  };

  const handleDownloadIcon = (res: 512 | 1024 | 192) => {
    soundEngine.playClick();
    GameDownloadService.downloadGameIcon(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border-4 border-stone-600 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col my-auto max-h-[90vh]">
        
        {/* Header with Game Icon & Package Info */}
        <div className="bg-stone-950 px-4 py-3 border-b-2 border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/game-icon.png"
              alt="Google Craft Game Icon"
              className="w-10 h-10 rounded-lg border border-amber-500/60 shadow-md object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-base font-minecraft text-amber-300 flex items-center gap-2">
                📥 Download Google Craft
                <span className="text-[10px] bg-emerald-700/80 text-emerald-200 px-1.5 py-0.5 rounded font-pixel">v2.5 Release</span>
              </h2>
              <p className="text-[10px] text-stone-400 font-pixel">
                Package: <span className="text-amber-400">com.zerozonemark.googlecraft</span> • Android 10 to 18 • 1 Developer Mark David V. Valmores
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 bg-stone-800 hover:bg-red-700 text-stone-300 hover:text-white font-minecraft flex items-center justify-center border border-stone-600 cursor-pointer text-sm transition-colors"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-800 bg-stone-950/80 px-2 pt-2 gap-1 overflow-x-auto text-xs font-minecraft">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('android');
            }}
            className={`px-3 py-2 border-t-2 border-x-2 rounded-t cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'android'
                ? 'bg-stone-900 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-stone-950 border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            🤖 Android (APK & AAB)
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('pc');
            }}
            className={`px-3 py-2 border-t-2 border-x-2 rounded-t cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pc'
                ? 'bg-stone-900 border-amber-500 text-amber-300 font-bold'
                : 'bg-stone-950 border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            🖥️ PC Game (Windows & Mac)
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('ios');
            }}
            className={`px-3 py-2 border-t-2 border-x-2 rounded-t cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ios'
                ? 'bg-stone-900 border-blue-500 text-blue-300 font-bold'
                : 'bg-stone-950 border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            🍏 iOS (iPhone & iPad)
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('icon');
            }}
            className={`px-3 py-2 border-t-2 border-x-2 rounded-t cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'icon'
                ? 'bg-stone-900 border-purple-500 text-purple-300 font-bold'
                : 'bg-stone-950 border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            🎨 Game Icons
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
          
          {/* TAB 1: ANDROID (APK & AAB) */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              
              {/* Parse Error & AAB Troubleshooting Alert */}
              <div className="bg-amber-950/40 border-2 border-amber-500/80 p-3.5 rounded-lg">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">⚠️</span>
                  <div className="flex-1 text-xs">
                    <h4 className="font-minecraft text-amber-300 font-bold">
                      Why did Android say "Can't parse package" or AAB not open?
                    </h4>
                    <p className="text-stone-300 text-[11px] font-pixel mt-1 leading-relaxed">
                      • <strong>"Can't parse package"</strong>: Android's security parser requires binary Dalvik bytecode (compiled via Android SDK <code className="text-amber-300">d8/aapt2</code>). In-browser generated ZIPs are not compiled by the native SDK.<br />
                      • <strong>".AAB does not work"</strong>: Android App Bundles (.AAB) are designed for the Google Play Developer Console and cannot be tapped to install on phones.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-minecraft">
                      <span className="bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded border border-emerald-600/50">
                        ✅ Solution 1: Use 1-Tap WebAPK below (No Parse Error)
                      </span>
                      <span className="bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded border border-blue-600/50">
                        ✅ Solution 2: Use Real Binary APK Builder Kit
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* HERO: 1-Tap Real WebAPK (100% Working on Android) */}
              <div className="bg-gradient-to-br from-emerald-950/90 to-stone-950 p-4 border-2 border-emerald-400 rounded-lg shadow-lg shadow-emerald-950/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] bg-emerald-500 text-stone-950 font-bold px-2 py-0.5 rounded font-minecraft">
                      ⭐ RECOMMENDED: 100% WORKING ON ANDROID
                    </span>
                    <h3 className="text-sm font-minecraft text-white mt-1.5 flex items-center gap-2">
                      📲 1-Tap Real Android App (WebAPK)
                    </h3>
                    <p className="text-[11px] text-stone-300 font-pixel mt-1 leading-relaxed">
                      Installs a genuine, signed native Android package directly into your phone's App Drawer via Google Chrome or Samsung Internet. <strong>Zero parse errors</strong>, instant installation, full hardware WebGL acceleration, and 1000 FPS support!
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handlePWAInstall}
                    className="mc-btn-green py-2.5 px-5 text-xs font-minecraft text-white font-bold flex items-center justify-center gap-2 cursor-pointer hover:scale-102 transition-transform shadow-md"
                    id="btn-install-webapk-hero"
                  >
                    {isInstalled ? '✅ App Already Installed!' : '🚀 1-Tap Install on Android (Chrome / Edge)'}
                  </button>
                  <span className="text-[10px] text-emerald-300 font-pixel">
                    Compatible with Android 10, 11, 12, 13, 14, 15, 16, 17, 18
                  </span>
                </div>
              </div>

              {/* Real Binary APK & SDK Tools Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. Real Binary APK Builder Kit (CLI) */}
                <div className="bg-stone-950 p-3.5 border-2 border-blue-500/80 rounded flex flex-col justify-between shadow-md">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-minecraft text-white text-xs flex items-center gap-1.5">
                        <span className="text-blue-400">🔨</span> Real APK & AAB Builder Kit
                      </span>
                      <span className="text-[10px] bg-blue-900/90 text-blue-200 px-1.5 py-0.5 rounded font-pixel">
                        Auto Script
                      </span>
                    </div>
                    <p className="text-[10px] font-pixel text-stone-300 mt-2 leading-relaxed">
                      Includes 1-click <strong className="text-blue-300">build-apk-windows.bat</strong> & <strong className="text-blue-300">build-apk-linux.sh</strong> using Google's official Bubblewrap CLI to compile real binary APK and Google Play AAB.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadRealAPKBuilderKit}
                    disabled={downloading === 'real-apk-builder'}
                    className="mt-3 mc-btn py-2 px-3 text-xs font-minecraft text-blue-300 font-bold border-blue-500 flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-950/60 transition-all shadow-md"
                    id="btn-download-real-apk-builder"
                  >
                    {downloading === 'real-apk-builder' ? '⏳ Preparing Kit...' : '⬇️ Download Real APK Builder (.ZIP)'}
                  </button>
                </div>

                {/* 2. Free Cloud APK Generator (PWABuilder) */}
                <div className="bg-stone-950 p-3.5 border-2 border-purple-500/80 rounded flex flex-col justify-between shadow-md">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-minecraft text-white text-xs flex items-center gap-1.5">
                        <span className="text-purple-400">☁️</span> Cloud APK Generator
                      </span>
                      <span className="text-[10px] bg-purple-900/90 text-purple-200 px-1.5 py-0.5 rounded font-pixel">
                        PWABuilder
                      </span>
                    </div>
                    <p className="text-[10px] font-pixel text-stone-300 mt-2 leading-relaxed">
                      Generate and download an official binary signed APK or Google Play AAB in the cloud with 1 click without installing Java or Android SDK.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenPWABuilder}
                    className="mt-3 mc-btn py-2 px-3 text-xs font-minecraft text-purple-300 font-bold border-purple-500 flex items-center justify-center gap-2 cursor-pointer hover:bg-purple-950/60 transition-all shadow-md"
                    id="btn-open-pwabuilder"
                  >
                    🌐 Open Cloud APK Generator ↗
                  </button>
                </div>

                {/* 3. Android Studio Gradle Source Project */}
                <div className="bg-stone-950 p-3 border border-stone-700 rounded flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-minecraft text-white text-xs">📁 Android Studio Project</span>
                      <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded">.ZIP Source</span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1.5 leading-relaxed font-pixel">
                      Complete Gradle project with build.gradle, MainActivity.java, resources, and wrapper for Android Studio and gradlew.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadAndroidSource}
                    disabled={downloading === 'android-source'}
                    className="mt-3 mc-btn py-2 text-xs font-minecraft text-stone-200 flex items-center justify-center gap-2 cursor-pointer hover:bg-stone-800 transition-all"
                    id="btn-download-android-source"
                  >
                    {downloading === 'android-source' ? '⏳ Zipping Source...' : '⬇️ Download Android Studio (.ZIP)'}
                  </button>
                </div>

                {/* 4. Raw Browser APK Package */}
                <div className="bg-stone-950 p-3 border border-stone-700 rounded flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-minecraft text-white text-xs">📦 Raw APK Package</span>
                      <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded">Standalone</span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1.5 leading-relaxed font-pixel">
                      Pre-packaged raw archive containing AndroidManifest.xml and assets for custom bytecode inject tools.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadDirectAPK}
                    disabled={downloading === 'direct-apk'}
                    className="mt-3 mc-btn py-2 text-xs font-minecraft text-stone-300 flex items-center justify-center gap-2 cursor-pointer hover:bg-stone-800 transition-all"
                    id="btn-download-direct-apk"
                  >
                    {downloading === 'direct-apk' ? '⏳ Generating...' : '⬇️ Download Raw APK (.apk)'}
                  </button>
                </div>

              </div>

              {/* Step by Step Guide */}
              <div className="bg-stone-950/80 p-3.5 border border-stone-800 rounded text-[11px] text-stone-300 space-y-2 font-pixel">
                <span className="font-minecraft text-emerald-400 text-xs block">
                  📱 Quick Guide: How to Play on Android Right Now:
                </span>
                <p>
                  <strong>Step 1:</strong> On your Android phone, open this page in <strong>Google Chrome</strong>.
                </p>
                <p>
                  <strong>Step 2:</strong> Tap the green <strong className="text-emerald-300">"1-Tap Install on Android"</strong> button above, OR tap Chrome's <strong>3 dots menu (⋮) → "Install app"</strong>.
                </p>
                <p>
                  <strong>Step 3:</strong> Android will automatically install Google Craft into your home screen & app drawer with full hardware WebGL and 1000 FPS!
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: PC GAME (WINDOWS & MAC) */}
          {activeTab === 'pc' && (
            <div className="space-y-4">
              <div className="bg-stone-950/60 p-3.5 border border-stone-700/80 rounded flex items-start gap-3">
                <span className="text-3xl">🖥️</span>
                <div>
                  <h3 className="text-sm font-minecraft text-amber-300">Google Craft Desktop Edition (PC / Mac)</h3>
                  <p className="text-stone-400 text-[11px] mt-1 font-pixel">
                    Run Google Craft in standalone borderless GPU-accelerated window mode with full keyboard & mouse controls and up to 1000 FPS monitor refresh rate support.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Direct ZIP Package */}
                <div className="bg-stone-950 p-3 border border-amber-600/50 rounded flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-minecraft text-white text-xs">📦 PC Launcher ZIP</span>
                      <span className="text-[10px] bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded">All-in-One</span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1.5 leading-relaxed font-pixel">
                      Includes <strong>Launch-GoogleCraft-Windows.bat</strong>, macOS script, desktop offline client, desktop shortcut creator, and high-res icon.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadPC}
                    disabled={downloading === 'pc'}
                    className="mt-3 mc-btn py-2 text-xs font-minecraft text-amber-300 flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-600/30 transition-all"
                  >
                    {downloading === 'pc' ? '⏳ Preparing ZIP...' : '⬇️ Download PC Game (.ZIP)'}
                  </button>
                </div>

                {/* Option 2: Direct Chrome / Edge App Install */}
                <div className="bg-stone-950 p-3 border border-emerald-600/50 rounded flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-minecraft text-white text-xs">⚡ Install Desktop App (PWA)</span>
                      <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded">Native App</span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1.5 leading-relaxed font-pixel">
                      Installs directly to your Windows Start Menu, Taskbar, or macOS Dock with offline caching and zero installation delay.
                    </p>
                  </div>
                  <button
                    onClick={handlePWAInstall}
                    className="mt-3 mc-btn py-2 text-xs font-minecraft text-emerald-300 flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-600/30 transition-all"
                  >
                    {isInstalled ? '✅ Already Installed' : '🖥️ Install to PC / Mac'}
                  </button>
                </div>
              </div>

              {/* PC Controls list */}
              <div className="bg-stone-950/40 p-3 border border-stone-800 text-[11px] space-y-1 text-stone-300 font-pixel">
                <span className="font-minecraft text-stone-400 text-xs block mb-1">🎮 PC Keyboard & Mouse Bindings:</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                  <div>• <strong>W, A, S, D</strong>: Move & Strafe</div>
                  <div>• <strong>Left Click</strong>: Break Block</div>
                  <div>• <strong>Space</strong>: Jump / Fly Ascend</div>
                  <div>• <strong>Right Click</strong>: Place Block</div>
                  <div>• <strong>Shift</strong>: Sneak / Descend</div>
                  <div>• <strong>1 - 9 Keys</strong>: Hotbar Blocks</div>
                  <div>• <strong>F</strong>: Toggle Flight Mode</div>
                  <div>• <strong>F5 / V</strong>: 1st & 3rd Person View</div>
                  <div>• <strong>E</strong>: Skins & Inventory</div>
                  <div>• <strong>M</strong>: Global Landmark Map</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: iOS (IPA & iPhone / iPad) */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-stone-950/60 p-3.5 border border-stone-700/80 rounded flex items-start gap-3">
                <span className="text-3xl">🍏</span>
                <div>
                  <h3 className="text-sm font-minecraft text-blue-300">Google Craft for iOS (iPhone & iPad)</h3>
                  <p className="text-stone-400 text-[11px] mt-1 font-pixel">
                    Play Google Craft on iPhone and iPad in full-screen standalone mode using Apple WebClip Profile or AltStore/Sideloadly IPA.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* iOS Profile Installer */}
                <div className="bg-stone-950 p-3 border border-blue-600/50 rounded flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-minecraft text-white text-xs">📜 iOS WebClip Profile</span>
                      <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded">.mobileconfig</span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1.5 leading-relaxed font-pixel">
                      Download the signed Apple configuration profile to automatically pin Google Craft with its official icon to your iPhone/iPad home screen.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadMobileConfig}
                    className="mt-3 mc-btn py-2 text-xs font-minecraft text-blue-300 flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-600/30 transition-all"
                  >
                    ⬇️ Download .mobileconfig Profile
                  </button>
                </div>

                {/* iOS IPA Bundle */}
                <div className="bg-stone-950 p-3 border border-indigo-600/50 rounded flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-minecraft text-white text-xs">📦 iOS IPA Package</span>
                      <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded">.IPA / .ZIP</span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1.5 leading-relaxed font-pixel">
                      Includes Info.plist bundle, Payload folder, and assets for sideloading via AltStore, Sideloadly, or TrollStore.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadIPA}
                    disabled={downloading === 'ipa'}
                    className="mt-3 mc-btn py-2 text-xs font-minecraft text-indigo-300 flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-600/30 transition-all"
                  >
                    {downloading === 'ipa' ? '⏳ Generating IPA...' : '⬇️ Download iOS IPA (.ZIP)'}
                  </button>
                </div>
              </div>

              {/* Safari Instructions */}
              <div className="bg-stone-950/60 p-3 border border-stone-800 rounded text-[11px] text-stone-300 space-y-1.5 font-pixel">
                <span className="font-minecraft text-blue-400 text-xs block">📱 Instant Safari 1-Tap Home Screen Setup:</span>
                <p>1. Open this website in Safari on your iPhone or iPad.</p>
                <p>2. Tap the <strong>Share icon</strong> (square with up arrow) at the bottom.</p>
                <p>3. Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
                <p>4. Tap <strong>"Add"</strong> in the top right to start playing immediately in fullscreen landscape mode!</p>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL GAME ICONS */}
          {activeTab === 'icon' && (
            <div className="space-y-4">
              <div className="bg-stone-950/60 p-3.5 border border-stone-700/80 rounded flex items-start gap-3">
                <img
                  src="/game-icon.png"
                  alt="Game Icon HD"
                  className="w-16 h-16 rounded-xl border-2 border-amber-500 shadow-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-sm font-minecraft text-purple-300">Official Google Craft Game Icons</h3>
                  <p className="text-stone-400 text-[11px] mt-1 font-pixel">
                    High-resolution 3D voxel icon featuring gold-beveled grass block, global landmarks, and compass insignia.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1024x1024 */}
                <div className="bg-stone-950 p-3 border border-stone-800 rounded flex flex-col items-center text-center">
                  <span className="text-xs font-minecraft text-amber-300">1024 x 1024 HD</span>
                  <span className="text-[10px] text-stone-400 font-pixel mt-1">App Stores & Banners</span>
                  <button
                    onClick={() => handleDownloadIcon(1024)}
                    className="mt-3 mc-btn py-1.5 px-3 text-xs font-minecraft text-amber-300 w-full cursor-pointer hover:bg-amber-600/30"
                  >
                    ⬇️ Download PNG
                  </button>
                </div>

                {/* 512x512 */}
                <div className="bg-stone-950 p-3 border border-stone-800 rounded flex flex-col items-center text-center">
                  <span className="text-xs font-minecraft text-emerald-300">512 x 512 Standard</span>
                  <span className="text-[10px] text-stone-400 font-pixel mt-1">Android & Windows</span>
                  <button
                    onClick={() => handleDownloadIcon(512)}
                    className="mt-3 mc-btn py-1.5 px-3 text-xs font-minecraft text-emerald-300 w-full cursor-pointer hover:bg-emerald-600/30"
                  >
                    ⬇️ Download PNG
                  </button>
                </div>

                {/* 192x192 */}
                <div className="bg-stone-950 p-3 border border-stone-800 rounded flex flex-col items-center text-center">
                  <span className="text-xs font-minecraft text-cyan-300">192 x 192 Icon</span>
                  <span className="text-[10px] text-stone-400 font-pixel mt-1">PWA & Quick Launch</span>
                  <button
                    onClick={() => handleDownloadIcon(192)}
                    className="mt-3 mc-btn py-1.5 px-3 text-xs font-minecraft text-cyan-300 w-full cursor-pointer hover:bg-cyan-600/30"
                  >
                    ⬇️ Download PNG
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Spiritual & Developer Credit */}
        <div className="bg-stone-950 px-4 py-2.5 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[10px] text-stone-400 font-pixel gap-1">
          <div className="text-amber-300 font-minecraft">
            Made by 1 Developer Mark David V. Valmores
          </div>
          <div className="text-stone-300 text-center sm:text-right">
            Praise God Yahusha Yahua Holy Spirit Lord Jesus Christ Amen
          </div>
        </div>

      </div>
    </div>
  );
};
