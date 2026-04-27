/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, name) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: name });
    
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      name,
      email,
      skills: [],
      interests: [],
      location: '',
      trustScore: 100,
      badges: ['New Member'],
      contributions: 0,
      createdAt: new Date()
    });

    return user;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        skills: [],
        interests: [],
        location: '',
        trustScore: 100,
        badges: ['New Member'],
        contributions: 0,
        createdAt: new Date()
      });
    }
    
    return user;
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fallback user data while loading from Firestore
        setUserData({
          name: user.displayName || user.email,
          email: user.email
        });

        // Listen in real-time to the user document
        const userRef = doc(db, 'users', user.uid);
        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore real-time read failed:", error);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  function logout() {
    return signOut(auth);
  }

  function isAccountRestricted() {
    if (!userData) return false;
    if (userData.accountStatus === 'banned') return 'banned';
    if (userData.accountStatus === 'suspended') {
      const now = new Date();
      const suspendedUntil = userData.suspendedUntil?.toDate ? userData.suspendedUntil.toDate() : new Date(0);
      if (now < suspendedUntil) return 'suspended';
    }
    return false;
  }

  const value = {
    currentUser,
    userData,
    signup,
    login,
    signInWithGoogle,
    logout,
    isAccountRestricted
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-page)] transition-colors duration-500">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-[var(--accent)] opacity-20 blur-3xl rounded-full animate-pulse"></div>
            
            {/* Animated Isometric Stack */}
            <div className="relative w-12 h-12 transform rotate-12 animate-bounce-gentle">
              {/* Top Layer */}
              <div className="absolute top-0 left-0 w-10 h-10 bg-gradient-to-tr from-[var(--accent)] to-[#2dd4bf] rounded-xl z-30 shadow-2xl border border-white/20 animate-pulse"></div>
              {/* Middle Layer */}
              <div className="absolute top-3 left-3 w-10 h-10 bg-[var(--accent)] opacity-60 rounded-xl z-20 shadow-xl"></div>
              {/* Bottom Layer */}
              <div className="absolute top-6 left-6 w-10 h-10 bg-[var(--accent)] opacity-30 rounded-xl z-10"></div>
              
              {/* Center Active Node */}
              <div className="absolute top-[14px] left-[14px] w-3 h-3 bg-white rounded-full z-40 shadow-inner animate-ping"></div>
            </div>
          </div>
          <div className="mt-12 text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">
            Helplystack initializing
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}
