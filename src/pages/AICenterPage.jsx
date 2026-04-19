import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function AICenterPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="bg-[#2b3231] rounded-[24px] p-10 flex flex-col text-white">
        <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">AI CENTER</p>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 max-w-3xl">
          See what the platform intelligence is noticing.
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl">
          AI-like insights summarize demand trends, helper readiness, urgency signals, and request recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <Card className="bg-white border-none shadow-sm rounded-[24px] p-8 flex flex-col justify-between">
          <div>
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-4">TREND PULSE</p>
            <h3 className="text-3xl font-bold text-[#2b3231] leading-tight mb-6">Web<br/>Development</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Most common support area based on active community requests.
          </p>
        </Card>

        {/* Metric 2 */}
        <Card className="bg-white border-none shadow-sm rounded-[24px] p-8 flex flex-col justify-between">
          <div>
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-4">URGENCY WATCH</p>
            <h3 className="text-4xl font-bold text-[#2b3231] mb-6">1</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Requests currently flagged high priority by the urgency detector.
          </p>
        </Card>

        {/* Metric 3 */}
        <Card className="bg-white border-none shadow-sm rounded-[24px] p-8 flex flex-col justify-between">
          <div>
            <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-4">MENTOR POOL</p>
            <h3 className="text-4xl font-bold text-[#2b3231] mb-6">2</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Trusted helpers with strong response history and contribution signals.
          </p>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="bg-[#fdfcf9] border-none shadow-sm rounded-[24px] p-8 lg:p-10 mt-2">
        <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">AI RECOMMENDATIONS</p>
        <h3 className="text-3xl font-bold text-[#2b3231] mb-8">Requests needing attention</h3>

        <div className="space-y-4">
          {/* Recommendation 1 */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 lg:p-8">
            <h4 className="font-bold text-[17px] leading-snug mb-3">Need help making my portfolio responsive before demo day</h4>
            <p className="text-gray-600 text-[15px] leading-relaxed mb-6 max-w-4xl">
              Responsive layout issue with a short deadline. Best helpers are frontend mentors comfortable with CSS grids and media queries.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">Web Development</Badge>
              <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">High</Badge>
            </div>
          </div>

          {/* Recommendation 2 */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 lg:p-8">
            <h4 className="font-bold text-[17px] leading-snug mb-3">Looking for Figma feedback on a volunteer event poster</h4>
            <p className="text-gray-600 text-[15px] leading-relaxed mb-6 max-w-4xl">
              A visual design critique request where feedback on hierarchy, spacing, and messaging would create the most value.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">Design</Badge>
              <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">Medium</Badge>
            </div>
          </div>

          {/* Recommendation 3 */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 lg:p-8">
            <h4 className="font-bold text-[17px] leading-snug mb-3">Need mock interview support for internship applications</h4>
            <p className="text-gray-600 text-[15px] leading-relaxed mb-6 max-w-4xl">
              Career coaching request focused on confidence-building, behavioral answers, and entry-level frontend interviews.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">Career</Badge>
              <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">Low</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
