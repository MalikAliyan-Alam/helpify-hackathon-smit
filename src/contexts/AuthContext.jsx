import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
    
    // Update auth profile
    await updateProfile(user, { displayName: name });
    
    // We will skip Firestore for now as requested to avoid timeouts
    return user;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      // Since we are skipping dynamic Firestore to fix the timeout,
      // we just mock the userData if a user is logged in.
      if (user) {
        setUserData({
          name: user.displayName || 'Ayesha Khan',
          email: user.email,
          location: 'Karachi',
          trustScore: 98,
          contributions: 3,
          skills: ['Figma', 'UI/UX', 'HTML/CSS'],
          badges: ['Design Ally', 'Fast Responder']
        });
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userData,
    signup,
    login,
    logout
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
