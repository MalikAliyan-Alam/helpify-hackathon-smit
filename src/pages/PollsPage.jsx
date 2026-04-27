import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PollCard } from '../components/PollCard';
import toast from 'react-hot-toast';

export function PollsPage() {
  const { currentUser } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPolls(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim());
    if (!question.trim() || validOptions.length < 2) {
      toast.error('Please provide a question and at least 2 options');
      return;
    }

    try {
      setCreating(true);
      const initialVotes = {};
      validOptions.forEach((_, i) => initialVotes[i] = []);

      await addDoc(collection(db, 'polls'), {
        question: question.trim(),
        options: validOptions,
        votes: initialVotes,
        status: 'open',
        creatorId: currentUser.uid,
        creatorName: currentUser.displayName || 'Anonymous',
        createdAt: serverTimestamp()
      });

      setQuestion('');
      setOptions(['', '']);
      setShowForm(false);
      toast.success('Community poll launched! 🚀');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create poll');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="bg-[var(--hero-bg)] rounded-[24px] p-10 flex flex-col md:flex-row md:items-center justify-between text-[var(--hero-text)] gap-6">
        <div className="flex-1">
          <p className="opacity-60 font-bold text-xs uppercase tracking-wider mb-4">COMMUNITY / GOVERNANCE</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Voice your opinion on platform evolution.
          </h1>
          <p className="opacity-80 text-lg max-w-xl">
            Polls help us decide on new features, community guidelines, and technical approaches.
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className={`rounded-full px-8 py-6 text-lg font-bold shadow-xl transition-all ${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-[#129780] hover:bg-[#0f806c]'}`}
        >
          {showForm ? 'Cancel Creation' : 'Start New Poll 📊'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
        {/* Polls Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center text-gray-500 font-medium">Loading community polls...</div>
          ) : polls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {polls.map(poll => (
                <PollCard key={poll.id} poll={poll} messageId={poll.id} collectionPath="polls" />
              ))}
            </div>
          ) : (
            <Card className="p-20 text-center bg-[var(--bg-card)] border-dashed border-[var(--border-color)]">
               <p className="text-[var(--text-secondary)] italic">No active polls. Be the first to start a discussion!</p>
            </Card>
          )}
        </div>

        {/* Creation Sidebar */}
        <div className="space-y-6">
          {showForm && (
             <Card className="p-8 border-none shadow-2xl bg-[var(--bg-card)] sticky top-24 animate-in slide-in-from-right duration-500">
                <p className="text-[var(--accent)] font-black text-[10px] uppercase tracking-widest mb-4">POLL CONFIGURATION</p>
                <form onSubmit={handleCreatePoll} className="space-y-6">
                   <div>
                      <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Question</label>
                      <textarea 
                        rows="3"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="What should we vote on?"
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Options</label>
                      {options.map((opt, i) => (
                        <input 
                          key={i}
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const next = [...options];
                            next[i] = e.target.value;
                            setOptions(next);
                          }}
                          placeholder={`Option ${i + 1}`}
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        />
                      ))}
                      {options.length < 4 && (
                        <button 
                          type="button"
                          onClick={() => setOptions([...options, ''])}
                          className="w-full py-2 border border-dashed border-[var(--border-color)] rounded-xl text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all"
                        >
                          + ADD OPTION
                        </button>
                      )}
                   </div>
                   <Button type="submit" disabled={creating} className="w-full py-4 rounded-2xl font-bold text-base shadow-lg shadow-[#129780]/20">
                     {creating ? 'Launching...' : 'Launch Poll 🚀'}
                   </Button>
                </form>
             </Card>
          )}

          <Card className="bg-[#129780] border-none p-8 text-white rounded-[32px] shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <p className="text-white/60 font-black text-[10px] uppercase tracking-widest mb-4">PLATFORM TIP</p>
            <h4 className="text-xl font-bold mb-4">Drive Change</h4>
            <p className="text-sm text-white/80 leading-relaxed mb-6">
              Active polls are weighted by community trust. High-trust helpers have more influence on the final outcomes.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold bg-white/10 p-3 rounded-2xl border border-white/10">
              📊 {polls.length} Active Discussion{polls.length !== 1 ? 's' : ''}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
