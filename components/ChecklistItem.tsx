
import React, { useState, useEffect } from 'react';
import { HabitTask, HabitCategory, Language } from '../types';
import { translations } from '../translations';

interface ChecklistItemProps {
  task: HabitTask;
  index: number;
  onChange: (id: string, score: number) => void;
  onDelete: (id: string, label: string) => void;
  onEdit: (id: string, oldLabel: string, newLabel: string, newCategory: HabitCategory, newWeight: number) => void;
  lang: Language;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ 
  task, 
  onChange,
  onDelete,
  onEdit,
  lang,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(task.label);
  const [editWeight, setEditWeight] = useState(task.weight || 2);
  const t = translations[lang];

  // Sync state when task prop changes (critical for correct viewing after edits)
  useEffect(() => {
    setEditLabel(task.label);
    setEditWeight(task.weight);
  }, [task]);

  // Fix: Added missing COMMUNITY category to categoryConfig
  const categoryConfig = {
    [HabitCategory.HEALTH]: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
    [HabitCategory.MINDSET]: { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700' },
    [HabitCategory.ROUTINE]: { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700' },
    [HabitCategory.DIET]: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700' },
    [HabitCategory.COMMUNITY]: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700' },
  };

  const currentTheme = categoryConfig[task.category] || { bg: 'bg-white', border: 'border-slate-100', text: 'text-slate-700' };

  const levels = [
    { value: 0, activeColor: 'bg-rose-500', label: '🔴' },
    { value: 1, activeColor: 'bg-orange-500', label: '🟠' },
    { value: 2, activeColor: 'bg-yellow-500', label: '🟡' },
    { value: 3, activeColor: 'bg-emerald-500', label: '🟢' },
    { value: 4, activeColor: 'bg-indigo-600', label: '🔥' },
  ];

  const handleSaveEdit = () => {
    if (editLabel.trim()) {
      onEdit(task.id, task.label, editLabel, task.category, editWeight);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className={`${currentTheme.bg} p-6 mb-3 rounded-3xl border ${currentTheme.border} shadow-inner animate-fade-in`}>
        <label className="text-[10px] font-black text-slate-400 mb-2 block mr-1 uppercase">{t.editHabit}</label>
        <input 
          type="text" 
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          className="w-full bg-white px-4 py-3 rounded-xl border-none font-bold text-slate-800 mb-4 shadow-sm"
        />
        
        <label className="text-[10px] font-black text-slate-400 mb-2 block mr-1 uppercase">{t.importance}</label>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(w => (
            <button
              key={w}
              type="button"
              onClick={() => setEditWeight(w)}
              className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${editWeight === w ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}
            >
              {w}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={handleSaveEdit} className="flex-1 bg-emerald-500 text-[#1a1f2c] py-4 rounded-xl font-black text-xs">{t.saveChanges}</button>
          <button onClick={() => setIsEditing(false)} className="px-6 bg-white text-slate-400 py-4 rounded-xl font-black text-xs">{t.cancel}</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      draggable 
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`${currentTheme.bg} p-4 mb-3 rounded-3xl border ${currentTheme.border} shadow-sm transition-all duration-300 group relative overflow-hidden ${isDragging ? 'opacity-40 scale-95' : 'opacity-100 hover:shadow-md cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className={`flex-1 flex gap-3 ${lang === 'fa' ? 'pr-1' : 'pl-1'}`}>
          {/* Drag Handle */}
          <div className="flex flex-col justify-center text-slate-200 group-hover:text-slate-400 transition-colors px-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 6a1 1 0 100-2 1 1 0 000 2zM7 11a1 1 0 100-2 1 1 0 000 2zM7 16a1 1 0 100-2 1 1 0 000 2zM13 6a1 1 0 100-2 1 1 0 000 2zM13 11a1 1 0 100-2 1 1 0 000 2zM13 16a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[8px] font-black text-slate-400 bg-white/60 px-1.5 py-0.5 rounded-md border border-white/20">
                {t.categories[task.category]}
              </span>
              <span className="text-[8px] font-black text-indigo-400 bg-white/60 px-1.5 py-0.5 rounded-md border border-white/20">
                {t.weight}: {task.weight}
              </span>
              
              <div className={`flex items-center gap-1 ${lang === 'fa' ? 'mr-auto' : 'ml-auto'}`}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
                  className="text-slate-300 hover:text-indigo-600 p-1.5 transition-colors rounded-xl hover:bg-white/40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(task.id, task.label); }} 
                  className="text-slate-300 hover:text-rose-600 p-1.5 transition-colors rounded-xl hover:bg-white/40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`text-sm md:text-base font-bold leading-snug transition-all ${task.score === 0 ? 'text-slate-400 opacity-80' : 'text-slate-800 opacity-100'}`}>
                {task.label}
              </span>
              {task.score === 4 && <span className="text-emerald-500 text-base animate-bounce-short">✅</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-1 bg-white/50 p-1 rounded-2xl border border-white/20 backdrop-blur-sm shadow-inner">
          {levels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(task.id, level.value); }}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 transform active:scale-90 ${
                task.score === level.value 
                  ? `${level.activeColor} shadow-lg scale-105 z-10 text-white` 
                  : 'bg-white/20 opacity-30 hover:opacity-100 hover:bg-white/50 text-slate-500'
              }`}
            >
              <span className="text-base">{level.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChecklistItem;
