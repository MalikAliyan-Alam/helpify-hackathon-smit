import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function LiveSessionPage() {
  const { sessionId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const docRef = doc(db, 'bookings', sessionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSession(docSnap.data());
        } else {
          toast.error("Session not found");
          navigate('/sessions');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId, navigate]);

  const handleEndSession = async () => {
    if (window.confirm('End this session and mark it as completed?')) {
      try {
        await updateDoc(doc(db, 'bookings', sessionId), { status: 'completed' });
        toast.success('Session completed!');
        navigate('/sessions');
      } catch (err) {
        toast.error('Failed to update session status');
      }
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#2b3231]">
      <div className="w-8 h-8 border-4 border-[#129780] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-[#1a1f1e] flex flex-col">
      {/* Session Header */}
      <div className="bg-[#2b3231] border-b border-white/5 p-4 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#129780] flex items-center justify-center text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15.6 11.6L22 7v10l-6.4-4.6z"></path><rect x="2" y="5" width="14" height="14" rx="2"></rect></svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm leading-tight">{session?.postTitle}</h3>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Live Collaborative Session</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-[#129780]/20 text-[#129780] border-none font-bold px-3 py-1">LIVE</Badge>
          <Button 
            onClick={handleEndSession}
            variant="destructive"
            className="rounded-full px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white font-bold text-xs"
          >
            End Session
          </Button>
        </div>
      </div>

      {/* Main Call Interface */}
      <div className="flex-1 bg-black relative">
        <iframe
          src={`https://meet.jit.si/${sessionId}#userInfo.displayName="${currentUser?.displayName || 'User'}"&config.startWithAudioMuted=true&config.startWithVideoMuted=false`}
          allow="camera; microphone; display-capture; fullscreen; clipboard-read; clipboard-write; speaker-selection"
          className="w-full h-full border-none"
          title="Video Call"
        ></iframe>
        
        {/* Helper/Requester Info Overlay */}
        <div className="absolute bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none">
           <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
                Connected with {currentUser.uid === session?.helperId ? session?.requesterName : session?.helperName}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${className}`}>
      {children}
    </span>
  );
}
