import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import toast from 'react-hot-toast';

export function BookingModal({ isOpen, onClose, helper, post, currentUser }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fullHelper, setFullHelper] = useState(null);

  useEffect(() => {
    if (!helper?.uid || !isOpen) return;

    // Fetch helper's full data for availability
    const fetchHelper = async () => {
      try {
        const docRef = doc(db, 'users', helper.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFullHelper(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching helper availability:", err);
      }
    };
    fetchHelper();

    // Listen for existing bookings
    const q = query(
      collection(db, 'bookings'),
      where('helperId', '==', helper.uid),
      where('status', '!=', 'cancelled')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const booked = snapshot.docs.map(doc => ({
        date: doc.data().date,
        slot: doc.data().slot
      }));
      setBookedSlots(booked);
    });

    return () => unsubscribe();
  }, [helper, isOpen]);

  if (!isOpen) return null;

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select both a date and a time slot.');
      return;
    }

    try {
      setLoading(true);
      
      // 1. Create the booking
      await addDoc(collection(db, 'bookings'), {
        helperId: helper.uid,
        helperName: helper.name,
        requesterId: currentUser.uid,
        requesterName: currentUser.displayName || 'Anonymous',
        postId: post.id,
        postTitle: post.title,
        date: selectedDate,
        slot: selectedSlot,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // 2. Notify Helper
      await addDoc(collection(db, 'notifications'), {
        userId: helper.uid,
        message: `${currentUser.displayName || 'Someone'} booked a session with you for "${post.title}"`,
        type: 'Booking',
        createdAt: serverTimestamp(),
        read: false
      });

      // 3. Notify Requester
      await addDoc(collection(db, 'notifications'), {
        userId: currentUser.uid,
        message: `Your session with ${helper.name} has been requested for ${selectedDate} at ${selectedSlot}`,
        type: 'Booking',
        createdAt: serverTimestamp(),
        read: false
      });

      toast.success('Session booked successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to book session.');
    } finally {
      setLoading(false);
    }
  };

  const isSlotBooked = (date, slot) => {
    return bookedSlots.some(b => b.date === date && b.slot === slot);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[var(--bg-card)] sm:bg-[var(--glass-bg)] sm:backdrop-blur-2xl border border-[var(--glass-border)] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[var(--accent)] font-black text-[10px] uppercase tracking-[0.2em] mb-1">SCHEDULING</p>
              <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Book with {helper.name}</h3>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/80 transition-colors">×</button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 opacity-60">Select Date</label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 opacity-60">Available Slots</label>
              <div className="flex flex-wrap gap-2">
                {!fullHelper ? (
                  <div className="w-full flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : fullHelper.availability?.slots?.length > 0 ? (
                  fullHelper.availability.slots.map((slot, idx) => {
                    const booked = isSlotBooked(selectedDate, slot);
                    return (
                      <button
                        key={idx}
                        disabled={booked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                          booked 
                            ? 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] opacity-40 cursor-not-allowed'
                            : selectedSlot === slot
                              ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg shadow-[var(--accent)]/20'
                              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--accent)]'
                        }`}
                      >
                        {slot} {booked && '(Booked)'}
                      </button>
                    );
                  })
                ) : (
                  <div className="w-full bg-orange-500/5 border border-orange-500/10 rounded-2xl p-6 text-center">
                    <p className="text-sm text-orange-500 font-bold mb-1">
                      No slots configured
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold opacity-60">
                      The helper hasn't set their availability yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-color)]">
              <Button 
                onClick={handleBooking} 
                disabled={loading || !selectedDate || !selectedSlot}
                className="w-full rounded-full py-4 font-black bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {loading ? 'Processing...' : 'Confirm Booking'}
              </Button>
              <p className="text-center text-[9px] text-[var(--text-secondary)] mt-6 uppercase tracking-[0.2em] font-black opacity-40">
                Cancellations must be made 2 hours in advance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
