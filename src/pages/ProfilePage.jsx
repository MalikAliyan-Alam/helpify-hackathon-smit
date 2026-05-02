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
import { KudosButton } from '../components/KudosButton';
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
  const kudosCount = userData?.kudosCount || 0;
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
      <div className="relative overflow-hidden rounded-[32px] p-10 lg:p-14 flex flex-col shadow-xl shadow-[var(--shadow)] border border-[var(--border-color)] group" style={{ background: 'var(--hero-gradient)' }}>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent)] opacity-10 blur-[100px] rounded-full group-hover:opacity-20 transition-opacity duration-1000"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500 opacity-[0.03] blur-[100px] rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="opacity-60 font-black text-[10px] uppercase tracking-[0.3em] text-[var(--hero-text)]">PROFILE</p>
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
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4">
            <h1 className="text-4xl lg:text-[64px] font-black tracking-tighter text-[var(--hero-text)] leading-[1.1] break-all">
              {name}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              {userData?.verified && (
                <div className="bg-[#129780] text-white p-2 rounded-full shadow-lg shadow-[#129780]/30 group relative cursor-help flex items-center justify-center ring-4 ring-[#129780]/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                    Verified Expert in {userData.verifiedSkill}
                  </div>
                </div>
              )}
              {kudosCount > 0 && (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-black/5 transition-transform hover:scale-105">
                  <span className="text-sm leading-none">👏</span>
                  <span className="text-sm font-black text-[var(--text-primary)] leading-none">{kudosCount}</span>
                </div>
              )}
              {pinnedBadges.map(id => {
                const badge = BADGE_DEFINITIONS[id];
                return (
                  <div key={id} className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center text-lg shadow-sm border border-black/5 group relative hover:scale-105 transition-transform">
                    {badge?.icon}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl pointer-events-none">
                      {badge?.name}
                    </div>
                  </div>
                );
              })}
              {currentUser?.uid !== userData?.uid && (
                 <KudosButton 
                    targetUserId={userData?.uid} 
                    messageId={`profile-${userData?.uid}`} 
                    kudosGiven={userData?.kudosVoters || []} 
                    currentKudos={userData?.kudosCount || 0}
                 />
              )}
            </div>
          </div>
          <p className="opacity-70 text-lg lg:text-xl font-medium text-[var(--hero-text)]">
            Helper • {location}
          </p>
        </div>
      </div>

      {/* Verified Expert Banner */}
      {userData?.verified && (
        <div className="relative overflow-hidden rounded-[32px] p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-[#129780]/30 shadow-2xl shadow-[#129780]/10 bg-gradient-to-br from-[#129780] via-[#0f806c] to-[#0a5c4d] text-white group">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-md"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl lg:text-3xl font-black tracking-tight drop-shadow-sm">Verified Expert</h3>
                <span className="px-2.5 py-1 rounded-md bg-white/20 text-white text-[10px] font-black tracking-widest uppercase drop-shadow-sm">Elite Status</span>
              </div>
              <p className="text-white/80 font-bold text-sm lg:text-base tracking-wide uppercase drop-shadow-sm">Official Badge in {userData.verifiedSkill}</p>
            </div>
          </div>
          
          <div className="relative z-10 shrink-0">
            <div className="bg-white text-[#129780] px-6 py-3 rounded-full font-black text-sm shadow-xl shadow-black/10 hover:scale-105 transition-transform cursor-default">
              Trust Level: 100%
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        <div className="space-y-8">
          {/* Skills & Reputation */}
          <Card className="border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-2">PUBLIC PROFILE</p>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Skills and reputation</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 flex flex-col gap-2 group hover:border-[var(--accent)]/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </div>
                  <span className="text-xl font-black text-[var(--text-primary)]">{trustScore}%</span>
                </div>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Trust Score</p>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 flex flex-col gap-2 group hover:border-purple-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  </div>
                  <span className="text-xl font-black text-[var(--text-primary)]">{contributions}</span>
                </div>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Contributions</p>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 flex flex-col gap-2 group hover:border-orange-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  </div>
                  <span className="text-xl font-black text-[var(--text-primary)]">{kudosCount}</span>
                </div>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Kudos Received</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)] mb-3">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={`skill-${index}`} variant="outline" className="border-[var(--border-color)] text-[var(--accent)] bg-[var(--bg-secondary)] px-4 py-1.5 font-semibold">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-[var(--text-primary)] mb-3">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, index) => (
                    <Badge key={`interest-${index}`} variant="outline" className="border-[var(--border-color)] text-purple-600 bg-purple-500/10 px-4 py-1.5 font-semibold">{interest}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Endorsements Section */}
          <Card className="border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-2">RECOGNITION</p>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-[var(--text-primary)]">Skill Endorsements</h3>
              <div className="text-right">
                <p className="text-2xl font-bold text-[var(--accent)]">+{Object.values(userData?.endorsements || {}).reduce((acc, curr) => acc + curr.count, 0)}</p>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter">Total Endorsements</p>
              </div>
            </div>

            <div className="space-y-4">
              {userData?.endorsements && Object.keys(userData.endorsements).length > 0 ? (
                Object.entries(userData.endorsements)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([skill, data]) => (
                    <div key={skill} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] group hover:border-[var(--accent)]/30 transition-all hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="bg-[var(--bg-card)] text-[var(--accent)] px-4 py-2 rounded-xl font-bold text-sm shadow-sm group-hover:shadow-[var(--accent)]/10 transition-all">
                          {skill} <span className="ml-2 text-xs opacity-60">×{data.count}</span>
                        </div>
                        <div className="flex -space-x-2">
                          {data.endorsers.slice(0, 3).map((endorser, i) => (
                            <div 
                              key={i} 
                              className="w-6 h-6 rounded-full bg-[var(--accent)] border-2 border-[var(--bg-card)] flex items-center justify-center text-[8px] text-white font-bold"
                              title={endorser.name}
                            >
                              {endorser.name?.charAt(0)}
                            </div>
                          ))}
                          {data.count > 3 && (
                           <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--bg-card)] flex items-center justify-center text-[8px] text-[var(--text-secondary)] font-bold">
                              +{data.count - 3}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 blur-[2px] transition-all"></div>
                    </div>
                  ))
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-[var(--border-color)] rounded-[24px]">
                  <p className="text-[var(--text-secondary)] text-sm italic">No endorsements yet. Solve requests to get recognized!</p>
                </div>
              )}
            </div>
          </Card>

          {/* Availability Setup */}
          <Card className="border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-2">SCHEDULING</p>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Availability Setup</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-8">Select the days and times you are usually available to help others.</p>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-4">Available Days</label>
                <div className="flex flex-wrap gap-3">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      type="button"
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                        availability.days.includes(day)
                          ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                          : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-4">Time Slots</label>
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
                        className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
                    className="text-xs font-bold text-[var(--accent)] border border-dashed border-[var(--accent)]/30 rounded-xl py-2 hover:bg-[var(--accent)]/5 transition-colors"
                  >
                    + Add Slot
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Badges & Achievements */}
          <Card className="border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-2">MILESTONES</p>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Badges & achievements</h3>
            <BadgeShowcase 
              earnedBadges={earnedBadges} 
              pinnedBadges={pinnedBadges}
              onPinBadge={handlePinBadge}
              isOwnProfile={currentUser?.uid === userData?.uid}
            />
          </Card>
        </div>

        {/* Edit Profile Form */}
        <Card className="border-none shadow-sm rounded-[24px] p-8 sticky top-8">
          <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-2">EDIT PROFILE</p>
          <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Update your identity</h3>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Location</label>
                <input 
                  type="text" 
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. Karachi"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Skills</label>
              <input 
                type="text" 
                value={editSkills}
                onChange={(e) => setEditSkills(e.target.value)}
                placeholder="Figma, UI/UX, HTML/CSS" 
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Interests</label>
              <input 
                type="text" 
                value={editInterests}
                onChange={(e) => setEditInterests(e.target.value)}
                placeholder="Hackathons, Community Building" 
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full rounded-full font-semibold py-3 text-base">
              {loading ? 'Saving...' : 'Save profile'}
            </Button>

            {!userData?.verified && (
              <button 
                type="button" 
                onClick={() => setIsVerificationOpen(true)}
                className="w-full rounded-full border border-[var(--accent)]/30 bg-transparent text-[var(--accent)] hover:bg-[var(--accent)]/5 font-bold py-3 text-sm mt-4 transition-colors"
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
