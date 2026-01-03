
import React, { useState, useMemo } from 'react';
import { UserProfile, HabitTask, HabitCategory, Language } from './types';
import { DEFAULT_HABITS, MOCK_COMMUNITIES } from './constants';
import { getAIHabitSuggestions } from './services/geminiService';
import { translations } from './translations';

interface OnboardingViewProps {
  onComplete: (profile: UserProfile, initialHabits: Omit<HabitTask, 'id' | 'score'>[], joinedGroupIds: string[]) => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0); 
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [syncingHealth, setSyncingHealth] = useState(false);
  const [suggestedHabits, setSuggestedHabits] = useState<Omit<HabitTask, 'id' | 'score'>[]>([]);
  const [selectedHabitLabels, setSelectedHabitLabels] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  
  const [birthYear, setBirthYear] = useState('1370');
  const [birthMonth, setBirthMonth] = useState('01');
  const [birthDay, setBirthDay] = useState('01');

  const [profile, setProfile] = useState<UserProfile>({
    id: `user-${Date.now()}`,
    name: '', lastName: '', telegramId: '', preferredName: '', job: '', city: '', birthDate: '', onboarded: false, motto: '', language: 'fa',
    biometrics: { gender: 'male', medicalHistory: '', weight: 75, height: 175 },
    superiorSelf: { vision: '', blooming: '', identity: '', lifestyle: '', habits: '' },
    coins: 0,
    coachTone: 'scientific',
    friends: [],
    weightHistory: []
  });

  const lang = profile.language;
  const isFa = lang === 'fa';
  const t = translations[lang] || translations.fa;
  const currentDefaultHabits = DEFAULT_HABITS[lang] || DEFAULT_HABITS.fa;
  const currentMockCommunities = MOCK_COMMUNITIES[lang] || MOCK_COMMUNITIES.fa;

  const JALALI_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
  const GREGORIAN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const groupedHabits = useMemo(() => {
    const combined = [...suggestedHabits, ...currentDefaultHabits];
    const unique = combined.filter((v, i, a) => a.findIndex(t => t.label === v.label) === i);
    
    const groups: Record<HabitCategory, Omit<HabitTask, 'id' | 'score'>[]> = {
      [HabitCategory.HEALTH]: [],
      [HabitCategory.MINDSET]: [],
      [HabitCategory.ROUTINE]: [],
      [HabitCategory.DIET]: [],
      [HabitCategory.COMMUNITY]: [],
    };

    unique.forEach(h => {
      if (groups[h.category]) groups[h.category].push(h);
    });
    return groups;
  }, [suggestedHabits, currentDefaultHabits]);

  const nextStep = () => {
    if (step === 3) handleFetchSuggestions();
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFetchSuggestions = async () => {
    if (!profile.superiorSelf.vision) return;
    setLoadingSuggestions(true);
    try {
      const suggestions = await getAIHabitSuggestions(profile.superiorSelf, lang);
      if (suggestions && suggestions.length > 0) {
        setSuggestedHabits(suggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const simulateHealthSync = () => {
    setSyncingHealth(true);
    setTimeout(() => {
      setProfile(prev => ({
        ...prev,
        biometrics: { ...prev.biometrics, weight: 78, height: 182 }
      }));
      setSyncingHealth(false);
    }, 2000);
  };

  const handleFinish = () => {
    const combinedTemplates = [...suggestedHabits, ...currentDefaultHabits];
    const uniqueTemplates = combinedTemplates.filter((v, i, a) => a.findIndex(t => t.label === v.label) === i);
    const finalHabits = uniqueTemplates.filter(h => selectedHabitLabels.includes(h.label));
    
    onComplete({ 
      ...profile, 
      birthDate: `${birthYear}/${birthMonth}/${birthDay}`,
      onboarded: true 
    }, finalHabits, selectedGroupIds);
  };

  const toggleHabit = (label: string) => {
    setSelectedHabitLabels(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  return (
    <div className={`min-h-screen bg-white flex flex-col items-center justify-start py-8 px-6 md:p-12 animate-fade-in ${isFa ? 'font-vazir' : 'font-sans'}`} dir={isFa ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-xl flex flex-col min-h-[85vh]">
        {step > 0 && (
          <div className="flex gap-1 mb-10 shrink-0">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
            ))}
          </div>
        )}

        <div className="flex-1 flex flex-col">
          {step === 0 && (
            <div className="animate-slide-up space-y-8 text-center pt-16">
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">Choose your language</h2>
              <h2 className="text-3xl font-black text-slate-700 mt-2">زبان خود را انتخاب کنید</h2>
              <div className="grid gap-4 pt-8">
                <button onClick={() => { setProfile({...profile, language: 'fa'}); setStep(1); }} className="p-8 rounded-[2.5rem] border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-between group">
                  <span className="text-2xl font-black text-slate-800">فارسی</span>
                  <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">🇮🇷</span>
                </button>
                <button onClick={() => { setProfile({...profile, language: 'en'}); setStep(1); }} className="p-8 rounded-[2.5rem] border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-between group">
                  <span className="text-2xl font-black text-slate-800">English</span>
                  <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">🇬🇧</span>
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-slide-up space-y-6">
              <h2 className="text-4xl font-black text-slate-800 leading-tight">{isFa ? 'به «مَنِ نو» خوش اومدی' : 'Welcome to Mane No'}</h2>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <input placeholder={isFa ? "نام (اختیاری)" : "First Name"} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="bg-slate-50 border-none rounded-2xl p-5 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500" />
                <input placeholder={isFa ? "نام خانوادگی (اختیاری)" : "Last Name"} value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="bg-slate-50 border-none rounded-2xl p-5 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest px-1">{t.preferredNameLabel}</label>
                <input 
                  placeholder={t.preferredNamePlaceholder} 
                  value={profile.preferredName} 
                  onChange={e => setProfile({...profile, preferredName: e.target.value})} 
                  className="w-full bg-[#1a1f2c] text-white rounded-2xl p-5 font-black placeholder:text-white/30 focus:ring-2 focus:ring-indigo-500 shadow-xl" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest px-1">{t.telegramId}</label>
                <input 
                  placeholder={t.telegramIdPlaceholder} 
                  value={profile.telegramId} 
                  onChange={e => setProfile({...profile, telegramId: e.target.value})} 
                  className="w-full bg-indigo-50 border-2 border-dashed border-indigo-100 rounded-2xl p-5 font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input placeholder={isFa ? "شغل (اختیاری)" : "Job"} value={profile.job} onChange={e => setProfile({...profile, job: e.target.value})} className="bg-slate-50 border-none rounded-2xl p-5 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500" />
                <input placeholder={isFa ? "شهر (اختیاری)" : "City"} value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} className="bg-slate-50 border-none rounded-2xl p-5 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-3 uppercase tracking-widest">{isFa ? 'تاریخ تولد (شمسی)' : 'Birth Date'}</label>
                <div className="grid grid-cols-3 gap-2">
                  <select value={birthDay} onChange={e => setBirthDay(e.target.value)} className="bg-slate-50 rounded-2xl p-5 font-bold border-none appearance-none cursor-pointer">
                    {Array.from({length: 31}, (_, i) => (i + 1).toString().padStart(2, '0')).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)} className="bg-slate-50 rounded-2xl p-5 font-bold border-none appearance-none cursor-pointer">
                    {(isFa ? JALALI_MONTHS : GREGORIAN_MONTHS).map((m, i) => <option key={i} value={(i + 1).toString().padStart(2, '0')}>{m}</option>)}
                  </select>
                  <select value={birthYear} onChange={e => setBirthYear(e.target.value)} className="bg-slate-50 rounded-2xl p-5 font-bold border-none appearance-none cursor-pointer">
                    {Array.from({length: 80}, (_, i) => (isFa ? 1403 - i : 2024 - i).toString()).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-up space-y-8">
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">{isFa ? 'شناخت وضعیت فعلی' : 'Current Status'}</h2>
              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-xs font-black text-slate-400 block mb-4 uppercase tracking-widest">{isFa ? 'جنسیت' : 'Gender'}</label>
                  <div className="flex gap-3">
                    {(['male', 'female', 'other'] as const).map(g => (
                      <button key={g} onClick={() => setProfile({...profile, biometrics: {...profile.biometrics, gender: g}})} className={`flex-1 py-5 rounded-2xl font-black text-sm border transition-all ${profile.biometrics.gender === g ? 'bg-[#1a1f2c] border-[#1a1f2c] text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                        {g === 'male' ? (isFa ? 'مرد' : 'Male') : g === 'female' ? (isFa ? 'زن' : 'Female') : (isFa ? 'سایر' : 'Other')}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={simulateHealthSync} disabled={syncingHealth} className={`w-full p-8 rounded-[2.5rem] border-2 border-dashed transition-all flex items-center justify-center gap-6 ${syncingHealth ? 'bg-indigo-50 border-indigo-200 animate-pulse' : 'bg-white border-slate-100 hover:bg-indigo-50/30'}`}>
                  {syncingHealth ? <div className="animate-spin w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full" /> : <span className="text-4xl">📱</span>}
                  <div className={isFa ? 'text-right' : 'text-left'}>
                    <p className="font-black text-base text-indigo-600">{isFa ? 'اتصال به Health App' : 'Connect to Health App'}</p>
                    <p className="text-xs text-slate-400 font-bold">{isFa ? 'فراخوانی خودکار قد و وزن' : 'Auto-fetch weight & height'}</p>
                  </div>
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{isFa ? 'قد (cm)' : 'Height (cm)'}</label>
                    <input type="number" placeholder="175" value={profile.biometrics.height || ''} onChange={e => setProfile({...profile, biometrics: {...profile.biometrics, height: Number(e.target.value)}})} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-black text-slate-800 text-center" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{isFa ? 'وزن (kg)' : 'Weight (kg)'}</label>
                    <input type="number" placeholder="75" value={profile.biometrics.weight || ''} onChange={e => setProfile({...profile, biometrics: {...profile.biometrics, weight: Number(e.target.value)}})} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-black text-slate-800 text-center" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-up space-y-6 flex flex-col h-full">
              <h2 className="text-4xl font-black text-slate-800 leading-tight">{t.onboardingStep3VisionTitle}</h2>
              <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50">
                <p className="text-slate-600 font-bold leading-relaxed text-sm">{t.onboardingStep3VisionDesc}</p>
              </div>
              <div className="flex-1 space-y-4 pt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">{t.vision}</label>
                  <textarea 
                    value={profile.superiorSelf.vision} 
                    onChange={e => setProfile({...profile, superiorSelf: {...profile.superiorSelf, vision: e.target.value}})} 
                    className="w-full bg-slate-50 border-none rounded-[2rem] p-6 font-medium text-slate-800 min-h-[160px] md:min-h-[200px] resize-none focus:ring-2 focus:ring-indigo-500 shadow-inner" 
                    placeholder={t.onboardingStep3VisionPlaceholder} 
                  />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">{isFa ? 'شعار' : 'Motto'}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none opacity-40">
                      <span className="text-xl">✨</span>
                    </div>
                    <input 
                      placeholder={t.onboardingStep3MottoPlaceholder} 
                      value={profile.motto} 
                      onChange={e => setProfile({...profile, motto: e.target.value})} 
                      className={`w-full bg-[#1a1f2c] text-white border-none rounded-2xl p-5 font-black placeholder:text-white/40 shadow-xl ${isFa ? 'pr-12' : 'pl-12'}`} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-slide-up space-y-6 overflow-hidden">
              <div className="shrink-0">
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">{t.onboardingStep4Title}</h2>
                <p className="text-slate-500 font-bold mt-2 text-sm leading-relaxed">
                  {isFa 
                    ? 'بر اساس هویت هدف شما، این عادت‌ها بهترین مسیر برای تحول هستند:' 
                    : 'Based on your target identity, these habits are the best path for your transformation:'}
                </p>
              </div>
              
              <div className="space-y-10 overflow-y-auto pr-2 scrollbar-hide flex-1 max-h-[450px] pb-10">
                {loadingSuggestions && (
                  <div className="p-10 bg-indigo-50/50 rounded-[2.5rem] text-center border-2 border-dashed border-indigo-100 flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                      {isFa ? 'مربی در حال طراحی پیشنهادات اختصاصی...' : 'Coach is designing custom suggestions...'}
                    </span>
                  </div>
                )}

                {(Object.keys(groupedHabits) as HabitCategory[]).map(category => {
                  const habitsInCategory = groupedHabits[category];
                  if (habitsInCategory.length === 0) return null;

                  const categoryThemes = {
                    [HabitCategory.HEALTH]: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
                    [HabitCategory.MINDSET]: { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700' },
                    [HabitCategory.ROUTINE]: { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700' },
                    [HabitCategory.DIET]: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700' },
                    [HabitCategory.COMMUNITY]: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700' },
                  };

                  const theme = categoryThemes[category];

                  return (
                    <div key={category} className="space-y-4">
                      <div className={`px-4 py-2 rounded-2xl inline-block text-[10px] font-black uppercase tracking-widest border ${theme.bg} ${theme.border} ${theme.text}`}>
                        {t.categories[category]}
                      </div>
                      <div className="grid gap-3">
                        {habitsInCategory.map((h, i) => {
                          const isSelected = selectedHabitLabels.includes(h.label);
                          const isAI = suggestedHabits.some(sh => sh.label === h.label);
                          return (
                            <button 
                              key={i} 
                              onClick={() => toggleHabit(h.label)} 
                              className={`p-6 rounded-[2rem] border transition-all duration-300 flex items-center justify-between text-right group ${isSelected ? 'bg-[#1a1f2c] border-[#1a1f2c] text-white shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 hover:bg-slate-50 shadow-sm'}`}
                            >
                               <div className={`flex flex-col ${isFa ? 'text-right' : 'text-left'}`}>
                                 <div className="flex items-center gap-2 mb-1">
                                   {isAI && !isSelected && <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-black">AI ✨</span>}
                                   <span className={`font-bold text-sm leading-snug ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                     {h.label}
                                   </span>
                                 </div>
                               </div>
                               <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500 border-indigo-400 shadow-inner' : 'border-slate-100 bg-slate-50'}`}>
                                 {isSelected ? <span className="text-white">✓</span> : <span className="text-slate-200">○</span>}
                               </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-slide-up space-y-6 flex flex-col h-full overflow-hidden">
              <h2 className="text-4xl font-black text-slate-800 shrink-0">{t.onboardingStep5Title}</h2>
              
              <div className="p-8 rounded-[2.5rem] bg-[#1a1f2c] text-white shadow-2xl relative overflow-hidden text-center shrink-0 border border-indigo-500/30">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <div className="relative z-10">
                    <h4 className="text-xl font-black text-white leading-tight mb-2">
                      {t.onboardingCommunityQuote}
                    </h4>
                    <p className="text-slate-400 font-bold text-xs leading-relaxed max-w-sm mx-auto">
                      {t.onboardingCommunityAction}
                    </p>
                 </div>
              </div>

              <div className="grid gap-4 overflow-y-auto pr-2 scrollbar-hide pb-10 flex-1 max-h-[400px]">
                {currentMockCommunities.map(group => {
                  const isSelected = selectedGroupIds.includes(group.id);
                  return (
                    <button 
                      key={group.id} 
                      onClick={() => setSelectedGroupIds(prev => isSelected ? prev.filter(gid => gid !== group.id) : [...prev, group.id])} 
                      className={`p-6 rounded-[2.5rem] border transition-all flex items-center justify-between group ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-100 hover:bg-slate-50 shadow-sm'}`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-4xl transition-all ${isSelected ? 'bg-white/20' : 'bg-slate-50'}`}>
                          {group.icon}
                        </div>
                        <div className={isFa ? 'text-right' : 'text-left'}>
                          <span className="font-black text-lg leading-tight block">{group.name}</span>
                          <p className={`text-[10px] font-bold ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {group.memberCount} {isFa ? 'عضو فعال' : 'active members'}
                          </p>
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-white border-white' : 'border-slate-100 bg-slate-50'}`}>
                         {isSelected ? <span className="text-indigo-600 text-xl font-black">✓</span> : <span className="text-slate-200 text-lg">○</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4 shrink-0 pb-8">
          {step > 1 && (
            <button 
              onClick={prevStep} 
              className="flex-1 py-5 rounded-[2rem] font-black text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100"
            >
              {isFa ? 'قبلی' : 'Back'}
            </button>
          )}
          {step < 5 ? (
            <button 
              onClick={nextStep} 
              disabled={
                (step === 1 && !profile.telegramId.trim()) || 
                (step === 3 && !profile.superiorSelf.vision.trim())
              } 
              className="flex-[2] py-5 rounded-[2rem] font-black text-white bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-300 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              {isFa ? 'بعدی' : 'Next'}
            </button>
          ) : (
            <button onClick={handleFinish} className="flex-[2] py-5 rounded-[2rem] font-black text-white bg-[#1a1f2c] hover:bg-slate-800 transition-all shadow-2xl">
              {isFa ? 'شروع تحول' : 'Start Journey'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingView;
