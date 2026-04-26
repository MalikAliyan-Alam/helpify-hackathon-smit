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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#fdfcf9] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-1">SCHEDULING</p>
              <h3 className="text-2xl font-bold text-[#2b3231]">Book with {helper.name}</h3>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">×</button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#2b3231] mb-3">Select Date</label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2b3231] mb-3">Available Slots</label>
              <div className="flex flex-wrap gap-2">
                {!fullHelper ? (
                  <div className="w-full flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-[#129780] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : fullHelper.availability?.slots?.length > 0 ? (
                  fullHelper.availability.slots.map((slot, idx) => {
                    const booked = isSlotBooked(selectedDate, slot);
                    return (
                      <button
                        key={idx}
                        disabled={booked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                          booked 
                            ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
                            : selectedSlot === slot
                              ? 'bg-[#129780] text-white border-[#129780]'
                              : 'bg-white text-[#129780] border-[#129780]/20 hover:bg-[#f0f9f8]'
                        }`}
                      >
                        {slot} {booked && '(Booked)'}
                      </button>
                    );
                  })
                ) : (
                  <div className="w-full bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                    <p className="text-sm text-amber-700 font-medium italic">
                      This helper hasn't set up their specific time slots yet. 
                    </p>
                    <p className="text-[10px] text-amber-600 mt-1 uppercase tracking-widest font-bold">
                      Tip: You can set yours in Profile &gt; Scheduling
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Button 
                onClick={handleBooking} 
                disabled={loading || !selectedDate || !selectedSlot}
                className="w-full rounded-full py-4 font-bold shadow-lg"
              >
                {loading ? 'Processing...' : 'Confirm Booking'}
              </Button>
              <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">
                Cancellations must be made 2 hours in advance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
