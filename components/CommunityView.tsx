
import React, { useState } from 'react';
import { Community, HabitTask, UserProfile, Language } from '../types';
import { translations } from '../translations';

interface CommunityViewProps {
  userTasks: HabitTask[];
  communities: Community[];
  onCreateCommunity: (community: Community) => void;
  onToggleJoin: (id: string) => void;
  onUpdateCommunity: (community: Community) => void;
  currentUser: UserProfile;
}

const CommunityView: React.FC<CommunityViewProps> = ({ 
  userTasks, 
  communities, 
  onCreateCommunity, 
  onToggleJoin,
  onUpdateCommunity,
  currentUser 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const lang = currentUser.language || 'fa';
  const t = translations[lang];
  const isFa = lang === 'fa';

  const [newComm, setNewComm] = useState({
    name: '',
    description: '',
    telegramLink: '',
    telegramChatId: '',
    icon: '🚀',
    requiredHabits: [] as string[]
  });

  const [challengeInput, setChallengeInput] = useState('');

  const userHabitLabels = userTasks.map(t => t.label);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComm.name || !newComm.telegramLink) return;
    
    const community: Community = {
      id: `custom-${Date.now()}`,
      name: newComm.name,
      description: newComm.description,
      telegramLink: newComm.telegramLink,
      telegramChatId: newComm.telegramChatId,
      icon: newComm.icon,
      requiredHabitLabels: newComm.requiredHabits,
      memberCount: isFa ? '۱' : '1',
      leaderName: (currentUser.name && currentUser.lastName) 
        ? `${currentUser.name} ${currentUser.lastName}` 
        : (currentUser.telegramId || (isFa ? 'کاربر ناشناس' : 'Unknown User')),
      leaderAvatar: '👑',
      joined: true,
      currentManagerId: currentUser.id,
      engagementScore: 100
    };

    onCreateCommunity(community);
    setIsCreating(false);
    setNewComm({ name: '', description: '', telegramLink: '', telegramChatId: '', icon: '🚀', requiredHabits: [] });
  };

  const handleSetChallenge = (comm: Community) => {
    if (!challengeInput.trim()) return;
    onUpdateCommunity({
      ...comm,
      dailyChallenge: challengeInput
    });
    setChallengeInput('');
  };

  return (
    <div className="animate-fade-in pb-10">
      <header className="mb-8 px-2 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800">{t.communityHeader}</h2>
          <p className="text-slate-500 mt-2 font-medium">{t.communitySub}</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="bg-indigo-600 text-white w-12 h-12 flex items-center justify-center rounded-2xl shadow-lg font-black text-xl">
          +
        </button>
      </header>

      {isCreating && (
        <div className="bg-[#1a1f2c] rounded-[2.5rem] p-8 text-white shadow-2xl mb-8 animate-fade-in relative">
          <h3 className="text-xl font-black mb-6">{t.createGroup}</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input 
                type="text" 
                value={newComm.name}
                onChange={e => setNewComm(p => ({...p, name: e.target.value}))}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm"
                placeholder={t.groupName}
                required
              />
              <input 
                type="url" 
                value={newComm.telegramLink}
                onChange={e => setNewComm(p => ({...p, telegramLink: e.target.value}))}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm ltr text-left"
                placeholder={t.telegramInvite}
                required
              />
            </div>
            <textarea 
              value={newComm.description}
              onChange={e => setNewComm(p => ({...p, description: e.target.value}))}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm resize-none"
              rows={2}
              placeholder={t.groupDesc}
            />
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-emerald-500 text-[#1a1f2c] py-4 rounded-2xl font-black">{t.confirmAndPublish}</button>
              <button type="button" onClick={() => setIsCreating(false)} className="px-8 bg-white/10 text-slate-300 py-4 rounded-2xl font-black">{t.cancel}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {communities.map((community) => {
          const isEligible = community.requiredHabitLabels.every(h => userHabitLabels.includes(h));
          const isJoined = community.joined;
          const isManager = community.currentManagerId === currentUser.id;

          return (
            <div key={community.id} className={`bg-white rounded-[3rem] p-8 border shadow-sm relative transition-all ${isJoined ? 'border-indigo-100 ring-2 ring-indigo-50/30' : 'border-slate-100'}`}>
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">{community.icon}</div>
                  <div>
                    <h3 className="font-black text-slate-800 text-xl leading-tight">{community.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">
                        {community.memberCount} {t.members}
                      </span>
                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                        Pulse: {community.engagementScore || 85}%
                      </span>
                    </div>
                  </div>
                </div>
                {isJoined && (
                  <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  </div>
                )}
              </div>

              <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">{community.description}</p>
              
              {isJoined && (
                <div className="space-y-6 mb-8">
                  {/* Daily Challenge Info */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10 text-4xl">🎯</div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t.challengeTitle}</span>
                    <p className="font-black text-slate-700">{community.dailyChallenge || (isFa ? "هنوز چالشی تعریف نشده است." : "No challenge set yet.")}</p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-xs">👤</span>
                          <span className="text-[10px] font-bold text-slate-500">{t.praiseManager} {community.leaderName}</span>
                       </div>
                       <button className="text-[10px] font-black text-indigo-600 hover:underline">{t.becomeManager}</button>
                    </div>
                  </div>

                  {/* Manager Zone */}
                  {isManager && (
                    <div className="bg-indigo-900 rounded-[2rem] p-6 text-white shadow-xl animate-slide-up">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">🛠️</span>
                        <h4 className="font-black text-sm uppercase tracking-widest">{t.managerZone}</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <textarea 
                          value={challengeInput}
                          onChange={e => setChallengeInput(e.target.value)}
                          placeholder={t.challengePlaceholder}
                          className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs text-white placeholder:text-white/40 resize-none focus:ring-2 focus:ring-emerald-400"
                          rows={2}
                        />
                        <button 
                          onClick={() => handleSetChallenge(community)}
                          className="w-full bg-emerald-500 text-[#1a1f2c] py-3 rounded-xl font-black text-xs hover:bg-emerald-400 transition-all"
                        >
                          {t.saveChallenge}
                        </button>
                        
                        <div className="pt-2">
                           <button className="w-full bg-white/10 border border-white/10 py-3 rounded-xl text-[10px] font-black hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                              <span>📢</span> {t.mentionAbsentees}
                           </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {isEligible ? (
                  <>
                    {!isJoined ? (
                      <div className="flex flex-col gap-2 pt-4">
                        <a href={community.telegramLink} target="_blank" className="w-full bg-[#1a1f2c] text-white py-4 rounded-2xl font-black text-center flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                          {t.enterTelegram}
                        </a>
                        <button 
                          onClick={() => onToggleJoin(community.id)}
                          className="w-full bg-emerald-50 text-emerald-600 border border-emerald-100 py-4 rounded-2xl font-black text-sm hover:bg-emerald-100 transition-all"
                        >
                          {t.confirmMembership}
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => onToggleJoin(community.id)}
                        className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-sm hover:bg-rose-50 hover:text-rose-600 transition-all"
                      >
                        {t.leaveGroup}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 font-bold mb-2">{t.preReqHabits}</p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {community.requiredHabitLabels.map((h, i) => (
                        <span key={i} className="text-[9px] bg-white border border-slate-100 px-2 py-1 rounded-md text-slate-500">
                          {userHabitLabels.includes(h) ? '✅' : '❌'} {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityView;
