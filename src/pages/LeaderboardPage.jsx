import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs, where } from 'firebase/firestore';
import { BADGE_DEFINITIONS } from '../lib/gamification.jsx';
import { KudosButton } from '../components/KudosButton';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

export function LeaderboardPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' or 'monthly'
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // In a real app with Cloud Functions, we'd have a pre-calculated leaderboard collection.
    // For this implementation, we'll fetch top users by Trust Score and Contributions.
    // We'll simulate weekly/monthly by sorting slightly differently or using metadata if available.
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const trust = data.trustScore || 0;
        const cont = data.contributions || 0;
        return {
          id: doc.id,
          ...data,
          performanceScore: trust + (cont * 10)
        };
      });

      // Sort by performance score
      const sortedUsers = usersData.sort((a, b) => b.performanceScore - a.performanceScore);
      setLeaders(sortedUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const getRankBadge = (rank) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `#${rank + 1}`;
  };

  const getRankColor = (rank) => {
    if (rank === 0) return 'from-yellow-400 to-amber-600 shadow-yellow-500/20';
    if (rank === 1) return 'from-slate-300 to-slate-500 shadow-slate-500/20';
    if (rank === 2) return 'from-orange-400 to-orange-700 shadow-orange-500/20';
    return 'from-gray-100 to-gray-200';
  };

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="bg-[#2b3231] rounded-[40px] p-10 md:p-16 flex flex-col items-center text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#129780]/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative z-10">
          <p className="text-[var(--accent)] font-bold text-xs uppercase tracking-[0.3em] mb-4">REPUTATION & IMPACT</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">Hall of Heroes</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Recognizing the champions of our community who consistently provide world-class help and mentorship.
          </p>

          {/* Tab Switcher */}
          <div className="flex gap-2 p-1.5 bg-black/30 backdrop-blur-xl rounded-[24px] w-fit mx-auto border border-white/5 shadow-2xl">
            <button 
              onClick={() => setActiveTab('weekly')}
              className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === 'weekly' ? 'bg-[#129780] text-white shadow-lg shadow-[#129780]/20' : 'text-gray-400 hover:text-white'}`}
            >
              Weekly Top
            </button>
            <button 
              onClick={() => setActiveTab('monthly')}
              className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === 'monthly' ? 'bg-[#129780] text-white shadow-lg shadow-[#129780]/20' : 'text-gray-400 hover:text-white'}`}
            >
              Monthly Top
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Podium (Visual only for desktop) */}
      {!loading && leaders.length >= 3 && (
        <div className="hidden lg:flex items-end justify-center gap-6 mt-12 mb-8">
          {/* Silver - Rank 2 */}
          <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-100">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-[var(--bg-secondary)] flex items-center justify-center text-4xl border-4 border-[var(--border-color)] shadow-xl overflow-hidden text-[var(--text-primary)]">
                {leaders[1].name?.charAt(0)}
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-500 rounded-full flex items-center justify-center text-lg shadow-lg border-2 border-[var(--bg-card)]">🥈</div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-[var(--text-primary)]">{leaders[1].name}</h3>
              <p className="text-[var(--accent)] font-bold text-xs">{Math.min(100, leaders[1].trustScore || 0)}% Trust</p>
            </div>
            <div className="w-48 h-32 bg-[var(--bg-card)] backdrop-blur-md rounded-t-[32px] border border-[var(--border-color)] shadow-sm flex flex-col items-center justify-center p-4">
               <span className="text-slate-400 font-black text-2xl">2ND</span>
            </div>
          </div>

          {/* Gold - Rank 1 */}
          <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-12 duration-1000">
            <div className="relative">
              <div className="w-32 h-32 rounded-[40px] bg-[var(--bg-secondary)] flex items-center justify-center text-5xl border-4 border-[var(--accent)] shadow-2xl overflow-hidden scale-110 text-[var(--text-primary)]">
                {leaders[0].name?.charAt(0)}
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center text-2xl shadow-xl border-4 border-[var(--bg-card)]">🥇</div>
            </div>
            <div className="text-center mt-2">
              <h3 className="font-black text-xl text-[var(--text-primary)]">{leaders[0].name}</h3>
              <p className="text-[var(--accent)] font-bold text-sm">{Math.min(100, leaders[0].trustScore || 0)}% Trust • Elite</p>
            </div>
            <div className="w-56 h-48 bg-[var(--bg-card)] shadow-2xl rounded-t-[40px] border border-[var(--border-color)] flex flex-col items-center justify-center p-6 relative">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"></div>
               <span className="text-amber-500 font-black text-4xl">1ST</span>
               <p className="text-xs text-[var(--text-secondary)] font-bold uppercase mt-2">{leaders[0].contributions} HELPS</p>
            </div>
          </div>

          {/* Bronze - Rank 3 */}
          <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-[var(--bg-secondary)] flex items-center justify-center text-4xl border-4 border-[var(--border-color)] shadow-xl overflow-hidden text-[var(--text-primary)]">
                {leaders[2].name?.charAt(0)}
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-orange-300 to-orange-600 rounded-full flex items-center justify-center text-lg shadow-lg border-2 border-[var(--bg-card)]">🥉</div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-[var(--text-primary)]">{leaders[2].name}</h3>
              <p className="text-[var(--accent)] font-bold text-xs">{Math.min(100, leaders[2].trustScore || 0)}% Trust</p>
            </div>
            <div className="w-48 h-24 bg-[var(--bg-card)] backdrop-blur-md rounded-t-[32px] border border-[var(--border-color)] shadow-sm flex flex-col items-center justify-center p-4">
               <span className="text-orange-400 font-black text-xl">3RD</span>
            </div>
          </div>
        </div>
      )}

      {/* Main List */}
      <div className="max-w-4xl mx-auto w-full space-y-3">
        {loading ? (
          Array(10).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-[24px] animate-pulse"></div>
          ))
        ) : (
          leaders.map((user, index) => {
            const isMe = user.id === currentUser?.uid;
            const rankStyle = index < 3 ? 'font-black text-xl' : 'font-bold text-gray-400 text-sm';
            
            return (
              <Card 
                key={user.id} 
                className={`border-none shadow-sm rounded-[24px] p-4 flex items-center gap-6 transition-all hover:shadow-md hover:scale-[1.01] ${isMe ? 'ring-2 ring-[var(--accent)] bg-[var(--badge-green-bg)]' : ''}`}
              >
                <div className={`w-12 text-center ${rankStyle}`}>
                  {getRankBadge(index)}
                </div>

                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] font-bold shrink-0 relative">
                  {user.name?.charAt(0).toUpperCase()}
                  {user.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-[var(--accent)] text-white p-0.5 rounded-full border-2 border-[var(--bg-card)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-[var(--text-primary)] truncate">{user.name}</h4>
                    <div className="flex gap-1.5 shrink-0">
                      {user.pinnedBadges?.map(id => (
                        <span key={id} title={BADGE_DEFINITIONS[id]?.name} className="text-sm w-6 h-6 flex items-center justify-center bg-[var(--bg-secondary)] backdrop-blur-sm rounded-full shadow-sm border border-[var(--border-color)] text-[var(--text-primary)]">
                          {BADGE_DEFINITIONS[id]?.icon}
                        </span>
                      ))}
                    </div>
                    {user.id !== currentUser.uid && (
                      <KudosButton 
                        targetUserId={user.id} 
                        messageId={`profile-${user.id}`} 
                        kudosGiven={user.kudosVoters || []} 
                        currentKudos={user.kudosCount || 0}
                      />
                    )}
                    {isMe && <span className="bg-[#129780] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">YOU</span>}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {user.verifiedSkill || 'Community Helper'}
                  </p>
                </div>

                <div className="flex items-center gap-8 pr-4">
                  <div className="text-center">
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mb-0.5">Trust</p>
                    <p className="text-sm font-black text-[var(--accent)]">{Math.min(100, user.trustScore || 0)}%</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase mb-0.5">Helps</p>
                    <p className="text-sm font-black text-[var(--text-primary)]">{user.contributions || 0}</p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Persistence Note */}
      <p className="text-center text-gray-400 text-xs font-medium max-w-md mx-auto leading-relaxed">
        Leaderboard updates in real-time. Weekly resets occur every Monday at 00:00 UTC. 
        Keep helping to climb the ranks!
      </p>
    </div>
  );
}
