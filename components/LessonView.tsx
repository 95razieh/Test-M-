
import React, { useState, useEffect } from 'react';
import { HabitTask, Language } from '../types';
import { getAIEducationalQuiz } from '../services/geminiService';
import { translations } from '../translations';

interface LessonViewProps {
  tasks: HabitTask[];
  lang: Language;
  onReward: (amount: number) => void;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const LessonView: React.FC<LessonViewProps> = ({ tasks, lang, onReward }) => {
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const t = translations[lang];

  const fetchQuiz = async () => {
    if (tasks.length === 0) return;
    setLoading(true);
    const data = await getAIEducationalQuiz(tasks, lang);
    setQuiz(data);
    setLoading(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  useEffect(() => {
    fetchQuiz();
  }, [lang]);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === quiz[currentIndex].correctIndex) {
      onReward(1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuiz([]); // Finish quiz
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-pulse text-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">📚</span>
        </div>
        <p className="font-black text-slate-400">{t.fetchingQuiz}</p>
      </div>
    );
  }

  if (quiz.length === 0) {
    return (
      <div className="bg-white rounded-[3rem] p-12 text-center shadow-sm border border-slate-100 animate-fade-in">
        <div className="text-6xl mb-6">🎓</div>
        <h3 className="text-2xl font-black text-slate-800 mb-4">{t.quizComplete}</h3>
        <p className="text-slate-400 font-bold mb-8">{t.wisdomDesc}</p>
        <button 
          onClick={fetchQuiz}
          className="bg-[#1a1f2c] text-white px-10 py-5 rounded-[2rem] font-black shadow-xl hover:scale-105 transition-transform"
        >
          {t.startQuiz}
        </button>
      </div>
    );
  }

  const currentQ = quiz[currentIndex];

  return (
    <div className="animate-fade-in px-2">
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
        
        <div className="flex justify-between items-center mb-10">
          <div className="flex gap-1">
            {quiz.map((_, i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${i <= currentIndex ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
            ))}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentIndex + 1} / {quiz.length}</span>
        </div>

        <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-8 leading-relaxed">
          {currentQ.question}
        </h2>

        <div className="grid gap-3">
          {currentQ.options.map((option, idx) => {
            let style = "bg-slate-50 border-slate-100 text-slate-600";
            if (isAnswered) {
              if (idx === currentQ.correctIndex) style = "bg-emerald-500 border-emerald-500 text-white shadow-lg";
              else if (idx === selectedOption) style = "bg-rose-500 border-rose-500 text-white";
              else style = "bg-slate-50 border-slate-100 text-slate-300 opacity-50";
            } else {
              style = "bg-white border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-indigo-200";
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleOptionClick(idx)}
                className={`w-full p-6 rounded-3xl border-2 text-right font-bold transition-all ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-8 animate-slide-up">
            <div className={`p-6 rounded-3xl mb-6 ${selectedOption === currentQ.correctIndex ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
              <p className="font-black mb-2">{selectedOption === currentQ.correctIndex ? t.correctAnswer : t.wrongAnswer}</p>
              <p className="text-sm opacity-80">{currentQ.explanation}</p>
            </div>
            <button 
              onClick={nextQuestion}
              className="w-full bg-[#1a1f2c] text-white py-5 rounded-[2rem] font-black shadow-xl"
            >
              {currentIndex === quiz.length - 1 ? 'پایان' : 'سؤال بعدی'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonView;
