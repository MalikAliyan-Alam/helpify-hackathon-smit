import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function DailyChallengeBanner({ challenge, request }) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setUTCHours(24, 0, 0, 0);
      
      const diff = nextMidnight - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  if (!request) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-[2px] rounded-[32px] overflow-hidden group shadow-2xl mb-8"
    >
      {/* Animated Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#129780] via-yellow-400 to-[#129780] animate-gradient-x group-hover:duration-1000"></div>
      
      <div className="relative bg-[var(--bg-card)] rounded-[30px] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-yellow-400/30">
              🏆 Daily Challenge
            </span>
            <span className="text-[var(--text-secondary)] text-xs font-medium">Ends in: {timeLeft}</span>
          </div>
          
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
            {request.title}
          </h2>
          
          <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
               {request.category}
            </div>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
               {request.urgency} Urgency
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/request/${request.id}`)}
          className="bg-[var(--accent)] text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all shadow-xl active:scale-95 shrink-0"
        >
          Take the Challenge 🚀
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s linear infinite;
        }
      `}} />
    </motion.div>
  );
}
