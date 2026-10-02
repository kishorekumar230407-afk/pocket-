import React, { useState } from 'react';
import {
  PartyPopper,
  Users,
  Building,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Clock,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  ShoppingBag,
  MessageSquare,
  Save,
  Printer,
  Utensils,
  Music,
  MapPin,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Currency, PartyPlanData } from '../types';
import { formatCurrency, getPlatformBadgeStyle, buildSearchUrl } from '../utils/formatters';

interface PartyPlannerProps {
  currency: Currency;
  onSavePlan: (scenario: 'party', title: string, budget: number, cost: number, data: PartyPlanData) => void;
  onOpenCoPilot: (scenario: string, plan: PartyPlanData) => void;
}

const EVENT_TYPES = [
  'Birthday Party',
  'Wedding / Sangeet',
  'Corporate Mixer',
  'Housewarming Bash',
  'Anniversary Celebration',
  'College / Grad Party',
  'Casual Rooftop Jam'
];

const VENUE_TYPES = [
  { id: 'Home / Apartment', label: 'Home / Living Room', desc: 'Zero hall rental, higher budget for gourmet food' },
  { id: 'Rented Banquet Hall', label: 'Banquet Hall', desc: 'Formal setup with dedicated staff and tables' },
  { id: 'Rooftop Lounge', label: 'Rooftop Lounge', desc: 'Open sky, sunset cocktail vibes, great acoustics' },
  { id: 'Outdoor Lawn / Garden', label: 'Lawn / Farmhouse', desc: 'Open greenery, fairy light canopy, barbecue' },
  { id: 'Resort / OYO Staycation', label: 'OYO Townhouse / Villa', desc: 'Stay + party space combo with private suites' }
];

const VENDORS = ['Swiggy', 'Zomato', 'OYO', 'Amazon', 'Blinkit', 'Airbnb'];

