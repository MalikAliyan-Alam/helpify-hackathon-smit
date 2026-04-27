import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';

import { useTheme } from '../contexts/ThemeContext';

export function Navbar() {
  const { isDarkMode, toggleTheme } = useTheme();
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

  const displayedLinks = isAdmin ? [
    { name: 'Admin Panel', path: '/admin' },
    { name: 'Explore', path: '/explore' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Polls', path: '/polls' },
    { name: 'Messages', path: '/messages' },
    { name: 'Sessions', path: '/sessions' },
    { name: 'Profile', path: '/profile' }
  ] : [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Explore', path: '/explore' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Polls', path: '/polls' },
    { name: 'Create Request', path: '/create' },
    { name: 'Messages', path: '/messages' },
    { name: 'Sessions', path: '/sessions' },
    { name: 'Profile', path: '/profile' }
  ];

  async function handleLogout() {
    toast((t) => (
      <div className="flex flex-col gap-4 min-w-[280px] p-1">
        <div>
          <h4 className="font-bold text-[var(--text-primary)] text-lg mb-1">Confirm Logout</h4>
          <p className="text-sm text-[var(--text-secondary)]">Are you sure you want to leave your session?</p>
        </div>
        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-5 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
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
        padding: '24px',
        borderRadius: '28px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        color: 'var(--text-primary)'
      }
    });
  }

  return (
    <nav className="sticky top-0 z-[100] bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] px-6 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo Section - flex-1 to push nav to center */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
              {/* Logo: Isometric Stack */}
              <div className="relative w-7 h-7 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                {/* Top Layer */}
                <div className="absolute top-0 left-0 w-5 h-5 bg-gradient-to-tr from-[var(--accent)] to-[#2dd4bf] rounded-md z-30 shadow-lg border border-white/20"></div>
                {/* Middle Layer */}
                <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-[var(--accent)] opacity-60 rounded-md z-20 shadow-md"></div>
                {/* Bottom Layer */}
                <div className="absolute top-3 left-3 w-5 h-5 bg-[var(--accent)] opacity-30 rounded-md z-10"></div>
                
                {/* Center dot/accent */}
                <div className="absolute top-[6px] left-[6px] w-1.5 h-1.5 bg-white rounded-full z-40 shadow-sm animate-pulse"></div>
              </div>
            </div>
            <span className="font-black text-[var(--text-primary)] text-xl tracking-tighter">Helplystack</span>
          </Link>
        </div>

        {/* Center Navigation - Perfectly Centered */}
        <div className="hidden lg:flex items-center bg-[var(--bg-secondary)] p-1.5 rounded-full border border-[var(--border-color)] shadow-inner">
          {displayedLinks.slice(0, 3).map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isActive ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                {link.name}
              </Link>
            );
          })}
          {/* More Dropdown Placeholder / Extra Links */}
          {displayedLinks.length > 3 && (
             <div className="relative group px-4 py-2 text-sm font-bold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] flex items-center gap-1">
                More
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-color)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                   {displayedLinks.slice(3).map((link) => (
                     <Link key={link.name} to={link.path} className="block px-6 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)]">
                        {link.name}
                     </Link>
                   ))}
                </div>
             </div>
          )}
        </div>

        {/* Right Actions Cluster */}
        <div className="flex-1 flex justify-end items-center gap-3">
          {/* Theme Toggle - Visible to All */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/80 transition-colors shadow-sm"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>

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
              <Link to="/notifications" className="relative p-2.5 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/80 transition-colors">
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
                <Button variant="default" className="hidden sm:flex rounded-xl px-5 py-2 text-sm font-bold shadow-lg shadow-[var(--accent)]/20">AI Center</Button>
              </Link>

              {/* Profile / Logout Group */}
              <div className="relative group">
                 <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] shadow-md flex items-center justify-center text-[var(--text-primary)] font-bold cursor-pointer hover:scale-105 transition-transform overflow-hidden">
                    {userData?.avatar ? <img src={userData.avatar} className="w-full h-full object-cover" /> : userData?.name?.charAt(0).toUpperCase() || 'U'}
                 </div>
                 <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-color)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                    <Link to="/profile" className="block px-6 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]">Settings</Link>
                    <div className="h-px bg-[var(--border-color)] my-1 mx-4"></div>
                    <button onClick={handleLogout} className="w-full text-left px-6 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 hover:text-red-600">Log out</button>
                 </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {location.pathname === '/signup' ? (
                <Link to="/login" className="text-[var(--text-secondary)] font-bold text-sm hover:text-[var(--text-primary)] transition-colors">Log in</Link>
              ) : location.pathname === '/login' ? (
                <Link to="/signup">
                  <Button variant="default" className="rounded-xl px-6 py-2.5 text-sm font-black shadow-lg shadow-[var(--accent)]/20">Join Now</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-[var(--text-secondary)] font-bold text-sm hover:text-[var(--text-primary)] transition-colors">Log in</Link>
                  <Link to="/signup">
                    <Button variant="default" className="rounded-xl px-6 py-2.5 text-sm font-black shadow-lg shadow-[var(--accent)]/20">Join Now</Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
