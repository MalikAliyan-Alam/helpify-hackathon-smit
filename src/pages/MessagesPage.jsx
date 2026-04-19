import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function MessagesPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="bg-[#2b3231] rounded-[24px] p-10 flex flex-col text-white">
        <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">INTERACTION / MESSAGING</p>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 max-w-2xl">
          Keep support moving through direct communication.
        </h1>
        <p className="text-gray-300 text-lg max-w-xl">
          Basic messaging gives helpers and requesters a clear follow-up path once a match happens.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Conversation Stream */}
        <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8">
          <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">CONVERSATION STREAM</p>
          <h3 className="text-3xl font-bold text-[#2b3231] mb-8">Recent messages</h3>

          <div className="space-y-4">
            {/* Message 1 */}
            <div className="bg-white border border-gray-100 rounded-[16px] p-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-sm text-[#2b3231] mb-2">Ayesha Khan → Sara Noor</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  I checked your portfolio request. Share the breakpoint screenshots and I can suggest fixes.
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#e8f3f1] flex items-center justify-center flex-shrink-0 text-[#129780] text-xs font-bold text-center leading-tight shadow-sm border border-[#d1e8e4]">
                09:45<br/>AM
              </div>
            </div>

            {/* Message 2 */}
            <div className="bg-white border border-gray-100 rounded-[16px] p-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-sm text-[#2b3231] mb-2">Hassan Ali → Ayesha Khan</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Your event poster concept is solid. I would tighten the CTA and reduce the background texture.
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#e8f3f1] flex items-center justify-center flex-shrink-0 text-[#129780] text-xs font-bold text-center leading-tight shadow-sm border border-[#d1e8e4]">
                11:10<br/>AM
              </div>
            </div>
          </div>
        </Card>

        {/* Send Message Form */}
        <Card className="bg-white border-none shadow-sm rounded-[24px] p-8">
          <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">SEND MESSAGE</p>
          <h3 className="text-3xl font-bold text-[#2b3231] mb-8">Start a conversation</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
              <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] appearance-none">
                <option>Ayesha Khan</option>
                <option>Sara Noor</option>
                <option>Hassan Ali</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
              <textarea 
                rows="5"
                placeholder="Share support details, ask for files, or suggest next steps." 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] resize-none"
              ></textarea>
            </div>

            <Button className="w-full rounded-full font-semibold py-3 text-base">Send</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
