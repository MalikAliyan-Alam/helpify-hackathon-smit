import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="bg-[#2b3231] rounded-[24px] p-10 flex flex-col text-white">
        <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">DASHBOARD</p>
        <h1 className="text-4xl lg:text-[56px] font-bold tracking-tight mb-4">
          Welcome back, Ayesha Khan.
        </h1>
        <p className="text-gray-300 text-lg">
          Your command center for requests, AI insights, helper momentum, and live community activity.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-4">TRUST SCORE</p>
            <h3 className="text-4xl font-bold text-[#2b3231] mb-4">98%</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Driven by solved requests and consistent support.
          </p>
        </Card>

        <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-4">HELPING</p>
            <h3 className="text-4xl font-bold text-[#2b3231] mb-4">3</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Requests where you are currently listed as a helper.
          </p>
        </Card>

        <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-4">OPEN REQUESTS</p>
            <h3 className="text-4xl font-bold text-[#2b3231] mb-4">2</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Community requests currently active across the feed.
          </p>
        </Card>

        <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-4">AI PULSE</p>
            <h3 className="text-4xl font-bold text-[#2b3231] leading-tight mb-4">1 trends</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Trend count detected in the latest request activity.
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Main Feed */}
        <div>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">RECENT REQUESTS</p>
              <h3 className="text-3xl font-bold text-[#2b3231]">What the community<br/>needs right now</h3>
            </div>
            <Button variant="secondary" className="rounded-full shadow-sm border-none bg-white w-14 h-14 flex items-center justify-center p-0 flex-col">
              <span className="text-[10px] font-bold leading-tight">Go to</span>
              <span className="text-[10px] font-bold leading-tight">feed</span>
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Request 1 */}
            <Card className="bg-white border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">Web Development</Badge>
                <Badge variant="destructive" className="bg-[#fef2f2] text-[#ef4444] border-none">High</Badge>
                <Badge variant="outline" className="bg-[#ecfdf5] text-[#059669] border-none">Solved</Badge>
              </div>
              <h4 className="font-bold text-xl leading-snug mb-3">need review for returant</h4>
              <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
                kjkjcljsdkjasdlkjsalkjdkas
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="outline" className="bg-[#f6f8f9] border-none text-gray-600">Javascript</Badge>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="font-bold text-sm text-[#2b3231]">Ayesha Khan</p>
                  <p className="text-xs text-gray-500">Karachi • 1 helper interested</p>
                </div>
                <Button variant="outline" className="rounded-full border-gray-200 shadow-sm bg-white font-semibold px-6 py-2">Open details</Button>
              </div>
            </Card>

            {/* Request 2 */}
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
            
             {/* Request 3 */}
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
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-8">
          {/* AI Insights */}
          <Card className="bg-white border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">AI INSIGHTS</p>
            <h3 className="text-xl font-bold text-[#2b3231] mb-6">Suggested actions for you</h3>

            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <span className="text-sm text-gray-600">Most requested category</span>
                <span className="text-sm font-bold text-[#2b3231]">Web Development</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <span className="text-sm text-gray-600">Your strongest trust driver</span>
                <span className="text-sm font-bold text-[#2b3231]">Design Ally</span>
              </div>
              <div className="flex items-start justify-between border-b border-gray-100 pb-5 gap-4">
                <span className="text-sm text-gray-600">AI says you can mentor in</span>
                <span className="text-sm font-bold text-[#2b3231] text-right">HTML/CSS, UI/UX, Career Guidance, Figma</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Your active requests</span>
                <span className="text-sm font-bold text-[#2b3231]">2</span>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8">
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">NOTIFICATIONS</p>
            <h3 className="text-xl font-bold text-[#2b3231] mb-6">Latest updates</h3>

            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-[16px] p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-[#2b3231] leading-snug mb-1">"need review for returant" was marked as solved</p>
                  <p className="text-xs text-gray-500">Status • Just now</p>
                </div>
                <Badge variant="destructive" className="bg-[#fef2f2] text-[#ef4444] border-none rounded-full px-3 py-1">Unread</Badge>
              </div>

              <div className="bg-white border border-gray-100 rounded-[16px] p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-[#2b3231] leading-snug mb-1">Ayesha Khan offered help on "need review for returant"</p>
                  <p className="text-xs text-gray-500">Match • Just now</p>
                </div>
                <Badge variant="destructive" className="bg-[#fef2f2] text-[#ef4444] border-none rounded-full px-3 py-1">Unread</Badge>
              </div>

              <div className="bg-white border border-gray-100 rounded-[16px] p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-[#2b3231] leading-snug mb-1">"need review for returant" was marked as solved</p>
                  <p className="text-xs text-gray-500">Status • Just now</p>
                </div>
                <Badge variant="destructive" className="bg-[#fef2f2] text-[#ef4444] border-none rounded-full px-3 py-1">Unread</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
