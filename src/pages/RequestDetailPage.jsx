import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, addDoc, collection, serverTimestamp, increment } from 'firebase/firestore';
import { updateStreak } from '../lib/gamification.jsx';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { CommentSection } from '../components/CommentSection';
import { BookingModal } from '../components/BookingModal';
import { EndorsementModal } from '../components/EndorsementModal';
import { DailyChallengeService } from '../lib/DailyChallengeService';
import confetti from 'canvas-confetti';

export function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isEndorsementOpen, setIsEndorsementOpen] = useState(false);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [forceShowComments, setForceShowComments] = useState(false);
  
  // Challenge State
  const [isChallenge, setIsChallenge] = useState(false);
  const [challengeData, setChallengeData] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    // Check if this is the daily challenge
    const checkChallenge = async () => {
      const challenge = await DailyChallengeService.getCurrentChallenge();
      if (challenge && challenge.requestId === id) {
        setIsChallenge(true);
        setChallengeData(challenge);
      }
    };
    checkChallenge();
    
    const docRef = doc(db, 'posts', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error("Request not found.");
        navigate('/dashboard');
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching request:", err);
      toast.error("Failed to load request details.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const handleMarkAsSolved = async () => {
    if (!post || post.userId !== currentUser.uid) return;
    try {
      setActionLoading(true);
      const docRef = doc(db, 'posts', post.id);
      await updateDoc(docRef, { status: 'Solved' });
      
      // Notify author
      await addDoc(collection(db, 'notifications'), {
        userId: post.userId,
        message: `"${post.title}" was marked as solved`,
        type: 'Status',
        createdAt: serverTimestamp(),
        read: false
      });

      // Notify helpers
      const helpers = post.helpers || [];
      for (const helper of helpers) {
        if (helper.uid !== post.userId) {
          await addDoc(collection(db, 'notifications'), {
            userId: helper.uid,
            message: `"${post.title}" was marked as solved`,
            type: 'Status',
            createdAt: serverTimestamp(),
            read: false
          });
        }
      }

      toast.success("Marked as solved!");
      
      // Open endorsement modal if there are helpers
      if (post.helpers && post.helpers.length > 0) {
        setIsEndorsementOpen(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOfferHelp = async () => {
    if (!currentUser || !userData) return;
    
    // Check if user is already a helper
    const existingHelpers = post.helpers || [];
    const isAlreadyHelper = existingHelpers.some(h => h.uid === currentUser.uid);
    
    if (isAlreadyHelper) {
      toast.error("You're already listed as a helper.");
      return;
    }

    try {
      setActionLoading(true);
      const docRef = doc(db, 'posts', post.id);
      
      const newHelper = {
        uid: currentUser.uid,
        name: userData.name || currentUser.displayName || currentUser.email || 'Anonymous Helper',
        skills: userData.skills?.join(', ') || 'No skills listed',
        trustScore: userData.trustScore || 100
      };

      await updateDoc(docRef, { 
        helpers: arrayUnion(newHelper) 
      });

      // Notify author
      if (post.userId !== currentUser.uid) {
        await addDoc(collection(db, 'notifications'), {
          userId: post.userId,
          message: `${newHelper.name} offered help on "${post.title}"`,
          type: 'Match',
          createdAt: serverTimestamp(),
          read: false
        });
      }

      toast.success("You are now listed as a helper!");
      setForceShowComments(true);
      
      // Update Streak & Check Badges
      await updateStreak(currentUser.uid, userData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to offer help.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectWinner = async (comment) => {
    if (!isAuthor || !isChallenge || challengeData?.winnerId) return;
    
    try {
      setActionLoading(true);
      
      // 1. Update Challenge Doc
      const challengeRef = doc(db, 'dailyChallenge', 'current');
      await updateDoc(challengeRef, {
        winnerId: comment.userId,
        winnerName: comment.userName,
        status: 'completed',
        winningCommentId: comment.id
      });

      // 2. Award rewards to winner (+50 Trust Score)
      const userRef = doc(db, 'users', comment.userId);
      await updateDoc(userRef, {
        trustScore: increment(50),
        lastDailyWin: serverTimestamp()
      });

      // 3. Send Notification
      await addDoc(collection(db, 'notifications'), {
        userId: comment.userId,
        message: `You won today's Daily Challenge! +50 Trust Score bonus awarded.`,
        type: 'Achievement',
        createdAt: serverTimestamp(),
        read: false
      });

      // Celebration!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#129780', '#eab308', '#ffffff']
      });

      toast.success("Champion selected! Rewards distributed. 🏆");
    } catch (err) {
      console.error(err);
      toast.error("Failed to select winner.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-[var(--text-secondary)] font-medium">Loading request details...</div>;
  }

  if (!post) return null;

  const isAuthor = currentUser?.uid === post.userId;
  const isSolved = post.status?.toLowerCase() === 'solved';
  const helpers = post.helpers || [];
  
  // Mock data for AI summary based on UI
  const aiSummary = `AI summary: ${post.category || 'General'} request with ${post.urgency?.toLowerCase() || 'normal'} urgency. Best suited for members with ${post.tags?.[0]?.toLowerCase() || 'relevant'} expertise.`;
  const authorInitials = post.authorName ? post.authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  const isHelper = helpers.some(h => h.uid === currentUser?.uid);
  const showCommentSection = isAuthor || isHelper || forceShowComments;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header Card */}
      <div className="bg-[var(--hero-bg)] rounded-[24px] p-8 lg:p-12 flex flex-col text-[var(--hero-text)] shadow-sm">
        <p className="opacity-60 font-bold text-xs uppercase tracking-wider mb-6">REQUEST DETAIL</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {isChallenge && (
             <Badge variant="outline" className="border-none bg-yellow-400 text-[#2b3231] font-black uppercase tracking-tighter px-3 py-1 animate-pulse">
               🏆 Daily Challenge
             </Badge>
          )}
          <Badge variant="outline" className="border-none bg-[#129780]/20 text-[#129780] font-semibold">{post.category || 'General'}</Badge>
          <Badge variant="outline" className="border-none bg-red-500/20 text-red-400 font-semibold">{post.urgency || 'Normal'}</Badge>
          <Badge variant="outline" className={`border-none ${isSolved ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-300'} font-semibold`}>
            {post.status || 'Open'}
          </Badge>
        </div>
        <h1 className="text-4xl lg:text-[56px] font-bold tracking-tight leading-[1.1] mb-6 text-[var(--hero-text)]">
          {post.title}
        </h1>
        <p className="opacity-90 text-lg leading-relaxed max-w-3xl">
          {post.description}
        </p>

        {post.attachment && (
          <div className="mt-8 rounded-[24px] overflow-hidden max-w-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
            {post.attachment.type === 'image' ? (
              <img src={post.attachment.url} alt="Attachment" className="w-full object-cover" />
            ) : (
              <video src={post.attachment.url} controls className="w-full" />
            )}
            <div className="bg-black/20 backdrop-blur-md px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/60">
              Attached Reference: {post.attachment.name}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          {/* AI Summary */}
          <Card className="bg-[var(--bg-card)] border border-[var(--accent)]/10 shadow-sm rounded-[24px] p-8">
            <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-2">AI SUMMARY</p>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">What this request needs</h3>
            <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed mb-6">
              {aiSummary}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                   <Badge key={i} variant="outline" className="bg-[var(--accent)]/10 border-none text-[var(--accent)] font-medium">{tag}</Badge>
                ))}
              </div>
            )}
          </Card>

          {showCommentSection && (
            <CommentSection 
              postId={post.id} 
              postTitle={post.title} 
              authorId={post.userId} 
              authorName={post.authorName}
              helpers={post.helpers || []}
              isChallenge={isChallenge}
              challengeWinnerId={challengeData?.winnerId}
              onSelectWinner={handleSelectWinner}
            />
          )}

          {/* Actions */}
          <Card className="bg-[var(--bg-card)] border border-[var(--accent)]/10 shadow-sm rounded-[24px] p-8">
            <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-2">ACTIONS</p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {!isAuthor && !isSolved && !isHelper && (
                <Button 
                  onClick={handleOfferHelp}
                  disabled={actionLoading}
                  className="rounded-full font-semibold px-8 py-2.5 bg-[var(--accent)] hover:opacity-90"
                >
                  {actionLoading ? 'Updating...' : 'I can help'}
                </Button>
              )}
              {isAuthor && !isSolved && (
                <Button 
                  variant="outline" 
                  onClick={handleMarkAsSolved}
                  disabled={actionLoading}
                  className="rounded-full border-[var(--border-color)] shadow-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold px-6 py-2.5 hover:bg-[var(--bg-card)]"
                >
                  {actionLoading ? 'Updating...' : 'Mark as solved'}
                </Button>
              )}
              {isSolved && (
                <p className="text-[var(--accent)] font-bold">This request has been solved!</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {/* Requester */}
          <Card className="bg-[var(--bg-card)] border border-[var(--accent)]/10 shadow-sm rounded-[24px] p-8">
            <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-4">REQUESTER</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-lg shrink-0">
                {authorInitials}
              </div>
              <div>
                <p className="font-bold text-[var(--text-primary)] text-[15px]">{post.authorName || 'Anonymous'}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{post.authorLocation || 'Unknown'} • Trust 98%</p>
              </div>
            </div>
          </Card>

          {/* Helpers */}
          <Card className="bg-[var(--bg-card)] border border-[var(--accent)]/10 shadow-sm rounded-[24px] p-8">
            <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-2">HELPERS</p>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">People ready to support</h3>
            
            <div className="space-y-4">
              {helpers.length === 0 ? (
                <p className="text-[var(--text-secondary)] text-sm">No helpers yet. Be the first to offer support!</p>
              ) : (
                helpers.map((helper, idx) => (
                  <div key={idx} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f97316] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {helper.name ? helper.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'H'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-[var(--text-primary)] text-sm truncate">{helper.name}</p>
                        {helper.verified && (
                          <div className="text-[var(--accent)] bg-[var(--accent)]/10 p-0.5 rounded-full cursor-help group relative">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                              Verified Expert in {helper.verifiedSkill}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{helper.skills}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant="outline" className="bg-[var(--accent)]/10 text-[var(--accent)] border-none text-[10px]">Trust {helper.trustScore}%</Badge>
                      {helper.uid !== currentUser?.uid && (
                        <button 
                          onClick={() => {
                            setSelectedHelper(helper);
                            setIsBookingOpen(true);
                          }}
                          className="text-[10px] font-bold text-[var(--accent)] hover:underline"
                        >
                          Book Session
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {selectedHelper && (
        <BookingModal 
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          helper={selectedHelper}
          post={post}
          currentUser={currentUser}
        />
      )}

      {isEndorsementOpen && (
        <EndorsementModal 
          isOpen={isEndorsementOpen}
          onClose={() => setIsEndorsementOpen(false)}
          helpers={post.helpers || []}
          authorId={currentUser.uid}
          authorName={userData?.name || currentUser.displayName}
        />
      )}
    </div>
  );
}
