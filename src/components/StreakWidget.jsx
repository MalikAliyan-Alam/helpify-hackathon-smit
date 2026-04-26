import React from 'react';
import { Card } from './ui/Card';

export function StreakWidget({ currentStreak = 0, longestStreak = 0, freezes = 0 }) {
  // Activity simulation (last 7 days)
  const activity = [1, 0, 1, 1, 1, 0, 1]; // 1 for active, 0 for inactive

  return (
    <Card className="bg-white border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col relative overflow-hidden group">
      {/* Animated Background Flame */}
      <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
        <svg viewBox="0 0 24 24" fill="#129780" className="animate-pulse"><path d="M12,2C12,2 12,7 12,7C12,7 15,9 15,12C15,15 12,17 12,17C12,17 9,15 9,12C9,9 12,7 12,7C12,7 12,2 12,2M12,22C12,22 17,20 17,13C17,10 15,8 15,8C15,8 12,11 12,11C12,11 9,8 9,8C9,8 7,10 7,13C7,20 12,22 12,22Z"/></svg>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-1">MOMENTUM</p>
          <h3 className="text-xl font-bold text-[#2b3231]">Helping Streak</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Streak Freeze Icon - Shield Shape */}
          <div className="flex items-center gap-1.5 bg-blue-50/80 text-blue-600 px-4 py-2 rounded-2xl border border-blue-100/50 shadow-sm group/freeze relative cursor-help">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span className="text-xs font-black">{freezes}</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[8px] rounded opacity-0 group-hover/freeze:opacity-100 transition-opacity whitespace-nowrap z-50">
              Streak Freezes
            </div>
          </div>
          {/* Flame Icon */}
          <div className="flex items-center gap-1.5 bg-orange-50/80 text-orange-600 px-4 py-2 rounded-2xl border border-orange-100/50 shadow-sm relative group/flame cursor-help">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
            <span className="text-xs font-black">{currentStreak}</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[8px] rounded opacity-0 group-hover/flame:opacity-100 transition-opacity whitespace-nowrap z-50">
              Active Streak
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Current Streak</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-black text-[#2b3231] tracking-tighter">{currentStreak}</span>
              <span className="text-sm font-bold text-gray-400">days</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Best Ever</p>
            <p className="text-2xl font-black text-[#129780]">{longestStreak}</p>
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="space-y-2.5">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.15em]">
            <span className="text-gray-400">Next Milestone</span>
            <span className="text-[#129780]">{currentStreak >= 7 ? '30 Days' : '7 Days'}</span>
          </div>
          <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
            <div 
              className="h-full bg-gradient-to-r from-[#129780] to-[#0f7a68] transition-all duration-1000"
              style={{ width: `${(currentStreak / (currentStreak >= 7 ? 30 : 7)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Activity Grid */}
        <div className="pt-6 border-t border-gray-100">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.15em] mb-4">Activity Log</p>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2.5">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <span key={i} className="flex-1 text-center text-[9px] font-bold text-gray-400">{day}</span>
              ))}
            </div>
            <div className="flex gap-2.5">
              {activity.map((active, i) => (
                <div 
                  key={i} 
                  className={`flex-1 h-12 rounded-xl transition-all flex items-center justify-center ${active ? 'bg-[#129780] shadow-sm shadow-[#129780]/10' : 'bg-gray-50 border border-gray-100'}`}
                >
                  {active && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
