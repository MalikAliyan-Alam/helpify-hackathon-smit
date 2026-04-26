import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { BADGE_DEFINITIONS } from '../lib/gamification.jsx';
import { Card } from './ui/Card';
import { Link } from 'react-router-dom';

export function LeaderboardWidget() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        const trust = data.trustScore || 0;
        const cont = data.contributions || 0;
        return { 
          id: doc.id, 
          ...data,
          performanceScore: trust + (cont * 10)
        };
      });

      // Sort by calculated performance score
      const sorted = users.sort((a, b) => b.performanceScore - a.performanceScore);
      setLeaders(sorted.slice(0, 5));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="border-none shadow-sm rounded-[24px] p-6 flex flex-col h-full group hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-1">COMMUNITY</p>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Top Helpers</h3>
        </div>
        <Link to="/leaderboard" className="text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] uppercase tracking-widest transition-colors flex items-center gap-1 group-hover:gap-2">
          Full List
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </Link>
      </div>

      <div className="space-y-3 flex-1">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-12 bg-[var(--bg-secondary)] rounded-xl animate-pulse"></div>
          ))
        ) : (
          <>
            {leaders.map((user, index) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[var(--bg-secondary)] transition-colors">
                <div className={`w-6 text-center font-black text-xs ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-orange-400' : 'text-[var(--text-secondary)]'}`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#2b3231] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user.name}</p>
                    <div className="flex gap-1 shrink-0">
                      {user.pinnedBadges?.map(id => (
                        <span key={id} title={BADGE_DEFINITIONS[id]?.name} className="text-[10px] w-4 h-4 flex items-center justify-center bg-[var(--bg-secondary)] rounded-full text-[var(--text-primary)]">
                          {BADGE_DEFINITIONS[id]?.icon}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-full bg-[var(--bg-secondary)] h-1 rounded-full overflow-hidden">
                        <div className="bg-[var(--accent)] h-full" style={{ width: `${Math.min(100, user.trustScore || 0)}%` }}></div>
                     </div>
                     <span className="text-[9px] font-bold text-[var(--text-secondary)]">{Math.min(100, user.trustScore || 0)}%</span>
                  </div>
                </div>
              </div>
            ))}
            {/* Fill remaining slots if < 5 leaders */}
            {Array(Math.max(0, 5 - leaders.length)).fill(0).map((_, i) => {
              const rank = leaders.length + i;
              return (
                <div key={`empty-${i}`} className="flex items-center gap-3 p-2 rounded-2xl opacity-40 grayscale">
                  <div className="w-6 text-center font-black text-xs text-[var(--text-secondary)]">
                    {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : rank + 1}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)] shrink-0 border border-dashed border-[var(--border-color)]">
                    ?
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[var(--text-secondary)]">Open Position</p>
                    <div className="w-full bg-[var(--bg-secondary)] h-1 rounded-full mt-1"></div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
        <p className="text-[10px] text-[var(--text-secondary)] font-medium text-center italic">
          Based on Trust Score & contributions
        </p>
      </div>
    </Card>
  );
}
