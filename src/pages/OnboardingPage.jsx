import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function OnboardingPage() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setName(userData.name || currentUser?.displayName || '');
      setLocation(userData.location || '');
      setSkills(userData.skills?.join(', ') || '');
      setInterests(userData.interests?.join(', ') || '');
    } else if (currentUser) {
      setName(currentUser.displayName || '');
    }
  }, [userData, currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      const userRef = doc(db, 'users', currentUser.uid);
      
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s !== '');
      const interestsArray = interests.split(',').map(i => i.trim()).filter(i => i !== '');

      await setDoc(userRef, {
        name,
        location,
        skills: skillsArray,
        interests: interestsArray,
        onboardingComplete: true
      }, { merge: true });

      toast.success('Onboarding saved successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleFit = () => {
    const hasSkills = skills.trim().length > 0;
    const hasInterests = interests.trim().length > 0;
    
    if (hasSkills && hasInterests) return 'Both';
    if (hasSkills) return 'Mentor';
    if (hasInterests) return 'Learner';
    return 'Pending';
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-[#2b3231] rounded-[24px] p-10 lg:p-16 flex flex-col text-white">
        <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">ONBOARDING</p>
        <h1 className="text-4xl lg:text-[56px] font-bold tracking-tight mb-4 max-w-3xl leading-[1.1]">
          Shape your support identity with AI suggestions.
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl">
          Name your strengths, interests, and location so the system can recommend where you can help and where you may need backup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Left Column - Form */}
        <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8 lg:p-10">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                  placeholder="e.g. Karachi, Remote"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skills (comma separated)</label>
              <input 
                type="text" 
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                placeholder="Figma, UI/UX, HTML/CSS, React"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Interests (comma separated)</label>
              <input 
                type="text" 
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                placeholder="Hackathons, Community Building, Python"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-full font-bold py-3.5 text-base bg-[#129780] hover:bg-[#0f806c] mt-4"
            >
              {loading ? 'Saving...' : 'Save onboarding'}
            </Button>
          </form>
        </Card>

        {/* Right Column - AI Suggestions */}
        <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8 lg:p-10">
          <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">AI SUGGESTIONS</p>
          <h3 className="text-3xl font-bold text-[#2b3231] mb-8 leading-tight">Your likely contribution map</h3>

          <div className="space-y-6">
            <div className="flex flex-col border-b border-gray-100 pb-6 gap-2">
              <span className="text-sm text-gray-600">You can likely help with</span>
              <span className="font-bold text-[#2b3231]">{skills || '—'}</span>
            </div>
            
            <div className="flex flex-col border-b border-gray-100 pb-6 gap-2">
              <span className="text-sm text-gray-600">You may want support in</span>
              <span className="font-bold text-[#2b3231]">{interests || '—'}</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-600">Suggested role fit</span>
              <span className="font-bold text-[#2b3231]">{getRoleFit()}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
