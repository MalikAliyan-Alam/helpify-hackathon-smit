import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { handleKudos } from '../lib/gamification.jsx';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export function KudosButton({ targetUserId, messageId, kudosGiven = [], currentKudos = 0 }) {
  const { currentUser } = useAuth();
  const [localKudos, setLocalKudos] = useState(currentKudos);
  const [hasVoted, setHasVoted] = useState(kudosGiven?.includes(currentUser?.uid));
  const [isAnimating, setIsAnimating] = useState(false);

  const onKudos = async (e) => {
    e.stopPropagation();
    if (!currentUser || hasVoted || targetUserId === currentUser.uid) return;

    setIsAnimating(true);
    setHasVoted(true);
    setLocalKudos(prev => prev + 1);

    try {
      if (messageId?.startsWith('profile-')) {
        // Profile-level Kudos
        const userRef = doc(db, 'users', targetUserId);
        await updateDoc(userRef, {
          kudosVoters: arrayUnion(currentUser.uid)
        });
      } else {
        // Message-level Kudos
        const messageRef = doc(db, 'messages', messageId);
        await updateDoc(messageRef, {
          kudosGiven: arrayUnion(currentUser.uid)
        });
      }

      // 2. Update global user stats and badges
      await handleKudos(targetUserId, messageId, currentUser.uid);
    } catch (err) {
      console.error(err);
      setHasVoted(false);
      setLocalKudos(prev => prev - 1);
    }

    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onKudos}
      disabled={hasVoted}
      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border ${
        hasVoted 
          ? 'bg-[#129780] border-[#129780] text-white' 
          : 'bg-white border-gray-100 text-gray-500 hover:border-[#129780]/30 hover:bg-[#f0f9f8]'
      } shadow-sm relative overflow-hidden`}
    >
      <AnimatePresence>
        {isAnimating && (
          <motion.span
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -40, opacity: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center text-lg pointer-events-none"
          >
            👏
          </motion.span>
        )}
      </AnimatePresence>

      <motion.span 
        animate={isAnimating ? { rotate: [0, -20, 20, -20, 0], scale: [1, 1.4, 1] } : {}}
        className={`text-sm ${hasVoted ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'} transition-all`}
      >
        👏
      </motion.span>
      
      <span className="text-[11px] font-black tracking-tighter">
        {localKudos > 0 ? localKudos : 'KUDOS'}
      </span>

      {hasVoted && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 bg-[#129780]/10 pointer-events-none"
        />
      )}
    </motion.button>
  );
}
