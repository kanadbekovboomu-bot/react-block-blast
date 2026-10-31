import React from 'react';
import { Trophy, Flame, RotateCcw, Sparkles } from 'lucide-react';

export default function ScoreBoard({
  score,
  highScore,
  combo,
  maxCombo,
  linesCleared,
  piecesPlaced,
  onRestart,
}) {
  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-3">
      <div className="grid grid-cols-3 gap-2.5">
        {/* Current Score */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Score
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight mt-0.5">
            {score}
          </span>
          {combo > 1 && (
            <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 animate-pulse">
              <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>x{combo}</span>
            </div>
          )}
        </div>

        {/* High Score */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3 flex flex-col items-center justify-center relative shadow-inner">
          <div className="flex items-center gap-1 text-[11px] font-semibold tracking-wider text-amber-400/90 uppercase">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>Best</span>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-300 tracking-tight mt-0.5">
            {highScore}
          </span>
        </div>

        {/* Streak & Reset Button */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-2 flex flex-col justify-between items-center shadow-inner">
          <div className="w-full flex items-center justify-around text-[10px] text-slate-400 font-mono pt-1">
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-500">Lines</span>
              <span className="font-semibold text-slate-200">{linesCleared}</span>
            </div>
            <div className="h-5 w-px bg-slate-800"></div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-500">Combo</span>
              <span className="font-semibold text-amber-400">{maxCombo}x</span>
            </div>
          </div>

          <button
            onClick={onRestart}
            title="Restart Game"
            className="w-full mt-1.5 py-1 px-2 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
