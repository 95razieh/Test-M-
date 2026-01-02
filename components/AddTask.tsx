
import React, { useState } from 'react';
import { HabitCategory, Language } from '../types';
import { DEFAULT_HABITS } from '../constants';
import { translations } from '../translations';

interface AddTaskProps {
  onAdd: (label: string, category: HabitCategory, weight: number) => void;
  existingLabels: string[];
  lang: Language;
}

const AddTask: React.FC<AddTaskProps> = ({ onAdd, existingLabels, lang }) => {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<HabitCategory>(HabitCategory.HEALTH);
  const [weight, setWeight] = useState(2);
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onAdd(label, category, weight);
    setLabel('');
    setWeight(2);
    setIsOpen(false);
  };

  const currentDefaultHabits = DEFAULT_HABITS[lang] || DEFAULT_HABITS.fa;
  const suggestions = currentDefaultHabits.filter(h => !existingLabels.includes(h.label)).slice(0, 6);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-6 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black hover:border-slate-300 hover:text-slate-500 transition-all flex items-center justify-center gap-2 mb-4"
      >
        {lang === 'fa' ? '+ عادت جدید یا پیشنهادی' : '+ New or Suggested Habit'}
      </button>
    );
  }

  return (
    <div className="bg-slate-100 p-8 rounded-[2.5rem] mb-6 animate-fade-in border border-slate-200">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">{lang === 'fa' ? 'عنوان عادت' : 'Habit Title'}</label>
          <input 
            autoFocus
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={lang === 'fa' ? "مثلاً: دوش آبسرد..." : "e.g. Cold shower..."}
            className="w-full bg-white px-6 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
          />
        </div>

        {suggestions.length > 0 && !label && (
          <div className="animate-fade-in">
            <label className="text-[10px] font-bold text-slate-400 mb-3 block uppercase tracking-widest">{lang === 'fa' ? 'پیشنهادهای «مَنِ نو»' : 'Mane No Suggestions'}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx}
                  type="button"
                  onClick={() => {
                    onAdd(s.label, s.category as HabitCategory, s.weight);
                    setIsOpen(false);
                  }}
                  className={`p-4 bg-white hover:bg-indigo-50 border border-slate-200 rounded-2xl transition-all flex flex-col group ${lang === 'fa' ? 'text-right' : 'text-left'}`}
                >
                  <span className="text-[8px] font-black text-indigo-400 mb-1 group-hover:text-indigo-600">{t.categories[s.category as HabitCategory]}</span>
                  <span className="text-xs font-bold text-slate-700">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">{lang === 'fa' ? 'ارزش (اهمیت)' : 'Strategic Weight'}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeight(w)}
                  className={`w-12 h-12 rounded-xl font-black text-sm transition-all ${weight === w ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-300'}`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">{lang === 'fa' ? 'دسته‌بندی' : 'Category'}</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(HabitCategory).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${category === cat ? 'bg-[#1a1f2c] text-white' : 'bg-white text-slate-400'}`}
                >
                  {t.categories[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={!label.trim()} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all">{lang === 'fa' ? 'ایجاد عادت' : 'Create Habit'}</button>
          <button type="button" onClick={() => setIsOpen(false)} className="px-8 py-4 bg-white text-slate-400 rounded-2xl font-black">{t.cancel}</button>
        </div>
      </form>
    </div>
  );
};

export default AddTask;
