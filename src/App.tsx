import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePlanner } from './components/HomePlanner';
import { PartyPlanner } from './components/PartyPlanner';
import { JewelryPlanner } from './components/JewelryPlanner';
import { CoPilotDrawer } from './components/CoPilotDrawer';
import { SavedPlansModal } from './components/SavedPlansModal';
import { ArchitectureInfoModal } from './components/ArchitectureInfoModal';
import { Currency, SavedPlan } from './types';
import {
  Sparkles,
  Bot,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  ShoppingBag
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'party' | 'jewelry'>('home');
  const [currency, setCurrency] = useState<Currency>('INR');
  
  // Saved plans state
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => {
    try {
      const stored = localStorage.getItem('pocketsmart_saved_plans');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  // Co-Pilot state
  const [isCoPilotOpen, setIsCoPilotOpen] = useState(false);
  const [coPilotContext, setCoPilotContext] = useState<{ scenario: string; plan: any }>({
    scenario: 'Home Interior',
    plan: null,
  });

  useEffect(() => {
    try {
      localStorage.setItem('pocketsmart_saved_plans', JSON.stringify(savedPlans));
    } catch (e) {
      console.error('Failed to sync saved plans to localStorage', e);
    }
  }, [savedPlans]);

  const handleSavePlan = (
    scenario: 'home' | 'party' | 'jewelry',
    title: string,
    budget: number,
    cost: number,
    data: any
  ) => {
    const newPlan: SavedPlan = {
      id: `plan-${Date.now()}`,
      scenario,
      title,
      timestamp: Date.now(),
      budget,
      currency,
      totalEstimatedCost: cost,
      data,
    };
    setSavedPlans([newPlan, ...savedPlans]);
    setIsSavedModalOpen(true);
  };

  const handleDeletePlan = (id: string) => {
    setSavedPlans(savedPlans.filter((p) => p.id !== id));
  };

  const handleLoadPlan = (plan: SavedPlan) => {
    setActiveTab(plan.scenario);
    setCurrency(plan.currency);
  };

  const handleOpenCoPilot = (scenario: string, plan: any) => {
    setCoPilotContext({ scenario, plan });
    setIsCoPilotOpen(true);
  };

  const handleSelectPreset = (presetId: string) => {
    if (presetId.startsWith('home')) {
      setActiveTab('home');
    } else if (presetId.startsWith('party')) {
      setActiveTab('party');
    } else if (presetId.startsWith('jewelry')) {
      setActiveTab('jewelry');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        savedPlansCount={savedPlans.length}
        onOpenSavedPlans={() => setIsSavedModalOpen(true)}
        onOpenArchModal={() => setIsArchModalOpen(true)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-10">
        {/* Dynamic Scenario Planner View */}
        {activeTab === 'home' && (
          <HomePlanner
            currency={currency}
            onSavePlan={handleSavePlan}
            onOpenCoPilot={handleOpenCoPilot}
          />
        )}

        {activeTab === 'party' && (
          <PartyPlanner
            currency={currency}
            onSavePlan={handleSavePlan}
            onOpenCoPilot={handleOpenCoPilot}
          />
        )}

        {activeTab === 'jewelry' && (
          <JewelryPlanner
            currency={currency}
            onSavePlan={handleSavePlan}
            onOpenCoPilot={handleOpenCoPilot}
          />
        )}

        {/* Value Proposition Badges */}
        <div className="pt-6 border-t border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Proportional Budget Allocation
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Gemini 3.8 calculates exact percentage caps across core furniture, event catering, or jewelry metals to prevent unexpected deficits.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Cross-Platform Real Sourcing
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Seamlessly bridges IKEA, Amazon, Flipkart, Swiggy, Zomato, and OYO with direct deep-search links for 1-click purchasing.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Multimodal Vision Styling
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Upload outfit photographs to let Gemini examine fabric hues, collar geometries, and undertones for bespoke jewelry matching.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Co-Pilot Action Button */}
      <button
        onClick={() => handleOpenCoPilot(activeTab === 'home' ? 'Home Interior' : activeTab === 'party' ? 'Party Planner' : 'Occasion Jewelry', null)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-4 py-3 rounded-full shadow-2xl shadow-emerald-500/30 flex items-center gap-2 text-xs transition-transform hover:scale-105 cursor-pointer no-print"
      >
        <Bot className="w-4 h-4 text-slate-950" />
        <span>Ask Budget Co-Pilot</span>
      </button>

      {/* Modals & Drawers */}
      <CoPilotDrawer
        isOpen={isCoPilotOpen}
        onClose={() => setIsCoPilotOpen(false)}
        scenarioType={coPilotContext.scenario}
        currentPlan={coPilotContext.plan}
        currency={currency}
      />

      <SavedPlansModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        plans={savedPlans}
        onDeletePlan={handleDeletePlan}
        onLoadPlan={handleLoadPlan}
        currency={currency}
      />

      <ArchitectureInfoModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950/80 py-8 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">PocketSmart AI</span>
            <span>—</span>
            <span>Your Smart Budget &amp; Recommendation Assistant</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap text-[11px]">
            <span>Supported Platforms:</span>
            <span className="text-slate-400">Amazon</span>
            <span className="text-slate-400">Flipkart</span>
            <span className="text-slate-400">IKEA</span>
            <span className="text-slate-400">Swiggy</span>
            <span className="text-slate-400">Zomato</span>
            <span className="text-slate-400">OYO</span>
            <span className="text-slate-400">CaratLane</span>
            <span className="text-slate-400">Pepperfry</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
