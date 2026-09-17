// Google Craft - Minecraft Google Maps Adventure Main Application
import React, { useState, useEffect } from 'react';
import { VoxelWorld } from './components/VoxelWorld';
import { GoogleMapsExplorer } from './components/GoogleMapsExplorer';
import { GameplayTrailer30s, OpeningTrailer21s } from './components/CinematicTrailers';
import { ServerBrowserModal } from './components/ServerBrowserModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SkinSelectorModal } from './components/SkinSelectorModal';
import { InventoryModal } from './components/InventoryModal';
import { OccasionsModal } from './components/OccasionsModal';
import { PerformanceModal } from './components/PerformanceModal';
import { WeatherModal } from './components/WeatherModal';
import { LocationOccasionPrompt } from './components/LocationOccasionPrompt';
import { DeveloperCreditsModal } from './components/DeveloperCreditsModal';
import { DownloadGameModal } from './components/DownloadGameModal';
import { FAMOUS_LANDMARKS, Landmark } from './services/googleMapsService';
import { MINECRAFT_SKINS, MinecraftSkin } from './services/skins';
import { GameServer, serverNetwork } from './services/serverNetwork';
import { soundEngine } from './services/soundEngine';
import { holidaysService } from './services/holidaysAndOccasionsService';
import { weatherSeasonService } from './services/weatherSeasonService';
import { hardwareOptimizer } from './services/hardwareOptimizer';

