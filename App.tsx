
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { HabitTask, HistoryData, DayProgress, HabitCategory, UserProfile, Community, Language, CoachTone } from './types';
import { DEFAULT_HABITS, MOCK_COMMUNITIES } from './constants';
import ChecklistItem from './components/ChecklistItem';
import StatsPanel from './components/StatsPanel';
import AddTask from './components/AddTask';
import ProfileView from './components/ProfileView';
import CommunityView from './components/CommunityView';
import HistoryAnalysis from './components/HistoryAnalysis';
import DailyBriefing from './components/DailyBriefing';
import OnboardingView from './components/OnboardingView';
import LessonView from './components/LessonView';
import { getDailyStrategicBriefing } from './services/geminiService';
import { translations } from './translations';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'profile' | 'community' | 'lessons'>('today');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<HabitTask[]>([]);
  const [habitTemplates, setHabitTemplates] = useState<Omit<HabitTask, 'score'>[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [history, setHistory] = useState<HistoryData>({});
  const [profile, setProfile] = useState<UserProfile>({
    id: `user-${Date.now()}`,
    name: '',
    lastName: '',
    telegramId: '',
    preferredName: '', // Initialize new field
    job: '',
    city: '',
    birthDate: '',
    onboarded: false,
    motto: '',
    language: 'fa',
    coins: 0,
    coachTone: 'scientific',
    biometrics: { gender: 'male', medicalHistory: '', weight: 75, height: 175 },
    weightHistory: [],
    superiorSelf: { vision: '', blooming: '', identity: '', lifestyle: '', habits: '' },
    friends: []
  });
  
  const [dailyBrief, setDailyBrief] = useState<string>('');
  const [loadingBrief, setLoadingBrief] = useState<boolean>(false);
  const [isReporting, setIsReporting] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isInitialMount = useRef(true);
  
  const lang = profile.language || 'fa';
  const t = translations[lang];

  const addNotify = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('man_no_history_v5');
    const savedTemplates = localStorage.getItem('man_no_habit_templates_v5');
    const savedProfile = localStorage.getItem('man_no_profile_v5');
    const savedComms = localStorage.getItem('man_no_communities_v5');
    
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile({ 
        ...parsed, 
        friends: parsed.friends || [],
        weightHistory: parsed.weightHistory || [],
        preferredName: parsed.preferredName || ''
      });
    }

    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    if (savedComms) {
      setCommunities(JSON.parse(savedComms));
    } else {
      setCommunities(MOCK_COMMUNITIES[lang]);
    }

    let templates: Omit<HabitTask, 'score'>[] = [];
    if (savedTemplates) {
      templates = JSON.parse(savedTemplates);
      setHabitTemplates(templates);
    }

    const fullHistory: HistoryData = savedHistory ? JSON.parse(savedHistory) : {};
    const dayData = fullHistory[selectedDate];
    
    if (dayData && dayData.tasks && dayData.tasks.length > 0) {
      setTasks(dayData.tasks);
    } else if (templates.length > 0) {
      setTasks(templates.map(h => ({ ...h, score: 0 })));
    }

    isInitialMount.current = false;
  }, []);

  useEffect(() => {
    if (isInitialMount.current || selectedDate !== todayStr) return;
    
    const activeGroupChallenges = communities
      .filter(c => c.joined && c.dailyChallenge)
      .map(c => ({
        id: `challenge-${c.id}`,
        label: `${t.challengeTitle} ${c.dailyChallenge}`,
        category: HabitCategory.COMMUNITY,
        weight: 3,
        score: tasks.find(tk => tk.id === `challenge-${c.id}`)?.score || 0,
        isGroupChallenge: true
      }));

    setTasks(prev => {
      const withoutChallenges = prev.filter(t => !t.isGroupChallenge);
      return [...activeGroupChallenges, ...withoutChallenges];
    });
  }, [communities, selectedDate]);

  useEffect(() => {
    if (isInitialMount.current) return;
    const dayData = history[selectedDate];
    if (dayData && dayData.tasks && dayData.tasks.length > 0) {
      setTasks(dayData.tasks);
    } else {
      setTasks(habitTemplates.map(h => ({ ...h, score: 0 })));
    }
  }, [selectedDate, habitTemplates]);

  useEffect(() => {
    if (isInitialMount.current) return;
    const updatedHistory = { ...history, [selectedDate]: { date: selectedDate, tasks: tasks } };
    localStorage.setItem('man_no_history_v5', JSON.stringify(updatedHistory));
  }, [tasks, selectedDate]);

  useEffect(() => {
    if (isInitialMount.current) return;
    localStorage.setItem('man_no_habit_templates_v5', JSON.stringify(habitTemplates));
    localStorage.setItem('man_no_profile_v5', JSON.stringify(profile));
    localStorage.setItem('man_no_communities_v5', JSON.stringify(communities));
  }, [habitTemplates, profile, communities]);

  const handleOnboardingComplete = (finalProfile: UserProfile, initialHabits: Omit<HabitTask, 'id' | 'score'>[], joinedGroupIds: string[]) => {
    const habitsWithIds = initialHabits.map((h, i) => ({
      ...h,
      id: `habit-${Date.now()}-${i}`
    }));

    setProfile({
      ...finalProfile, 
      coins: 0, 
      coachTone: 'scientific',
      friends: [],
      weightHistory: finalProfile.biometrics.weight ? [{date: new Date().toISOString().split('T')[0], weight: finalProfile.biometrics.weight}] : []
    });
    setHabitTemplates(habitsWithIds);
    setTasks(habitsWithIds.map(h => ({ ...h, score: 0 })));
    
    const langSpecificComms = MOCK_COMMUNITIES[finalProfile.language];
    const updatedComms = langSpecificComms.map(c => joinedGroupIds.includes(c.id) ? { ...c, joined: true } : c);
    setCommunities(updatedComms);
    
    addNotify(translations[finalProfile.language].onboardingDesigned, 'success');
  };

  const updateTaskScore = useCallback((id: string, score: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, score } : t));
  }, []);

  const handleReward = (amount: number) => {
    setProfile(p => ({ ...p, coins: (p.coins || 0) + amount }));
    addNotify(t.correctAnswer, 'success');
  };

  const addNewHabit = (label: string, category: HabitCategory, weight: number = 1) => {
    const newHabitId = `habit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newTask: HabitTask = { label, category, weight, id: newHabitId, score: 0 };
    setTasks(prev => [...prev, newTask]);
    if (selectedDate === todayStr) {
      setHabitTemplates(prev => [...prev, { label, category, weight, id: newHabitId }]);
    }
  };

  const removeHabit = (id: string, label: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedDate === todayStr) {
      setHabitTemplates(prev => prev.filter(t => t.id !== id));
    }
    addNotify(lang === 'fa' ? 'عادت حذف شد.' : 'Habit removed.', 'info');
  };

  const editHabit = (id: string, oldLabel: string, newLabel: string, newCategory: HabitCategory, newWeight: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, label: newLabel, category: newCategory, weight: newWeight } : t));
    setHabitTemplates(prev => prev.map(t => t.id === id ? { ...t, label: newLabel, category: newCategory, weight: newWeight } : t));
  };

  const onDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newTasks = [...tasks];
    const item = newTasks[draggedItemIndex];
    newTasks.splice(draggedItemIndex, 1);
    newTasks.splice(index, 0, item);
    setDraggedItemIndex(index);
    setTasks(newTasks);
  };

  const onDragEnd = () => {
    setDraggedItemIndex(null);
    if (selectedDate === todayStr) {
      const newTemplates = tasks.map(({ id, label, category, weight }) => ({ id, label, category, weight }));
      setHabitTemplates(newTemplates);
    }
  };

  const handleUpdateCommunity = (updated: Community) => {
    setCommunities(prev => prev.map(c => c.id === updated.id ? updated : c));
    addNotify(lang === 'fa' ? 'تغییرات گروه ثبت شد.' : 'Group updated.', 'success');
  };

  const handleFinalSubmit = async () => {
    setIsReporting(true);
    setLoadingBrief(true);
    setActiveTab('history');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const brief = await getDailyStrategicBriefing(tasks, history, profile);
      setDailyBrief(brief);
    } catch (e) {
      addNotify(t.analysisError, 'error');
    } finally {
      setIsReporting(false);
      setLoadingBrief(false);
    }
  };

  const calculateEvolution = () => {
    if (tasks.length === 0) return 0;
    const totalPossible = tasks.reduce((sum, t) => sum + (t.weight * 4), 0);
    const current = tasks.reduce((sum, t) => sum + (t.weight * t.score), 0);
    return Math.round((current / (totalPossible || 1)) * 100);
  };

  const CalendarBar = () => {
    const prevDate = () => {
      const d = new Date(selectedDate); d.setDate(d.getDate() - 1);
      setSelectedDate(d.toISOString().split('T')[0]);
    };
    const nextDate = () => {
      const d = new Date(selectedDate); d.setDate(d.getDate() + 1);
      const ns = d.toISOString().split('T')[0];
      if (ns <= todayStr) setSelectedDate(ns);
    };
    const isTodaySelected = selectedDate === todayStr;
    return (
      <div className="bg-white rounded-[2rem] p-4 mb-6 shadow-sm border border-slate-100 flex items-center justify-between animate-fade-in">
        <button onClick={lang === 'fa' ? nextDate : prevDate} disabled={lang === 'fa' && isTodaySelected} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${(lang === 'fa' && isTodaySelected) ? 'bg-slate-50 text-slate-200' : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 shadow-sm'}`}><svg className={`w-6 h-6 ${lang === 'fa' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7"/></svg></button>
        <div className="text-center"><h2 className="text-lg font-black text-slate-800">{new Date(selectedDate).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>{isTodaySelected ? <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-0.5 block">{t.today}</span> : <button onClick={() => setSelectedDate(todayStr)} className="text-[10px] font-black text-indigo-500 mt-0.5">{t.backToToday}</button>}</div>
        <button onClick={lang === 'fa' ? prevDate : nextDate} disabled={lang === 'en' && isTodaySelected} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${(lang === 'en' && isTodaySelected) ? 'bg-slate-50 text-slate-200' : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 shadow-sm'}`}><svg className={`w-6 h-6 ${lang === 'fa' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg></button>
      </div>
    );
  };

  if (!profile.onboarded) return <OnboardingView onComplete={handleOnboardingComplete} />;

  return (
    <div className={`min-h-screen pb-40 px-4 md:px-8 max-w-4xl mx-auto relative ${lang === 'fa' ? 'font-vazir' : 'font-sans'}`} dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-sm z-[200] space-y-2 px-4 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-2xl shadow-2xl border text-[11px] font-black animate-slide-up flex items-center gap-3 pointer-events-auto ${n.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : n.type === 'error' ? 'bg-rose-500 border-rose-400 text-white' : 'bg-[#1a1f2c] border-slate-700 text-white'}`}><div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>{n.message}</div>
        ))}
      </div>
      <header className="py-12 flex flex-col items-center text-center">
        <h1 className="text-6xl font-black text-[#1a1f2c] mt-2 tracking-tight">{t.appName}</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">{t.tagline}</p>
        <div className="mt-4 bg-indigo-50 px-5 py-2.5 rounded-full border border-indigo-100 flex items-center gap-3 shadow-sm">
          <span className="text-2xl animate-bounce-short">🌕</span>
          <span className="text-xs font-black text-indigo-700 tracking-tighter">{profile.coins || 0} {t.wisdomCoins}</span>
        </div>
      </header>
      
      {activeTab === 'today' && (
        <>
          <CalendarBar />
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 mb-8">
            <AddTask onAdd={addNewHabit} existingLabels={tasks.map(t => t.label)} lang={lang} />
            <div className="grid gap-1 mt-4">
              {tasks.map((task, index) => (
                <ChecklistItem 
                  key={task.id} 
                  task={task} 
                  index={index} 
                  onChange={updateTaskScore} 
                  onDelete={removeHabit} 
                  onEdit={editHabit} 
                  lang={lang} 
                  onDragStart={() => onDragStart(index)} 
                  onDragOver={(e) => onDragOver(e, index)} 
                  onDragEnd={onDragEnd} 
                  isDragging={draggedItemIndex === index}
                />
              ))}
              {tasks.length === 0 && (
                <div className="p-12 text-center"><p className="text-slate-400 font-bold">{t.emptyHabits}</p></div>
              )}
            </div>
          </div>
          <div className="mt-8 mb-4">
            <button onClick={handleFinalSubmit} disabled={isReporting || tasks.length === 0} className={`w-full py-6 rounded-[2.5rem] text-xl font-black shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${isReporting ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
              {isReporting ? t.submitting : t.finalSubmit}
            </button>
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div className="animate-fade-in px-2">
          <StatsPanel 
            habitPerformanceData={habitTemplates.map(tmp => ({ 
              name: tmp.label, 
              count: parseFloat(Array.from({length:7}, (_,i) => { 
                const d = new Date(); 
                d.setDate(d.getDate() - (6-i)); 
                const entry = history[d.toISOString().split('T')[0]]; 
                const taskForDay = entry?.tasks.find(tk => tk.id === tmp.id); 
                return (taskForDay?.score === 4 ? 1 : 0); 
              }).reduce((a,b) => a+b, 0).toFixed(2)) 
            }))} 
            totalReports={Object.keys(history).length} 
            dateRange={t.transformationTrend} 
            history={history} 
            habitNames={habitTemplates.map(t => t.label)} 
            lang={lang}
          />
          <HistoryAnalysis history={history} profile={profile} />
          <DailyBriefing content={dailyBrief} loading={loadingBrief} onClose={() => setDailyBrief('')} lang={lang} />
        </div>
      )}

      {activeTab === 'lessons' && <LessonView tasks={tasks} lang={lang} onReward={handleReward} />}
      {activeTab === 'profile' && <ProfileView profile={profile} currentScore={calculateEvolution()} onUpdate={setProfile} onAddHabit={addNewHabit} lang={lang} />}
      {activeTab === 'community' && <CommunityView userTasks={tasks} communities={communities} onCreateCommunity={(c) => setCommunities(p => [...p, c])} onUpdateCommunity={handleUpdateCommunity} onToggleJoin={(id) => setCommunities(prev => prev.map(c => c.id === id ? { ...c, joined: !c.joined } : c))} currentUser={profile} />}
      
      <nav className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-lg bg-white/90 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-[3rem] p-2 flex items-center justify-between z-50`}>
        {(lang === 'fa' ? (['profile', 'community', 'today', 'lessons', 'history'] as const) : (['history', 'lessons', 'today', 'community', 'profile'] as const)).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`flex-1 flex flex-col items-center py-4 rounded-[2.5rem] transition-all duration-500 gap-1.5 ${activeTab === tab ? 'bg-[#1a1f2c] text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={
                tab === 'profile' ? "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" : 
                tab === 'today' ? "M13 10V3L4 14h7v7l9-11h-7z" : 
                tab === 'community' ? "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" : 
                tab === 'lessons' ? "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" :
                "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"}
              />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {tab === 'profile' ? t.profile : tab === 'today' ? t.today : tab === 'community' ? t.groups : tab === 'lessons' ? t.lessons : t.report}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
