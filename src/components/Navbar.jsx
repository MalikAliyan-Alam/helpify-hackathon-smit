import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';

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
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-transparent border-b border-gray-200/50 max-w-7xl mx-auto w-full">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#129780] flex items-center justify-center text-white font-bold text-lg">
          H
        </div>
        <span className="font-bold text-[#2b3231] text-[17px] tracking-tight">Helplytics AI</span>
      </Link>

      {!isAuthPage && (
        <div className="hidden md:flex items-center gap-1">
          {displayedLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-full text-[15px] font-medium transition-colors ${
                  isActive ? 'bg-[#e3e8e6] text-[#2b3231]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-4">
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
