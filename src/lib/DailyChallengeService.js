import { db } from './firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Service to handle Daily Challenge logic.
 * In a real production app, the 'selectDailyChallenge' part would run in a Cloud Function.
 */
export const DailyChallengeService = {
  
  // Fetches today's active challenge
  getCurrentChallenge: async () => {
    const challengeRef = doc(db, 'dailyChallenge', 'current');
    const snap = await getDoc(challengeRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  },

  // Fetches yesterday's winner
  getPreviousChampion: async () => {
    const q = query(
      collection(db, 'dailyChallengeHistory'),
      orderBy('date', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data();
    }
    return null;
  },

  /**
   * MOCK SELECTION LOGIC (To be replaced by Cloud Function)
   * Selects: High Urgency + Most Views + Oldest
   */
  triggerDailySelection: async () => {
    const postsRef = collection(db, 'posts');
    // Simplified query to avoid requiring composite indexes immediately
    const q = query(
      postsRef,
      where('status', '==', 'open')
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    // Pick the best one (Sort in JS instead of Firestore to be index-safe)
    const candidates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort logic: High Urgency (Assume 1-5 or strings) -> Oldest First
    candidates.sort((a, b) => {
      // Urgency sort (descending)
      const urgencyMap = { 'High': 3, 'Normal': 2, 'Low': 1 };
      const urgencyA = urgencyMap[a.urgency] || 0;
      const urgencyB = urgencyMap[b.urgency] || 0;
      if (urgencyB !== urgencyA) return urgencyB - urgencyA;
      
      // Date sort (ascending - oldest first)
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeA - timeB;
    });

    const selected = candidates[0]; 

    // Move current to history
    const currentRef = doc(db, 'dailyChallenge', 'current');
    const currentSnap = await getDoc(currentRef);
    if (currentSnap.exists()) {
      await setDoc(doc(collection(db, 'dailyChallengeHistory')), {
        ...currentSnap.data(),
        archivedAt: serverTimestamp()
      });
    }

    // Set new current
    const newChallenge = {
      requestId: selected.id,
      title: selected.title,
      category: selected.category,
      urgency: selected.urgency,
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      winnerId: null,
      createdAt: serverTimestamp()
    };

    await setDoc(currentRef, newChallenge);
    return newChallenge;
  }
};
