import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, userData } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const isAdmin = userData?.role === 'admin' || currentUser?.email === 'admin@helpify.com';

  const displayedLinks = currentUser ? (
    isAdmin ? [
      { name: 'Admin Panel', path: '/admin' },
      { name: 'Explore', path: '/explore' },
      { name: 'Leaderboard', path: '/leaderboard' },
      { name: 'Messages', path: '/messages' },
      { name: 'Sessions', path: '/sessions' },
      { name: 'Profile', path: '/profile' }
    ] : [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Explore', path: '/explore' },
      { name: 'Leaderboard', path: '/leaderboard' },
      { name: 'Create Request', path: '/create' },
      { name: 'Messages', path: '/messages' },
      { name: 'Sessions', path: '/sessions' },
      { name: 'Profile', path: '/profile' }
    ]
  ) : [
    { name: 'Explore', path: '/explore' },
  ];

  async function handleLogout() {
    toast((t) => (
      <div className="flex flex-col gap-4 min-w-[280px] p-1">
        <div>
          <h4 className="font-bold text-[#2b3231] text-lg mb-1">Confirm Logout</h4>
          <p className="text-sm text-gray-500">Are you sure you want to leave your session?</p>
        </div>
        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await logout();
                navigate('/');
              } catch (error) {
                console.error("Failed to log out", error);
              }
            }}
            className="px-5 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-full shadow-sm transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
      style: {
        maxWidth: '400px',
        padding: '16px',
        borderRadius: '24px',
        border: '1px solid #f3f4f6',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }
    });
  }

  return (
    <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo Section */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#129780] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#129780]/20 group-hover:scale-105 transition-transform">
              H
            </div>
            <span className="font-black text-[#2b3231] text-lg tracking-tighter">Helplytics <span className="text-[#129780]">AI</span></span>
          </Link>
        </div>

        {/* Center Navigation - Core Links */}
        <div className="hidden lg:flex items-center bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
          {displayedLinks.slice(0, 3).map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isActive ? 'bg-white text-[#129780] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {link.name}
              </Link>
            );
          })}
          {/* More Dropdown Placeholder / Extra Links */}
          {displayedLinks.length > 3 && (
             <div className="relative group px-4 py-2 text-sm font-bold text-gray-500 cursor-pointer hover:text-gray-900 flex items-center gap-1">
                More
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                   {displayedLinks.slice(3).map((link) => (
                     <Link key={link.name} to={link.path} className="block px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#129780]">
                        {link.name}
                     </Link>
                   ))}
                </div>
             </div>
          )}
        </div>

        {/* Right Actions Cluster */}
        <div className="flex-1 flex justify-end items-center gap-3">
          {currentUser ? (
            <>
              {/* Streak */}
              {userData?.currentStreak > 0 && (
                <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl border border-orange-100 shadow-sm">
                  <span className="text-sm">🔥</span>
                  <span className="text-xs font-black">{userData.currentStreak}</span>
                </div>
              )}

              {/* Notifications Icon */}
              <Link to="/notifications" className="relative p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-gray-500 hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </Link>

              {/* AI Center Button */}
              <Link to="/ai-center">
                <Button variant="default" className="hidden sm:flex rounded-xl px-5 py-2 text-sm font-bold shadow-lg shadow-[#129780]/20">AI Center</Button>
              </Link>

              {/* Profile / Logout Group */}
              <div className="relative group">
                 <div className="w-10 h-10 rounded-xl bg-[#2b3231] border-2 border-white shadow-md flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform overflow-hidden">
                    {userData?.avatar ? <img src={userData.avatar} className="w-full h-full object-cover" /> : userData?.name?.charAt(0).toUpperCase() || 'U'}
                 </div>
                 <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                    <Link to="/profile" className="block px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Settings</Link>
                    <div className="h-px bg-gray-100 my-1 mx-4"></div>
                    <button onClick={handleLogout} className="w-full text-left px-6 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600">Log out</button>
                 </div>
              </div>
            </>
          ) : !isAuthPage ? (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 font-bold text-sm hover:text-gray-900 transition-colors">Log in</Link>
              <Link to="/signup">
                <Button variant="default" className="rounded-xl px-6 py-2.5 text-sm font-black shadow-lg shadow-[#129780]/20">Join Now</Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
