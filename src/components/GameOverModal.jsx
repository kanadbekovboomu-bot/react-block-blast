import React, { useEffect } from 'react';
import { RotateCcw, Trophy, Flame, Grid, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GameOverModal({
  isOpen,
  score,
  highScore,
  isNewHigh,
  maxCombo,
  linesCleared,
  piecesPlaced,
  onRestart,
  onOpenLeaderboard,
}) {
  useEffect(() => {
    if (isOpen && isNewHigh && score > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#6366f1', '#f59e0b', '#10b981', '#f43f5e'],
        });
      } catch {
        // ignore confetti errors in test environment
      }
    }
  }, [isOpen, isNewHigh, score]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-center">
        {/* Glow backdrop */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/80 mb-3 text-rose-400">
          <Grid className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">Game Over</h2>
        <p className="text-xs text-slate-400 mt-0.5">No valid moves remaining on the board</p>

        {isNewHigh && score > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>NEW HIGH SCORE!</span>
          </div>
        )}

        {/* Score Card */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Final Score</span>
          <div className="text-4xl font-extrabold font-mono text-white mt-1">
            {score}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/60 text-xs font-mono">
            <div>
              <div className="text-[10px] uppercase text-slate-500">Best</div>
              <div className="font-semibold text-amber-400">{highScore}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-500">Max Combo</div>
              <div className="font-semibold text-indigo-400">{maxCombo}x</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-500">Lines</div>
              <div className="font-semibold text-emerald-400">{linesCleared}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>View Leaderboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
