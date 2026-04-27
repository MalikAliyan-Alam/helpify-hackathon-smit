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
              className={`relative group flex flex-col items-center p-5 rounded-[32px] transition-all duration-300 ${isEarned ? 'bg-[var(--bg-card)] shadow-sm hover:shadow-xl hover:-translate-y-1 border border-[var(--border-color)]' : 'bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)]'}`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 relative transition-all duration-500 ${isEarned ? 'bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] shadow-lg ring-4 ring-[var(--accent)]/5' : 'bg-[var(--bg-secondary)] opacity-50'}`}>
                <span className={`${isEarned ? 'drop-shadow-md' : 'grayscale contrast-50 brightness-75 blur-[2px] opacity-40'}`}>
                  {badge.icon}
                </span>
                
                {!isEarned && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-full backdrop-blur-[1px]">
                    <div className="bg-[var(--bg-card)] p-2 rounded-full shadow-sm">
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)]"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                  </div>
                )}
                
                {isEarned && (
                   <div className="absolute -inset-1 rounded-full bg-[var(--accent)]/10 animate-pulse -z-10 blur-md"></div>
                )}
              </div>
              
              <p className={`text-[11px] font-black uppercase tracking-tighter text-center leading-tight mb-1 ${isEarned ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {badge.name}
              </p>
              
              {!isEarned && (
                <p className="text-[8px] font-bold text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">Locked</p>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 p-4 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-[24px] opacity-0 group-hover:opacity-100 transition-all invisible group-hover:visible translate-y-2 group-hover:translate-y-0 z-[100] shadow-2xl border border-[var(--border-color)] pointer-events-none">
                <div className="flex items-center gap-3 mb-2">
                   <span className="text-2xl">{badge.icon}</span>
                   <div>
                      <p className="font-black text-xs uppercase tracking-tight text-[var(--text-primary)]">{badge.name}</p>
                      {isEarned ? (
                        <span className="text-[8px] font-black text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full uppercase">Unlocked</span>
                      ) : (
                        <span className="text-[8px] font-black text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full uppercase">Achievement</span>
                      )}
                   </div>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mb-3 font-medium">{badge.description}</p>
                {isEarned && earnedInfo && (
                  <div className="pt-3 border-t border-[var(--border-color)]">
                    <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">
                      Earned on {new Date(earnedInfo.unlockedAt?.toDate ? earnedInfo.unlockedAt.toDate() : earnedInfo.unlockedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[var(--bg-card)]"></div>
              </div>

              {/* Pin Action */}
              {isOwnProfile && isEarned && (
                <button 
                  onClick={() => onPinBadge(badge.id)}
                  className={`mt-2 p-1.5 rounded-full transition-colors ${isPinned ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--accent)]'}`}
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
