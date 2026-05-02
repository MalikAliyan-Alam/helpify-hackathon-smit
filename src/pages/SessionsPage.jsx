import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function SessionsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const qHelper = query(collection(db, 'bookings'), where('helperId', '==', currentUser.uid), where('status', '==', 'pending'));
    const qRequester = query(collection(db, 'bookings'), where('requesterId', '==', currentUser.uid), where('status', '==', 'pending'));

    const unsubHelper = onSnapshot(qHelper, (snap) => {
      const helperBookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), role: 'helper' }));
      updateBookings(helperBookings, 'helper');
    });

    const unsubRequester = onSnapshot(qRequester, (snap) => {
      const requesterBookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), role: 'requester' }));
      updateBookings(requesterBookings, 'requester');
    });

    const updateBookings = (newBookings, type) => {
      setBookings(prev => {
        const others = prev.filter(b => b.role !== type);
        const combined = [...others, ...newBookings];
        setLoading(false);
        return combined.sort((a, b) => new Date(a.date) - new Date(b.date));
      });
    };

    return () => {
      unsubHelper();
      unsubRequester();
    };
  }, [currentUser]);

  const handleStartSession = (booking) => {
    navigate(`/session/${booking.id}`);
  };

  const handleCancelSession = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this session?')) {
      try {
        await updateDoc(doc(db, 'bookings', bookingId), { status: 'cancelled' });
        toast.success('Session cancelled');
      } catch (err) {
        toast.error('Failed to cancel session');
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] p-10 lg:p-14 flex flex-col shadow-xl shadow-[var(--shadow)] border border-[var(--border-color)] group" style={{ background: 'var(--hero-gradient)' }}>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent)] opacity-10 blur-[100px] rounded-full group-hover:opacity-20 transition-opacity duration-1000"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500 opacity-[0.03] blur-[100px] rounded-full"></div>
        
        <div className="relative z-10">
          <p className="opacity-60 font-black text-[10px] uppercase tracking-[0.3em] mb-4 text-[var(--hero-text)]">MANAGEMENT</p>
          <h1 className="text-4xl lg:text-[64px] font-black tracking-tighter mb-4 text-[var(--hero-text)] leading-[1.1]">
            Your Sessions
          </h1>
          <p className="opacity-70 text-lg lg:text-xl max-w-xl text-[var(--hero-text)] font-medium leading-relaxed">
            Coordinate and launch live help sessions with your matches.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading your sessions...</div>
        ) : bookings.length === 0 ? (
          <Card className="border-none shadow-sm rounded-[24px] p-12 text-center">
            <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text-secondary)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No upcoming sessions</h3>
            <p className="text-[var(--text-secondary)] max-w-xs mx-auto mb-8">Once you book a slot with a helper, it will appear here.</p>
            <Button onClick={() => navigate('/explore')} className="rounded-full px-8 py-3 bg-[var(--accent)]">Find Help</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map(booking => (
              <Card key={booking.id} className="border-none shadow-lg rounded-[24px] p-8 flex flex-col relative overflow-hidden group hover:shadow-xl transition-all border border-[var(--border-color)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-bl-[80px] -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
                
                <div className="flex items-start justify-between mb-6">
                  <div className="bg-[var(--accent)] text-white p-4 rounded-[20px] shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15.6 11.6L22 7v10l-6.4-4.6z"></path><rect x="2" y="5" width="14" height="14" rx="2"></rect></svg>
                  </div>
                  <Badge className="bg-[var(--accent)]/10 text-[var(--accent)] border-none px-4 py-1.5 rounded-full font-bold uppercase text-[10px] tracking-widest">
                    {booking.role}
                  </Badge>
                </div>

                <h4 className="font-bold text-[var(--text-primary)] text-xl mb-2 line-clamp-1">{booking.postTitle}</h4>
                <div className="flex flex-col gap-1 mb-6">
                  <p className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
                    {booking.date}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] opacity-60 uppercase tracking-widest font-bold ml-3.5">
                    {booking.slot}
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-8 bg-[var(--bg-secondary)] p-3 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-xs">
                    {(booking.role === 'helper' ? booking.requesterName : booking.helperName).charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-secondary)] opacity-60 font-bold uppercase tracking-tighter">
                      {booking.role === 'helper' ? 'Requester' : 'Helper'}
                    </p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {booking.role === 'helper' ? booking.requesterName : booking.helperName}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                  <Button 
                    onClick={() => handleStartSession(booking)}
                    className="w-full rounded-full py-4 font-bold bg-[var(--accent)] hover:bg-[var(--accent)]/90 shadow-lg shadow-[var(--accent)]/20"
                  >
                    Start Session
                  </Button>
                  <button 
                    onClick={() => handleCancelSession(booking.id)}
                    className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors py-2"
                  >
                    Reschedule or Cancel
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
