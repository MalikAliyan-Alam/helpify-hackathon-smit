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
  const { currentUser, logout } = useAuth();
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

  const displayedLinks = currentUser ? [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Explore', path: '/explore' },
    { name: 'Create Request', path: '/create' },
    { name: 'Messages', path: '/messages' },
    { name: 'Sessions', path: '/sessions' },
    { name: 'Profile', path: '/profile' }
  ] : [
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
    <nav className="grid grid-cols-[1fr_auto_1fr] items-center px-8 py-4 bg-transparent border-b border-gray-200/50 max-w-7xl mx-auto w-full gap-4">
      <div className="flex justify-start">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#129780] flex items-center justify-center text-white font-bold text-lg shrink-0">
            H
          </div>
          <span className="font-bold text-[#2b3231] text-[17px] tracking-tight whitespace-nowrap">Helplytics AI</span>
        </Link>
      </div>

      <div className="hidden lg:flex items-center gap-1 justify-center">
        {displayedLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`px-4 py-2 rounded-full text-[15px] font-medium transition-colors whitespace-nowrap ${isActive ? 'bg-[#e3e8e6] text-[#2b3231]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="flex justify-end items-center gap-4">
        {currentUser ? (
          <>
            <Link to="/notifications" className="hidden xl:flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-gray-200 text-[15px] font-medium text-gray-500 shadow-sm hover:bg-gray-50 transition-colors whitespace-nowrap">
              Notifications
              {unreadCount > 0 && (
                <span className="flex items-center justify-center bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link to="/ai-center">
              <Button variant="default" className="rounded-full px-6 py-2.5 text-[15px] font-semibold whitespace-nowrap">Open AI Center</Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} className="rounded-full border-gray-200 shadow-sm bg-white font-semibold text-sm h-9 whitespace-nowrap">Log out</Button>
          </>
        ) : !isAuthPage ? (
          <>
            <Link to="/login" className="text-gray-600 font-semibold hover:text-gray-900 px-4 whitespace-nowrap">Log in</Link>
            <Link to="/signup">
              <Button variant="default" className="rounded-full px-6 py-2.5 text-[15px] font-semibold whitespace-nowrap">Join the platform</Button>
            </Link>
          </>
        ) : null}
      </div>
    </nav>
  );
}
