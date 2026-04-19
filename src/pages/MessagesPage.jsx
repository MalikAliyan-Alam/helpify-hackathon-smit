import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

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

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="bg-[#2b3231] rounded-[24px] p-10 flex flex-col text-white">
        <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">INTERACTION / MESSAGING</p>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 max-w-2xl">
          Keep support moving through direct communication.
        </h1>
        <p className="text-gray-300 text-lg max-w-xl">
          Basic messaging gives helpers and requesters a clear follow-up path once a match happens.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Conversation Stream */}
        <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8">
          <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">CONVERSATION STREAM</p>
          <h3 className="text-3xl font-bold text-[#2b3231] mb-8">Recent messages</h3>

          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No messages yet. Start a conversation!</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-white border border-gray-100 rounded-[16px] p-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#2b3231] mb-2 truncate">
                      {msg.senderName} → {msg.receiverName}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed break-words">
                      {msg.content}
                    </p>
                  </div>
                  <div className="w-16 h-12 rounded-[12px] bg-[#e8f3f1] flex items-center justify-center flex-shrink-0 text-[#129780] text-xs font-bold text-center leading-tight shadow-sm border border-[#d1e8e4]">
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Send Message Form */}
        <Card className="bg-white border-none shadow-sm rounded-[24px] p-8">
          <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">SEND MESSAGE</p>
          <h3 className="text-3xl font-bold text-[#2b3231] mb-8">Start a conversation</h3>

          <form onSubmit={handleSendMessage} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
              <select 
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] appearance-none"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
              <textarea 
                rows="5"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Share support details, ask for files, or suggest next steps." 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] resize-none"
              ></textarea>
            </div>

            <Button type="submit" disabled={sending} className="w-full rounded-full font-semibold py-3 text-base">
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
