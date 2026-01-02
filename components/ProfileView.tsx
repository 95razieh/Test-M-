
import React, { useState, useMemo } from 'react';
import { UserProfile, HabitCategory, Biometrics, Language, CoachTone, Friend, WeightEntry } from '../types';
import { getAIHabitSuggestions } from '../services/geminiService';
import VitruvianAvatar from './VitruvianAvatar';
import { translations } from '../translations';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ProfileViewProps {
  profile: UserProfile;
  currentScore: number;
  onUpdate: (profile: UserProfile) => void;
  onAddHabit: (label: string, category: HabitCategory) => void;
  lang: Language;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, currentScore, onUpdate, onAddHabit, lang }) => {
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeSection, setActiveSection] = useState<'id' | 'bio' | 'vision' | 'friends' | 'settings'>('id');
  const [newFriendAlias, setNewFriendAlias] = useState('');
  const [newWeight, setNewWeight] = useState<string>('');
  const t = translations[lang];

  const updateBiometrics = (data: Partial<Biometrics>) => {
    onUpdate({
      ...profile,
      biometrics: { ...profile.biometrics, ...data }
    });
  };

  const handleAddWeight = () => {
    const weightVal = parseFloat(newWeight);
    if (isNaN(weightVal)) return;

    const entry: WeightEntry = {
      date: new Date().toISOString().split('T')[0],
      weight: weightVal
    };

    const newHistory = [...(profile.weightHistory || []), entry].sort((a, b) => a.date.localeCompare(b.date));
    
    onUpdate({
      ...profile,
      biometrics: { ...profile.biometrics, weight: weightVal },
      weightHistory: newHistory
    });
    setNewWeight('');
  };

  const chartData = useMemo(() => {
    if (!profile.weightHistory || profile.weightHistory.length === 0) return [];
    return profile.weightHistory.map(entry => ({
      date: new Date(entry.date).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', { day: 'numeric', month: 'short' }),
      weight: entry.weight
    }));
  }, [profile.weightHistory, lang]);

  const handleGenerateSuggestions = async () => {
    setLoadingSuggestions(true);
    const result = await getAIHabitSuggestions(profile.superiorSelf, lang);
    setLoadingSuggestions(false);
  };

  const handleAddFriend = () => {
    if (!newFriendAlias.trim()) return;
    
    const newFriend: Friend = {
      id: `f-${Date.now()}`,
      alias: newFriendAlias,
      evolutionScore: Math.floor(Math.random() * 40) + 30,
      motto: lang === 'fa' ? 'در مسیر تحول...' : 'On the path of evolution...',
      avatar: ['👤', '🏃‍♂️', '🧘‍♀️', '🧗‍♂️', '🚴‍♀️'][Math.floor(Math.random() * 5)]
    };

    onUpdate({
      ...profile,
      friends: [...(profile.friends || []), newFriend]
    });
    setNewFriendAlias('');
  };

  const handleResetApp = () => {
    if (window.confirm(t.confirmReset)) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const isFa = lang === 'fa';
  // Prioritize showing the preferred name if available
  const displayName = profile.preferredName || (profile.name ? `${profile.name} ${profile.lastName}` : profile.telegramId);

  return (
    <div className="animate-fade-in pb-10 px-2">
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 mb-8 flex flex-col items-center">
        <VitruvianAvatar score={currentScore} />
        
        <div className="mt-8 text-center w-full">
          <h2 className="text-2xl font-black text-slate-800 text-center mb-1">
            {displayName || (isFa ? 'کاربر بدون نام' : 'Anonymous User')}
          </h2>
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="text-xs font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
              {profile.telegramId || '@username'}
            </span>
          </div>
          <input
            type="text"
            value={profile.motto}
            onChange={(e) => onUpdate({ ...profile, motto: e.target.value })}
            placeholder={isFa ? "شعار تحول..." : "Evolution motto..."}
            className="text-xs text-slate-400 text-center border-none bg-transparent focus:ring-0 w-full mt-1 font-bold"
          />
        </div>

        <div className="flex gap-1 mt-8 bg-slate-50 p-1 rounded-2xl w-full overflow-x-auto scrollbar-hide">
          {(['id', 'bio', 'vision', 'friends', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={`flex-1 min-w-[75px] py-3 rounded-xl text-[10px] font-black transition-all ${activeSection === tab ? 'bg-[#1a1f2c] text-white shadow-lg' : 'text-slate-400'}`}
            >
              {tab === 'id' ? t.identity : tab === 'bio' ? t.bio : tab === 'vision' ? t.vision : tab === 'friends' ? t.friends : t.settings}
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'id' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">👤 {t.identity}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.preferredNameLabel}</label>
                 <input 
                  type="text" 
                  value={profile.preferredName} 
                  onChange={e => onUpdate({...profile, preferredName: e.target.value})}
                  placeholder={t.preferredNamePlaceholder}
                  className="w-full bg-[#1a1f2c] text-white rounded-2xl p-4 font-black shadow-xl border-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{isFa ? 'نام' : 'First Name'}</label>
                   <input 
                    type="text" 
                    value={profile.name} 
                    onChange={e => onUpdate({...profile, name: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{isFa ? 'نام خانوادگی' : 'Last Name'}</label>
                   <input 
                    type="text" 
                    value={profile.lastName} 
                    onChange={e => onUpdate({...profile, lastName: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.telegramId}</label>
                 <input 
                  type="text" 
                  value={profile.telegramId} 
                  onChange={e => onUpdate({...profile, telegramId: e.target.value})}
                  placeholder={t.telegramIdPlaceholder}
                  className="w-full bg-indigo-50 border-none rounded-2xl p-4 font-black text-indigo-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{isFa ? 'شغل' : 'Job'}</label>
                   <input 
                    type="text" 
                    value={profile.job} 
                    onChange={e => onUpdate({...profile, job: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{isFa ? 'شهر' : 'City'}</label>
                   <input 
                    type="text" 
                    value={profile.city} 
                    onChange={e => onUpdate({...profile, city: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'bio' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">⚖️ {t.weightTracking}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <label className="text-[10px] font-black text-slate-400 block mb-4 uppercase tracking-widest">{t.addWeight}</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    step="0.1"
                    value={newWeight}
                    onChange={e => setNewWeight(e.target.value)}
                    placeholder="75.5"
                    className="flex-1 bg-white border-none rounded-xl p-4 font-black text-xl text-center focus:ring-2 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={handleAddWeight}
                    className="bg-[#1a1f2c] text-white px-6 rounded-xl font-black text-xs shadow-lg"
                  >
                    {t.saveWeight}
                  </button>
                </div>
              </div>

              <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100 flex flex-col justify-center items-center">
                 <span className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">{t.latestWeight}</span>
                 <div className="flex items-baseline gap-1">
                   <span className="text-4xl font-black">{profile.biometrics.weight || '--'}</span>
                   <span className="text-xs font-bold opacity-80">{t.kg}</span>
                 </div>
              </div>
            </div>

            {chartData.length > 1 && (
              <div className="mt-8 pt-8 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-400 block mb-6 uppercase tracking-widest">{t.weightTrend}</span>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} stroke="#e2e8f0" />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-[#1a1f2c] text-white p-3 rounded-2xl shadow-xl text-center">
                                <p className="text-[10px] font-bold opacity-60 mb-1">{payload[0].payload.date}</p>
                                <p className="text-lg font-black">{payload[0].value} {t.kg}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#6366f1" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
              <label className="text-[10px] font-black text-slate-400 block mb-3 uppercase tracking-widest">{t.height} ({t.cm})</label>
              <input 
                type="number" 
                value={profile.biometrics.height || ''} 
                onChange={e => updateBiometrics({ height: Number(e.target.value) })}
                className="w-full text-2xl font-black text-indigo-600 bg-slate-50 rounded-2xl p-4 border-none text-center focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <label className="text-[10px] font-black text-slate-400 block mb-4 uppercase tracking-widest">{isFa ? 'جنسیت' : 'Gender'}</label>
              <div className="flex gap-3">
                {(['male', 'female', 'other'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => updateBiometrics({ gender: g })}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black border transition-all ${profile.biometrics.gender === g ? 'bg-[#1a1f2c] border-[#1a1f2c] text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white'}`}
                  >
                    {g === 'male' ? (isFa ? 'مرد' : 'Male') : g === 'female' ? (isFa ? 'زن' : 'Female') : (isFa ? 'سایر' : 'Other')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'vision' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-[#1a1f2c] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-black mb-6">{isFa ? 'تصویر مَنِ برتر' : 'Superior Self Image'}</h3>
            <textarea 
              value={profile.superiorSelf.vision}
              onChange={(e) => onUpdate({ ...profile, superiorSelf: { ...profile.superiorSelf, vision: e.target.value } })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 resize-none mb-6"
              rows={3}
            />
            <button 
              onClick={handleGenerateSuggestions}
              disabled={loadingSuggestions}
              className="w-full bg-white text-[#1a1f2c] py-4 rounded-2xl font-black transition-all hover:bg-slate-100"
            >
              {loadingSuggestions ? (isFa ? 'در حال طراحی...' : 'Designing...') : (isFa ? 'پیشنهاد عادت‌های جدید' : 'Get habit suggestions')}
            </button>
          </div>
        </div>
      )}

      {activeSection === 'friends' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex gap-2 mb-8">
               <input 
                 type="text" 
                 placeholder={t.friendAlias}
                 value={newFriendAlias}
                 onChange={(e) => setNewFriendAlias(e.target.value)}
                 className="flex-1 bg-slate-50 border-none rounded-2xl px-5 font-bold text-sm"
               />
               <button 
                 onClick={handleAddFriend}
                 className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-xs shadow-lg shadow-indigo-100"
               >
                 {t.addFriend}
               </button>
             </div>

             <div className="space-y-4">
                {(!profile.friends || profile.friends.length === 0) ? (
                  <div className="py-10 text-center opacity-40">
                    <span className="text-4xl block mb-2">🤝</span>
                    <p className="font-black text-xs">{t.noFriends}</p>
                  </div>
                ) : (
                  profile.friends.map(friend => (
                    <div key={friend.id} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:bg-indigo-50 transition-colors">
                            {friend.avatar}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800">{friend.alias}</h4>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5">{friend.motto}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="flex items-center gap-2 mb-1 justify-end">
                             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">{t.evolution}</span>
                             <span className="text-sm font-black text-slate-800">{friend.evolutionScore}%</span>
                          </div>
                          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                               style={{ width: `${friend.evolutionScore}%` }}
                             />
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      )}

      {activeSection === 'settings' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">⚙️ {t.settings}</h3>
            
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-4">{t.language}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => onUpdate({ ...profile, language: 'fa' })} className={`py-4 rounded-2xl font-black text-xs border transition-all ${lang === 'fa' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>فارسی 🇮🇷</button>
                  <button onClick={() => onUpdate({ ...profile, language: 'en' })} className={`py-4 rounded-2xl font-black text-xs border transition-all ${lang === 'en' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>English 🇬🇧</button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-4">{t.coachTone}</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['strict', 'compassionate', 'scientific', 'enthusiastic'] as CoachTone[]).map(tone => (
                    <button 
                      key={tone}
                      onClick={() => onUpdate({ ...profile, coachTone: tone })}
                      className={`py-4 rounded-2xl font-black text-[10px] border transition-all ${profile.coachTone === tone ? 'bg-[#1a1f2c] border-[#1a1f2c] text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                    >
                      {t.toneOptions[tone]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">{t.lifeContextTitle}</label>
                <textarea 
                  value={profile.lifeContext || ''}
                  onChange={(e) => onUpdate({ ...profile, lifeContext: e.target.value })}
                  placeholder={t.lifeContextPlaceholder}
                  className="w-full bg-[#1a1f2c] text-white rounded-2xl p-4 text-xs font-medium border-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none"
                />
                <p className="text-[9px] text-slate-400 mt-2 italic">{t.lifeContextDesc}</p>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <button onClick={handleResetApp} className="w-full py-4 rounded-2xl font-black text-xs bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all">
                  ⚠️ {t.resetApp}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
