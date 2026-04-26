import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

export function VerificationModal({ isOpen, onClose, currentUser }) {
  const [formData, setFormData] = useState({
    skillCategory: '',
    experience: '',
    bio: '',
    portfolio: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.skillCategory || !formData.experience || !formData.bio) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'verifications'), {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userEmail: currentUser.email,
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast.success('Application submitted successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['UI/UX Design', 'Frontend Development', 'Backend Development', 'Fullstack', 'Mobile Dev', 'AI/ML', 'Content Writing', 'Marketing'];

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#fdfcf9] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-1">ELITE STATUS</p>
              <h3 className="text-3xl font-bold text-[#2b3231]">Get Verified</h3>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Skill Category</label>
              <select 
                value={formData.skillCategory}
                onChange={(e) => setFormData({...formData, skillCategory: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
              >
                <option value="">Select a category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Experience</label>
                <input 
                  type="text" 
                  placeholder="e.g. 5+ Years"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Portfolio (Link)</label>
                <input 
                  type="url" 
                  placeholder="https://..."
                  value={formData.portfolio}
                  onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Expert Bio</label>
              <textarea 
                placeholder="Briefly describe your expertise..."
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] min-h-[100px] resize-none"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-full py-4 font-bold bg-[#129780] shadow-lg shadow-[#129780]/20"
            >
              {loading ? 'Submitting Application...' : 'Apply for Verification'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
