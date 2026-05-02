import React from 'react';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] overflow-x-hidden w-full">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Outlet />
      </main>
      <footer className="w-full text-center py-6 text-sm text-[var(--text-secondary)] max-w-7xl mx-auto px-8 border-t border-[var(--border-color)] mt-12">
        Powered by our tech stack: React, Tailwind CSS, and Firebase.
      </footer>
    </div>
  );
}
