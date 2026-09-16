// 34-Server Browser, Proximity Matchmaking & Custom Lobby Maker

import React, { useState } from 'react';
import { GameServer, CustomLobby, serverNetwork } from '../services/serverNetwork';
import { Landmark, FAMOUS_LANDMARKS } from '../services/googleMapsService';
import { soundEngine } from '../services/soundEngine';

interface ServerBrowserModalProps {
  currentServer: GameServer;
  onSelectServer: (server: GameServer) => void;
  onSelectLandmark: (landmark: Landmark) => void;
  onClose: () => void;
}

export const ServerBrowserModal: React.FC<ServerBrowserModalProps> = ({
  currentServer,
  onSelectServer,
  onSelectLandmark,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'servers' | 'create_lobby' | 'custom_lobbies'>('servers');
  const [servers, setServers] = useState<GameServer[]>(serverNetwork.getServers());
  const [customLobbies, setCustomLobbies] = useState<CustomLobby[]>(serverNetwork.getCustomLobbies());
  const [searchFilter, setSearchFilter] = useState('');
  const [privateCodeInput, setPrivateCodeInput] = useState('');

  // Lobby Creation Form State
  const [lobbyName, setLobbyName] = useState('Global Builders Club');
  const [selectedRegionId, setSelectedRegionId] = useState<number>(1);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>('eiffel_tower');
  const [lobbyMode, setLobbyMode] = useState<'Creative' | 'Architecture Build' | 'Survival Adventure'>('Architecture Build');
  const [maxPlayers, setMaxPlayers] = useState<number>(16);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [pvpEnabled, setPvpEnabled] = useState<boolean>(false);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night' | 'sunset' | 'cycle'>('day');

  // Handle Matchmaking
  const handleProximityMatch = () => {
    soundEngine.playLevelUp();
    const result = serverNetwork.findOptimalServer();
    onSelectServer(result.server);
    onClose();
  };

  // Handle Create Lobby
  const handleCreateLobby = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playLevelUp();

    const roomCode = isPrivate ? Math.random().toString(36).substring(2, 8).toUpperCase() : undefined;

    const newLobby = serverNetwork.createCustomLobby({
      name: lobbyName,
      hostName: 'Player',
      regionServerId: selectedRegionId,
      landmarkId: selectedLandmarkId,
      mode: lobbyMode,
      maxPlayers,
      isPrivate,
      roomCode,
      pvpEnabled,
      timeOfDay
    });

    const s = servers.find(sv => sv.id === selectedRegionId) || servers[0];
    const lm = FAMOUS_LANDMARKS.find(l => l.id === selectedLandmarkId) || FAMOUS_LANDMARKS[0];
    onSelectServer(s);
    onSelectLandmark(lm);
    onClose();
  };

  // Filtered servers
  const filteredServers = servers.filter(s =>
    s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.location.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.region.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none" id="server-browser-modal">
      <div className="w-full max-w-4xl h-[85vh] bg-stone-900 border-3 border-stone-600 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-stone-950 px-4 py-3 border-b-2 border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌐</span>
            <div>
              <h2 className="text-sm font-minecraft text-amber-400">
                GOOGLE CRAFT GLOBAL SERVER NETWORK
              </h2>
              <p className="text-xs font-pixel text-stone-400">
                34 Dedicated Low-Latency Global Nodes with Geographic Proximity Matchmaking
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="mc-btn px-3 py-1 text-xs text-red-300 cursor-pointer"
            id="btn-close-server-modal"
          >
            ✕ Close
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-stone-850 px-4 py-2 border-b border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2 font-minecraft text-xs">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('servers');
              }}
              className={`px-3 py-1.5 cursor-pointer ${
                activeTab === 'servers'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
              }`}
              id="tab-servers-list"
            >
              All 34 Servers
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('create_lobby');
              }}
              className={`px-3 py-1.5 cursor-pointer ${
                activeTab === 'create_lobby'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
              }`}
              id="tab-create-lobby"
            >
              + Create Custom Lobby
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('custom_lobbies');
              }}
              className={`px-3 py-1.5 cursor-pointer ${
                activeTab === 'custom_lobbies'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
              }`}
              id="tab-hosted-lobbies"
            >
              Hosted Lobbies ({customLobbies.length})
            </button>
          </div>

          {/* Quick Proximity Match Button */}
          <button
            onClick={handleProximityMatch}
            className="mc-btn-green px-3 py-1.5 font-minecraft text-[10px] flex items-center gap-1.5 cursor-pointer"
            id="btn-auto-proximity-match"
          >
            ⚡ Auto Proximity Match
          </button>
        </div>

        {/* TAB 1: 34 SERVERS LIST */}
        {activeTab === 'servers' && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                placeholder="Search server name, country, or region..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="flex-1 bg-stone-950 border border-stone-700 px-3 py-1.5 text-xs font-pixel text-white outline-none focus:border-amber-400"
              />
              <span className="text-xs font-pixel text-stone-400">
                Showing {filteredServers.length} of 34 Active Nodes
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1" id="servers-scroll-container">
              {filteredServers.map((server) => {
                const isSelected = server.id === currentServer.id;
                const pingColor = server.pingMs < 30 ? 'text-emerald-400' : (server.pingMs < 60 ? 'text-amber-400' : 'text-rose-400');
                return (
                  <div
                    key={server.id}
                    className={`p-2.5 border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/30'
                        : 'border-stone-800 bg-stone-850 hover:bg-stone-800'
                    }`}
                    id={`server-row-${server.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-stone-900 border border-stone-700 flex items-center justify-center font-minecraft text-xs text-amber-400">
                        {server.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-minecraft text-xs text-white">{server.name}</span>
                          <span className="text-[10px] bg-stone-700 text-stone-300 px-1 font-pixel">
                            {server.region}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] bg-emerald-700 text-emerald-100 font-minecraft px-1">
                              CONNECTED
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-pixel text-stone-400">
                          {server.location} • Tick Rate: 20TPS
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className={`font-minecraft text-xs ${pingColor}`}>
                          {server.pingMs}ms
                        </div>
                        <div className="text-[10px] font-pixel text-stone-400">
                          {server.onlinePlayers} / {server.maxPlayers} Players
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          soundEngine.playLevelUp();
                          onSelectServer(server);
                          onClose();
                        }}
                        disabled={isSelected}
                        className={`mc-btn px-3 py-1.5 text-[10px] font-minecraft cursor-pointer ${
                          isSelected ? 'opacity-50 cursor-default' : 'hover:text-amber-300'
                        }`}
                        id={`btn-join-server-${server.id}`}
                      >
                        {isSelected ? 'Active' : 'Jump In ➔'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CREATE CUSTOM LOBBY */}
        {activeTab === 'create_lobby' && (
          <form onSubmit={handleCreateLobby} className="flex-1 overflow-y-auto p-6 space-y-4 font-pixel text-sm">
            <div>
              <label className="block font-minecraft text-xs text-stone-300 mb-1">
                Lobby Title / Room Name
              </label>
              <input
                type="text"
                value={lobbyName}
                onChange={e => setLobbyName(e.target.value)}
                required
                className="w-full bg-stone-950 border border-stone-700 px-3 py-2 text-white outline-none focus:border-amber-400 text-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-minecraft text-xs text-stone-300 mb-1">
                  Server Regional Host
                </label>
                <select
                  value={selectedRegionId}
                  onChange={e => setSelectedRegionId(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 px-3 py-2 text-white outline-none"
                >
                  {servers.slice(0, 10).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.location} - {s.pingMs}ms)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-minecraft text-xs text-stone-300 mb-1">
                  Architectural Landmark Site
                </label>
                <select
                  value={selectedLandmarkId}
                  onChange={e => setSelectedLandmarkId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 px-3 py-2 text-white outline-none"
                >
                  {FAMOUS_LANDMARKS.map(lm => (
                    <option key={lm.id} value={lm.id}>
                      {lm.flag} {lm.name} ({lm.country})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-minecraft text-xs text-stone-300 mb-1">
                  Game Mode
                </label>
                <select
                  value={lobbyMode}
                  onChange={e => setLobbyMode(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 px-3 py-2 text-white outline-none"
                >
                  <option value="Architecture Build">Architecture Build</option>
                  <option value="Creative">Creative Mode</option>
                  <option value="Survival Adventure">Survival Adventure</option>
                </select>
              </div>

              <div>
                <label className="block font-minecraft text-xs text-stone-300 mb-1">
                  Max Capacity
                </label>
                <select
                  value={maxPlayers}
                  onChange={e => setMaxPlayers(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 px-3 py-2 text-white outline-none"
                >
                  <option value={8}>8 Players</option>
                  <option value={16}>16 Players</option>
                  <option value={32}>32 Players</option>
                  <option value={64}>64 Players</option>
                </select>
              </div>

              <div>
                <label className="block font-minecraft text-xs text-stone-300 mb-1">
                  Sky Lighting
                </label>
                <select
                  value={timeOfDay}
                  onChange={e => setTimeOfDay(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 px-3 py-2 text-white outline-none"
                >
                  <option value="day">Full Daylight</option>
                  <option value="sunset">Golden Hour Sunset</option>
                  <option value="night">Starry Night</option>
                  <option value="cycle">Dynamic 24m Day/Night Cycle</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={e => setIsPrivate(e.target.checked)}
                  className="accent-amber-500 w-4 h-4"
                />
                <span className="font-minecraft text-xs text-stone-300">
                  Private Room (Require 6-character room code)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pvpEnabled}
                  onChange={e => setPvpEnabled(e.target.checked)}
                  className="accent-amber-500 w-4 h-4"
                />
                <span className="font-minecraft text-xs text-stone-300">
                  Enable Player Interactions (PVP)
                </span>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="mc-btn-green px-6 py-2.5 font-minecraft text-xs cursor-pointer"
                id="btn-submit-create-lobby"
              >
                ✨ Launch Custom Server Lobby
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: HOSTED LOBBIES */}
        {activeTab === 'custom_lobbies' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            <div className="bg-stone-950 border border-stone-700 p-3 flex items-center gap-3">
              <span className="font-minecraft text-xs text-amber-400">JOIN PRIVATE LOBBY:</span>
              <input
                type="text"
                placeholder="Enter 6-char room code (e.g. 7X9K2A)"
                value={privateCodeInput}
                onChange={e => setPrivateCodeInput(e.target.value.toUpperCase())}
                className="bg-stone-900 border border-stone-600 px-3 py-1 font-minecraft text-xs text-white w-64 uppercase"
              />
              <button
                onClick={() => {
                  soundEngine.playLevelUp();
                  alert(`Connecting to custom room code [${privateCodeInput}]...`);
                  onClose();
                }}
                disabled={privateCodeInput.length < 4}
                className="mc-btn px-3 py-1 text-xs cursor-pointer disabled:opacity-40"
              >
                Connect ➔
              </button>
            </div>

            {customLobbies.length === 0 ? (
              <div className="p-12 text-center text-stone-400 font-pixel text-base">
                No active custom rooms hosted yet. Click "+ Create Custom Lobby" to host your own dedicated world!
              </div>
            ) : (
              customLobbies.map(lobby => (
                <div key={lobby.id} className="p-3 bg-stone-850 border border-stone-700 flex items-center justify-between">
                  <div>
                    <div className="font-minecraft text-xs text-amber-300">{lobby.name}</div>
                    <div className="font-pixel text-xs text-stone-400">
                      Mode: {lobby.mode} • Players: {lobby.currentPlayers}/{lobby.maxPlayers} • {lobby.isPrivate ? '🔒 Private' : '🌐 Public'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playLevelUp();
                      onClose();
                    }}
                    className="mc-btn px-3 py-1 text-xs cursor-pointer"
                  >
                    Join Lobby ➔
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
