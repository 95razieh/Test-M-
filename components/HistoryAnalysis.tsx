
import React, { useMemo, useState } from 'react';
import { HistoryData, DayProgress, UserProfile } from '../types';
import { getPeriodicAIAnalysis } from '../services/geminiService';
import { translations } from '../translations';

interface HistoryAnalysisProps {
  history: HistoryData;
  profile: UserProfile;
}

const HistoryAnalysis: React.FC<HistoryAnalysisProps> = ({ history, profile }) => {
  const [aiReport, setAiReport] = useState<{ type: string; content: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const lang = profile.language || 'fa';
  const t = translations[lang];

  const stats = useMemo(() => {
    const allEntries = (Object.entries(history) as [string, DayProgress][]).sort((a, b) => b[0].localeCompare(a[0]));
    if (allEntries.length === 0) return null;

    const calculateWeightedScore = (data: DayProgress) => {
      const totalPossible = data.tasks.reduce((sum, t) => sum + (t.weight * 4), 0);
      const current = data.tasks.reduce((sum, t) => sum + (t.weight * t.score), 0);
      return (current / (totalPossible || 1)) * 100;
    };

    const now = new Date();
    const monthEntries = allEntries.filter(([date]) => {
      const d = new Date(date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthAvg = monthEntries.reduce((acc, [_, data]) => acc + calculateWeightedScore(data), 0) / (monthEntries.length || 1);

    const allAvg = allEntries.reduce((acc, [_, data]) => acc + calculateWeightedScore(data), 0) / allEntries.length;

    const bestDay = [...allEntries].sort((a, b) => calculateWeightedScore(b[1]) - calculateWeightedScore(a[1]))[0];

    return {
      monthAvg: Math.round(monthAvg),
      allAvg: Math.round(allAvg),
      monthCount: monthEntries.length,
      bestDayScore: bestDay ? Math.round(calculateWeightedScore(bestDay[1])) : 0
    };
  }, [history]);

  const handleFetchAiReport = async (type: 'monthly' | 'all') => {
    setLoading(true);
    setAiReport(null);
    try {
      const content = await getPeriodicAIAnalysis(type === 'monthly' ? 'monthly' : 'all', history, profile);
      setAiReport({ 
        type: type === 'monthly' ? t.monthlySmartReport : t.fullPeriodAnalysis, 
        content 
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!stats) return null;

  return (
    <div className="space-y-6 mb-10 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1a1f2c] rounded-[2rem] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.currentMonthPerformance}</span>
            <div className="flex items-end gap-2 mt-2">
              <h4 className="text-4xl font-black text-white">{stats.monthAvg}%</h4>
              <span className="text-[10px] font-bold mb-1.5 text-slate-500">({t.daysCount(stats.monthCount)})</span>
            </div>
          </div>
          <button 
            onClick={() => handleFetchAiReport('monthly')}
            className="mt-4 text-[10px] font-black bg-white/10 text-white py-2 rounded-xl hover:bg-white/20 transition-all border border-white/5"
          >
            {t.monthlySmartReport}
          </button>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t.cumulativePeriod}</span>
            <h4 className="text-4xl font-black text-[#1a1f2c] mt-2">{stats.allAvg}%</h4>
          </div>
          <button 
            onClick={() => handleFetchAiReport('all')}
            className="mt-4 text-[10px] font-black bg-emerald-50 text-emerald-600 py-2 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
          >
            {t.fullPeriodAnalysis}
          </button>
        </div>
      </div>

      {(loading || aiReport) && (
        <div className="bg-[#1a1f2c] rounded-[2.5rem] p-8 text-white shadow-2xl animate-slide-up border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                  <span className="animate-pulse">💎</span>
                </div>
                <h3 className="font-black text-lg">{aiReport?.type || t.fetchingPatterns}</h3>
              </div>
              {aiReport && (
                <button onClick={() => setAiReport(null)} className="text-slate-500 hover:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                <div className="h-3 bg-white/5 rounded-full w-full animate-pulse"></div>
                <div className="h-3 bg-white/5 rounded-full w-5/6 animate-pulse"></div>
                <div className="h-3 bg-white/5 rounded-full w-4/6 animate-pulse"></div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium italic">
                  {aiReport?.content}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryAnalysis;
