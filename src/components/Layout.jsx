import React from 'react';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f3eb]">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Outlet />
      </main>
      <footer className="w-full text-center py-6 text-sm text-gray-500 max-w-7xl mx-auto px-8 border-t border-gray-200/50 mt-12">
        HelpHub AI is built as a premium-feel, multi-page community support product using HTML, CSS, JavaScript, React, and LocalStorage/Firebase.
      </footer>
    </div>
  );
}