export default function App() {
  // Game state
  const [inGame, setInGame] = useState(false);
  const [isOpeningTrailer, setIsOpeningTrailer] = useState(false);
  const [showGameplayTrailer, setShowGameplayTrailer] = useState(false);

  // Selected configurations
  const [currentLandmark, setCurrentLandmark] = useState<Landmark>(FAMOUS_LANDMARKS[0]);
  const [currentSkin, setCurrentSkin] = useState<MinecraftSkin>(MINECRAFT_SKINS[0]);
  const [currentServer, setCurrentServer] = useState<GameServer>(serverNetwork.getCurrentServer());
  const [username, setUsername] = useState('SteveExplorer');

  // Modals
  const [showServerBrowser, setShowServerBrowser] = useState(false);
  const [showMapsExplorer, setShowMapsExplorer] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSkinSelector, setShowSkinSelector] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showOccasionsModal, setShowOccasionsModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Live animated global player counter
  const [totalPlayers, setTotalPlayers] = useState(serverNetwork.getTotalPlayers());
  const [counterAnimated, setCounterAnimated] = useState(false);

  // Player stats
  const [userStats, setUserStats] = useState({
    blocksPlaced: 142,
    blocksBroken: 67,
    landmarksExplored: 4,
    score: 2150
  });

  // Splash texts in Minecraft style
  const SPLASH_TEXTS = [
    'Auto-Teleport to Global Celebrations & Holidays!',
    'Up to 1000 FPS for Ultra High Refresh Displays!',
    'Local Timezone Weather & Dynamic Seasons!',
    'Mount Calvary Holy Week & Resurrection Dawn!',
    'Christmas at the North Pole & New Year in Japan!',
    'Now with Google Maps Places & 34 Dedicated Servers!',
    'Mobile Touch & PS / Xbox Controller Ready!'
  ];
  const [splashText, setSplashText] = useState(SPLASH_TEXTS[0]);

  useEffect(() => {
    setSplashText(SPLASH_TEXTS[Math.floor(Math.random() * SPLASH_TEXTS.length)]);

    // Subscribe to server network updates
    const unsubscribe = serverNetwork.subscribe(() => {
      setTotalPlayers(serverNetwork.getTotalPlayers());
      setCounterAnimated(true);
      setTimeout(() => setCounterAnimated(false), 500);
    });

    // Auto-tune default landmark to detected season/holiday occasion on first load
    const activeOccasion = holidaysService.detectActiveOccasion();
    const autoLandmark = FAMOUS_LANDMARKS.find(l => l.id === activeOccasion.landmarkId);
    if (autoLandmark) {
      setCurrentLandmark(autoLandmark);
    }

    return () => unsubscribe();
  }, []);

  // Launch Game with Proximity Matchmaking & 21s Opening Trailer
  const handleStartGame = (skipPrompt = false) => {
    if (!skipPrompt) {
      soundEngine.playClick();
      setShowLocationPrompt(true);
      return;
    }

    soundEngine.playLevelUp();
    const { server } = serverNetwork.findOptimalServer();
    setCurrentServer(server);

    setIsOpeningTrailer(true);
    setInGame(true);
  };

  const handleOpeningTrailerComplete = () => {
    setIsOpeningTrailer(false);
    soundEngine.playLevelUp();
  };

  const handleSkipOpeningTrailer = () => {
    setIsOpeningTrailer(false);
    soundEngine.playClick();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none" id="google-craft-root">
      {/* IN-GAME VIEW */}
      {inGame ? (
        <div className="w-full h-full relative" id="game-active-stage">
          {/* Main 3D Voxel World */}
          <VoxelWorld
            currentLandmark={currentLandmark}
            currentSkin={currentSkin}
            currentServer={currentServer}
            username={username}
            isOpeningTrailer={isOpeningTrailer}
            onBlockPlaced={() => {
              setUserStats(prev => ({
                ...prev,
                blocksPlaced: prev.blocksPlaced + 1,
                score: prev.score + 10
              }));
            }}
            onBlockBroken={() => {
              setUserStats(prev => ({
                ...prev,
                blocksBroken: prev.blocksBroken + 1,
                score: prev.score + 5
              }));
            }}
            onOpenInventory={() => setShowInventory(true)}
            onToggleMap={() => setShowMapsExplorer(prev => !prev)}
            onOpenWeather={() => setShowWeatherModal(true)}
            onOpenPerformance={() => setShowPerformanceModal(true)}
            onOpenOccasions={() => setShowOccasionsModal(true)}
            onOpenCredits={() => setShowCreditsModal(true)}
            onOpenDownload={() => setShowDownloadModal(true)}
          />

          {/* Top Bar HUD - Clean non-overlapping centered toolbar */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-1.5 z-30 pointer-events-auto bg-stone-900/80 backdrop-blur-md px-3 py-1.5 border border-stone-700/80 shadow-2xl rounded" id="in-game-top-bar">
            {/* Live Global Players Counter */}
            <div className="flex items-center gap-1.5 text-[11px] font-pixel pr-2 border-r border-stone-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-stone-300">ONLINE:</span>
              <span className={`font-minecraft text-emerald-400 font-bold transition-all ${
                counterAnimated ? 'scale-110 text-amber-300' : ''
              }`}>
                {totalPlayers.toLocaleString()}
              </span>
            </div>

            {/* Google Maps Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowMapsExplorer(true);
              }}
              className="mc-btn px-2.5 py-1 text-[11px] flex items-center gap-1 cursor-pointer"
              id="btn-hud-maps"
            >
              🗺️ Maps
            </button>

            {/* 34 Servers Browser */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowServerBrowser(true);
              }}
              className="mc-btn px-2.5 py-1 text-[11px] flex items-center gap-1 cursor-pointer"
              id="btn-hud-servers"
            >
              🌐 {currentServer.name}
            </button>

            {/* Skin Selector */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowSkinSelector(true);
              }}
              className="mc-btn px-2.5 py-1 text-[11px] flex items-center gap-1 cursor-pointer"
              id="btn-hud-skin"
            >
              👕 {currentSkin.name}
            </button>

            {/* Download Game Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowDownloadModal(true);
              }}
              className="mc-btn px-2.5 py-1 text-[11px] flex items-center gap-1 cursor-pointer text-emerald-300 font-bold border-emerald-500/80"
              id="btn-hud-download-top"
            >
              📥 Download
            </button>

            {/* Credits (Mark David V. Valmores) */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowCreditsModal(true);
              }}
              className="mc-btn px-2.5 py-1 text-[11px] flex items-center gap-1 cursor-pointer text-amber-300"
              id="btn-hud-credits-top"
            >
              👨‍💻 Credits
            </button>

            {/* Menu / Return to Title */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setInGame(false);
              }}
              className="mc-btn px-2.5 py-1 text-[11px] text-rose-300 hover:text-white cursor-pointer ml-1"
              id="btn-hud-exit-title"
            >
              🚪 Title
            </button>
          </div>

          {/* 21-Second Opening Cinematic Trailer (when starting game) */}
          {isOpeningTrailer && (
            <OpeningTrailer21s
              currentLandmark={currentLandmark}
              server={currentServer}
              onComplete={handleOpeningTrailerComplete}
              onSkip={handleSkipOpeningTrailer}
            />
          )}
        </div>
      ) : (
        /* TITLE SCREEN: "Google Craft" in Minecraft Fonts */
        <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto" id="title-screen-container">
          {/* 30-Second Background Gameplay Trailer */}
          <GameplayTrailer30s isBackground={true} />

          {/* Top Header: Live Counter, Occasions & Optimizer Access */}
          <div className="relative z-10 w-full max-w-6xl flex flex-wrap items-center justify-between gap-3">
            {/* Animated Player Counter */}
            <div className="bg-stone-900/90 border-2 border-stone-700 px-4 py-2 flex items-center gap-3 shadow-2xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-[10px] font-pixel text-stone-400">
                  REAL-TIME GLOBAL PLAYERS ONLINE:
                </div>
                <div className={`text-base md:text-lg font-minecraft text-emerald-400 font-bold transition-transform ${
                  counterAnimated ? 'scale-105 text-amber-300' : ''
                }`}>
                  {totalPlayers.toLocaleString()} CRAFTERS
                </div>
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowDownloadModal(true);
                }}
                className="mc-btn px-3 py-2 text-xs font-minecraft text-emerald-300 flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                id="btn-title-download-badge"
              >
                📥 Download Game
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowCreditsModal(true);
                }}
                className="mc-btn px-3 py-2 text-xs font-minecraft text-amber-300 flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                id="btn-title-credits-badge"
              >
                👨‍💻 Credits (1 Dev)
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowOccasionsModal(true);
                }}
                className="mc-btn px-3 py-2 text-xs font-minecraft text-amber-300 flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
                id="btn-title-occasions"
              >
                🎉 Celebrations
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowPerformanceModal(true);
                }}
                className="mc-btn px-3 py-2 text-xs font-minecraft text-cyan-300 flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
                id="btn-title-performance"
              >
                ⚡ 1000 FPS Mode
              </button>

              <button
                onClick={() => {
                  soundEngine.playLevelUp();
                  setShowGameplayTrailer(true);
                }}
                className="mc-btn px-3 py-2 text-xs font-minecraft text-emerald-300 flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
                id="btn-play-gameplay-trailer"
              >
                🎬 30s Trailer
              </button>
            </div>
          </div>

          {/* Center Logo & Title: Google Craft in Minecraft Fonts */}
          <div className="relative z-10 flex flex-col items-center my-auto py-6">
            <div className="relative text-center">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-minecraft tracking-tight text-white mc-title-shadow select-none">
                GOOGLE <span className="text-amber-400">CRAFT</span>
              </h1>

              {/* Minecraft Animated Splash Text */}
              <div className="absolute -right-4 sm:-right-8 -bottom-4 sm:-bottom-6 transform rotate-[-12deg] bg-amber-400 text-stone-950 font-minecraft font-bold px-2.5 py-1 text-xs sm:text-sm shadow-xl animate-bounce">
                {splashText}
              </div>
            </div>

            {/* Prominent 1-Developer Attribution Badge */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowCreditsModal(true);
              }}
              className="mt-4 inline-flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 px-3.5 py-1.5 rounded-full text-xs font-minecraft text-amber-200 shadow-md cursor-pointer transition-colors"
              id="btn-banner-developer-credits"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Made by 1 Developer <strong className="text-white underline">Mark David V. Valmores</strong></span>
              <span className="text-amber-400">★ View Profile</span>
            </button>

            <p className="mt-4 text-xs sm:text-sm font-pixel text-stone-300 max-w-xl text-center bg-stone-900/80 px-4 py-2 border border-stone-700 shadow-xl">
              Real-world Google Maps landmarks rendered in procedural 3D voxels • Dynamic timezone weather & holiday celebrations • Ultra high refresh rate support up to 1000 FPS
            </p>

            {/* Username Input Field */}
            <div className="mt-4 flex items-center gap-2 bg-stone-900/90 border-2 border-stone-600 px-3 py-1.5 shadow-xl">
              <span className="text-xs font-minecraft text-stone-400">PLAYER NAME:</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.slice(0, 16))}
                className="bg-stone-950 border border-stone-700 px-2.5 py-1 text-xs font-minecraft text-amber-300 focus:outline-none focus:border-amber-400 w-36 sm:w-44"
                placeholder="Steve"
                id="input-player-name"
              />
            </div>
          </div>

          {/* Bottom Main Navigation Menu Buttons */}
          <div className="relative z-10 w-full max-w-md flex flex-col gap-2.5 mb-2">
            {/* Play World Button */}
            <button
              onClick={() => handleStartGame(false)}
              className="mc-btn-green py-3.5 px-6 text-sm sm:text-base font-minecraft text-white font-bold tracking-wide shadow-2xl flex items-center justify-center gap-3 cursor-pointer hover:scale-102 transition-transform"
              id="btn-play-game"
            >
              <span>⚔️</span>
              <span>PLAY WORLD (AUTO-SYNC TIMEZONE)</span>
              <span>🚀</span>
            </button>

            {/* 2-Column Sub Menu Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowMapsExplorer(true);
                }}
                className="mc-btn py-2.5 px-3 text-xs font-minecraft text-stone-200 flex items-center justify-center gap-2 cursor-pointer"
                id="btn-menu-maps"
              >
                🗺️ Explore Maps
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowOccasionsModal(true);
                }}
                className="mc-btn py-2.5 px-3 text-xs font-minecraft text-amber-300 flex items-center justify-center gap-2 cursor-pointer"
                id="btn-menu-occasions"
              >
                🎉 Celebrations
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowServerBrowser(true);
                }}
                className="mc-btn py-2.5 px-3 text-xs font-minecraft text-stone-200 flex items-center justify-center gap-2 cursor-pointer"
                id="btn-menu-servers"
              >
                🌐 34 Servers
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowSkinSelector(true);
                }}
                className="mc-btn py-2.5 px-3 text-xs font-minecraft text-stone-200 flex items-center justify-center gap-2 cursor-pointer"
                id="btn-menu-skin"
              >
                👕 Skin Wardrobe
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowWeatherModal(true);
                }}
                className="mc-btn py-2.5 px-3 text-xs font-minecraft text-cyan-300 flex items-center justify-center gap-2 cursor-pointer"
                id="btn-menu-weather"
              >
                🌦️ Weather & Seasons
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowCreditsModal(true);
                }}
                className="mc-btn py-2.5 px-3 text-xs font-minecraft text-amber-300 flex items-center justify-center gap-2 cursor-pointer border-amber-600/70"
                id="btn-menu-developer-credits"
              >
                👨‍💻 Solo Dev Credits
              </button>
            </div>

            {/* Prominent Direct Download Button in Main Menu */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowDownloadModal(true);
              }}
              className="mc-btn py-2.5 px-4 text-xs font-minecraft text-emerald-300 flex items-center justify-center gap-2 cursor-pointer border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:scale-102 transition-transform"
              id="btn-menu-download-game"
            >
              <span>📥</span>
              <span>DOWNLOAD GAME (PC • ANDROID APK • iOS IPA)</span>
              <span>⚡</span>
            </button>
          </div>

          {/* Footer Info with Developer Credit */}
          <div className="relative z-10 text-[10px] font-pixel text-stone-300 text-center space-y-1">
            <div className="text-amber-300 font-minecraft font-semibold">
              ⭐ Made by 1 Developer Mark David V. Valmores ⭐
            </div>
            <div className="text-stone-400">
              Google Craft v2.5 • Google Maps Platform & WebGL 2.0 • Ultra 1000 FPS • Praise God Yahusha Yahua Holy Spirit Lord Jesus Christ Amen
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showLocationPrompt && (
        <LocationOccasionPrompt
          onConfirmLocation={(lat, lng, name) => {
            const custom: Landmark = {
              id: 'custom_local_spawn',
              name: name || 'My Local Region',
              location: 'Detected Geolocation Area',
              country: 'Local',
              flag: '📍',
              lat,
              lng,
              altitudeMeters: 50,
              category: 'Modern Wonder',
              description: 'Custom coordinates from your real device location.',
              historicalFact: 'Voxelized real-world terrain surrounding your GPS coordinate matrix.',
              recommendedTime: 'day',
              voxelPalette: ['stone', 'grass', 'oak_planks', 'water', 'glowstone']
            };
            setCurrentLandmark(custom);
            handleStartGame(true);
          }}
          onSelectOccasion={(landmark) => {
            setCurrentLandmark(landmark);
            handleStartGame(true);
          }}
          onDefaultTimesSquare={() => {
            const timesSquare = FAMOUS_LANDMARKS.find(l => l.id === 'times_square') || FAMOUS_LANDMARKS[0];
            setCurrentLandmark(timesSquare);
            handleStartGame(true);
          }}
          onClose={() => setShowLocationPrompt(false)}
        />
      )}

      {showOccasionsModal && (
        <OccasionsModal
          currentLandmark={currentLandmark}
          onSelectOccasion={(landmark) => {
            setCurrentLandmark(landmark);
            if (!inGame) {
              handleStartGame(true);
            }
          }}
          onClose={() => setShowOccasionsModal(false)}
        />
      )}

      {showPerformanceModal && (
        <PerformanceModal
          onClose={() => setShowPerformanceModal(false)}
          onSettingsChanged={(_settings) => {}}
        />
      )}

      {showWeatherModal && (
        <WeatherModal
          onClose={() => setShowWeatherModal(false)}
          onWeatherChanged={(_weatherState) => {}}
        />
      )}

      {showMapsExplorer && (
        <GoogleMapsExplorer
          currentLandmark={currentLandmark}
          onSelectLandmark={(landmark) => {
            setCurrentLandmark(landmark);
            if (!inGame) {
              handleStartGame(true);
            }
          }}
          onClose={() => setShowMapsExplorer(false)}
        />
      )}

      {showServerBrowser && (
        <ServerBrowserModal
          currentServer={currentServer}
          onSelectServer={(server) => setCurrentServer(server)}
          onClose={() => setShowServerBrowser(false)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          userStats={userStats}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {showSkinSelector && (
        <SkinSelectorModal
          currentSkin={currentSkin}
          onSelectSkin={(skin) => setCurrentSkin(skin)}
          onClose={() => setShowSkinSelector(false)}
        />
      )}

      {showInventory && (
        <InventoryModal
          onClose={() => setShowInventory(false)}
        />
      )}

      {showCreditsModal && (
        <DeveloperCreditsModal
          onClose={() => setShowCreditsModal(false)}
        />
      )}

      {showDownloadModal && (
        <DownloadGameModal
          onClose={() => setShowDownloadModal(false)}
        />
      )}

      {showGameplayTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-4xl aspect-video border-2 border-stone-600 bg-stone-900 shadow-2xl flex flex-col">
            <GameplayTrailer30s onComplete={() => setShowGameplayTrailer(false)} />
            <button
              onClick={() => setShowGameplayTrailer(false)}
              className="absolute top-4 right-4 z-50 mc-btn px-3 py-1.5 text-xs text-white cursor-pointer"
            >
              ✕ Close Trailer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
