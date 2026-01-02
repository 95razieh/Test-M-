
import React from 'react';
import { Language, CoachTone } from '../types';
import { translations } from '../translations';

interface DailyBriefingProps {
  content: string;
  loading: boolean;
  onClose: () => void;
  lang: Language;
  tone?: CoachTone;
}

const DailyBriefing: React.FC<DailyBriefingProps> = ({ content, loading, onClose, lang, tone }) => {
  const t = translations[lang] || translations.fa;
  if (!content && !loading) return null;

  const isPythonic = tone === 'pythonic';

  return (
    <div className="mt-8 mb-12 animate-slide-up">
      <div className={`${isPythonic ? 'bg-[#0d1117] border-[#30363d]' : 'bg-[#1a1f2c] border-indigo-500/30'} rounded-[2rem] p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border`}>
        {!isPythonic && (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </>
        )}
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${isPythonic ? 'bg-[#161b22] border-[#30363d]' : 'bg-white/10 border-white/10'} rounded-2xl flex items-center justify-center backdrop-blur-sm border`}>
                <span className={`text-2xl ${loading ? 'animate-pulse' : ''}`}>{isPythonic ? '🐍' : '✨'}</span>
              </div>
              <div>
                <h3 className={`text-xl font-black ${isPythonic ? 'font-mono text-emerald-400' : ''}`}>{isPythonic ? 'mane_no_coach.analyze()' : t.coachAnalysisTitle}</h3>
                <p className={`text-[10px] ${isPythonic ? 'font-mono text-slate-500' : 'text-indigo-300'} font-bold uppercase tracking-widest mt-1`}>{isPythonic ? '# personal evolution logic' : t.personalGuide}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="space-y-4 py-4">
              <div className={`h-4 ${isPythonic ? 'bg-emerald-500/10' : 'bg-white/10'} rounded-full w-3/4 animate-pulse`}></div>
              <div className={`h-4 ${isPythonic ? 'bg-emerald-500/10' : 'bg-white/10'} rounded-full w-full animate-pulse`}></div>
              <div className={`h-4 ${isPythonic ? 'bg-emerald-500/10' : 'bg-white/10'} rounded-full w-5/6 animate-pulse`}></div>
              <p className={`text-center text-xs ${isPythonic ? 'font-mono text-emerald-500/60' : 'text-slate-400 font-bold'} mt-4`}>{isPythonic ? '>>> [COMPILING GROWTH DATA...]' : t.findingPatterns}</p>
            </div>
          ) : (
            <div className={`prose prose-invert max-w-none ${isPythonic ? 'font-mono' : ''}`}>
              <div className={`${isPythonic ? 'bg-[#161b22] p-6 rounded-xl border border-[#30363d] text-emerald-100' : 'text-slate-200'} leading-relaxed text-sm md:text-base whitespace-pre-wrap`}>
                {content}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${isPythonic ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
              ))}
            </div>
            <p className={`text-[10px] font-black italic ${isPythonic ? 'font-mono text-emerald-900' : 'text-slate-500'}`}>{isPythonic ? 'return success' : t.futureMotto}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyBriefing;
