import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Card } from './ui/Card';
import { Link } from 'react-router-dom';

export function TopKudosWidget() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('kudosCount', 'desc'),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTopUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="bg-[var(--accent)] border-none shadow-xl rounded-[24px] p-6 text-white relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
      
      <div className="relative z-10">
        <p className="text-white/70 font-bold text-[10px] uppercase tracking-wider mb-1">APPRECIATION</p>
        <h3 className="text-xl font-bold mb-6">Top Kudos This Week</h3>

        <div className="space-y-4">
          {loading ? (
             Array(3).fill(0).map((_, i) => (
               <div key={i} className="h-10 bg-white/10 rounded-xl animate-pulse"></div>
             ))
          ) : topUsers.length > 0 ? (
            topUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2b3231] flex items-center justify-center text-[10px] font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-bold truncate max-w-[100px]">{user.name}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">👏</span>
                  <span className="text-sm font-black">{user.kudosCount || 0}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-white/60 italic text-center py-4">No kudos yet. Be the first to clap! 👏</p>
          )}
        </div>
      </div>
    </Card>
  );
}
