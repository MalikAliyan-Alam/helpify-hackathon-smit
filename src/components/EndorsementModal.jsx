import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

export function EndorsementModal({ isOpen, onClose, helpers, authorId, authorName }) {
  const [selectedEndorsements, setSelectedEndorsements] = useState({}); // { helperUid: [skills] }
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const toggleSkill = (helperUid, skill) => {
    setSelectedEndorsements(prev => {
      const helperSkills = prev[helperUid] || [];
      if (helperSkills.includes(skill)) {
        return { ...prev, [helperUid]: helperSkills.filter(s => s !== skill) };
      } else {
        return { ...prev, [helperUid]: [...helperSkills, skill] };
      }
    });
  };

  const handleEndorse = async () => {
    setLoading(true);
    try {
      for (const [helperUid, skills] of Object.entries(selectedEndorsements)) {
        if (skills.length === 0) continue;

        const userRef = doc(db, 'users', helperUid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const currentEndorsements = userData.endorsements || {};
          
          const updatedEndorsements = { ...currentEndorsements };
          skills.forEach(skill => {
            if (!updatedEndorsements[skill]) {
              updatedEndorsements[skill] = { count: 0, endorsers: [] };
            }
            
            // Avoid duplicate endorsements from same author
            const alreadyEndorsed = updatedEndorsements[skill].endorsers.some(e => e.uid === authorId);
            if (!alreadyEndorsed) {
              updatedEndorsements[skill].count += 1;
              updatedEndorsements[skill].endorsers.push({ 
                uid: authorId, 
                name: authorName,
                timestamp: Date.now()
              });
            }
          });

          await updateDoc(userRef, {
            endorsements: updatedEndorsements,
            trustScore: increment(skills.length * 2) // Boost trust score
          });
        }
      }
      toast.success('Endorsements submitted!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit endorsements');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#fdfcf9] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-1">CELEBRATE SUCCESS</p>
              <h3 className="text-3xl font-bold text-[#2b3231]">Endorse your helpers</h3>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">×</button>
          </div>

          <p className="text-gray-500 mb-8">This request is solved! Take a moment to recognize the skills your helpers used. Each endorsement boosts their Trust Score.</p>

          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {helpers.map((helper) => (
              <div key={helper.uid} className="bg-white border border-gray-100 rounded-[24px] p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#2b3231] flex items-center justify-center text-white font-bold text-xs">
                    {helper.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[#2b3231]">{helper.name}</p>
                    <p className="text-xs text-gray-400">Available skills to endorse:</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {helper.skills?.split(',').map((skill) => {
                    const s = skill.trim();
                    const isSelected = selectedEndorsements[helper.uid]?.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleSkill(helper.uid, s)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-[#129780] text-white border-[#129780] shadow-md shadow-[#129780]/20'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-[#129780]/30'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
            <Button 
              onClick={handleEndorse} 
              disabled={loading || Object.keys(selectedEndorsements).length === 0}
              className="flex-1 rounded-full py-4 font-bold bg-[#129780] shadow-lg shadow-[#129780]/20"
            >
              {loading ? 'Submitting...' : 'Confirm Endorsements'}
            </Button>
            <button onClick={onClose} className="px-8 font-bold text-gray-400 hover:text-gray-600 transition-colors">Skip</button>
          </div>
        </div>
      </div>
    </div>
  );
}
