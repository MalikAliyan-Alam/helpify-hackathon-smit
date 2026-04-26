import React from 'react';
import { db } from './firebase';
import { doc, updateDoc, increment, serverTimestamp, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti'; // Celebratory achievement animation

export const BADGE_DEFINITIONS = {
  FIRST_HELPER: { id: 'FIRST_HELPER', name: 'First Helper', icon: '🌱', description: 'Help on your first request', condition: 'first_help' },
  SPEED_DEMON: { id: 'SPEED_DEMON', name: 'Speed Demon', icon: '⚡', description: 'Resolve a request in under 1 hour', condition: 'fast_resolve' },
  STREAK_SAVER: { id: 'STREAK_SAVER', name: 'Streak Saver', icon: '🔥', description: 'Maintain a 7-day helping streak', condition: '7_day_streak' },
  TRUST_ELITE: { id: 'TRUST_ELITE', name: 'Trust Elite', icon: '💎', description: 'Reach a Trust Score of 90%+', condition: 'high_trust' },
  SPECIALIST: { id: 'SPECIALIST', name: 'Specialist', icon: '🎯', description: 'Get endorsed 10 times in the same skill', condition: '10_endorsements' },
  COMMUNITY_PILLAR: { id: 'COMMUNITY_PILLAR', name: 'Community Pillar', icon: '🤝', description: 'Help on 50 requests total', condition: '50_helps' },
  EXPERT_VOICE: { id: 'EXPERT_VOICE', name: 'Expert Voice', icon: '🧠', description: 'Get verified in a skill category', condition: 'verified' },
  EARLY_ADOPTER: { id: 'EARLY_ADOPTER', name: 'Early Adopter', icon: '🚀', description: 'One of the first 100 users', condition: 'early_join' },
  LEGEND: { id: 'LEGEND', name: 'Legend', icon: '👑', description: 'Maintain a 100-day helping streak', condition: '100_day_streak' },
  COMMUNITY_FAVORITE: { id: 'COMMUNITY_FAVORITE', name: 'Community Favorite', icon: '👏', description: 'Received 50 Kudos from the community', condition: '50_kudos' },
  CROWD_PLEASER: { id: 'CROWD_PLEASER', name: 'Crowd Pleaser', icon: '🌟', description: 'Received 100 Kudos from the community', condition: '100_kudos' },
  LEGEND_OF_KINDNESS: { id: 'LEGEND_OF_KINDNESS', name: 'Legend of Kindness', icon: '🏵️', description: 'Received 500 Kudos from the community', condition: '500_kudos' }
};

export const checkAndUnlockBadges = async (userId, userData, actionType, actionData = {}) => {
  const earnedBadges = userData.earnedBadges || [];
  const newBadges = [];

  const unlock = async (badgeId) => {
    if (earnedBadges.some(b => b.id === badgeId)) return;
    
    const badge = BADGE_DEFINITIONS[badgeId];
    const newBadgeEntry = { id: badge.id, unlockedAt: new Date() };
    
    newBadges.push(badge);
    
    // Update Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      earnedBadges: [...earnedBadges, newBadgeEntry],
      trustScore: userData.trustScore >= 100 ? 100 : increment(5)
    });

    // Trigger Celebration
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#129780', '#2b3231', '#ffffff']
    });

    // Notify with JSX
    toast.success((t) => (
      <div className="flex items-center gap-3">
        <span className="text-2xl">{badge.icon}</span>
        <div>
          <p className="font-bold text-xs uppercase tracking-widest text-[#129780]">Badge Unlocked!</p>
          <p className="font-black text-sm">{badge.name}</p>
        </div>
      </div>
    ), { duration: 5000 });
  };

  if (actionType === 'help' && userData.contributions === 0) await unlock('FIRST_HELPER');
  if (actionType === 'resolve' && actionData.duration < 3600000) await unlock('SPEED_DEMON');
  if (actionType === 'streak' && actionData.count >= 7) await unlock('STREAK_SAVER');
  if (actionType === 'streak' && actionData.count >= 100) await unlock('LEGEND');
  if (userData.trustScore >= 90) await unlock('TRUST_ELITE');
  if (userData.contributions >= 50) await unlock('COMMUNITY_PILLAR');
  if (userData.verified) await unlock('EXPERT_VOICE');
  
  // Kudos Milestones
  const kudos = userData.kudosCount || 0;
  if (kudos >= 50) await unlock('COMMUNITY_FAVORITE');
  if (kudos >= 100) await unlock('CROWD_PLEASER');
  if (kudos >= 500) await unlock('LEGEND_OF_KINDNESS');

  if (actionType === 'endorsement') {
    const endorsements = userData.endorsements || {};
    const maxEndorsements = Object.values(endorsements).reduce((max, e) => Math.max(max, e.count || 0), 0);
    if (maxEndorsements >= 10) await unlock('SPECIALIST');
  }

  return newBadges;
};

