import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function NotificationsPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="bg-[#2b3231] rounded-[24px] p-10 flex flex-col text-white">
        <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">NOTIFICATIONS</p>
        <h1 className="text-4xl lg:text-[56px] font-bold tracking-tight mb-4 max-w-3xl leading-[1.1]">
          Stay updated on requests, helpers, and trust signals.
        </h1>
        <p className="text-gray-300 text-lg">
          Track new matches, solved items, AI insights, and reputation changes in one place.
        </p>
      </div>

      <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-6 lg:p-10">
        <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">LIVE UPDATES</p>
        <h3 className="text-3xl font-bold text-[#2b3231] mb-8">Notification feed</h3>

        <div className="space-y-4">
          {/* Notification 1 */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[17px] font-bold text-[#2b3231] leading-snug mb-2">"need review for returant" was marked as solved</p>
              <p className="text-sm text-gray-500">Status • Just now</p>
            </div>
            <Badge variant="outline" className="border-gray-200 text-gray-700 bg-white rounded-full px-4 py-1.5 shadow-sm font-semibold">Unread</Badge>
          </div>

          {/* Notification 2 */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[17px] font-bold text-[#2b3231] leading-snug mb-2">Ayesha Khan offered help on "need review for returant"</p>
              <p className="text-sm text-gray-500">Match • Just now</p>
            </div>
            <Badge variant="outline" className="border-gray-200 text-gray-700 bg-white rounded-full px-4 py-1.5 shadow-sm font-semibold">Unread</Badge>
          </div>

          {/* Notification 3 */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[17px] font-bold text-[#2b3231] leading-snug mb-2">"need review for returant" was marked as solved</p>
              <p className="text-sm text-gray-500">Status • Just now</p>
            </div>
            <Badge variant="outline" className="border-gray-200 text-gray-700 bg-white rounded-full px-4 py-1.5 shadow-sm font-semibold">Unread</Badge>
          </div>

          {/* Notification 4 */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[17px] font-bold text-[#2b3231] leading-snug mb-2">Your request "need review for returant" is now live in the community feed</p>
              <p className="text-sm text-gray-500">Request • Just now</p>
            </div>
            <Badge variant="outline" className="border-gray-200 text-gray-700 bg-white rounded-full px-4 py-1.5 shadow-sm font-semibold">Unread</Badge>
          </div>

          {/* Notification 5 */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[17px] font-bold text-[#2b3231] leading-snug mb-2">New helper matched to your responsive portfolio request</p>
              <p className="text-sm text-gray-500">Match • 12 min ago</p>
            </div>
            <Badge variant="outline" className="border-gray-200 text-gray-700 bg-white rounded-full px-4 py-1.5 shadow-sm font-semibold">Unread</Badge>
          </div>

          {/* Notification 6 */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[17px] font-bold text-[#2b3231] leading-snug mb-2">Your trust score increased after a solved request</p>
              <p className="text-sm text-gray-500">Reputation • 1 hr ago</p>
            </div>
            <Badge variant="outline" className="border-gray-200 text-gray-700 bg-white rounded-full px-4 py-1.5 shadow-sm font-semibold">Unread</Badge>
          </div>

          {/* Notification 7 */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[17px] font-bold text-[#2b3231] leading-snug mb-2">AI Center detected rising demand for interview prep</p>
              <p className="text-sm text-gray-500">Insight • Today</p>
            </div>
            <Badge variant="outline" className="border-gray-200 text-gray-700 bg-white rounded-full px-4 py-1.5 shadow-sm font-semibold">Read</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
