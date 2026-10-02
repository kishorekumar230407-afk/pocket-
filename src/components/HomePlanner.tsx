import React, { useState } from 'react';
import {
  Home,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  TrendingDown,
  Layers,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  RotateCcw,
  MessageSquare,
  Save,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Currency, HomePlanData, RoomConfig, RoomItemConfig } from '../types';
import { formatCurrency, getPlatformBadgeStyle, buildSearchUrl } from '../utils/formatters';

interface HomePlannerProps {
  currency: Currency;
  onSavePlan: (scenario: 'home', title: string, budget: number, cost: number, data: HomePlanData) => void;
  onOpenCoPilot: (scenario: string, plan: HomePlanData) => void;
  presetTrigger?: string;
}

const DEFAULT_ROOMS: RoomConfig[] = [
  {
    name: 'Living Room',
    items: [
      { name: 'Ceiling Fan (BLDC)', quantity: 1, priority: 'Essential' },
      { name: 'Ambient Warm Light Fixtures', quantity: 2, priority: 'Recommended' },
      { name: '3-Seater Sofa / Couch', quantity: 1, priority: 'Essential' },
      { name: 'Coffee / Center Table', quantity: 1, priority: 'Recommended' },
      { name: 'Textured Area Rug', quantity: 1, priority: 'Recommended' }
    ]
  },
  {
    name: 'Bedroom',
    items: [
      { name: 'Warm Bedside Table Lamps', quantity: 2, priority: 'Recommended' },
      { name: 'Blackout Linen Curtains (Pair)', quantity: 2, priority: 'Essential' },
      { name: 'Under-bed Storage Organizer', quantity: 2, priority: 'Recommended' }
    ]
  }
];

const STYLES = [
  { id: 'Modern Minimalist', label: 'Modern Minimalist', desc: 'Clean lines, neutral palette, functional simplicity' },
  { id: 'Scandinavian', label: 'Scandinavian', desc: 'Light woods, cozy hygge textures, natural light' },
  { id: 'Bohemian / Boho', label: 'Bohemian / Boho', desc: 'Rattan, earthy plants, warm patterned textiles' },
  { id: 'Industrial Chic', label: 'Industrial Chic', desc: 'Matte black metal, raw wood, exposed accents' },
  { id: 'Contemporary Japandi', label: 'Japandi', desc: 'Japanese elegance meets Scandinavian minimalism' },
  { id: 'Traditional Heritage', label: 'Traditional Indian', desc: 'Solid wood, brass accents, rich ethnic hues' }
];

const PLATFORMS = ['IKEA', 'Amazon', 'Flipkart', 'Pepperfry', 'Urban Ladder'];

