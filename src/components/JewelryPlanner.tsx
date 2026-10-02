import React, { useState, useRef } from 'react';
import {
  Gem,
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  TrendingDown,
  ShoppingBag,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Save,
  Printer,
  Eye,
  Percent
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Currency, JewelryPlanData } from '../types';
import { formatCurrency, getPlatformBadgeStyle, buildSearchUrl } from '../utils/formatters';

interface JewelryPlannerProps {
  currency: Currency;
  onSavePlan: (scenario: 'jewelry', title: string, budget: number, cost: number, data: JewelryPlanData) => void;
  onOpenCoPilot: (scenario: string, plan: JewelryPlanData) => void;
}

const OCCASIONS = [
  'Wedding / Bridal',
  'Festive / Diwali / Eid',
  'Engagement / Roka',
  'Cocktail / Sangeet',
  'Office / Professional',
  'Casual Everyday Chic'
];

const STYLES = [
  { id: 'Kundan & Jadau', label: 'Kundan & Jadau', desc: 'Glass-stone encrusted royal Rajasthani heritage' },
  { id: 'Polki & Fresh Water Pearls', label: 'Polki & Pearls', desc: 'Uncut diamond look with luminous pearl drops' },
  { id: 'Temple Traditional Antique', label: 'Temple Antique', desc: 'Matte gold coin motifs & nakshi deities' },
  { id: 'Contemporary Diamond & Crystal', label: 'Diamond / CZ', desc: 'Sleek silver or white-gold sparkling elegance' },
  { id: 'Minimalist Delicate Gold', label: 'Minimalist Gold', desc: 'Dainty chains, geometric hoops, subtle luxury' },
  { id: 'Boho Oxidised Silver', label: 'Oxidised Silver', desc: 'Artisanal tribal motifs & bell charms' }
];

const PLATFORMS = ['Amazon', 'Flipkart', 'CaratLane', 'Tanishq', 'Myntra', 'Meesho'];

// Sample outfit color palette presets if user doesn't have an immediate photo to upload
const SAMPLE_OUTFITS = [
  {
    name: 'Emerald Zari Lehenga',
    colorHex: '#064e3b',
    description: 'Deep bottle green raw silk lehenga with heavy antique gold zardozi border and sweetheart neckline',
  },
  {
    name: 'Crimson Silk Saree',
    colorHex: '#881337',
    description: 'Crimson red Kanjeevaram silk saree with woven gold temple borders and round neck blouse',
  },
  {
    name: 'Midnight Blue Velvet Gown',
    colorHex: '#172554',
    description: 'Midnight blue velvet evening cocktail gown with off-shoulder neckline and crystal sequins',
  },
  {
    name: 'Ivory Pastel Anarkali',
    colorHex: '#fef08a',
    description: 'Ivory and champagne chikankari anarkali with subtle sequin embroidery and sheer dupatta',
  }
];

