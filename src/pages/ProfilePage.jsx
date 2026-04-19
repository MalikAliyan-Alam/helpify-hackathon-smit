import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const { currentUser, userData } = useAuth();
  
  // Provide fallback in case data is loading
  const name = userData?.name || currentUser?.displayName || 'Loading...';
  const location = userData?.location || 'Unknown Location';
  const trustScore = userData?.trustScore || 0;
  const contributions = userData?.contributions || 0;
  const skills = userData?.skills?.length ? userData.skills : ['Add skills in edit profile'];
  const badges = userData?.badges?.length ? userData.badges : [];

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
                  <Badge key={index} variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8] px-4 py-1.5 font-semibold">{skill}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-[#2b3231] mb-3">Badges</p>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <Badge key={index} variant="outline" className="border-[#129780]/20 text-[#129780] bg-[#129780]/10 px-4 py-1.5 font-semibold">{badge}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Profile Form */}
        <Card className="bg-white border-none shadow-sm rounded-[24px] p-8">
          <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">EDIT PROFILE</p>
          <h3 className="text-3xl font-bold text-[#2b3231] mb-8">Update your identity</h3>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input 
                  type="text" 
                  defaultValue={name} 
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input 
                  type="text" 
                  defaultValue={location} 
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
              <input 
                type="text" 
                defaultValue="Figma, UI/UX, HTML/CSS, Career Guidance" 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Interests</label>
              <input 
                type="text" 
                defaultValue="Hackathons, UI/UX, Community Building" 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
              />
            </div>

            <Button className="w-full rounded-full font-semibold py-3 text-base">Save profile</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
