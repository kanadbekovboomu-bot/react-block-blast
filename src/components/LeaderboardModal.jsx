import React, { useEffect, useState } from 'react';
import { X, Trophy, Medal, RotateCw, Flame } from 'lucide-react';
import { fetchTopScores } from '../services/storageAdapter';

export default function LeaderboardModal({ isOpen, onClose }) {
  const [scores, setScores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadScores = async () => {
    setIsLoading(true);
    try {
      const top = await fetchTopScores(10);
      setScores(top || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadScores();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Leaderboard</h2>
              <p className="text-[11px] text-slate-400">All-time top Block Blast scores</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={loadScores}
              title="Refresh"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scores List */}
        <div className="my-4 max-h-[320px] overflow-y-auto space-y-2 pr-1">
          {scores.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No scores recorded yet. Play a game to set the first record!
            </div>
          ) : (
            scores.map((item, idx) => {
              let rankBadge = (
                <span className="w-6 text-center font-mono text-xs text-slate-500 font-bold">
                  #{idx + 1}
                </span>
              );

              if (idx === 0) {
                rankBadge = (
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    🥇
                  </div>
                );
              } else if (idx === 1) {
                rankBadge = (
                  <div className="w-6 h-6 rounded-lg bg-slate-300/20 text-slate-300 flex items-center justify-center font-bold text-xs">
                    🥈
                  </div>
                );
              } else if (idx === 2) {
                rankBadge = (
                  <div className="w-6 h-6 rounded-lg bg-amber-700/20 text-amber-600 flex items-center justify-center font-bold text-xs">
                    🥉
                  </div>
                );
              }

              return (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/70 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {rankBadge}
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        {item.userDisplayName || 'Anonymous'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        {item.maxCombo > 1 && (
                          <span className="flex items-center gap-0.5 text-amber-400/90">
                            <Flame className="w-2.5 h-2.5" />
                            {item.maxCombo}x combo
                          </span>
                        )}
                        <span>{item.linesCleared || 0} lines</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-white">
                      {item.score}
                    </span>
                    <span className="block text-[9px] text-slate-500">pts</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