export const HomePlanner: React.FC<HomePlannerProps> = ({
  currency,
  onSavePlan,
  onOpenCoPilot,
}) => {
  // Budget default based on currency
  const defaultBudget = currency === 'INR' ? 65000 : currency === 'USD' ? 950 : currency === 'EUR' ? 880 : 750;
  
  const [budget, setBudget] = useState<number>(defaultBudget);
  const [style, setStyle] = useState<string>('Modern Minimalist');
  const [rooms, setRooms] = useState<RoomConfig[]>(DEFAULT_ROOMS);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['IKEA', 'Amazon', 'Flipkart', 'Pepperfry']);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [planResult, setPlanResult] = useState<HomePlanData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manage rooms
  const handleAddRoom = (roomName: string) => {
    if (!roomName.trim()) return;
    if (rooms.some(r => r.name.toLowerCase() === roomName.toLowerCase())) return;
    setRooms([...rooms, { name: roomName, items: [{ name: 'Ceiling Light / Lamp', quantity: 1, priority: 'Essential' }] }]);
  };

  const handleRemoveRoom = (roomIndex: number) => {
    setRooms(rooms.filter((_, idx) => idx !== roomIndex));
  };

  const handleAddItemToRoom = (roomIndex: number, itemName: string) => {
    if (!itemName.trim()) return;
    const updated = [...rooms];
    updated[roomIndex].items.push({ name: itemName, quantity: 1, priority: 'Recommended' });
    setRooms(updated);
  };

  const handleUpdateItemQty = (roomIndex: number, itemIndex: number, delta: number) => {
    const updated = [...rooms];
    const current = updated[roomIndex].items[itemIndex].quantity;
    const nextQty = Math.max(1, current + delta);
    updated[roomIndex].items[itemIndex].quantity = nextQty;
    setRooms(updated);
  };

  const handleRemoveItem = (roomIndex: number, itemIndex: number) => {
    const updated = [...rooms];
    updated[roomIndex].items = updated[roomIndex].items.filter((_, idx) => idx !== itemIndex);
    setRooms(updated);
  };

  const togglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(item => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  // Submit and generate plan
  const handleGeneratePlan = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/recommendations/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget,
          currency,
          rooms,
          style,
          preferredPlatforms: selectedPlatforms,
          additionalNotes
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setPlanResult(data.data);
        if (data.data.savingsOrSurplus >= 0) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
      } else {
        setErrorMsg(data.error || 'Failed to generate recommendations. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred while planning home budget.');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset loader
  const handleLoadDemo = () => {
    setBudget(currency === 'INR' ? 50000 : 750);
    setStyle('Scandinavian');
    setRooms([
      {
        name: 'Living Room',
        items: [
          { name: 'IKEA Style 3-Seater Sofa', quantity: 1, priority: 'Essential' },
          { name: 'Warm Oak Coffee Table', quantity: 1, priority: 'Recommended' },
          { name: 'Floor Reading Lamp', quantity: 1, priority: 'Recommended' },
          { name: 'High-speed BLDC Fan', quantity: 1, priority: 'Essential' }
        ]
      },
      {
        name: 'Compact Dining & Kitchen',
        items: [
          { name: 'Drop-leaf Folding Dining Table', quantity: 1, priority: 'Essential' },
          { name: 'Pendant Hanging Lights', quantity: 2, priority: 'Recommended' }
        ]
      }
    ]);
  };

  return (
    <div className="space-y-8">
      {/* Intro Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/50 border border-emerald-800/30 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <Home className="w-3.5 h-3.5" />
            <span>Scenario 1: Home Interior Planning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Smart Budget Allocation &amp; Cross-Platform Decor Sourcing
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            PocketSmart AI calculates proportional budget shares across your rooms and sources aesthetic, cost-effective furniture and lighting from <strong className="text-white">IKEA, Amazon, Flipkart &amp; Pepperfry</strong> without financial overspending.
          </p>
        </div>
        <div className="absolute right-4 -bottom-6 opacity-15 pointer-events-none">
          <Home className="w-64 h-64 text-emerald-400" />
        </div>
      </div>

      {/* Main Grid: Form Configurator & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Adaptive Configuration Form */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-white text-base">Plan Parameters</h2>
            </div>
            <button
              onClick={handleLoadDemo}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
            >
              Load Sample 2-Room Preset
            </button>
          </div>

          {/* 1. Total Budget Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Interior Budget ({currency})
              </label>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {formatCurrency(budget, currency)}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="5000"
                step="1000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="e.g. 65000"
              />
            </div>
            {/* Quick budget chip selectors */}
            <div className="flex items-center gap-2 mt-2">
              {[currency === 'INR' ? 40000 : 500, currency === 'INR' ? 75000 : 1000, currency === 'INR' ? 150000 : 2000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBudget(val)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
                    budget === val
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {formatCurrency(val, currency)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Interior Design Aesthetic */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Design Aesthetic
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStyle(st.id)}
                  className={`text-left p-2.5 rounded-xl border transition-all text-xs ${
                    style === st.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-white">{st.label}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{st.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Rooms & Item Quantities (Scenario requirement) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Rooms &amp; Quantities ({rooms.length})
              </label>
              <div className="flex items-center gap-1.5">
                {['Kitchen', 'Balcony', 'Home Office', 'Dining'].map((extraRoom) => (
                  <button
                    key={extraRoom}
                    type="button"
                    onClick={() => handleAddRoom(extraRoom)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.8 rounded-md transition-colors"
                  >
                    + {extraRoom}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {rooms.map((room, rIdx) => (
                <div key={rIdx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      {room.name}
                    </span>
                    {rooms.length > 1 && (
                      <button
                        onClick={() => handleRemoveRoom(rIdx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Remove room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Room items list */}
                  <div className="space-y-1.5">
                    {room.items.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs"
                      >
                        <span className="text-slate-200 font-medium truncate max-w-[170px]" title={item.name}>
                          {item.name}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Counter */}
                          <div className="flex items-center bg-slate-950 rounded border border-slate-700 px-1 py-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(rIdx, iIdx, -1)}
                              className="text-slate-400 hover:text-white px-1 text-xs"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono font-bold text-emerald-400 px-1.5">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(rIdx, iIdx, 1)}
                              className="text-slate-400 hover:text-white px-1 text-xs"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(rIdx, iIdx)}
                            className="text-slate-600 hover:text-rose-400"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add item prompt */}
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Add custom item (e.g. Dining Chairs, Bookshelf)..."
                      className="flex-1 bg-slate-900 border border-slate-800 text-[11px] text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddItemToRoom(rIdx, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Target Platforms Sourcing */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Cross-Platform Ecosystems
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((plat) => {
                const isSelected = selectedPlatforms.includes(plat);
                const badge = getPlatformBadgeStyle(plat);
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => togglePlatform(plat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? `${badge.bg} ${badge.text} ${badge.border} shadow-sm ring-1 ring-emerald-500/20`
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>{plat}</span>
                    {isSelected && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Special Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Custom Requirements (Optional)
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Need warm dimmable lights, pet-friendly fabric couch..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Submit Action */}
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gemini Analyzing Budget &amp; Sourcing Products...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Smart Home Interior Plan</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Results Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {!planResult && !loading && (
            <div className="bg-slate-900/60 border border-slate-800 border-dashed rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Home className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-white">Ready to Optimize Your Interior Budget</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure your rooms, fan/light counts, and budget on the left, then click &ldquo;Generate Smart Home Interior Plan&rdquo; to unlock AI recommendations across IKEA, Amazon, and Flipkart.
                </p>
              </div>
              <button
                onClick={handleGeneratePlan}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all cursor-pointer"
              >
                <span>Run Quick Demo Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Gemini 3.8 Flash is Calculating...</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Cross-referencing room dimensions, lighting specs, and current price trends on IKEA, Amazon, and Flipkart.
                </p>
              </div>
            </div>
          )}

          {planResult && !loading && (
            <div className="space-y-6">
              {/* Financial Health Summary Banner */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Smart Budget Health
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black text-white font-mono">
                        {formatCurrency(planResult.totalEstimatedCost, currency)}
                      </span>
                      <span className="text-xs text-slate-400">
                        est. spend of {formatCurrency(budget, currency)} budget
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {planResult.savingsOrSurplus >= 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Saved {formatCurrency(planResult.savingsOrSurplus, currency)} Surplus
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs">
                        Over budget by {formatCurrency(Math.abs(planResult.savingsOrSurplus), currency)}
                      </span>
                    )}

                    {/* Actions: Save & Co-Pilot */}
                    <button
                      onClick={() => onSavePlan('home', `${style} Interior (${rooms.length} Rooms)`, budget, planResult.totalEstimatedCost, planResult)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      title="Save this plan"
                    >
                      <Save className="w-4 h-4 text-emerald-400" />
                    </button>
                    <button
                      onClick={() => onOpenCoPilot('Home Interior', planResult)}
                      className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                      title="Ask AI Co-Pilot to tune this plan"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors no-print"
                      title="Print or Export PDF"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-700 ${
                        planResult.totalEstimatedCost <= budget ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((planResult.totalEstimatedCost / budget) * 100))}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>0%</span>
                    <span>
                      {Math.round((planResult.totalEstimatedCost / budget) * 100)}% of Budget Allocated
                    </span>
                    <span>100%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  &ldquo;{planResult.summary}&rdquo;
                </p>

                {/* Proportional category allocation pill cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {planResult.budgetBreakdown.map((cat, idx) => (
                    <div key={idx} className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2.5">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold truncate">{cat.category}</div>
                      <div className="text-sm font-bold text-white font-mono mt-0.5">
                        {formatCurrency(cat.allocatedAmount, currency)}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold">{cat.percentage}% allocation</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sourced Recommendations Listing */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <span>Curated Sourced Products ({planResult.recommendations.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Live links to Amazon, IKEA &amp; Flipkart
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {planResult.recommendations.map((item) => {
                    const badge = getPlatformBadgeStyle(item.platform);
                    const directUrl = buildSearchUrl(item.platform, item.searchQuery || item.productName, currency);

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all rounded-xl p-4 shadow-sm space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                              >
                                {item.platform}
                              </span>
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                                {item.room}
                              </span>
                              {item.isBudgetPick && (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                                  ★ Smart Value Pick
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-white leading-snug">{item.productName}</h4>
                          </div>

                          {/* Pricing block */}
                          <div className="text-left sm:text-right shrink-0">
                            <div className="text-base font-black text-emerald-400 font-mono">
                              {formatCurrency(item.totalPrice, currency)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {formatCurrency(item.unitPrice, currency)} × {item.quantity} qty
                            </div>
                          </div>
                        </div>

                        {/* Rationale description */}
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {item.matchReason}
                        </p>

                        {/* Lower cost alternative callout if present */}
                        {item.alternativeLowerCost && (
                          <div className="flex items-center justify-between bg-slate-950/80 border border-emerald-950 px-3 py-1.5 rounded-lg text-xs">
                            <span className="text-slate-400 text-[11px]">
                              Budget Alternative: <strong className="text-slate-200">{item.alternativeLowerCost.name}</strong> on {item.alternativeLowerCost.platform}
                            </span>
                            <span className="font-mono text-emerald-400 font-bold text-[11px]">
                              {formatCurrency(item.alternativeLowerCost.price, currency)}
                            </span>
                          </div>
                        )}

                        {/* Card Footer: Rating + Direct Search Link */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                          <div className="flex items-center gap-1.5 text-amber-400 font-medium text-xs">
                            <span>★ {item.rating.toFixed(1)}</span>
                            <span className="text-slate-500 text-[11px]">({item.reviewsCount} reviews)</span>
                          </div>

                          <a
                            href={directUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                          >
                            <span>Check on {item.platform}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Designer Pro-Tips & Trade-offs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Interior Designer Budget Hacks</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {planResult.proTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Aesthetic &amp; Price Trade-Off Analysis</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {planResult.tradeOffAnalysis}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
