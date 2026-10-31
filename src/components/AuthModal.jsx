import React, { useState } from 'react';
import { X, User, Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';
import { signInGuest, signInEmail, signUpEmail } from '../services/storageAdapter';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('guest'); // 'guest' | 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGuest = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInGuest();
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to login as guest');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let user;
      if (tab === 'signup') {
        user = await signUpEmail(email, password);
      } else {
        user = await signInEmail(email, password);
      }
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Player Profile</h2>
              <p className="text-[11px] text-slate-400">Save scores to cloud leaderboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl my-4 text-xs font-medium">
          <button
            onClick={() => {
              setTab('guest');
              setError(null);
            }}
            className={`py-1.5 rounded-lg transition-all ${
              tab === 'guest' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Guest
          </button>
          <button
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`py-1.5 rounded-lg transition-all ${
              tab === 'login' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
            className={`py-1.5 rounded-lg transition-all ${
              tab === 'signup' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {tab === 'guest' ? (
          <div className="space-y-4 py-2 text-center">
            <p className="text-xs text-slate-400">
              Play immediately with a random Guest ID. No password or registration needed!
            </p>
            <button
              onClick={handleGuest}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Entering...' : 'Continue as Guest'}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-3 py-1">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <span>{loading ? 'Processing...' : tab === 'signup' ? 'Create Account' : 'Sign In'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
