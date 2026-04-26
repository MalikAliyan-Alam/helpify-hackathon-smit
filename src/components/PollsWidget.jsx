import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Card } from './ui/Card';
import { Link } from 'react-router-dom';

export function PollsWidget() {
  const [latestPoll, setLatestPoll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'polls'), orderBy('createdAt', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLatestPoll({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="h-32 bg-[var(--bg-secondary)] animate-pulse rounded-[24px]"></div>;

  return (
    <Card className="border-none shadow-sm rounded-[24px] p-6 hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[var(--accent)] font-black text-[10px] uppercase tracking-widest">Active Discussion</p>
        <Link to="/polls" className="text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">VIEW ALL</Link>
      </div>

      {latestPoll ? (
        <>
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4 line-clamp-2">
            {latestPoll.question}
          </h4>
          <div className="space-y-2 mb-4">
            {latestPoll.options.slice(0, 2).map((opt, i) => {
              const votes = latestPoll.votes?.[i]?.length || 0;
              const total = Object.values(latestPoll.votes || {}).reduce((a, b) => a + b.length, 0);
              const pct = total === 0 ? 0 : Math.round((votes / total) * 100);
              
              return (
                <div key={i} className="relative h-8 bg-[var(--bg-secondary)] rounded-lg overflow-hidden border border-[var(--border-color)]">
                  <div 
                    className="absolute inset-y-0 left-0 bg-[var(--accent)]/10 transition-all duration-500" 
                    style={{ width: `${pct}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] truncate mr-2">{opt}</span>
                    <span className="text-[10px] font-black text-[var(--accent)]">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <Link 
            to="/polls" 
            className="w-full block text-center py-2 bg-[var(--bg-secondary)] text-[var(--accent)] text-[10px] font-black rounded-xl hover:bg-[var(--accent)] hover:text-white transition-all uppercase tracking-widest"
          >
            Vote Now 🗳️
          </Link>
        </>
      ) : (
        <p className="text-xs text-gray-400 italic text-center py-4">No active polls. Start one!</p>
      )}
    </Card>
  );
}
