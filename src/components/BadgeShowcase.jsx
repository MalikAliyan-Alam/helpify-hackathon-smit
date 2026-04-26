import React from 'react';
import { BADGE_DEFINITIONS } from '../lib/gamification';
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
              className={`relative group flex flex-col items-center p-4 rounded-3xl transition-all ${isEarned ? 'bg-white shadow-sm hover:shadow-md' : 'bg-gray-50 opacity-60'}`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 relative transition-transform group-hover:scale-110 ${isEarned ? 'bg-gradient-to-br from-white to-gray-50 shadow-inner' : 'bg-gray-200 grayscale'}`}>
                {badge.icon}
                {!isEarned && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                )}
                {isEarned && <div className="absolute inset-0 rounded-full bg-[#129780]/5 animate-pulse"></div>}
              </div>
              
              <p className={`text-[10px] font-black uppercase tracking-tighter text-center leading-tight ${isEarned ? 'text-[#2b3231]' : 'text-gray-400'}`}>
                {badge.name}
              </p>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-[#2b3231] text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                <p className="font-bold text-xs mb-1">{badge.name}</p>
                <p className="text-[10px] text-gray-300 leading-relaxed mb-2">{badge.description}</p>
                {isEarned && earnedInfo && (
                  <p className="text-[9px] text-[#129780] font-bold uppercase">
                    Unlocked {new Date(earnedInfo.unlockedAt?.toDate ? earnedInfo.unlockedAt.toDate() : earnedInfo.unlockedAt).toLocaleDateString()}
                  </p>
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
