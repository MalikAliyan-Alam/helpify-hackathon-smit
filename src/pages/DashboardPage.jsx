import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const name = userData?.name || currentUser?.displayName || currentUser?.email || 'User';
  const [allPosts, setAllPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch bookings where user is helper OR requester
    // Firestore doesn't support logical OR across different fields in a simple query, 
    // so we'll fetch both and merge or use two listeners.
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
        return combined.sort((a, b) => new Date(a.date) - new Date(b.date));
      });
    };

    return () => {
      unsubHelper();
      unsubRequester();
    };
  }, [currentUser]);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = [];
      snapshot.forEach((doc) => {
        fetchedPosts.push({ id: doc.id, ...doc.data() });
      });
      setAllPosts(fetchedPosts);
      setPosts(fetchedPosts.slice(0, 5)); // only show latest 5 in the feed
      setLoadingPosts(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setLoadingPosts(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    
    // Fetch notifications for current user
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort locally to avoid needing a composite index
      notifs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      
      setNotifications(notifs.slice(0, 5));
    });

    return () => unsubscribe();
  }, [currentUser]);
  
  // Dynamic Calculations
  const helpingCount = allPosts.filter(p => p.helpers?.some(h => h.uid === currentUser?.uid)).length;
  const openRequestsCount = allPosts.filter(p => p.status !== 'Solved').length;
  const userActiveRequests = allPosts.filter(p => p.userId === currentUser?.uid && p.status !== 'Solved').length;

  const allTags = allPosts.flatMap(p => p.tags || []);
  const uniqueTagsCount = new Set(allTags.map(t => t.toLowerCase())).size;

  const categoryCounts = allPosts.reduce((acc, p) => {
    if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  let mostRequestedCategory = 'None yet';
  let maxCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostRequestedCategory = cat;
    }
  }

  const mentorSkills = userData?.skills?.length > 0 ? userData.skills.join(', ') : 'General Support';

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="bg-[#2b3231] rounded-[24px] p-10 flex flex-col text-white">
        <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">DASHBOARD</p>
        <h1 className="text-4xl lg:text-[56px] font-bold tracking-tight mb-4">
          Welcome back, {name}.
        </h1>
        <p className="text-gray-300 text-lg">
          Your command center for requests, AI insights, helper momentum, and live community activity.
        </p>
      </div>

      {/* Setup Availability CTA */}
      {(!userData?.availability?.slots || userData?.availability?.slots.length === 0) && (
        <Card className="bg-[#129780] border-none shadow-lg rounded-[24px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in duration-500">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">Enable Session Bookings 📅</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              You haven't set up your availability yet. Define your preferred days and time slots in your profile so other members can book support sessions with you.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/profile')}
            className="bg-white text-[#129780] hover:bg-gray-100 font-bold px-8 py-3 rounded-full shrink-0"
          >
            Setup Availability
          </Button>
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-4">TRUST SCORE</p>
            <h3 className="text-4xl font-bold text-[#2b3231] mb-4">{userData?.trustScore || 100}%</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Driven by solved requests and consistent support.
          </p>
        </Card>

        <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-4">HELPING</p>
            <h3 className="text-4xl font-bold text-[#2b3231] mb-4">{helpingCount}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Requests where you are currently listed as a helper.
          </p>
        </Card>

        <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-4">OPEN REQUESTS</p>
            <h3 className="text-4xl font-bold text-[#2b3231] mb-4">{openRequestsCount}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Community requests currently active across the feed.
          </p>
        </Card>

        <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-4">AI PULSE</p>
            <h3 className="text-4xl font-bold text-[#2b3231] leading-tight mb-4">{uniqueTagsCount || 0} trends</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Trend count detected in the latest request activity.
          </p>
        </Card>
      </div>

      {/* Upcoming Sessions Section */}
      {bookings.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">LIVE MOMENTUM</p>
              <h3 className="text-2xl font-bold text-[#2b3231]">Upcoming Sessions</h3>
            </div>
            <button 
              onClick={() => navigate('/sessions')}
              className="text-xs font-bold text-[#129780] hover:underline"
            >
              View all sessions →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map(booking => (
              <Card key={booking.id} className="bg-white border-none shadow-md rounded-[24px] p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#129780]/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
                <div className="flex items-center gap-4 mb-4">
                   <div className="bg-[#129780] text-white p-3 rounded-2xl">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15.6 11.6L22 7v10l-6.4-4.6z"></path><rect x="2" y="5" width="14" height="14" rx="2"></rect></svg>
                   </div>
                   <div>
                     <p className="text-sm font-bold text-[#2b3231]">{booking.date}</p>
                     <p className="text-xs text-[#129780] font-bold uppercase tracking-wider">{booking.slot}</p>
                   </div>
                </div>
                <h4 className="font-bold text-gray-800 text-lg mb-2 truncate">{booking.postTitle}</h4>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">
                    {(booking.role === 'helper' ? booking.requesterName : booking.helperName).charAt(0)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {booking.role === 'helper' ? 'Helping' : 'Mentored by'} <span className="font-bold text-gray-700">{booking.role === 'helper' ? booking.requesterName : booking.helperName}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-3 mt-auto">
                  <Button 
                    onClick={() => navigate(`/session/${booking.id}`)}
                    className="w-full rounded-full py-2.5 font-bold bg-[#129780] shadow-sm"
                  >
                    Join Call
                  </Button>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-[#f0f9f8] text-[#129780] border-none text-[10px] py-1 px-3">Pending</Badge>
                    <button 
                      onClick={async () => {
                        if(window.confirm('Cancel this session?')) {
                          try {
                            await updateDoc(doc(db, 'bookings', booking.id), { status: 'cancelled' });
                            toast.success('Session cancelled');
                          } catch (err) {
                            toast.error('Failed to cancel session');
                          }
                        }
                      }}
                      className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Main Feed */}
        <div>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">RECENT REQUESTS</p>
              <h3 className="text-3xl font-bold text-[#2b3231]">What the community<br/>needs right now</h3>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/explore')}
              className="rounded-full shadow-sm border-none bg-white w-14 h-14 flex items-center justify-center p-0 flex-col hover:bg-gray-50"
            >
              <span className="text-[10px] font-bold leading-tight">Go to</span>
              <span className="text-[10px] font-bold leading-tight">feed</span>
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {loadingPosts ? (
              <div className="py-12 text-center text-gray-500 font-medium">Loading community requests...</div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post.id} className="bg-white border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">{post.category || 'General'}</Badge>
                    <Badge variant="destructive" className="bg-[#fef2f2] text-[#ef4444] border-none">{post.urgency || 'Normal'}</Badge>
                    <Badge variant="outline" className={`border-none ${post.status?.toLowerCase() === 'solved' ? 'bg-green-500/20 text-green-400' : 'border-gray-200 text-[#129780] bg-[#f0f9f8]'}`}>
                      {post.status || 'Open'}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-xl leading-snug mb-3">{post.title}</h4>
                  <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
                    {post.description}
                  </p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                      {post.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="bg-[#f6f8f9] border-none text-gray-600">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <p className="font-bold text-sm text-[#2b3231]">{post.authorName || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{post.authorLocation || 'Unknown'} • {post.helpers?.length || 0} helpers interested</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/request/${post.id}`)}
                      className="rounded-full border-gray-200 shadow-sm bg-white font-semibold px-6 py-2"
                    >
                      Open details
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="bg-white border-none shadow-sm rounded-[24px] p-12 text-center">
                <p className="text-gray-500">No requests in the community yet. Be the first to ask for help!</p>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-8">
          {/* AI Insights */}
          <Card className="bg-white border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">AI INSIGHTS</p>
            <h3 className="text-xl font-bold text-[#2b3231] mb-6">Suggested actions for you</h3>

            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <span className="text-sm text-gray-600">Most requested category</span>
                <span className="text-sm font-bold text-[#2b3231]">{mostRequestedCategory}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <span className="text-sm text-gray-600">Your strongest trust driver</span>
                <span className="text-sm font-bold text-[#2b3231]">Community Builder</span>
              </div>
              <div className="flex items-start justify-between border-b border-gray-100 pb-5 gap-4">
                <span className="text-sm text-gray-600">AI says you can mentor in</span>
                <span className="text-sm font-bold text-[#2b3231] text-right">{mentorSkills}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Your active requests</span>
                <span className="text-sm font-bold text-[#2b3231]">{userActiveRequests}</span>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">NOTIFICATIONS</p>
            <h3 className="text-xl font-bold text-[#2b3231] mb-6">Latest updates</h3>

            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-sm text-gray-500 py-4 text-center">No recent updates.</div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className="bg-white border border-gray-100 rounded-[16px] p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#2b3231] leading-snug mb-1">{notif.message}</p>
                      <p className="text-xs text-gray-500">
                        {notif.type} • {notif.createdAt ? (() => {
                          const diff = Math.floor((new Date() - notif.createdAt.toDate()) / 60000);
                          if (diff < 1) return 'Just now';
                          if (diff < 60) return `${diff}m ago`;
                          if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
                          return `${Math.floor(diff/1440)}d ago`;
                        })() : 'Just now'}
                      </p>
                    </div>
                    {!notif.read && (
                      <Badge variant="destructive" className="bg-[#fef2f2] text-[#ef4444] border-none rounded-full px-3 py-1">Unread</Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
