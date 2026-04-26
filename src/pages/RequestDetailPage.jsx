import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { CommentSection } from '../components/CommentSection';

export function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [forceShowComments, setForceShowComments] = useState(false);

  useEffect(() => {
    if (!id) return;
    
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
    } catch (err) {
      console.error(err);
      toast.error("Failed to offer help.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500 font-medium">Loading request details...</div>;
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
      <div className="bg-[#2b3231] rounded-[24px] p-8 lg:p-12 flex flex-col text-white shadow-sm">
        <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-6">REQUEST DETAIL</p>
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="outline" className="border-none bg-[#129780]/20 text-[#129780] font-semibold">{post.category || 'General'}</Badge>
          <Badge variant="outline" className="border-none bg-red-500/20 text-red-400 font-semibold">{post.urgency || 'Normal'}</Badge>
          <Badge variant="outline" className={`border-none ${isSolved ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-300'} font-semibold`}>
            {post.status || 'Open'}
          </Badge>
        </div>
        <h1 className="text-4xl lg:text-[56px] font-bold tracking-tight leading-[1.1] mb-6">
          {post.title}
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
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
          <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">AI SUMMARY</p>
            <h3 className="text-2xl font-bold text-[#2b3231] mb-4">What this request needs</h3>
            <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
              {aiSummary}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="bg-[#e9f2f0] border-none text-[#129780] font-medium">{tag}</Badge>
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
            />
          )}

          {/* Actions */}
          <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">ACTIONS</p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {!isAuthor && !isSolved && !isHelper && (
                <Button 
                  onClick={handleOfferHelp}
                  disabled={actionLoading}
                  className="rounded-full font-semibold px-8 py-2.5 bg-[#129780] hover:bg-[#0f806c]"
                >
                  {actionLoading ? 'Updating...' : 'I can help'}
                </Button>
              )}
              {isAuthor && !isSolved && (
                <Button 
                  variant="outline" 
                  onClick={handleMarkAsSolved}
                  disabled={actionLoading}
                  className="rounded-full border-gray-200 shadow-sm bg-white font-semibold px-6 py-2.5"
                >
                  {actionLoading ? 'Updating...' : 'Mark as solved'}
                </Button>
              )}
              {isSolved && (
                <p className="text-[#129780] font-bold">This request has been solved!</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {/* Requester */}
          <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-4">REQUESTER</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#129780] flex items-center justify-center text-white font-bold text-lg shrink-0">
                {authorInitials}
              </div>
              <div>
                <p className="font-bold text-[#2b3231] text-[15px]">{post.authorName || 'Anonymous'}</p>
                <p className="text-xs text-gray-500 mt-1">{post.authorLocation || 'Unknown'} • Trust 98%</p>
              </div>
            </div>
          </Card>

          {/* Helpers */}
          <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">HELPERS</p>
            <h3 className="text-xl font-bold text-[#2b3231] mb-6">People ready to support</h3>
            
            <div className="space-y-4">
              {helpers.length === 0 ? (
                <p className="text-gray-500 text-sm">No helpers yet. Be the first to offer support!</p>
              ) : (
                helpers.map((helper, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f97316] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {helper.name ? helper.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'H'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#2b3231] text-sm truncate">{helper.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{helper.skills}</p>
                    </div>
                    <Badge variant="outline" className="bg-[#f0f9f8] text-[#129780] border-none shrink-0 text-xs">Trust {helper.trustScore}%</Badge>
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
