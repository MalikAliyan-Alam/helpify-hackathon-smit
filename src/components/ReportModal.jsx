import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

export function ReportModal({ isOpen, onClose, reportedUserId, reportedUserName, reporterId, requestId = 'Direct' }) {
  const [formData, setFormData] = useState({
    reason: '',
    details: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason) {
      toast.error('Please select a reason');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'reports'), {
        reporterId,
        reportedUserId,
        reportedUserName,
        requestId,
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast.success('Report submitted to admins for review.');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const reasons = ["Unresponsive", "Bad Advice", "Inappropriate Behavior", "Other"];

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[var(--bg-card)] sm:bg-[var(--glass-bg)] sm:backdrop-blur-2xl border border-[var(--glass-border)] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-red-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">SAFETY & TRUST</p>
              <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Report {reportedUserName}</h3>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/80 transition-colors">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 opacity-60">Reason for Report</label>
              <div className="grid grid-cols-2 gap-3">
                {reasons.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({...formData, reason: r})}
                    className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border text-left ${
                      formData.reason === r
                        ? 'bg-red-500/10 text-red-500 border-red-500 shadow-sm'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-red-500/50 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 opacity-60">Additional Details</label>
              <textarea 
                placeholder="Please describe the issue in detail..."
                value={formData.details}
                onChange={(e) => setFormData({...formData, details: e.target.value})}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 min-h-[120px] resize-none transition-all"
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-[var(--border-color)]">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 rounded-full py-4 font-black bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
              <button 
                type="button"
                onClick={onClose} 
                className="px-8 font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-wider text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
