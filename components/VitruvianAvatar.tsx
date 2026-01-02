
import React from 'react';

interface VitruvianAvatarProps {
  score: number; // 0 to 100
}

const VitruvianAvatar: React.FC<VitruvianAvatarProps> = ({ score }) => {
  const getLevel = () => {
    if (score < 30) return 1;
    if (score < 60) return 2;
    if (score < 90) return 3;
    return 4;
  };

  const level = getLevel();
  const color = level === 4 ? '#fbbf24' : level === 3 ? '#6366f1' : level === 2 ? '#94a3b8' : '#e2e8f0';
  const glow = level === 4 ? 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.6))' : level === 3 ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))' : 'none';

  return (
    <div className="relative w-48 h-48 flex items-center justify-center transition-all duration-1000" style={{ filter: glow }}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* دایره محیطی و مربع ویتروسی */}
        <circle cx="100" cy="100" r="85" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 4" className="opacity-40" />
        <rect x="35" y="35" width="130" height="130" fill="none" stroke={color} strokeWidth="0.5" className="opacity-20" />
        
        {/* فیگور مرکزی - ساده شده برای استایل هنری */}
        <g stroke={color} strokeWidth={level >= 3 ? "2" : "1"} fill="none" strokeLinecap="round" className="transition-all duration-700">
          {/* ستون فقرات و سر */}
          <circle cx="100" cy="50" r="10" />
          <path d="M100 60 L100 120" />
          
          {/* دست‌های باز (حالت اول) */}
          <path d="M100 75 L150 75 M100 75 L50 75" className={level >= 2 ? "opacity-100" : "opacity-30"} />
          
          {/* دست‌های بالا (حالت ویتروسی) */}
          {level >= 3 && (
            <g className="opacity-60">
              <path d="M100 75 L145 45 M100 75 L55 45" />
            </g>
          )}

          {/* پاها (حالت اول) */}
          <path d="M100 120 L120 170 M100 120 L80 170" className={level >= 2 ? "opacity-100" : "opacity-30"} />
          
          {/* پاهای باز (حالت ویتروسی) */}
          {level >= 3 && (
            <g className="opacity-60">
              <path d="M100 120 L150 160 M100 120 L50 160" />
            </g>
          )}
        </g>

        {/* ذرات انرژی برای سطح نهایی */}
        {level === 4 && (
          <g className="animate-pulse">
            <circle cx="100" cy="100" r="92" fill="none" stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="1 10" />
            <circle cx="100" cy="50" r="15" fill="rgba(251, 191, 36, 0.1)" />
          </g>
        )}
      </svg>
      
      <div className="absolute -bottom-2 bg-[#1a1f2c] text-white text-[8px] font-black px-3 py-1 rounded-full border border-white/10">
        EVOLUTION: {Math.round(score)}%
      </div>
    </div>
  );
};

export default VitruvianAvatar;
