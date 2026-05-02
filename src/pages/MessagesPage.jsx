import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { VoiceNoteRecorder } from '../components/VoiceNoteRecorder';
import { KudosButton } from '../components/KudosButton';

export function MessagesPage() {
  const { currentUser, userData } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  // Fetch all users for the dropdown
  useEffect(() => {
    async function fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== currentUser?.uid) {
            usersList.push({ id: doc.id, ...doc.data() });
          }
        });
        setUsers(usersList);
        if (usersList.length > 0) {
          setSelectedUser(usersList[0].id);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    if (currentUser) fetchUsers();
  }, [currentUser]);

  // Real-time listener for messages
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach(doc => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort locally to avoid needing a complex composite index in Firestore
      msgs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA; // Descending (newest first)
      });
      
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUser || !messageContent.trim()) {
      toast.error('Please select a user and type a message.');
      return;
    }

    try {
      setSending(true);
      const receiver = users.find(u => u.id === selectedUser);
      
      const messageData = {
        participants: [currentUser.uid, selectedUser],
        senderId: currentUser.uid,
        senderName: userData?.name || currentUser.displayName || currentUser.email || 'Anonymous',
        receiverId: selectedUser,
        receiverName: receiver?.name || 'User',
        content: messageContent.trim(),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'messages'), messageData);
      setMessageContent('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleVoiceSend = async (audioURL) => {
    if (!selectedUser || !currentUser) return;
    try {
      const receiver = users.find(u => u.id === selectedUser);
      const messageData = {
        participants: [currentUser.uid, selectedUser],
        senderId: currentUser.uid,
        senderName: userData?.name || currentUser.displayName || currentUser.email || 'Anonymous',
        receiverId: selectedUser,
        receiverName: receiver?.name || 'User',
        content: '',
        audioURL: audioURL,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'messages'), messageData);
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast.error('Failed to send voice note.');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] p-10 lg:p-14 flex flex-col shadow-xl shadow-[var(--shadow)] border border-[var(--border-color)] group" style={{ background: 'var(--hero-gradient)' }}>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent)] opacity-10 blur-[100px] rounded-full group-hover:opacity-20 transition-opacity duration-1000"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500 opacity-[0.03] blur-[100px] rounded-full"></div>
        
        <div className="relative z-10">
          <p className="opacity-60 font-black text-[10px] uppercase tracking-[0.3em] mb-4 text-[var(--hero-text)]">INTERACTION / MESSAGING</p>
          <h1 className="text-4xl lg:text-[64px] font-black tracking-tighter mb-4 text-[var(--hero-text)] leading-[1.1] max-w-2xl">
            Keep support moving through direct communication.
          </h1>
          <p className="opacity-70 text-lg lg:text-xl max-w-xl text-[var(--hero-text)] font-medium leading-relaxed">
            Basic messaging gives helpers and requesters a clear follow-up path once a match happens.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Conversation Stream */}
        <Card className="border-none shadow-sm rounded-[24px] p-8">
          <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-2">CONVERSATION STREAM</p>
          <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Recent messages</h3>

          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">No messages yet. Start a conversation!</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[16px] p-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <p className="font-bold text-sm text-[var(--text-primary)] truncate">
                        {msg.senderName} → {msg.receiverName}
                      </p>
                      {msg.senderId !== currentUser.uid && (
                        <KudosButton 
                          targetUserId={msg.senderId} 
                          messageId={msg.id} 
                          kudosGiven={msg.kudosGiven} 
                          currentKudos={msg.kudosGiven?.length || 0}
                        />
                      )}
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed break-words">
                      {msg.audioURL ? (
                        <div className="mt-2">
                          <audio src={msg.audioURL} controls className="h-8 w-full max-w-[200px]" />
                        </div>
                      ) : (
                        msg.content
                      )}
                    </p>
                  </div>
                  <div className="w-16 h-12 rounded-[12px] bg-[var(--bg-card)] flex items-center justify-center flex-shrink-0 text-[var(--accent)] text-xs font-bold text-center leading-tight shadow-sm border border-[var(--border-color)]">
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Send Message Form */}
        <Card className="border-none shadow-sm rounded-[24px] p-8">
          <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-2">SEND MESSAGE</p>
          <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Start a conversation</h3>

          <form onSubmit={handleSendMessage} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">To</label>
              <select 
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] appearance-none"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Message</label>
              <textarea 
                rows="5"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Share support details, ask for files, or suggest next steps." 
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
              ></textarea>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={sending} className="flex-1 rounded-full font-semibold py-3 text-base shadow-md">
                {sending ? 'Sending...' : 'Send'}
              </Button>
              
              <VoiceNoteRecorder 
                onSend={handleVoiceSend} 
                storageFolder={`voiceNotes/messages/${currentUser.uid}`} 
              />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
