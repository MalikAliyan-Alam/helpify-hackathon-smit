import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export function NotificationsPage() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch without orderBy to avoid needing a composite index
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort locally
      notifs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      
      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleToggleRead = async (notifId, currentStatus) => {
    try {
      const notifRef = doc(db, 'notifications', notifId);
      await updateDoc(notifRef, { read: !currentStatus });
    } catch (error) {
      console.error("Error updating notification:", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="bg-[var(--hero-bg)] rounded-[24px] p-10 flex flex-col text-[var(--hero-text)]">
        <p className="opacity-60 font-bold text-xs uppercase tracking-wider mb-4">NOTIFICATIONS</p>
        <h1 className="text-4xl lg:text-[56px] font-bold tracking-tight mb-4 max-w-3xl leading-[1.1]">
          Stay updated on requests, helpers, and trust signals.
        </h1>
        <p className="opacity-80 text-lg">
          Track new matches, solved items, AI insights, and reputation changes in one place.
        </p>
      </div>

      <Card className="border-none shadow-sm rounded-[24px] p-6 lg:p-10">
        <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-2">LIVE UPDATES</p>
        <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Notification feed</h3>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500 font-medium">Loading notifications...</div>
          ) : notifications.length > 0 ? (
            notifications.map((notif) => (
              <div key={notif.id} className={`bg-[var(--bg-card)] border ${notif.read ? 'border-[var(--border-color)] opacity-60' : 'border-[var(--accent)]/30'} rounded-[20px] p-6 flex items-center justify-between gap-4`}>
                <div>
                  <p className="text-[17px] font-bold text-[var(--text-primary)] leading-snug mb-2">{notif.message}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {notif.type} • {notif.createdAt?.toDate ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => handleToggleRead(notif.id, notif.read)}
                  className={`rounded-full px-6 py-2 shadow-sm font-semibold border-[var(--border-color)] ${notif.read ? 'text-[var(--text-secondary)] bg-[var(--bg-card)]' : 'text-[var(--text-primary)] bg-[var(--bg-card)]'}`}
                >
                  {notif.read ? 'Read' : 'Unread'}
                </Button>
              </div>
            ))
          ) : (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-12 text-center">
              <div className="w-16 h-16 bg-[var(--bg-card)] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-lg font-bold text-[var(--text-primary)] mb-2">You're all caught up!</p>
              <p className="text-[var(--text-secondary)] text-sm">When there's activity on your requests or profile, it will show up here.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
