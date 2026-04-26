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
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#fdfcf9] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-red-500 font-bold text-[10px] uppercase tracking-wider mb-1">SAFETY & TRUST</p>
              <h3 className="text-3xl font-bold text-[#2b3231]">Report {reportedUserName}</h3>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Reason for Report</label>
              <div className="grid grid-cols-2 gap-3">
                {reasons.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({...formData, reason: r})}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border text-left ${
                      formData.reason === r
                        ? 'bg-red-50 text-red-500 border-red-500 shadow-sm'
                        : 'bg-white text-gray-500 border-gray-100 hover:border-red-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Additional Details</label>
              <textarea 
                placeholder="Please describe the issue in detail..."
                value={formData.details}
                onChange={(e) => setFormData({...formData, details: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-h-[120px] resize-none"
              />
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 rounded-full py-4 font-bold bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
              <button 
                type="button"
                onClick={onClose} 
                className="px-8 font-bold text-gray-400 hover:text-gray-600 transition-colors"
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