export const JewelryPlanner: React.FC<JewelryPlannerProps> = ({
  currency,
  onSavePlan,
  onOpenCoPilot,
}) => {
  const defaultBudget = currency === 'INR' ? 22000 : currency === 'USD' ? 320 : currency === 'EUR' ? 290 : 250;

  const [budget, setBudget] = useState<number>(defaultBudget);
  const [occasion, setOccasion] = useState<string>('Wedding / Bridal');
  const [stylePreference, setStylePreference] = useState<string>('Kundan & Jadau');
  const [outfitDescription, setOutfitDescription] = useState<string>('Emerald green raw silk lehenga with antique gold zardozi border');
  const [outfitImage, setOutfitImage] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Amazon', 'Flipkart', 'CaratLane', 'Tanishq']);
  const [jewelryPieces, setJewelryPieces] = useState<string[]>(['Necklace', 'Earrings', 'Bangles', 'Cocktail Ring']);

  const [loading, setLoading] = useState<boolean>(false);
  const [planResult, setPlanResult] = useState<JewelryPlanData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('Image size exceeds 8MB. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setOutfitImage(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSampleOutfit = (sample: typeof SAMPLE_OUTFITS[0]) => {
    setOutfitDescription(sample.description);
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

  const toggleJewelryPiece = (piece: string) => {
    if (jewelryPieces.includes(piece)) {
      if (jewelryPieces.length > 1) {
        setJewelryPieces(jewelryPieces.filter(item => item !== piece));
      }
    } else {
      setJewelryPieces([...jewelryPieces, piece]);
    }
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/recommendations/jewelry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget,
          currency,
          occasion,
          stylePreference,
          outfitDescription,
          outfitImage,
          preferredPlatforms: selectedPlatforms,
          jewelryTypes: jewelryPieces
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
        setErrorMsg(data.error || 'Failed to generate jewelry recommendations.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred while styling jewelry.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = () => {
    setBudget(currency === 'INR' ? 18000 : 260);
    setOccasion('Festive / Diwali / Eid');
    setStylePreference('Polki & Fresh Water Pearls');
    setOutfitDescription('Navy blue banarasi silk saree with silver-gold zari border');
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-950/60 via-slate-900 to-pink-950/50 border border-fuchsia-800/30 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-semibold mb-3">
            <Gem className="w-3.5 h-3.5" />
            <span>Scenario 3: Jewelry Recommendations for Occasions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Outfit Vision &amp; Cross-Platform Jewelry Matching
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Upload your outfit image or select an occasion to unlock curated jewelry pairings from <strong className="text-white">Amazon, Flipkart, CaratLane, &amp; Tanishq</strong> with color harmony analysis, neckline coordination, and match scores.
          </p>
        </div>
        <div className="absolute right-4 -bottom-6 opacity-15 pointer-events-none">
          <Gem className="w-64 h-64 text-fuchsia-400" />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Vision Upload */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              <h2 className="font-bold text-white text-base">Styling Parameters</h2>
            </div>
            <button
              onClick={handleLoadDemo}
              className="text-xs text-fuchsia-400 hover:text-fuchsia-300 underline font-medium cursor-pointer"
            >
              Load Festive Kundan Preset
            </button>
          </div>

          {/* 1. Total Jewelry Budget */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Jewelry Ensemble Budget ({currency})
              </label>
              <span className="text-sm font-bold text-fuchsia-400 font-mono">
                {formatCurrency(budget, currency)}
              </span>
            </div>
            <input
              type="number"
              min="2000"
              step="500"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
              placeholder="e.g. 20000"
            />
            {/* Quick Chips */}
            <div className="flex items-center gap-2 mt-2">
              {[currency === 'INR' ? 8000 : 120, currency === 'INR' ? 20000 : 300, currency === 'INR' ? 50000 : 750].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBudget(val)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
                    budget === val
                      ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {formatCurrency(val, currency)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Occasion Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Occasion
            </label>
            <div className="grid grid-cols-2 gap-2">
              {OCCASIONS.map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setOccasion(occ)}
                  className={`text-xs px-3 py-2 rounded-xl border font-medium transition-all text-left ${
                    occasion === occ
                      ? 'bg-fuchsia-500/15 border-fuchsia-500 text-fuchsia-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Style Aesthetics */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Jewelry Aesthetic
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStylePreference(st.id)}
                  className={`text-left p-2.5 rounded-xl border transition-all text-xs ${
                    stylePreference === st.id
                      ? 'bg-fuchsia-500/15 border-fuchsia-500 text-white'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-white">{st.label}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{st.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Outfit Image Upload (Multimodal Vision) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Upload Outfit Photo (Vision AI)</span>
              </label>
              {outfitImage && (
                <button
                  onClick={() => setOutfitImage(null)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {!outfitImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-fuchsia-500/50 rounded-xl p-5 text-center cursor-pointer transition-all bg-slate-950/60 group"
              >
                <Upload className="w-6 h-6 text-slate-500 group-hover:text-fuchsia-400 mx-auto mb-2 transition-colors" />
                <div className="text-xs font-semibold text-slate-300 group-hover:text-white">
                  Drop outfit photo or click to browse
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Gemini analyzes fabric hue, embroidery, and neckline profile
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-fuchsia-500/40 bg-slate-950 p-2 flex items-center gap-3">
                <img
                  src={outfitImage}
                  alt="Uploaded outfit"
                  className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                />
                <div className="flex-1 text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Outfit Attached for Vision Analysis</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Gemini 3.8 will scan color contrasts and metal pairings.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Outfit description or sample presets */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Outfit Description or Sample Palette
              </label>
              <textarea
                value={outfitDescription}
                onChange={(e) => setOutfitDescription(e.target.value)}
                rows={2}
                placeholder="e.g. Mustard yellow silk saree with antique copper zari..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
              />
              <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-1">
                {SAMPLE_OUTFITS.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => handleSelectSampleOutfit(sample)}
                    className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-md bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 shrink-0"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/20"
                      style={{ backgroundColor: sample.colorHex }}
                    />
                    <span>{sample.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Target Jewelry Pieces */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Pieces Needed in Set
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['Necklace', 'Earrings', 'Bangles', 'Cocktail Ring', 'Maang Tikka', 'Anklet / Payal'].map((piece) => {
                const isSelected = jewelryPieces.includes(piece);
                return (
                  <button
                    key={piece}
                    type="button"
                    onClick={() => toggleJewelryPiece(piece)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      isSelected
                        ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    {piece}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Platforms Sourced */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              E-Commerce Platforms
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
                        ? `${badge.bg} ${badge.text} ${badge.border} shadow-sm ring-1 ring-fuchsia-500/20`
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

          {/* Submit Action */}
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-950 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gemini Analyzing Colors &amp; Styling Set...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Style Occasion Jewelry Ensemble</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Jewelry Results Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {!planResult && !loading && (
            <div className="bg-slate-900/60 border border-slate-800 border-dashed rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center">
                <Gem className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-white">Elevate Your Occasion Look</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Upload your outfit photo or specify your celebration look to unlock harmonious jewelry suggestions from Amazon, Flipkart, Tanishq, and CaratLane.
                </p>
              </div>
              <button
                onClick={handleGeneratePlan}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40 hover:bg-fuchsia-500/30 transition-all cursor-pointer"
              >
                <span>Run Festive Look Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-fuchsia-500/20 border-t-fuchsia-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Gemini 3.8 Flash Vision Analyzing...</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Evaluating undertones, neckline geometry, and comparing gold/silver pricing on Amazon and CaratLane.
                </p>
              </div>
            </div>
          )}

          {planResult && !loading && (
            <div className="space-y-6">
              {/* Financial & Styling Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Coordinated Ensemble Total
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black text-white font-mono">
                        {formatCurrency(planResult.totalEstimatedCost, currency)}
                      </span>
                      <span className="text-xs text-slate-400">
                        est. spend for complete {planResult.pieces.length}-piece set
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {planResult.savingsOrSurplus >= 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Saved {formatCurrency(planResult.savingsOrSurplus, currency)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-xs">
                        Over by {formatCurrency(Math.abs(planResult.savingsOrSurplus), currency)}
                      </span>
                    )}

                    <button
                      onClick={() => onSavePlan('jewelry', `${occasion} - ${stylePreference}`, budget, planResult.totalEstimatedCost, planResult)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      title="Save this jewelry plan"
                    >
                      <Save className="w-4 h-4 text-fuchsia-400" />
                    </button>
                    <button
                      onClick={() => onOpenCoPilot('Occasion Jewelry', planResult)}
                      className="p-2 rounded-lg bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 transition-colors"
                      title="Ask AI Co-Pilot to adjust jewelry"
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
                        planResult.totalEstimatedCost <= budget ? 'bg-fuchsia-500' : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((planResult.totalEstimatedCost / budget) * 100))}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>Target: {formatCurrency(budget, currency)}</span>
                    <span>{Math.round((planResult.totalEstimatedCost / budget) * 100)}% of Budget</span>
                    <span>Surplus: {formatCurrency(Math.max(0, planResult.savingsOrSurplus), currency)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  &ldquo;{planResult.summary}&rdquo;
                </p>

                {/* AI Outfit Harmony Card */}
                {planResult.outfitAnalysis && (
                  <div className="bg-slate-950/80 border border-fuchsia-950 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-fuchsia-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        <Eye className="w-3.5 h-3.5" />
                        <span>AI Outfit Vision &amp; Color Report</span>
                      </span>
                      <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded-full font-semibold">
                        {planResult.outfitAnalysis.detectedAesthetic}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Color Harmony</span>
                        <p className="text-slate-200 mt-0.5">{planResult.outfitAnalysis.colorHarmony}</p>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Neckline Complement</span>
                        <p className="text-slate-200 mt-0.5">{planResult.outfitAnalysis.necklineComplement}</p>
                      </div>
                    </div>

                    {planResult.outfitAnalysis.recommendedMetals && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] text-slate-400">Recommended Metals:</span>
                        {planResult.outfitAnalysis.recommendedMetals.map((metal, mIdx) => (
                          <span key={mIdx} className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            {metal}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sourced Jewelry Pieces Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-fuchsia-400" />
                    <span>Individual Curated Pieces ({planResult.pieces.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Amazon, Flipkart, CaratLane, Tanishq
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {planResult.pieces.map((piece) => {
                    const badge = getPlatformBadgeStyle(piece.platform);
                    const directUrl = buildSearchUrl(piece.platform, piece.searchQuery || piece.name, currency);

                    return (
                      <div
                        key={piece.id}
                        className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all rounded-xl p-4 shadow-sm space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                              >
                                {piece.platform}
                              </span>
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                                {piece.pieceType}
                              </span>
                              <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 px-2 py-0.5 rounded-full font-bold">
                                {piece.matchScore}% Match Score
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white leading-snug">{piece.name}</h4>
                            <div className="text-[11px] text-slate-400">{piece.metalAndFinish}</div>
                          </div>

                          <div className="text-left sm:text-right shrink-0">
                            <div className="text-base font-black text-fuchsia-400 font-mono">
                              {formatCurrency(piece.price, currency)}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {piece.stylingRationale}
                        </p>

                        {/* Budget alternative if available */}
                        {piece.budgetAlternative && (
                          <div className="flex items-center justify-between bg-slate-950/80 border border-fuchsia-950 px-3 py-1.5 rounded-lg text-xs">
                            <span className="text-slate-400 text-[11px]">
                              Value Option: <strong className="text-slate-200">{piece.budgetAlternative.name}</strong> on {piece.budgetAlternative.platform}
                            </span>
                            <span className="font-mono text-emerald-400 font-bold text-[11px]">
                              {formatCurrency(piece.budgetAlternative.price, currency)}
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
                            <span>View on {piece.platform}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Curated Pre-Set Options */}
              {planResult.curatedSets && planResult.curatedSets.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Curated Complete Set Options
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {planResult.curatedSets.map((set, sIdx) => (
                      <div key={sIdx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-white text-xs">{set.title}</h5>
                          <span className="text-xs font-mono font-bold text-fuchsia-400">
                            {formatCurrency(set.totalPrice, currency)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{set.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {set.includes.map((inc, iIdx) => (
                            <span key={iIdx} className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                              {inc}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Styling & Care Advice */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-pink-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Jewelry Stylist &amp; Preservation Advice</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {planResult.stylingAdvice.map((adv, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-pink-400 mt-0.5">•</span>
                      <span>{adv}</span>
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
