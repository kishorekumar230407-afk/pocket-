import React from 'react';
import { X, Cpu, Layers, CheckCircle2, HardDrive, Monitor, Globe, Code2, Sparkles, Terminal } from 'lucide-react';

interface ArchitectureInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureInfoModal: React.FC<ArchitectureInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const epics = [
    { id: 'EPIC-1', title: 'Cross-Platform Recommendation Engine', tasks: '2 Tasks (API aggregator, platform ranking)' },
    { id: 'EPIC-2', title: 'Scenario 1: Home Interior Smart Budget Allocator', tasks: '2 Tasks (Room configurator, IKEA/Amazon pricing)' },
    { id: 'EPIC-3', title: 'Scenario 2: AI Party & Event Planner', tasks: '2 Tasks (Proportional 5-pillar allocation, Swiggy/Zomato/OYO)' },
    { id: 'EPIC-4', title: 'Scenario 3: Occasion Jewelry & Vision Stylist', tasks: '2 Tasks (Outfit image vision, CaratLane/Tanishq matching)' },
    { id: 'EPIC-5', title: 'Gemini 3.8 Flash & Multimodal Vision Integration', tasks: '2 Tasks (Server SDK proxy, prompt engineering & schemas)' },
    { id: 'EPIC-6', title: 'Real-Time Co-Pilot Tuning & Assistant Chat', tasks: '2 Tasks (Chat interface, budget trade-off refinement)' },
    { id: 'EPIC-7', title: 'Dynamic Multi-Currency & Financial Health Visualizer', tasks: '2 Tasks (INR/USD/EUR conversion, surplus meter)' },
    { id: 'EPIC-8', title: 'Offline Persistence, Print & PDF Exporting', tasks: '2 Tasks (LocalStorage caching, print styling & checklist)' },
  ];

  const systemRequirements = [
    { label: 'Processor', value: 'Intel Core i5 or equivalent (minimum required)' },
    { label: 'System Memory (RAM)', value: '4 GB RAM (8 GB recommended for multitasking)' },
    { label: 'Storage', value: '128 GB SSD or 128 GB HDD' },
    { label: 'Internet Connectivity', value: 'High-speed internet (minimum 10 Mbps per system)' },
    { label: 'Browser', value: 'Google Chrome, Mozilla Firefox, or Microsoft Edge' },
    { label: 'Development IDE & Tools', value: 'Visual Studio Code, Git, Node.js / Python FastAPI runtime' },
  ];

  const skillsStack = [
    'Gemini 3.8 Flash',
    'Generative AI',
    'Multimodal Vision',
    'Google APIs',
    'JavaScript / TypeScript',
    'HTML5 / CSS3 / Tailwind',
    'FastAPI / Express Server',
    'Jinja / React Templates',
    'API Integration',
    'Mentor Guidance',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Technical Architecture &amp; Project Stats</h3>
              <p className="text-xs text-slate-400">PocketSmart AI Specifications &amp; Requirements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Epics</span>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">8</div>
            <span className="text-[10px] text-slate-500">Core functional epics</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Tasks</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">16</div>
            <span className="text-[10px] text-slate-500">Production stories</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">GenAI Core</span>
            <div className="text-base font-bold text-amber-400 font-mono mt-1">Gemini 3.8</div>
            <span className="text-[10px] text-slate-500">Flash &amp; Vision</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Cross-Platform</span>
            <div className="text-base font-bold text-purple-400 font-mono mt-1">7+ Vendors</div>
            <span className="text-[10px] text-slate-500">IKEA, Amazon, OYO...</span>
          </div>
        </div>

        {/* 8 Epics & 16 Tasks Overview */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>8 Epics &amp; 16 Subtasks Breakdown</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {epics.map((ep) => (
              <div key={ep.id} className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">
                    <span className="font-mono text-cyan-400 mr-1.5">{ep.id}:</span>
                    {ep.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{ep.tasks}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Requirements */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>System Requirements</span>
          </h4>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 divide-y divide-slate-800/80 text-xs">
            {systemRequirements.map((req, idx) => (
              <div key={idx} className="py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 first:pt-0 last:pb-0">
                <span className="text-slate-400 font-medium">{req.label}</span>
                <span className="text-slate-200 font-semibold">{req.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Required Skills & Technologies */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>Skills &amp; Technology Stack</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {skillsStack.map((sk) => (
              <span key={sk} className="text-[11px] bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-md">
                {sk}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close Specifications
          </button>
        </div>
      </div>
    </div>
  );
};