export const PartyPlanner: React.FC<PartyPlannerProps> = ({
  currency,
  onSavePlan,
  onOpenCoPilot,
}) => {
  const defaultBudget = currency === 'INR' ? 35000 : currency === 'USD' ? 550 : currency === 'EUR' ? 500 : 450;
  
  const [budget, setBudget] = useState<number>(defaultBudget);
  const [guestCount, setGuestCount] = useState<number>(25);
  const [eventType, setEventType] = useState<string>('Birthday Party');
  const [venueType, setVenueType] = useState<string>('Home / Apartment');
  const [selectedVendors, setSelectedVendors] = useState<string[]>(['Swiggy', 'Zomato', 'Amazon', 'OYO']);
  const [dietaryChoice, setDietaryChoice] = useState<string>('Veg & Non-Veg Mixed Platters');
  const [entertainmentChoice, setEntertainmentChoice] = useState<string>('Bluetooth Soundbox & Karaoke Games');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [planResult, setPlanResult] = useState<PartyPlanData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleVendor = (v: string) => {
    if (selectedVendors.includes(v)) {
      if (selectedVendors.length > 1) {
        setSelectedVendors(selectedVendors.filter(item => item !== v));
      }
    } else {
      setSelectedVendors([...selectedVendors, v]);
    }
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/recommendations/party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget,
          currency,
          guestCount,
          eventType,
          venueType,
          preferredVendors: selectedVendors,
          dietaryPreferences: [dietaryChoice],
          entertainmentPreferences: [entertainmentChoice],
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
        setErrorMsg(data.error || 'Failed to generate party budget plan.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred while planning party.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = () => {
    setBudget(currency === 'INR' ? 30000 : 450);
    setGuestCount(20);
    setEventType('Birthday Party');
    setVenueType('Rooftop Lounge');
    setDietaryChoice('Gourmet Sliders, Biryani & Mocktail Platters');
    setEntertainmentChoice('Karaoke Mic & Board Games');
  };

  return (
    <div className="space-y-8">
      {/* Scenario Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-orange-950/50 border border-amber-800/30 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <PartyPopper className="w-3.5 h-3.5" />
            <span>Scenario 2: AI-Based Party Budget Planning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Smart Proportional Budgeting for Catering, Decor &amp; Venue
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Eliminate financial guesswork for celebrations. PocketSmart AI allocates your budget across bulk catering on <strong className="text-white">Swiggy &amp; Zomato</strong>, party kits on <strong className="text-white">Amazon &amp; Blinkit</strong>, and guest stay/event suites on <strong className="text-white">OYO</strong>.
          </p>
        </div>
        <div className="absolute right-4 -bottom-6 opacity-15 pointer-events-none">
          <PartyPopper className="w-64 h-64 text-amber-400" />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="font-bold text-white text-base">Party Parameters</h2>
            </div>
            <button
              onClick={handleLoadDemo}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
            >
              Load 20-Guest Rooftop Preset
            </button>
          </div>

          {/* 1. Total Party Budget */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Celebration Budget ({currency})
              </label>
              <span className="text-sm font-bold text-amber-400 font-mono">
                {formatCurrency(budget, currency)}
              </span>
            </div>
            <input
              type="number"
              min="3000"
              step="500"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              placeholder="e.g. 30000"
            />
            {/* Quick Chips */}
            <div className="flex items-center gap-2 mt-2">
              {[currency === 'INR' ? 15000 : 250, currency === 'INR' ? 35000 : 500, currency === 'INR' ? 80000 : 1200].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBudget(val)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
                    budget === val
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {formatCurrency(val, currency)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Guest Count Counter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Guest Count</span>
              </label>
              <span className="text-xs font-mono font-bold text-slate-300">
                {guestCount} Attendees ({formatCurrency(Math.round(budget / Math.max(1, guestCount)), currency)} / person)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
              />
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1">
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.max(5, guestCount - 5))}
                  className="text-slate-400 hover:text-white px-1 text-sm font-bold"
                >
                  -
                </button>
                <span className="font-mono text-sm font-bold text-amber-400 px-2 min-w-[28px] text-center">
                  {guestCount}
                </span>
                <button
                  type="button"
                  onClick={() => setGuestCount(guestCount + 5)}
                  className="text-slate-400 hover:text-white px-1 text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 3. Event Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Occasion / Event Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEventType(type)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    eventType === type
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Venue Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Venue Details
            </label>
            <div className="space-y-1.5">
              {VENUE_TYPES.map((ven) => (
                <div
                  key={ven.id}
                  onClick={() => setVenueType(ven.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all text-xs flex items-center justify-between ${
                    venueType === ven.id
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">{ven.label}</div>
                    <div className="text-[10px] text-slate-400">{ven.desc}</div>
                  </div>
                  {venueType === ven.id && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Vendor Ecosystem Sourcing */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Integrated Platforms &amp; Delivery
            </label>
            <div className="flex flex-wrap gap-2">
              {VENDORS.map((v) => {
                const isSelected = selectedVendors.includes(v);
                const badge = getPlatformBadgeStyle(v);
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggleVendor(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? `${badge.bg} ${badge.text} ${badge.border} shadow-sm ring-1 ring-amber-500/20`
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>{v}</span>
                    {isSelected && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Food & Entertainment Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Catering Style
              </label>
              <select
                value={dietaryChoice}
                onChange={(e) => setDietaryChoice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Veg & Non-Veg Mixed Platters">Veg &amp; Non-Veg Mixed</option>
                <option value="100% Pure Vegetarian / Jain Friendly">100% Pure Vegetarian</option>
                <option value="Gourmet Finger Foods & Sliders">Gourmet Finger Foods</option>
                <option value="BBQ & Grilled Live Station">BBQ &amp; Live Station</option>
                <option value="Dessert & Mocktail Social">Dessert &amp; Mocktails Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Entertainment Setup
              </label>
              <select
                value={entertainmentChoice}
                onChange={(e) => setEntertainmentChoice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Bluetooth Soundbox & Karaoke Games">Bluetooth Speaker + Karaoke</option>
                <option value="Live Acoustic Musician or DJ">Live Acoustic / DJ</option>
                <option value="Board Games & Trivia Tournament">Board Games &amp; Trivia</option>
                <option value="Photobooth with Instant Print Camera">Photobooth &amp; Polaroid</option>
                <option value="Casual Background Lounge Playlist">Background Lounge Vibe</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-amber-950 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gemini Allocating Party Budget...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Smart Party Budget Plan</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Party Results Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {!planResult && !loading && (
            <div className="bg-slate-900/60 border border-slate-800 border-dashed rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <PartyPopper className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-white">Party Budgeting Made Effortless</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your guest count and party budget to unlock instant proportional allocation across Swiggy/Zomato bulk catering, Amazon theme decor, and OYO stay packages.
                </p>
              </div>
              <button
                onClick={handleGeneratePlan}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer"
              >
                <span>Run 25-Guest Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Gemini 3.8 Flash is Structuring Your Event...</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Calculating portion sizes, food warmer tray requirements, speaker wattages, and OYO room bundles.
                </p>
              </div>
            </div>
          )}

          {planResult && !loading && (
            <div className="space-y-6">
              {/* Financial Health Banner */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Party Budget Optimization
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black text-white font-mono">
                        {formatCurrency(planResult.totalEstimatedCost, currency)}
                      </span>
                      <span className="text-xs text-amber-400 font-bold font-mono">
                        ({formatCurrency(planResult.costPerGuest, currency)} / guest)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {planResult.savingsOrSurplus >= 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Saved {formatCurrency(planResult.savingsOrSurplus, currency)} Buffer
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-xs">
                        Over by {formatCurrency(Math.abs(planResult.savingsOrSurplus), currency)}
                      </span>
                    )}

                    <button
                      onClick={() => onSavePlan('party', `${eventType} (${guestCount} Guests)`, budget, planResult.totalEstimatedCost, planResult)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      title="Save this party plan"
                    >
                      <Save className="w-4 h-4 text-amber-400" />
                    </button>
                    <button
                      onClick={() => onOpenCoPilot('Party & Event', planResult)}
                      className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                      title="Ask AI Co-Pilot to adjust party plan"
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
                        planResult.totalEstimatedCost <= budget ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((planResult.totalEstimatedCost / budget) * 100))}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>{guestCount} Guests</span>
                    <span>{Math.round((planResult.totalEstimatedCost / budget) * 100)}% of Budget Sourced</span>
                    <span>Cap: {formatCurrency(budget, currency)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  &ldquo;{planResult.summary}&rdquo;
                </p>

                {/* Proportional 5-Pillar Allocation Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  <div className="bg-slate-950/80 border border-orange-950 rounded-xl p-2.5">
                    <div className="text-[10px] text-orange-400 uppercase font-semibold flex items-center gap-1">
                      <Utensils className="w-3 h-3" />
                      <span>Catering</span>
                    </div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {formatCurrency(planResult.allocation.catering?.amount || 0, currency)}
                    </div>
                    <div className="text-[10px] text-slate-400">{planResult.allocation.catering?.percent || 42}% share</div>
                  </div>

                  <div className="bg-slate-950/80 border border-amber-950 rounded-xl p-2.5">
                    <div className="text-[10px] text-amber-400 uppercase font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      <span>Decor</span>
                    </div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {formatCurrency(planResult.allocation.decoration?.amount || 0, currency)}
                    </div>
                    <div className="text-[10px] text-slate-400">{planResult.allocation.decoration?.percent || 20}% share</div>
                  </div>

                  <div className="bg-slate-950/80 border border-sky-950 rounded-xl p-2.5">
                    <div className="text-[10px] text-sky-400 uppercase font-semibold flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      <span>Entertainment</span>
                    </div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {formatCurrency(planResult.allocation.entertainment?.amount || 0, currency)}
                    </div>
                    <div className="text-[10px] text-slate-400">{planResult.allocation.entertainment?.percent || 16}% share</div>
                  </div>

                  <div className="bg-slate-950/80 border border-rose-950 rounded-xl p-2.5">
                    <div className="text-[10px] text-rose-400 uppercase font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>Venue / OYO</span>
                    </div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {formatCurrency(planResult.allocation.venueAccommodation?.amount || 0, currency)}
                    </div>
                    <div className="text-[10px] text-slate-400">{planResult.allocation.venueAccommodation?.percent || 14}% share</div>
                  </div>

                  <div className="bg-slate-950/80 border border-emerald-950 rounded-xl p-2.5">
                    <div className="text-[10px] text-emerald-400 uppercase font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Contingency</span>
                    </div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {formatCurrency(planResult.allocation.contingency?.amount || 0, currency)}
                    </div>
                    <div className="text-[10px] text-slate-400">{planResult.allocation.contingency?.percent || 8}% reserve</div>
                  </div>
                </div>
              </div>

              {/* Sourced Items Across Swiggy, Zomato, OYO, Amazon */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Cross-Platform Vendor Packages</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Swiggy, Zomato, OYO, Amazon
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {planResult.items.map((it) => {
                    const badge = getPlatformBadgeStyle(it.vendorOrPlatform);
                    const directUrl = buildSearchUrl(it.vendorOrPlatform, it.searchQuery || it.title, currency);

                    return (
                      <div
                        key={it.id}
                        className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all rounded-xl p-4 shadow-sm space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                              >
                                {it.vendorOrPlatform}
                              </span>
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                                {it.category}
                              </span>
                              <span className="text-[10px] bg-slate-800/80 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                                {it.quantityOrServings}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white leading-snug">{it.title}</h4>
                          </div>

                          <div className="text-left sm:text-right shrink-0">
                            <div className="text-base font-black text-amber-400 font-mono">
                              {formatCurrency(it.cost, currency)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              ★ {it.rating?.toFixed(1) || '4.6'} Vendor Rating
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {it.details}
                        </p>

                        {/* Budget tip */}
                        {it.budgetTip && (
                          <div className="bg-slate-950/80 border border-amber-950/80 px-3 py-1.5 rounded-lg text-xs flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">
                              💡 Smart Saving Hack: <strong className="text-amber-300">{it.budgetTip}</strong>
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-end pt-2 border-t border-slate-800/80 text-xs">
                          <a
                            href={directUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                          >
                            <span>Book / Order on {it.vendorOrPlatform}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day-of-Event Timeline Checklist */}
              {planResult.scheduleTimeline && planResult.scheduleTimeline.length > 0 && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Event Day Running Schedule &amp; Delivery Timeline</span>
                  </h4>
                  <div className="space-y-2">
                    {planResult.scheduleTimeline.map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-xs"
                      >
                        <span className="font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
                          {slot.time}
                        </span>
                        <div>
                          <div className="font-semibold text-white">{slot.activity}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{slot.notes}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Tips */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Party Organizer Pro-Tips</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {planResult.proTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
