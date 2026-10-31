import React from 'react';
import { X, HelpCircle, CheckCircle2, Zap, Flame, Trophy } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">How to Play</h2>
              <p className="text-[11px] text-slate-400">Block Blast rules & combo tips</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 space-y-3 text-xs leading-relaxed">
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Place Blocks on 8x8 Board:</span>
              <p className="text-slate-400 mt-0.5">
                Drag pieces or click to select and click any board tile to place them. Each tile scores +1 pt.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Clear Full Rows & Columns:</span>
              <p className="text-slate-400 mt-0.5">
                Fill any horizontal row or vertical column completely to blast it away. Rows and columns can blast simultaneously!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Combo Multipliers:</span>
              <p className="text-slate-400 mt-0.5">
                Clear lines with consecutive moves to stack huge COMBO multipliers (x2, x3, x4...) and bonus points.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <Trophy className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Game Over Rule:</span>
              <p className="text-slate-400 mt-0.5">
                When none of the remaining pieces in your tray can fit on the board, the game ends. Keep space open!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
        >
          Got it, let's play!
        </button>
      </div>
    </div>
  );
}
