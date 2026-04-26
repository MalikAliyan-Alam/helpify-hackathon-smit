import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import toast from 'react-hot-toast';
import { VerificationModal } from '../components/VerificationModal';
import { ReportModal } from '../components/ReportModal';
import { BadgeShowcase } from '../components/BadgeShowcase';
import { BADGE_DEFINITIONS } from '../lib/gamification.jsx';

export function ProfilePage() {
  const { currentUser, userData } = useAuth();
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const name = userData?.name || currentUser?.displayName || currentUser?.email || 'User';
  const earnedBadges = userData?.earnedBadges || [];
  const pinnedBadges = userData?.pinnedBadges || [];
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

  const handlePinBadge = async (badgeId) => {
    if (!currentUser || currentUser.uid !== userData?.uid) return;
    try {
      let newPinned = [...pinnedBadges];
      if (newPinned.includes(badgeId)) {
        newPinned = newPinned.filter(id => id !== badgeId);
      } else {
        if (newPinned.length >= 3) {
          toast.error('You can only pin up to 3 badges');
          return;
        }
        newPinned.push(badgeId);
      }
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        pinnedBadges: newPinned
      });
    } catch (err) {
      toast.error('Failed to update pinned badges');
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="bg-[#2b3231] rounded-[24px] p-10 flex flex-col text-white">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">PROFILE</p>
          {currentUser && currentUser.uid !== userData?.uid && (
            <button 
              onClick={() => setIsReportOpen(true)}
              className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all border border-red-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Report Profile
            </button>
          )}
        </div>
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-4xl lg:text-[56px] font-bold tracking-tight">
            {name}
          </h1>
          <div className="flex gap-2">
            {pinnedBadges.map(id => {
              const badge = BADGE_DEFINITIONS[id];
              return (
                <div key={id} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-sm shadow-inner group relative">
                  {badge?.icon}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {badge?.name}
                  </div>
                </div>
              );
            })}
          </div>
          {userData?.verified && (
            <div className="bg-[#129780] text-white p-1.5 rounded-full shadow-lg shadow-[#129780]/40 group relative cursor-help">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                Verified Expert in {userData.verifiedSkill}
              </div>
            </div>
          )}
        </div>
        <p className="text-gray-300 text-sm font-medium">
          Helper • {location}
        </p>
      </div>

      {/* Verified Expert Banner */}
      {userData?.verified && (
        <Card className="bg-gradient-to-r from-[#129780] to-[#0f7a68] border-none shadow-xl rounded-[24px] p-8 text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner">
                  ✅
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-1">Verified Expert</h3>
                  <p className="text-white/80 font-medium tracking-wide uppercase text-xs">Official Badge in {userData.verifiedSkill}</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                <span className="text-sm font-bold tracking-tight">Trust Level: Elite</span>
              </div>
           </div>
        </Card>
      )}

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

          {/* Endorsements Section */}
          <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">RECOGNITION</p>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-[#2b3231]">Skill Endorsements</h3>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#129780]">+{Object.values(userData?.endorsements || {}).reduce((acc, curr) => acc + curr.count, 0)}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total Endorsements</p>
              </div>
            </div>

            <div className="space-y-4">
              {userData?.endorsements && Object.keys(userData.endorsements).length > 0 ? (
                Object.entries(userData.endorsements)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([skill, data]) => (
                    <div key={skill} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 group hover:border-[#129780]/30 transition-all hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#f0f9f8] text-[#129780] px-4 py-2 rounded-xl font-bold text-sm shadow-sm group-hover:shadow-[#129780]/10 transition-all">
                          {skill} <span className="ml-2 text-xs opacity-60">×{data.count}</span>
                        </div>
                        <div className="flex -space-x-2">
                          {data.endorsers.slice(0, 3).map((endorser, i) => (
                            <div 
                              key={i} 
                              className="w-6 h-6 rounded-full bg-[#2b3231] border-2 border-white flex items-center justify-center text-[8px] text-white font-bold"
                              title={endorser.name}
                            >
                              {endorser.name?.charAt(0)}
                            </div>
                          ))}
                          {data.count > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] text-gray-500 font-bold">
                              +{data.count - 3}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-[#129780] opacity-0 group-hover:opacity-100 blur-[2px] transition-all"></div>
                    </div>
                  ))
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-[24px]">
                  <p className="text-gray-400 text-sm italic">No endorsements yet. Solve requests to get recognized!</p>
                </div>
              )}
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

          {/* Badges & Achievements */}
          <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">MILESTONES</p>
            <h3 className="text-3xl font-bold text-[#2b3231] mb-8">Badges & achievements</h3>
            <BadgeShowcase 
              earnedBadges={earnedBadges} 
              pinnedBadges={pinnedBadges}
              onPinBadge={handlePinBadge}
              isOwnProfile={currentUser?.uid === userData?.uid}
            />
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

            {!userData?.verified && (
              <button 
                type="button" 
                onClick={() => setIsVerificationOpen(true)}
                className="w-full rounded-full border border-[#129780]/30 bg-transparent text-[#129780] hover:bg-[#f0f9f8] font-bold py-3 text-sm mt-4 transition-colors"
              >
                Apply for Verified Badge
              </button>
            )}
          </form>
        </Card>
      </div>

      <VerificationModal 
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        currentUser={currentUser}
      />

      <ReportModal 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportedUserId={userData?.uid}
        reportedUserName={name}
        reporterId={currentUser?.uid}
      />
    </div>
  );
}
