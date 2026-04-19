import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export function LandingPage() {
  const navigate = useNavigate();
  const [featuredRequests, setFeaturedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = [];
      snapshot.forEach((doc) => {
        fetchedPosts.push({ id: doc.id, ...doc.data() });
      });
      setFeaturedRequests(fetchedPosts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching featured requests:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col gap-16 pb-12">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-[#f6f3eb] rounded-[32px] p-10 flex flex-col justify-center">
          <p className="text-[#129780] font-bold text-xs uppercase tracking-wider mb-6">SMIT GRAND CODING NIGHT 2026</p>
          <h1 className="text-5xl lg:text-[64px] leading-[1.1] font-bold text-[#2b3231] tracking-tight mb-6">
            Find help faster.<br/>Become help that<br/>matters.
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-md leading-relaxed">
            Helplytics AI is a community-powered support network for students, mentors,
            creators, and builders. Ask for help, offer help, track impact, and let AI surface
            smarter matches across the platform.
          </p>
          <div className="flex items-center gap-4 mb-12">
            <Link to="/explore">
              <Button className="rounded-full px-6 py-6 text-base font-semibold">Open product demo</Button>
            </Link>
            <Link to="/create">
              <Button variant="secondary" className="rounded-full px-6 py-6 text-base font-semibold border-none shadow-sm">Post a request</Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Card className="flex-1 min-w-[140px] bg-white border-none shadow-sm rounded-2xl p-5">
              <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">MEMBERS</p>
              <p className="text-3xl font-bold text-[#2b3231] mb-2">384+</p>
              <p className="text-xs text-gray-500 leading-relaxed">Students, mentors, and helpers in the loop.</p>
            </Card>
            <Card className="flex-1 min-w-[140px] bg-white border-none shadow-sm rounded-2xl p-5">
              <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">REQUESTS</p>
              <p className="text-3xl font-bold text-[#2b3231] mb-2">54+</p>
              <p className="text-xs text-gray-500 leading-relaxed">Support posts shared across learning journeys.</p>
            </Card>
            <Card className="flex-1 min-w-[140px] bg-white border-none shadow-sm rounded-2xl p-5">
              <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">SOLVED</p>
              <p className="text-3xl font-bold text-[#2b3231] mb-2">23+</p>
              <p className="text-xs text-gray-500 leading-relaxed">Problems resolved through fast community action.</p>
            </Card>
          </div>
        </div>

        <div className="bg-[#222D2B] rounded-[32px] p-10 flex flex-col text-white relative overflow-hidden">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-6">LIVE PRODUCT FEEL</p>
          <h2 className="text-4xl lg:text-5xl leading-[1.1] font-bold tracking-tight mb-6">
            More than a form.<br/>More like an<br/>ecosystem.
          </h2>
          <p className="text-gray-300 text-base mb-10 leading-relaxed max-w-md">
            A polished multi-page experience inspired by
            product platforms, with AI summaries, trust scores,
            contribution signals, notifications, and leaderboard
            momentum built directly in HTML, CSS, JavaScript, and
            LocalStorage.
          </p>
          
          <div className="flex flex-col gap-4 mt-auto">
            <div className="bg-[#F3F0E6] rounded-2xl p-5 text-[#222D2B]">
              <h4 className="font-bold mb-2">AI request intelligence</h4>
              <p className="text-sm text-gray-700">Auto-categorization, urgency detection, tags, rewrite suggestions, and trend snapshots.</p>
            </div>
            <div className="bg-[#F3F0E6] rounded-2xl p-5 text-[#222D2B]">
              <h4 className="font-bold mb-2">Community trust graph</h4>
              <p className="text-sm text-gray-700">Badges, helper rankings, trust score boosts, and visible contribution history.</p>
            </div>
            <div className="bg-[#F3F0E6] rounded-2xl p-5 text-[#222D2B]">
              <h4 className="font-bold mb-2">92%</h4>
              <p className="text-sm text-gray-700">Top trust score currently active across the sample mentor network.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Flow Section */}
      <div className="mt-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#129780] font-bold text-xs uppercase tracking-wider mb-2">CORE FLOW</p>
            <h3 className="text-3xl font-bold text-[#2b3231]">From struggling alone to solving together</h3>
          </div>
          <Link to="/explore">
            <Button variant="secondary" className="rounded-full shadow-sm border-none bg-white">Try onboarding AI</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-none shadow-sm rounded-2xl p-8">
            <h4 className="font-bold text-lg mb-3">Ask for help clearly</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Create structured requests with category, urgency, AI suggestions, and tags that attract the right people.
            </p>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-2xl p-8">
            <h4 className="font-bold text-lg mb-3">Discover the right people</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Use the explore feed, helper lists, notifications, and messaging to move quickly once a match happens.
            </p>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-2xl p-8">
            <h4 className="font-bold text-lg mb-3">Track real contribution</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Trust scores, badges, solved requests, and rankings help the community recognize meaningful support.
            </p>
          </Card>
        </div>
      </div>

      {/* Featured Requests Section */}
      <div className="mt-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#129780] font-bold text-xs uppercase tracking-wider mb-2">FEATURED REQUESTS</p>
            <h3 className="text-3xl font-bold text-[#2b3231]">Community problems currently in motion</h3>
          </div>
          <Link to="/explore">
            <Button variant="secondary" className="rounded-full shadow-sm border-none bg-white">View full feed</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-1 md:col-span-3 text-center py-12 text-gray-500 font-medium">Loading live community requests...</div>
          ) : featuredRequests.length > 0 ? (
            featuredRequests.map((post) => (
              <Card key={post.id} className="bg-white border-none shadow-sm rounded-2xl p-6 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">{post.category || 'General'}</Badge>
                  <Badge variant="destructive" className="bg-[#fef2f2] text-[#ef4444] border-none">{post.urgency || 'Normal'}</Badge>
                  <Badge variant="outline" className={`border-none ${post.status?.toLowerCase() === 'solved' ? 'bg-green-500/20 text-green-400' : 'border-gray-200 text-[#129780] bg-[#f0f9f8]'}`}>
                    {post.status || 'Open'}
                  </Badge>
                </div>
                <h4 className="font-bold text-[17px] leading-snug mb-3 line-clamp-2">{post.title}</h4>
                <p className="text-gray-600 text-[13px] leading-relaxed mb-6 flex-1 line-clamp-3">
                  {post.description}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline" className="bg-[#f6f8f9] border-none text-gray-600">{tag}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <p className="font-bold text-sm">{post.authorName || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">{post.authorLocation || 'Unknown'} • {post.helpers?.length || 0} helpers interested</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/request/${post.id}`)}
                    className="rounded-full border-gray-200 shadow-sm bg-white"
                  >
                    Open details
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-1 md:col-span-3 text-center py-12 text-gray-500 font-medium">No community requests currently in motion.</div>
          )}
        </div>
      </div>
    </div>
  );
}
