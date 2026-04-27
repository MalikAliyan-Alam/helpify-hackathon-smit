import React from 'react';
import { motion } from 'framer-motion';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export function PollCard({ poll, messageId, collectionPath = 'messages' }) {
  const { currentUser } = useAuth();
  const options = poll.options || [];
  const votes = poll.votes || {}; // { optionIndex: [userIds] }
  const isClosed = poll.status === 'closed';
  
  const totalVotes = Object.values(votes).reduce((acc, curr) => acc + curr.length, 0);

  const getOptionVotes = (index) => votes[index]?.length || 0;
  const getPercentage = (index) => totalVotes === 0 ? 0 : Math.round((getOptionVotes(index) / totalVotes) * 100);
  
  const userVote = Object.entries(votes).find(([_, users]) => users.includes(currentUser?.uid))?.[0];

  const handleVote = async (optionIndex) => {
    if (isClosed || !currentUser) return;
    
    const docRef = doc(db, collectionPath, messageId);
    const fieldPath = collectionPath === 'messages' ? 'poll.votes' : 'votes';
    
    try {
      // 1. Remove previous vote if any
      if (userVote !== undefined) {
        if (parseInt(userVote) === optionIndex) return; // Already voted for this
        await updateDoc(docRef, {
          [`${fieldPath}.${userVote}`]: arrayRemove(currentUser.uid)
        });
      }

      // 2. Add new vote
      await updateDoc(docRef, {
        [`${fieldPath}.${optionIndex}`]: arrayUnion(currentUser.uid)
      });
    } catch (err) {
      console.error("Voting failed", err);
    }
  };

  const handleClose = async () => {
    if (poll.creatorId !== currentUser?.uid) return;
    const docRef = doc(db, collectionPath, messageId);
    const fieldPath = collectionPath === 'messages' ? 'poll.status' : 'status';
    await updateDoc(docRef, { [fieldPath]: 'closed' });
  };

  const winnerIndex = isClosed ? Object.entries(votes).reduce((max, curr) => curr[1].length > (votes[max]?.length || 0) ? curr[0] : max, 0) : null;

  return (
    <div className="w-full max-w-sm bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] rounded-[24px] p-6 shadow-xl overflow-hidden relative group">
      {/* Decorative Blur */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#129780]/10 rounded-full blur-2xl group-hover:bg-[#129780]/20 transition-all"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full">
            {isClosed ? 'Poll Closed' : 'Live Poll'}
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)]">{totalVotes} votes</span>
        </div>

        <h4 className="text-lg font-bold text-[var(--text-primary)] mb-6 leading-tight">
          {poll.question}
        </h4>

        <div className="space-y-3">
          {options.map((option, index) => {
            const isVoted = parseInt(userVote) === index;
            const percentage = getPercentage(index);
            const isWinner = isClosed && parseInt(winnerIndex) === index;

            return (
              <button
                key={index}
                onClick={() => handleVote(index)}
                disabled={isClosed}
                className={`w-full relative text-left p-4 rounded-2xl transition-all border overflow-hidden ${
                  isVoted 
                    ? 'border-[var(--accent)] bg-[var(--bg-card)] shadow-md' 
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] hover:border-[var(--accent)]/30'
                } ${isClosed ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}`}
              >
                {/* Percentage Bar Background */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  className={`absolute inset-0 opacity-10 -z-10 ${isWinner ? 'bg-[var(--accent)]' : 'bg-[var(--text-secondary)]'}`}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${isVoted ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                      {option}
                    </span>
                    {isVoted && (
                      <span className="text-[var(--accent)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-black ${isVoted ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                    {percentage}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {poll.creatorId === currentUser?.uid && !isClosed && (
          <button
            onClick={handleClose}
            className="w-full mt-6 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors border-t border-[var(--border-color)] pt-4"
          >
            Close Poll
          </button>
        )}
      </div>
    </div>
  );
}
