import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function CreateRequestPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="bg-[#2b3231] rounded-[24px] p-10 flex flex-col text-white">
        <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">CREATE REQUEST</p>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 max-w-2xl">
          Turn a rough problem into a clear help request.
        </h1>
        <p className="text-gray-300 text-lg max-w-xl">
          Use built-in AI suggestions for category, urgency, tags, and a stronger description rewrite.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Form Container */}
        <Card className="bg-white border-none shadow-sm rounded-[24px] p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input 
                type="text" 
                placeholder="Need review on my JavaScript quiz app before submission" 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea 
                rows="6"
                placeholder="Explain the challenge, your current progress, deadline, and what kind of help would be useful." 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                <input 
                  type="text" 
                  placeholder="JavaScript, Debugging, Review" 
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] appearance-none">
                  <option>Web Development</option>
                  <option>Design</option>
                  <option>Career</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency</label>
              <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] appearance-none max-w-xs">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button variant="outline" className="rounded-full bg-white border-gray-200 shadow-sm font-semibold px-6">Apply AI suggestions</Button>
              <Button className="rounded-full font-semibold px-6">Publish request</Button>
            </div>
          </div>
        </Card>

        {/* AI Assistant Sidebar */}
        <Card className="bg-white border-none shadow-sm rounded-[24px] p-8 sticky top-8">
          <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">AI ASSISTANT</p>
          <h3 className="text-3xl font-bold text-[#2b3231] mb-8">Smart request guidance</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="text-sm text-gray-600">Suggested category</span>
              <span className="text-sm font-bold text-[#2b3231]">Community</span>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="text-sm text-gray-600">Detected urgency</span>
              <span className="text-sm font-bold text-[#2b3231]">Low</span>
            </div>

            <div className="flex items-start justify-between border-b border-gray-100 pb-4 gap-4">
              <span className="text-sm text-gray-600 whitespace-nowrap">Suggested tags</span>
              <span className="text-sm font-bold text-[#2b3231] text-right">Add more detail for smarter tags</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-gray-600 whitespace-nowrap">Rewrite suggestion</span>
              <span className="text-sm font-bold text-[#2b3231] text-right">Start describing the challenge to generate a stronger version.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
