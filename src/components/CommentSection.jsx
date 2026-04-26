import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { VoiceNoteRecorder } from './VoiceNoteRecorder';

export function CommentSection({ postId, postTitle, authorId, authorName, helpers = [] }) {
  const { currentUser, userData } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Attachments & Recording State
  const [attachment, setAttachment] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  
  // Mentions State
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(-1);
  
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cloudinary Config
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME';
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'YOUR_UPLOAD_PRESET';

  // Available users for mentions (Author + Helpers)
  const mentionableUsers = [
    { uid: authorId, name: authorName || 'Author' },
    ...helpers.map(h => ({ uid: h.uid, name: h.name }))
  ].filter((v, i, a) => a.findIndex(t => t.uid === v.uid) === i); // Unique users

  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = [];
      snapshot.forEach((doc) => {
        fetchedComments.push({ id: doc.id, ...doc.data() });
      });
      
      fetchedComments.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      });

      setComments(fetchedComments);
      setLoading(false);
      
      if (scrollRef.current) {
        setTimeout(() => {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 100);
      }
    }, (error) => {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    if (CLOUD_NAME === 'YOUR_CLOUD_NAME' || UPLOAD_PRESET === 'YOUR_UPLOAD_PRESET') {
      toast.error('Cloudinary credentials missing. Check your .env file and restart server.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      setUploading(true);
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      };

      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
          setAttachment({
            url: response.secure_url,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            name: file.name
          });
          setUploading(false);
          setUploadProgress(0);
          toast.success('File attached');
        } else {
          console.error('Cloudinary Error Detail:', response);
          setUploading(false);
          toast.error(`Upload failed: ${response.error?.message || 'Check Cloudinary settings'}`);
        }
      };

      xhr.send(formData);

    } catch (error) {
      console.error('Cloudinary Request Error:', error);
      setUploading(false);
    }
  };

  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `screen_record_${Date.now()}.webm`, { type: 'video/webm' });
        uploadFile(file);
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        clearInterval(recordingIntervalRef.current);
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Timer & Auto-stop at 30s
      let timeLeft = 30;
      setRecordingTime(timeLeft);
      recordingIntervalRef.current = setInterval(() => {
        timeLeft -= 1;
        setRecordingTime(timeLeft);
        if (timeLeft <= 0) {
          mediaRecorder.stop();
        }
      }, 1000);

    } catch (err) {
      console.error('Recording error:', err);
      toast.error('Failed to start recording');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart;
    setNewComment(value);

    // Detect mention trigger
    const textBeforeCursor = value.substring(0, selectionStart);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    
    if (lastAt !== -1 && (lastAt === 0 || textBeforeCursor[lastAt - 1] === ' ')) {
      const queryText = textBeforeCursor.substring(lastAt + 1);
      if (!queryText.includes(' ')) {
        setMentionQuery(queryText);
        setMentionIndex(lastAt);
        setShowMentions(true);
        return;
      }
    }
    setShowMentions(false);
  };

  const insertMention = (user) => {
    const before = newComment.substring(0, mentionIndex);
    const after = newComment.substring(textareaRef.current.selectionStart);
    const newValue = `${before}@${user.name} ${after}`;
    setNewComment(newValue);
    setShowMentions(false);
    textareaRef.current.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const commentText = newComment.trim();
    if (!commentText && !attachment) return;
    if (!currentUser) {
      toast.error("Please login to comment");
      return;
    }

    try {
      setSubmitting(true);
      const userName = userData?.name || currentUser.displayName || 'Anonymous';
      
      await addDoc(collection(db, 'comments'), {
        postId,
        userId: currentUser.uid,
        userName,
        content: commentText,
        attachment,
        audioURL: null,
        createdAt: serverTimestamp(),
        likes: []
      });

      setNewComment('');
      setAttachment(null);
      toast.success("Message sent!");

      // Notify post author
      if (authorId && authorId !== currentUser.uid) {
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: authorId,
            message: `${userName} commented on "${postTitle}"`,
            type: 'Comment',
            createdAt: serverTimestamp(),
            read: false
          });
        } catch (notifErr) {
          console.warn("Notification failed to send to author:", notifErr);
        }
      }

      // Notify mentioned users
      const mentions = commentText.match(/@(\w+(?:\s\w+)?)/g);
      if (mentions) {
        const uniqueMentionedNames = [...new Set(mentions.map(m => m.substring(1)))];
        for (const mentionedName of uniqueMentionedNames) {
          const targetUser = mentionableUsers.find(u => u.name === mentionedName);
          if (targetUser && targetUser.uid !== currentUser.uid && targetUser.uid !== authorId) {
            try {
              await addDoc(collection(db, 'notifications'), {
                userId: targetUser.uid,
                message: `${userName} mentioned you in "${postTitle}"`,
                type: 'Mention',
                createdAt: serverTimestamp(),
                read: false
              });
            } catch (notifErr) {
              console.warn(`Notification failed to send to mentioned user ${mentionedName}:`, notifErr);
            }
          }
        }
      }

    } catch (error) {
      console.error("Critical error adding comment:", error);
      toast.error(`Failed to send message: ${error.message || 'Check connection'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoiceSend = async (audioURL) => {
    if (!currentUser) return;
    try {
      const userName = userData?.name || currentUser.displayName || 'Anonymous';
      await addDoc(collection(db, 'comments'), {
        postId,
        userId: currentUser.uid,
        userName,
        content: '',
        attachment: null,
        audioURL: audioURL,
        createdAt: serverTimestamp(),
        likes: []
      });
      
      // Notify author
      if (authorId && authorId !== currentUser.uid) {
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: authorId,
            message: `${userName} sent a voice note on "${postTitle}"`,
            type: 'Comment',
            createdAt: serverTimestamp(),
            read: false
          });
        } catch (notifErr) {
          console.warn("Notification failed to send to author:", notifErr);
        }
      }
    } catch (err) {
      console.error('Error sending voice comment:', err);
      toast.error('Failed to send voice note');
    }
  };

  const handleReaction = async (commentId, currentLikes = []) => {
    if (!currentUser) return;
    const commentRef = doc(db, 'comments', commentId);
    const isLiked = currentLikes.includes(currentUser.uid);
    try {
      await updateDoc(commentRef, {
        likes: isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
      });
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  const renderContent = (content, audioURL) => {
    if (audioURL) {
      return (
        <div className="flex flex-col gap-2">
          <audio src={audioURL} controls className="max-w-full h-8 brightness-110 contrast-125" />
          {content && <p>{content}</p>}
        </div>
      );
    }
    if (!content) return null;
    const parts = content.split(/(@\w+(?:\s\w+)?)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-white bg-[#0f7a68] px-1 rounded font-bold">{part}</span>;
      }
      return part;
    });
  };

  const filteredMentions = mentionableUsers.filter(u => 
    u.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-6 lg:p-8 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-1">COMMUNITY CHAT</p>
          <h3 className="text-xl font-bold text-[#2b3231]">Help coordination</h3>
        </div>
        <div className="bg-[#f0f9f8] px-3 py-1 rounded-full">
           <p className="text-[#129780] text-[10px] font-bold uppercase">{comments.length} messages</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="space-y-4 mb-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar"
      >
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#129780] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-white/50 rounded-[20px] p-6 text-center border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm italic">No messages yet. Coordinate your help here!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isMe = comment.userId === currentUser?.uid;
            const isAuthor = comment.userId === authorId;
            const hasLiked = comment.likes?.includes(currentUser?.uid);
            
            return (
              <div key={comment.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-1 ${isMe ? 'bg-[#129780]' : 'bg-[#2b3231]'}`}>
                  {comment.userName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="font-bold text-[#2b3231] text-[11px]">{isMe ? 'You' : comment.userName}</span>
                    {isAuthor && (
                      <span className="bg-[#129780]/10 text-[#129780] text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">Author</span>
                    )}
                    <span className="text-[9px] text-gray-400">
                      {comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </span>
                  </div>
                  <div className="relative group">
                    <div className={`p-3 rounded-[18px] text-sm leading-relaxed shadow-sm transition-all ${
                      isMe 
                        ? 'bg-[#129780] text-white rounded-tr-none' 
                        : 'bg-white text-gray-600 border border-gray-100 rounded-tl-none'
                    }`}>
                      {comment.attachment && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-gray-100/20 shadow-md">
                          {comment.attachment.type === 'image' ? (
                            <img src={comment.attachment.url} alt="Shared" className="w-full object-cover max-h-48 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(comment.attachment.url, '_blank')} />
                          ) : (
                            <video src={comment.attachment.url} controls className="w-full max-h-48 bg-black" />
                          )}
                        </div>
                      )}
                      {renderContent(comment.content, comment.audioURL)}
                    </div>
                    
                    <button 
                      onClick={() => handleReaction(comment.id, comment.likes)}
                      className={`absolute -bottom-2 ${isMe ? '-left-2' : '-right-2'} flex items-center gap-1 bg-white border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm hover:scale-110 transition-transform active:scale-95`}
                    >
                      <span className={`text-[10px] ${hasLiked ? 'text-red-500' : 'text-gray-400'}`}>
                        {hasLiked ? '❤️' : '🤍'}
                      </span>
                      {comment.likes?.length > 0 && (
                        <span className="text-[8px] font-bold text-gray-500">{comment.likes.length}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="relative">
        {showMentions && filteredMentions.length > 0 && (
          <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <p className="bg-gray-50 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mention someone</p>
            <div className="max-h-48 overflow-y-auto">
              {filteredMentions.map(user => (
                <button
                  key={user.uid}
                  onClick={() => insertMention(user)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-[#f0f9f8] hover:text-[#129780] font-medium transition-colors flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Attachment Preview */}
        {attachment && (
          <div className="absolute bottom-full left-0 mb-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="relative inline-block group">
              <div className="bg-white p-1 rounded-2xl shadow-xl border border-gray-100">
                {attachment.type === 'image' ? (
                  <img src={attachment.url} className="w-20 h-20 object-cover rounded-xl" />
                ) : (
                  <div className="w-20 h-20 bg-black rounded-xl flex items-center justify-center text-white text-[10px] font-bold">VIDEO</div>
                )}
              </div>
              <button 
                onClick={() => setAttachment(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="absolute bottom-full left-0 w-full mb-4 px-4">
             <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden shadow-sm">
                <div 
                  className="bg-[#129780] h-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
             </div>
             <p className="text-[10px] font-bold text-[#129780] mt-1 text-center uppercase tracking-widest">Uploading attachment...</p>
          </div>
        )}

        {/* Screen Recording UI */}
        {isRecording && (
          <div className="absolute bottom-full right-0 mb-4 flex items-center gap-3 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <span className="text-xs font-bold uppercase tracking-widest">Recording Screen: {recordingTime}s</span>
            <button 
              onClick={() => mediaRecorderRef.current?.stop()}
              className="ml-2 bg-white text-red-500 text-[10px] font-bold px-3 py-1 rounded-full hover:bg-gray-100"
            >
              STOP
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative group flex flex-col gap-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={handleInputChange}
              placeholder="Type @ to mention, or coordinate..."
              className="w-full bg-white border border-gray-200 rounded-[24px] pl-5 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]/20 focus:border-[#129780] min-h-[60px] max-h-[120px] resize-none shadow-sm transition-all group-focus-within:shadow-md"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
                if (e.key === 'Escape') setShowMentions(false);
              }}
            />
            <button 
              type="submit" 
              disabled={submitting || uploading || (!newComment.trim() && !attachment)}
              className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-[#129780] hover:bg-[#0f806c] text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pl-2">
             <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
             <button 
               type="button" 
               onClick={() => fileInputRef.current.click()}
               className="p-2 text-gray-400 hover:text-[#129780] hover:bg-[#f0f9f8] rounded-full transition-all"
               title="Attach file"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
             </button>
             <button 
               type="button" 
               onClick={startScreenRecording}
               disabled={isRecording}
               className={`p-2 rounded-full transition-all ${isRecording ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-[#129780] hover:bg-[#f0f9f8]'}`}
               title="Record Screen"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
             </button>
             <VoiceNoteRecorder 
               onSend={handleVoiceSend} 
               storageFolder={`voiceNotes/comments/${postId}`} 
             />
          </div>
        </form>
      </div>
    </Card>
  );
}
