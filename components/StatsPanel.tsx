
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList, LineChart, Line } from 'recharts';
import { HistoryData, Language } from '../types';
import { translations } from '../translations';

interface StatsPanelProps {
  habitPerformanceData: { name: string; count: number }[];
  totalReports: number;
  dateRange: string;
  history: HistoryData;
  habitNames: string[];
  lang: Language;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ habitPerformanceData, totalReports, dateRange, history, habitNames, lang }) => {
  const [selectedHabit, setSelectedHabit] = useState<string>('overview');
  const t = translations[lang];

  const dailyDataForHabit = useMemo(() => {
    if (selectedHabit === 'overview') return null;

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayData = history[dateStr];
      const task = dayData?.tasks.find(t => t.label === selectedHabit);
      
      return {
        date: d.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', { weekday: 'narrow' }),
        fullDate: d.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', { day: 'numeric', month: 'short' }),
        score: task ? task.score : 0,
        status: task ? (task.score === 4 ? '🔥' : task.score === 3 ? '🟢' : task.score === 2 ? '🟡' : task.score === 1 ? '🟠' : '🔴') : '⚪'
      };
    });
  }, [selectedHabit, history, lang]);

  const chartMinWidth = Math.max(habitPerformanceData.length * 50, 600);

  return (
    <div className="bg-white rounded-[2.5rem] p-4 md:p-8 shadow-sm border border-slate-100 mb-10 overflow-hidden animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 px-2">
        <div className="flex-1">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{t.deepPersistenceAnalysis}</h3>
          <p className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-[0.2em]">{dateRange}</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 text-center">
             <span className="text-[9px] font-black text-slate-400 block mb-0.5">{t.reports}</span>
             <span className="text-xl font-black text-indigo-600">{totalReports}</span>
           </div>
        </div>
      </div>

      <div className="mb-8 px-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedHabit('overview')}
            className={`whitespace-nowrap px-5 py-3 rounded-2xl text-[10px] font-black transition-all ${selectedHabit === 'overview' ? 'bg-[#1a1f2c] text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            {t.overviewAverage}
          </button>
          {habitNames.map((name, i) => (
            <button
              key={i}
              onClick={() => setSelectedHabit(name)}
              className={`whitespace-nowrap px-5 py-3 rounded-2xl text-[10px] font-black transition-all ${selectedHabit === name ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div style={{ minWidth: selectedHabit === 'overview' ? `${chartMinWidth}px` : '100%', height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            {selectedHabit === 'overview' ? (
              <BarChart data={habitPerformanceData} margin={{ top: 20, right: 20, left: -20, bottom: 90 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" angle={-45} textAnchor="end" interval={0} height={100}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b', fontFamily: lang === 'fa' ? 'Vazirmatn' : 'sans-serif' }} 
                  stroke="#e2e8f0"
                />
                <YAxis domain={[0, 7]} ticks={[0, 1, 2, 3, 4, 5, 6, 7]} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} stroke="#e2e8f0" />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 10 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#1a1f2c] text-white p-4 rounded-3xl shadow-2xl border border-white/10 z-50">
                          <p className="text-[11px] font-bold mb-2 opacity-60 leading-tight">{payload[0].payload.name}</p>
                          <span className="text-lg font-black text-emerald-400">{payload[0].value} <span className="text-[10px] text-slate-500">{t.unitOfSeven}</span></span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={30}>
                  {habitPerformanceData.map((entry, index) => {
                    let color = '#e2e8f0';
                    if (entry.count >= 6) color = '#6366f1';
                    else if (entry.count >= 4) color = '#10b981';
                    else if (entry.count >= 2.5) color = '#eab308';
                    else if (entry.count > 0) color = '#f97316';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                  <LabelList dataKey="count" position="top" style={{ fontSize: '9px', fontWeight: '900', fill: '#94a3b8' }} formatter={(val: number) => val > 0 ? val : ''} />
                </Bar>
              </BarChart>
            ) : (
              <LineChart data={dailyDataForHabit!} margin={{ top: 20, right: 30, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fontWeight: 900, fill: '#64748b', fontFamily: lang === 'fa' ? 'Vazirmatn' : 'sans-serif' }} 
                  stroke="#e2e8f0"
                />
                <YAxis 
                  domain={[0, 4]} 
                  ticks={[0, 1, 2, 3, 4]}
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                  stroke="#e2e8f0"
                  formatter={(val: number) => {
                    if (val === 4) return '🔥';
                    if (val === 3) return '🟢';
                    if (val === 2) return '🟡';
                    if (val === 1) return '🟠';
                    return '🔴';
                  }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1a1f2c] text-white p-4 rounded-3xl shadow-2xl border border-white/10 z-50 text-center">
                          <p className="text-[11px] font-bold mb-1 opacity-60">{data.fullDate}</p>
                          <div className="text-2xl mb-1">{data.status}</div>
                          <p className="text-[10px] font-black uppercase text-indigo-400">{t.performanceLevel}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-6 border-t border-slate-50 pt-8">
          {selectedHabit === 'overview' ? (
            <>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#6366f1]"></div><span className="text-[10px] font-black text-slate-600">{t.mastery}</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div><span className="text-[10px] font-black text-slate-600">{t.stability}</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#eab308]"></div><span className="text-[10px] font-black text-slate-600">{t.midLevel}</span></div>
            </>
          ) : (
            <p className="text-[11px] font-bold text-slate-400">{t.dailyPerformanceTrend(selectedHabit)}</p>
          )}
      </div>
    </div>
  );
};

export default StatsPanel;
