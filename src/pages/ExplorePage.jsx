import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function ExplorePage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="bg-[#2b3231] rounded-[24px] p-10 flex flex-col text-white">
        <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">EXPLORE / FEED</p>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 max-w-2xl">
          Browse help requests with filterable community context.
        </h1>
        <p className="text-gray-300 text-lg max-w-xl">
          Filter by category, urgency, skills, and location to surface the best matches.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        {/* Filters Sidebar */}
        <div className="bg-[#f6f3eb] rounded-[24px] p-6 lg:p-8 border border-gray-200/50">
          <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">FILTERS</p>
          <h3 className="text-3xl font-bold text-[#2b3231] mb-8">Refine the feed</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] appearance-none">
                <option>All categories</option>
                <option>Web Development</option>
                <option>Design</option>
                <option>Career</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency</label>
              <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] appearance-none">
                <option>All urgency levels</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
              <input 
                type="text" 
                placeholder="React, Figma, Git/GitHub" 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input 
                type="text" 
                placeholder="Karachi, Lahore, Remote" 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
              />
            </div>
          </div>
        </div>

        {/* Feed List */}
        <div className="flex flex-col gap-4">
          {/* Card 1 */}
          <Card className="bg-white border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">Web Development</Badge>
              <Badge variant="destructive" className="bg-[#fef2f2] text-[#ef4444] border-none">High</Badge>
              <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">Open</Badge>
            </div>
            <h4 className="font-bold text-xl leading-snug mb-3">Need help making my portfolio responsive before demo day</h4>
            <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
              My HTML/CSS portfolio breaks on tablets and I need layout guidance before tomorrow evening.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              <Badge variant="outline" className="bg-[#f6f8f9] border-none text-gray-600">HTML/CSS</Badge>
              <Badge variant="outline" className="bg-[#f6f8f9] border-none text-gray-600">Responsive</Badge>
              <Badge variant="outline" className="bg-[#f6f8f9] border-none text-gray-600">Portfolio</Badge>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div>
                <p className="font-bold text-sm text-[#2b3231]">Sara Noor</p>
                <p className="text-xs text-gray-500">Karachi • 1 helper interested</p>
              </div>
              <Button variant="outline" className="rounded-full border-gray-200 shadow-sm bg-white font-semibold px-6 py-2">Open details</Button>
            </div>
          </Card>

          {/* Card 2 */}
          <Card className="bg-white border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">Design</Badge>
              <Badge variant="outline" className="bg-[#f0fdf4] text-[#16a34a] border-none">Medium</Badge>
              <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">Open</Badge>
            </div>
            <h4 className="font-bold text-xl leading-snug mb-3">Looking for Figma feedback on a volunteer event poster</h4>
            <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
              I have a draft poster for a campus community event and want sharper hierarchy, spacing, and CTA copy.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              <Badge variant="outline" className="bg-[#f6f8f9] border-none text-gray-600">Figma</Badge>
              <Badge variant="outline" className="bg-[#f6f8f9] border-none text-gray-600">Poster</Badge>
              <Badge variant="outline" className="bg-[#f6f8f9] border-none text-gray-600">Design Review</Badge>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div>
                <p className="font-bold text-sm text-[#2b3231]">Ayesha Khan</p>
                <p className="text-xs text-gray-500">Lahore • 1 helper interested</p>
              </div>
              <Button variant="outline" className="rounded-full border-gray-200 shadow-sm bg-white font-semibold px-6 py-2">Open details</Button>
            </div>
          </Card>

          {/* Card 3 */}
          <Card className="bg-white border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">Career</Badge>
              <Badge variant="outline" className="bg-[#f3f4f6] text-gray-600 border-none">Low</Badge>
              <Badge variant="outline" className="bg-[#ecfdf5] text-[#059669] border-none">Solved</Badge>
            </div>
            <h4 className="font-bold text-xl leading-snug mb-3">Need mock interview support for internship applications</h4>
            <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
              Applying to frontend internships and need someone to practice behavioral and technical interview questions with me.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              <Badge variant="outline" className="bg-[#f6f8f9] border-none text-gray-600">Interview Prep</Badge>
              <Badge variant="outline" className="bg-[#f6f8f9] border-none text-gray-600">Career</Badge>
              <Badge variant="outline" className="bg-[#f6f8f9] border-none text-gray-600">Frontend</Badge>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div>
                <p className="font-bold text-sm text-[#2b3231]">Sara Noor</p>
                <p className="text-xs text-gray-500">Remote • 2 helpers interested</p>
              </div>
              <Button variant="outline" className="rounded-full border-gray-200 shadow-sm bg-white font-semibold px-6 py-2">Open details</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
