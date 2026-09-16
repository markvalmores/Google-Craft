// Google Craft - Minecraft Google Maps Adventure Main Application

import React, { useState, useEffect } from 'react';
import { VoxelWorld } from './components/VoxelWorld';
import { GoogleMapsExplorer } from './components/GoogleMapsExplorer';
import { GameplayTrailer30s, OpeningTrailer21s } from './components/CinematicTrailers';
import { ServerBrowserModal } from './components/ServerBrowserModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SkinSelectorModal } from './components/SkinSelectorModal';
import { InventoryModal } from './components/InventoryModal';
import { FAMOUS_LANDMARKS, Landmark } from './services/googleMapsService';
import { MINECRAFT_SKINS, MinecraftSkin } from './services/skins';
import { GameServer, serverNetwork } from './services/serverNetwork';
import { soundEngine } from './services/soundEngine';

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

  // Live animated global player counter
  const [totalPlayers, setTotalPlayers] = useState(serverNetwork.getTotalPlayers());
  const [counterAnimated, setCounterAnimated] = useState(false);

  // Player stats
  const [userStats, setUserStats] = useState({
    blocksPlaced: 142,
    blocksBroken: 67,
    landmarksExplored: 3,
    score: 1890
  });

  // Splash texts in Minecraft style
  const SPLASH_TEXTS = [
    'Now with Google Maps API!',
    'Voxelizing the Earth!',
    '34 Dedicated Global Servers!',
    'Low Latency Sub-20ms Ping!',
    'Explore the Eiffel Tower in 3D!',
    'Architectural wonders in voxels!',
    'Multiplayer real-time build!'
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

    return () => unsubscribe();
  }, []);

  // Launch Game with Proximity Matchmaking & 21s Opening Trailer
  const handleStartGame = () => {
    soundEngine.playLevelUp();

    // Automatically jump into optimal proximity server (Server 1 Alpha, 2 Delta, etc.)
    const { server } = serverNetwork.findOptimalServer();
    setCurrentServer(server);

    // Trigger the 21-second opening trailer
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
          />

          {/* Top Bar HUD */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 pointer-events-auto" id="in-game-top-bar">
            {/* Live Global Players Counter */}
            <div className="bg-black/75 border border-stone-700 px-3 py-1.5 flex items-center gap-2 text-xs font-pixel shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-stone-300">GLOBAL PLAYERS:</span>
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
              className="mc-btn px-3 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
              id="btn-hud-maps"
            >
              🗺️ Maps [M]
            </button>

            {/* 34 Servers Browser */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowServerBrowser(true);
              }}
              className="mc-btn px-3 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
              id="btn-hud-servers"
            >
              🌐 {currentServer.name} ({currentServer.pingMs}ms)
            </button>

            {/* Skin Selector */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowSkinSelector(true);
              }}
              className="mc-btn px-3 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
              id="btn-hud-skin"
            >
              👕 {currentSkin.name}
            </button>

            {/* Leaderboard */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowLeaderboard(true);
              }}
              className="mc-btn px-3 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
              id="btn-hud-leaderboard"
            >
              🏆 Rank
            </button>

            {/* Menu / Return to Title */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setInGame(false);
              }}
              className="mc-btn px-3 py-1.5 text-xs text-rose-300 hover:text-white cursor-pointer"
              id="btn-hud-exit-title"
            >
              🚪 Title Screen
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
        <div className="relative w-full h-full flex flex-col items-center justify-between p-6 overflow-hidden" id="title-screen-container">
          {/* 30-Second Background Gameplay Trailer */}
          <GameplayTrailer30s isBackground={true} />

          {/* Top Header: Live Counter & Trailer Access */}
          <div className="relative z-10 w-full max-w-6xl flex items-center justify-between">
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

            {/* 30s Gameplay Trailer Button */}
            <button
              onClick={() => {
                soundEngine.playLevelUp();
                setShowGameplayTrailer(true);
              }}
              className="mc-btn px-4 py-2 text-xs font-minecraft text-amber-300 flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
              id="btn-play-gameplay-trailer"
            >
              🎬 Watch 30s Gameplay Trailer
            </button>
          </div>

          {/* Center Logo & Title: Google Craft in Minecraft Fonts */}
          <div className="relative z-10 flex flex-col items-center my-auto">
            {/* Minecraft Style Pixel Logo */}
            <div className="relative text-center">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-minecraft tracking-tight text-white mc-title-shadow select-none">
                GOOGLE <span className="text-amber-400">CRAFT</span>
              </h1>
              <p className="text-xs sm:text-sm font-minecraft text-stone-300 tracking-widest mt-1">
                MINECRAFT REAL-WORLD MAP ADVENTURE
              </p>

              {/* Tilting Yellow Splash Text */}
              <div className="absolute -bottom-4 right-0 sm:-right-8 animate-mc-splash pointer-events-none">
                <span className="font-minecraft text-xs sm:text-sm text-yellow-300 mc-text-shadow px-2 py-0.5 whitespace-nowrap">
                  {splashText}
                </span>
              </div>
            </div>

            {/* Landmark Quick Badge */}
            <div className="mt-8 bg-black/60 border border-stone-700 px-4 py-1.5 text-xs font-pixel text-stone-300 flex items-center gap-2">
              <span>Current World Landmark:</span>
              <strong className="text-amber-300">{currentLandmark.flag} {currentLandmark.name}</strong>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowMapsExplorer(true);
                }}
                className="text-cyan-400 underline ml-2 cursor-pointer hover:text-cyan-300"
              >
                Change Map
              </button>
            </div>

            {/* Main Menu Buttons */}
            <div className="w-full max-w-sm flex flex-col gap-2.5 mt-6" id="title-buttons-stack">
              <button
                onClick={handleStartGame}
                className="mc-btn-green py-3.5 px-6 text-sm md:text-base font-minecraft text-white cursor-pointer shadow-xl flex items-center justify-center gap-2"
                id="btn-start-game"
              >
                ▶ Start Adventure (Auto Server)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setShowServerBrowser(true);
                  }}
                  className="mc-btn py-2.5 px-3 text-xs font-minecraft cursor-pointer"
                  id="btn-server-browser"
                >
                  🌐 34 Servers
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setShowMapsExplorer(true);
                  }}
                  className="mc-btn py-2.5 px-3 text-xs font-minecraft cursor-pointer"
                  id="btn-title-maps"
                >
                  🗺️ Google Maps
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setShowSkinSelector(true);
                  }}
                  className="mc-btn py-2.5 px-3 text-xs font-minecraft cursor-pointer"
                  id="btn-title-skins"
                >
                  👕 Skin: {currentSkin.name.slice(0, 7)}..
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setShowLeaderboard(true);
                  }}
                  className="mc-btn py-2.5 px-3 text-xs font-minecraft cursor-pointer"
                  id="btn-title-leaderboard"
                >
                  🏆 Leaderboard
                </button>
              </div>
            </div>
          </div>

          {/* Footer Info & API Key notice */}
          <div className="relative z-10 w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between text-xs font-pixel text-stone-400 pt-4 border-t border-stone-800/80">
            <div className="flex items-center gap-2">
              <span>Connected Node:</span>
              <strong className="text-amber-400">{currentServer.name}</strong>
              <span className="text-emerald-400">({currentServer.pingMs}ms)</span>
              <span>• Proximity Matchmaking Enabled</span>
            </div>

            <div className="text-[11px] text-stone-400 mt-1 sm:mt-0">
              Google Maps Key Loaded: AIzaSyDsXmn4Uz0OGotNhv99x6qUjzRrUu4rMnc
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}

      {/* 30-Second Fullscreen Gameplay Trailer */}
      {showGameplayTrailer && (
        <GameplayTrailer30s onClose={() => setShowGameplayTrailer(false)} />
      )}

      {/* Google Maps Explorer Modal */}
      {showMapsExplorer && (
        <GoogleMapsExplorer
          currentLandmark={currentLandmark}
          onSelectLandmark={(landmark) => setCurrentLandmark(landmark)}
          onClose={() => setShowMapsExplorer(false)}
        />
      )}

      {/* 34-Server Browser & Lobby Maker Modal */}
      {showServerBrowser && (
        <ServerBrowserModal
          currentServer={currentServer}
          onSelectServer={(server) => setCurrentServer(server)}
          onSelectLandmark={(landmark) => setCurrentLandmark(landmark)}
          onClose={() => setShowServerBrowser(false)}
        />
      )}

      {/* Skin Selector Modal */}
      {showSkinSelector && (
        <SkinSelectorModal
          currentSkin={currentSkin}
          onSelectSkin={(skin) => setCurrentSkin(skin)}
          onClose={() => setShowSkinSelector(false)}
        />
      )}

      {/* Global Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          userStats={userStats}
          username={username}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Creative Inventory Modal */}
      {showInventory && (
        <InventoryModal
          onSelectBlock={(idx) => {
            // Selected block
          }}
          onClose={() => setShowInventory(false)}
        />
      )}
    </div>
  );
}
