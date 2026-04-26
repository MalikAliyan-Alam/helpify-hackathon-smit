import React from 'react';
import { BADGE_DEFINITIONS } from '../lib/gamification.jsx';
import { Card } from './ui/Card';

export function BadgeShowcase({ earnedBadges = [], pinnedBadges = [], onPinBadge, isOwnProfile }) {
  const earnedIds = earnedBadges.map(b => b.id);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Object.values(BADGE_DEFINITIONS).map((badge) => {
          const isEarned = earnedIds.includes(badge.id);
          const isPinned = pinnedBadges.includes(badge.id);
          const earnedInfo = earnedBadges.find(b => b.id === badge.id);

          return (
            <div 
              key={badge.id} 
              className={`relative group flex flex-col items-center p-5 rounded-[32px] transition-all duration-300 ${isEarned ? 'bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 border border-gray-100' : 'bg-gray-50/50 border border-dashed border-gray-200'}`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 relative transition-all duration-500 ${isEarned ? 'bg-gradient-to-br from-white to-gray-50 shadow-lg ring-4 ring-[#129780]/5' : 'bg-gray-200/50'}`}>
                <span className={`${isEarned ? 'drop-shadow-md' : 'grayscale contrast-50 brightness-75 blur-[2px] opacity-40'}`}>
                  {badge.icon}
                </span>
                
                {!isEarned && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 rounded-full backdrop-blur-[1px]">
                    <div className="bg-white/90 p-2 rounded-full shadow-sm">
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                  </div>
                )}
                
                {isEarned && (
                   <div className="absolute -inset-1 rounded-full bg-[#129780]/10 animate-pulse -z-10 blur-md"></div>
                )}
              </div>
              
              <p className={`text-[11px] font-black uppercase tracking-tighter text-center leading-tight mb-1 ${isEarned ? 'text-[#2b3231]' : 'text-gray-400'}`}>
                {badge.name}
              </p>
              
              {!isEarned && (
                <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Locked</p>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 p-4 bg-[#2b3231] text-white rounded-[24px] opacity-0 group-hover:opacity-100 transition-all invisible group-hover:visible translate-y-2 group-hover:translate-y-0 z-[100] shadow-2xl border border-white/10 pointer-events-none">
                <div className="flex items-center gap-3 mb-2">
                   <span className="text-2xl">{badge.icon}</span>
                   <div>
                      <p className="font-black text-xs uppercase tracking-tight">{badge.name}</p>
                      {isEarned ? (
                        <span className="text-[8px] font-black text-[#129780] bg-[#129780]/10 px-2 py-0.5 rounded-full uppercase">Unlocked</span>
                      ) : (
                        <span className="text-[8px] font-black text-gray-400 bg-white/5 px-2 py-0.5 rounded-full uppercase">Achievement</span>
                      )}
                   </div>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed mb-3 font-medium">{badge.description}</p>
                {isEarned && earnedInfo && (
                  <div className="pt-3 border-t border-white/5">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                      Earned on {new Date(earnedInfo.unlockedAt?.toDate ? earnedInfo.unlockedAt.toDate() : earnedInfo.unlockedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#2b3231]"></div>
              </div>

              {/* Pin Action */}
              {isOwnProfile && isEarned && (
                <button 
                  onClick={() => onPinBadge(badge.id)}
                  className={`mt-2 p-1.5 rounded-full transition-colors ${isPinned ? 'bg-[#129780] text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                  title={isPinned ? 'Unpin Badge' : 'Pin to Profile'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
