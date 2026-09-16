// Global Leaderboard with Player Rankings across 34 Servers

import React, { useState } from 'react';
import { LeaderboardEntry, INITIAL_LEADERBOARD } from '../services/serverNetwork';
import { soundEngine } from '../services/soundEngine';

interface LeaderboardModalProps {
  userStats: {
    blocksPlaced: number;
    blocksBroken: number;
    landmarksExplored: number;
    score: number;
  };
  username: string;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  userStats,
  username,
  onClose
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'weekly' | 'builders'>('all');

  const fullLeaderboard: LeaderboardEntry[] = [
    ...INITIAL_LEADERBOARD,
    {
      rank: 11,
      username: username || 'Player',
      skin: 'Diamond Knight',
      country: 'Local Player',
      flag: '⭐',
      blocksPlaced: userStats.blocksPlaced,
      landmarksExplored: userStats.landmarksExplored,
      hoursExplored: 1,
      score: userStats.score,
      serverId: 1
    }
  ].sort((a, b) => b.score - a.score).map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none" id="leaderboard-modal">
      <div className="w-full max-w-3xl h-[80vh] bg-stone-900 border-3 border-stone-600 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-stone-950 px-4 py-3 border-b-2 border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="text-sm font-minecraft text-amber-400">
                GLOBAL ARCHITECTURAL LEADERBOARD
              </h2>
              <p className="text-xs font-pixel text-stone-400">
                Top Voxel Builders & Explorers Across 34 Dedicated Regional Servers
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="mc-btn px-3 py-1 text-xs text-red-300 cursor-pointer"
            id="btn-close-leaderboard"
          >
            ✕ Close
          </button>
        </div>

        {/* Filters */}
        <div className="bg-stone-850 px-4 py-2 border-b border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2 font-minecraft text-xs">
            {(['all', 'weekly', 'builders'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  soundEngine.playClick();
                  setFilterTab(tab);
                }}
                className={`px-3 py-1 cursor-pointer capitalize ${
                  filterTab === tab ? 'bg-amber-600 text-white font-bold' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {tab === 'all' ? 'All-Time Legends' : (tab === 'weekly' ? 'Weekly Race' : 'Top Builders')}
              </button>
            ))}
          </div>

          <div className="text-xs font-pixel text-amber-400">
            Live Global Rank: <span className="font-bold">#11</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5" id="leaderboard-table">
          {fullLeaderboard.map((entry) => {
            const isUser = entry.username === username || entry.flag === '⭐';
            const rankBadge =
              entry.rank === 1 ? '🥇' :
              entry.rank === 2 ? '🥈' :
              entry.rank === 3 ? '🥉' : `#${entry.rank}`;

            return (
              <div
                key={entry.rank}
                className={`p-2.5 border flex items-center justify-between transition-all ${
                  isUser
                    ? 'border-amber-400 bg-amber-950/40 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                    : 'border-stone-800 bg-stone-850 text-stone-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center font-minecraft text-xs text-amber-400">
                    {rankBadge}
                  </div>
                  <span className="text-xl">{entry.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-minecraft text-xs">{entry.username}</span>
                      {isUser && (
                        <span className="text-[9px] bg-amber-600 text-white font-minecraft px-1">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-pixel text-stone-400">
                      Skin: {entry.skin} • Server {entry.serverId}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="font-minecraft text-xs text-emerald-400">
                      {entry.blocksPlaced.toLocaleString()} Blocks
                    </div>
                    <div className="text-[10px] font-pixel text-stone-400">
                      {entry.landmarksExplored} Wonders Visited
                    </div>
                  </div>

                  <div className="w-20 text-right">
                    <div className="font-minecraft text-xs text-amber-300">
                      {entry.score.toLocaleString()} PTS
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
