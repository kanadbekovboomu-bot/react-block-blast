import React from 'react';
import { Trophy, User, LogIn, LogOut, Flame, HelpCircle } from 'lucide-react';
import { isFirebaseAvailable } from '../services/firebase';

export default function Header({
  user,
  onOpenAuth,
  onSignOut,
  onOpenLeaderboard,
  onOpenHelp,
  highScore,
}) {
  return (
    <header className="w-full max-w-xl mx-auto flex items-center justify-between py-3 px-4 mb-2 border-b border-slate-800/80">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5 p-1">
              <span className="w-1.5 h-1.5 rounded-[2px] bg-cyan-400"></span>
              <span className="w-1.5 h-1.5 rounded-[2px] bg-amber-400"></span>
              <span className="w-1.5 h-1.5 rounded-[2px] bg-emerald-400"></span>
              <span className="w-1.5 h-1.5 rounded-[2px] bg-rose-400"></span>
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
            BLOCK BLAST
          </h1>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isFirebaseAvailable ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400'
              }`}
            ></span>
            <span>{isFirebaseAvailable ? 'Cloud Synced' : 'Local Mode'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenLeaderboard}
          title="Leaderboard"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline font-mono">{highScore}</span>
        </button>

        <button
          onClick={onOpenHelp}
          title="Game Rules"
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {user ? (
          <div className="flex items-center gap-1.5 pl-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[90px] truncate font-medium">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-rose-950/40 hover:border-rose-800/60 text-slate-400 hover:text-rose-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
