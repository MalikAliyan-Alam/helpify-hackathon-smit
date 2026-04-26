import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { currentUser, userData } = useAuth();
  
  const name = userData?.name || currentUser?.displayName || currentUser?.email || 'User';
  const location = userData?.location || 'Unknown Location';
  const trustScore = userData?.trustScore || 0;
  const contributions = userData?.contributions || 0;
  const skills = userData?.skills?.length ? userData.skills : ['Add skills in edit profile'];
  const interests = userData?.interests?.length ? userData.interests : ['Add interests in edit profile'];
  const badges = userData?.badges?.length ? userData.badges : [];

  const [editName, setEditName] = useState(name);
  const [editLocation, setEditLocation] = useState(location !== 'Unknown Location' ? location : '');
  const [editSkills, setEditSkills] = useState(userData?.skills?.join(', ') || '');
  const [editInterests, setEditInterests] = useState(userData?.interests?.join(', ') || '');
  const [availability, setAvailability] = useState(userData?.availability || {
    days: [],
    slots: ["10:00 - 12:00", "14:00 - 16:00"]
  });
  const [loading, setLoading] = useState(false);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Sync state if userData updates via real-time listener
  React.useEffect(() => {
    setEditName(name);
    setEditLocation(location !== 'Unknown Location' ? location : '');
    setEditSkills(userData?.skills?.join(', ') || '');
    setEditInterests(userData?.interests?.join(', ') || '');
    if (userData?.availability) setAvailability(userData.availability);
  }, [userData, name, location]);

  const toggleDay = (day) => {
    setAvailability(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  async function handleUpdateProfile(e) {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Update Auth Profile
      if (editName !== currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: editName });
      }

      // Update Firestore Profile using setDoc with merge
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        name: editName,
        location: editLocation,
        skills: editSkills.split(',').map(s => s.trim()).filter(s => s),
        interests: editInterests.split(',').map(i => i.trim()).filter(i => i),
        availability: availability
      }, { merge: true });
      
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="bg-[#2b3231] rounded-[24px] p-10 flex flex-col text-white">
        <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">PROFILE</p>
        <h1 className="text-4xl lg:text-[56px] font-bold tracking-tight mb-4">
          {name}
        </h1>
        <p className="text-gray-300 text-sm font-medium">
          Helper • {location}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        <div className="space-y-8">
          {/* Skills & Reputation */}
          <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">PUBLIC PROFILE</p>
            <h3 className="text-3xl font-bold text-[#2b3231] mb-8">Skills and reputation</h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-4">
                <span className="text-sm font-medium text-gray-700">Trust score</span>
                <span className="text-sm font-bold text-[#2b3231]">{trustScore}%</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-4">
                <span className="text-sm font-medium text-gray-700">Contributions</span>
                <span className="text-sm font-bold text-[#2b3231]">{contributions}</span>
              </div>

              <div>
                <p className="text-sm font-bold text-[#2b3231] mb-3">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={`skill-${index}`} variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8] px-4 py-1.5 font-semibold">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-[#2b3231] mb-3">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, index) => (
                    <Badge key={`interest-${index}`} variant="outline" className="border-gray-200 text-purple-600 bg-purple-50 px-4 py-1.5 font-semibold">{interest}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Availability Setup */}
          <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">SCHEDULING</p>
            <h3 className="text-3xl font-bold text-[#2b3231] mb-4">Availability Setup</h3>
            <p className="text-sm text-gray-500 mb-8">Select the days and times you are usually available to help others.</p>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-[#2b3231] mb-4">Available Days</label>
                <div className="flex flex-wrap gap-3">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      type="button"
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                        availability.days.includes(day)
                          ? 'bg-[#129780] text-white border-[#129780]'
                          : 'bg-white text-gray-400 border-gray-200 hover:border-[#129780] hover:text-[#129780]'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2b3231] mb-4">Time Slots</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availability.slots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                       <input 
                        type="text" 
                        value={slot}
                        onChange={(e) => {
                          const newSlots = [...availability.slots];
                          newSlots[idx] = e.target.value;
                          setAvailability(prev => ({ ...prev, slots: newSlots }));
                        }}
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                      />
                      <button 
                        onClick={() => {
                          const newSlots = availability.slots.filter((_, i) => i !== idx);
                          setAvailability(prev => ({ ...prev, slots: newSlots }));
                        }}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setAvailability(prev => ({ ...prev, slots: [...prev.slots, "09:00 - 11:00"] }))}
                    className="text-xs font-bold text-[#129780] border border-dashed border-[#129780]/30 rounded-xl py-2 hover:bg-[#f0f9f8] transition-colors"
                  >
                    + Add Slot
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Profile Form */}
        <Card className="bg-white border-none shadow-sm rounded-[24px] p-8 sticky top-8">
          <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">EDIT PROFILE</p>
          <h3 className="text-3xl font-bold text-[#2b3231] mb-8">Update your identity</h3>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input 
                  type="text" 
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. Karachi"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
              <input 
                type="text" 
                value={editSkills}
                onChange={(e) => setEditSkills(e.target.value)}
                placeholder="Figma, UI/UX, HTML/CSS" 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Interests</label>
              <input 
                type="text" 
                value={editInterests}
                onChange={(e) => setEditInterests(e.target.value)}
                placeholder="Hackathons, Community Building" 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full rounded-full font-semibold py-3 text-base">
              {loading ? 'Saving...' : 'Save profile'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
