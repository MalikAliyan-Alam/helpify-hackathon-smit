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
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f3eb] gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#129780] flex items-center justify-center text-white font-bold text-2xl animate-pulse">
            H
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}