export const handleKudos = async (targetUserId, messageId, currentUserId) => {
  if (!targetUserId || !messageId || !currentUserId) return;
  if (targetUserId === currentUserId) {
    toast.error("You can't kudos your own message!");
    return;
  }

  try {
    const messageRef = doc(db, 'messages', messageId);
    const targetUserRef = doc(db, 'users', targetUserId);
    
    // Update target user kudos
    await updateDoc(targetUserRef, {
      kudosCount: increment(1),
      trustScore: increment(0.5) // Small trust boost
    });

    // Check for badges
    const targetSnap = await getDoc(targetUserRef);
    if (targetSnap.exists()) {
      await checkAndUnlockBadges(targetUserId, targetSnap.data(), 'kudos');
    }

    toast.success('Kudos sent! 👏', { position: 'bottom-center' });
  } catch (err) {
    console.error(err);
    toast.error('Failed to send kudos');
  }
};

export const updateStreak = async (userId, userData) => {
  const now = new Date();
  const lastDate = userData.lastHelpedDate?.toDate ? userData.lastHelpedDate.toDate() : null;
  
  let currentStreak = userData.currentStreak || 0;
  let streakFreezes = userData.streakFreezes || 0;
  const longestStreak = userData.longestStreak || 0;

  if (lastDate && lastDate.getUTCFullYear() === now.getUTCFullYear() && 
      lastDate.getUTCMonth() === now.getUTCMonth() && 
      lastDate.getUTCDate() === now.getUTCDate()) {
    return { currentStreak, updated: false };
  }

  const yesterday = new Date(now);
  yesterday.setUTCDate(now.getUTCDate() - 1);
  
  const wasYesterday = lastDate && 
    lastDate.getUTCFullYear() === yesterday.getUTCFullYear() && 
    lastDate.getUTCMonth() === yesterday.getUTCMonth() && 
    lastDate.getUTCDate() === yesterday.getUTCDate();

  if (wasYesterday) {
    currentStreak += 1;
  } else {
    if (streakFreezes > 0) {
      streakFreezes -= 1;
      currentStreak += 1;
      toast('🧊 Streak Freeze Used!', { icon: '🧊' });
    } else {
      currentStreak = 1;
    }
  }

  const newLongest = Math.max(currentStreak, longestStreak);
  
  let newFreezes = streakFreezes;
  if (currentStreak > 0 && currentStreak % 30 === 0) {
    newFreezes += 1;
    toast.success('🧊 Earned a Streak Freeze!', { icon: '🧊' });
  }

  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    currentStreak,
    longestStreak: newLongest,
    lastHelpedDate: serverTimestamp(),
    streakFreezes: newFreezes,
    contributions: increment(1)
  });

  if (currentStreak === 3) toast('🔥 You\'re on a roll! 3-day streak!', { icon: '🔥' });
  if (currentStreak === 30) {
    await updateDoc(userRef, { trustScore: userData.trustScore >= 100 ? 100 : increment(20) });
    toast.success('💎 30-Day Streak! Trust Score Bonus +20!', { icon: '🏆' });
  }

  await checkAndUnlockBadges(userId, { ...userData, currentStreak }, 'streak', { count: currentStreak });

  return { currentStreak, updated: true };
};
