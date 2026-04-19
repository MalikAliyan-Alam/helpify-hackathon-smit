import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const displayedLinks = currentUser ? [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Explore', path: '/explore' },
    { name: 'Create Request', path: '/create' },
    { name: 'Messages', path: '/messages' },
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
    <nav className="flex items-center justify-between px-8 py-4 bg-transparent border-b border-gray-200/50 max-w-7xl mx-auto w-full relative">
      <div className="flex-1 flex justify-start">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#129780] flex items-center justify-center text-white font-bold text-lg">
            H
          </div>
          <span className="font-bold text-[#2b3231] text-[17px] tracking-tight">Helplytics AI</span>
        </Link>
      </div>

      <div className="flex-none hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
        {displayedLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`px-4 py-2 rounded-full text-[15px] font-medium transition-colors ${isActive ? 'bg-[#e3e8e6] text-[#2b3231]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="flex-1 flex justify-end items-center gap-4">
        {currentUser ? (
          <>
            <Link to="/notifications" className="hidden md:flex items-center px-5 py-2.5 bg-white rounded-full border border-gray-200 text-[15px] font-medium text-gray-500 shadow-sm hover:bg-gray-50 transition-colors">
              Notifications
            </Link>
            <Link to="/ai-center">
              <Button variant="default" className="rounded-full px-6 py-2.5 text-[15px] font-semibold">Open AI Center</Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} className="rounded-full border-gray-200 shadow-sm bg-white font-semibold text-sm h-9">Log out</Button>
          </>
        ) : !isAuthPage ? (
          <>
            <Link to="/login" className="text-gray-600 font-semibold hover:text-gray-900 px-4">Log in</Link>
            <Link to="/signup">
              <Button variant="default" className="rounded-full px-6 py-2.5 text-[15px] font-semibold">Join the platform</Button>
            </Link>
          </>
        ) : null}
      </div>
    </nav>
  );
}
