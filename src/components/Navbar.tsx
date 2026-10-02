import React from 'react';
import { Sparkles, Home, PartyPopper, Gem, BookmarkCheck, SlidersHorizontal, Cpu, Coins } from 'lucide-react';
import { Currency, CURRENCIES } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'party' | 'jewelry';
  setActiveTab: (tab: 'home' | 'party' | 'jewelry') => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  savedPlansCount: number;
  onOpenSavedPlans: () => void;
  onOpenArchModal: () => void;
  onSelectPreset: (presetId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  savedPlansCount,
  onOpenSavedPlans,
  onOpenArchModal,
  onSelectPreset,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 shadow-lg shadow-emerald-500/20 text-white font-bold">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">PocketSmart</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  AI 3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Smart Budget &amp; Recommendation Assistant
              </p>
            </div>
          </div>

          {/* Mobile actions */}
          <div className="flex md:hidden items-center gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              aria-label="Currency"
              className="bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
            <button
              onClick={onOpenSavedPlans}
              aria-label="View saved plans"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 relative"
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-400" />
              {savedPlansCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {savedPlansCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 3 Core Scenario Navigators */}
        <nav className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home Interior</span>
          </button>

          <button
            onClick={() => setActiveTab('party')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'party'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <PartyPopper className="w-4 h-4" />
            <span>Party Planner</span>
          </button>

          <button
            onClick={() => setActiveTab('jewelry')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'jewelry'
                ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gem className="w-4 h-4" />
            <span>Occasion Jewelry</span>
          </button>
        </nav>

        {/* Right Tools (Currency, Quick Presets, Saved, Architecture Specs) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Currency selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <Coins className="w-3.5 h-3.5 text-emerald-400 mr-2" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              aria-label="Select currency"
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-slate-100">
                  {c.symbol} {c.code} ({c.name.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Quick presets picker */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Presets</span>
            </button>
            <div className="absolute right-0 mt-1 w-56 p-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Quick Scenarios</div>
              <button
                onClick={() => onSelectPreset('home-studio')}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>🏠 Studio Apartment</span>
                <span className="text-[10px] text-emerald-400 font-mono">₹50K</span>
              </button>
              <button
                onClick={() => onSelectPreset('party-birthday')}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>🎉 25-Guest Rooftop Party</span>
                <span className="text-[10px] text-amber-400 font-mono">₹30K</span>
              </button>
              <button
                onClick={() => onSelectPreset('jewelry-diwali')}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>💎 Festive Kundan Look</span>
                <span className="text-[10px] text-fuchsia-400 font-mono">₹18K</span>
              </button>
            </div>
          </div>

          {/* Architecture info button */}
          <button
            onClick={onOpenArchModal}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 transition-colors"
            title="System Requirements & Architecture (8 Epics, 16 Tasks)"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Architecture</span>
          </button>

          {/* Saved Plans */}
          <button
            onClick={onOpenSavedPlans}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all relative"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Saved Plans</span>
            {savedPlansCount > 0 && (
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {savedPlansCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
