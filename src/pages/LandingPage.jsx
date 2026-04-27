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
    <div className="flex flex-col gap-24 pb-20">
      {/* Immersive Hero Section */}
      <section className="relative min-h-[85vh] rounded-[48px] overflow-hidden flex flex-col items-center justify-center text-center px-6 py-20 bg-[#0a0f0e]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent)]/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-orange-500/5 rounded-full blur-[100px] animate-pulse [animation-delay:4s]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-10 animate-fade-in shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
            </span>
            <p className="text-[var(--accent)] font-black text-[9px] uppercase tracking-[0.3em]">Next-Gen Intelligence Network</p>
          </div>

          <div className="relative group">
            {/* Headline Glow */}
            <div className="absolute -inset-20 bg-[var(--accent)]/10 rounded-full blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <h1 className="text-7xl lg:text-[110px] leading-[0.85] font-black text-white tracking-tighter mb-8 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              Empower your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] via-purple-400 to-orange-400 drop-shadow-[0_0_30px_rgba(18,151,128,0.3)]">knowledge.</span>
            </h1>

            {/* Decorative Particles */}
            <div className="absolute -top-10 -left-20 w-12 h-12 bg-white/10 rounded-full blur-xl animate-float opacity-30"></div>
            <div className="absolute top-20 -right-20 w-16 h-16 bg-purple-500/10 rounded-full blur-xl animate-float [animation-delay:2s] opacity-30"></div>
          </div>

          <p className="text-gray-400 text-lg lg:text-xl mb-12 max-w-xl mx-auto leading-relaxed font-medium opacity-80">
            Helplystack is a community-driven intelligence network. 
            Connect, solve, and grow with AI-powered matching that actually matters.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-24">
            <Link to="/explore">
              <Button className="rounded-full px-12 py-8 text-lg font-black shadow-[0_10px_40px_rgba(18,151,128,0.4)] hover:shadow-[0_15px_60px_rgba(18,151,128,0.6)] hover:scale-105 active:scale-95 transition-all duration-500 group overflow-hidden relative">
                <span className="relative z-10 flex items-center gap-2">
                  Launch Experience
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="outline" className="rounded-full px-12 py-8 text-lg font-black border-2 border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 hover:border-white/30 transition-all shadow-xl">
                Post Request
              </Button>
            </Link>
          </div>

          {/* Slim Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-1 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl animate-fade-in shadow-2xl">
            <div className="px-10 py-5 rounded-full hover:bg-white/5 transition-colors group">
              <p className="text-2xl font-black text-white mb-0.5 tracking-tighter group-hover:scale-110 transition-transform">384+</p>
              <p className="text-[8px] text-[var(--accent)] font-black uppercase tracking-[0.2em]">Active Minds</p>
            </div>
            <div className="w-[1px] h-10 bg-white/10"></div>
            <div className="px-10 py-5 rounded-full hover:bg-white/5 transition-colors group">
              <p className="text-2xl font-black text-white mb-0.5 tracking-tighter group-hover:scale-110 transition-transform">54+</p>
              <p className="text-[8px] text-purple-400 font-black uppercase tracking-[0.2em]">Live Journeys</p>
            </div>
            <div className="w-[1px] h-10 bg-white/10"></div>
            <div className="px-10 py-5 rounded-full hover:bg-white/5 transition-colors group">
              <p className="text-2xl font-black text-white mb-0.5 tracking-tighter group-hover:scale-110 transition-transform">92%</p>
              <p className="text-[8px] text-orange-400 font-black uppercase tracking-[0.2em]">Trust Velocity</p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
        </div>
      </section>

      {/* Feature Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-square rounded-[48px] bg-gradient-to-br from-[#129780]/20 to-purple-500/20 p-1">
          <div className="w-full h-full bg-[#0a0f0e] rounded-[47px] overflow-hidden flex items-center justify-center relative">
            {/* Mock AI Visualization */}
            <div className="absolute inset-0 opacity-20">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--accent)_0%,_transparent_70%)] opacity-30"></div>
            </div>
            {/* Professional AI Intelligence Board */}
            <div className="relative z-10 w-full h-full p-8 flex flex-col items-center justify-center">
              {/* Animated SVG Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 400 400">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
                    <stop offset="50%" stopColor="var(--accent)" stopOpacity="1" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M100 100 L300 300 M300 100 L100 300" stroke="url(#lineGrad)" strokeWidth="1" fill="none" className="animate-pulse" />
                <circle cx="200" cy="200" r="100" stroke="var(--accent)" strokeWidth="0.5" fill="none" strokeDasharray="5 5" className="animate-spin-slow" />
              </svg>

              {/* Central Processor */}
              <div className="relative z-20 mb-12 group">
                <div className="absolute -inset-8 bg-[var(--accent)]/10 rounded-full blur-2xl group-hover:bg-[var(--accent)]/20 transition-all duration-700"></div>
                <div className="relative w-28 h-28 rounded-[32px] bg-[#0a0f0e] border border-[var(--accent)]/30 flex items-center justify-center shadow-[0_0_40px_rgba(18,151,128,0.15)]">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                       <svg className="w-8 h-8 text-[var(--accent)] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                       <div className="absolute top-0 right-0 w-2 h-2 bg-[var(--accent)] rounded-full animate-ping"></div>
                    </div>
                    <span className="text-[8px] font-black text-[var(--accent)] uppercase tracking-widest">CORE-AI</span>
                  </div>
                </div>
              </div>

              {/* Functional Grid */}
              <div className="grid grid-cols-2 gap-4 w-full">
                {[
                  { t: 'Natural Language', d: 'Contextual analysis', i: 'NLP', c: 'var(--accent)' },
                  { t: 'Trust Engine', d: 'Reputation scoring', i: 'TRE', c: 'rgb(168 85 247)' },
                  { t: 'Graph Logic', d: 'Connection mapping', i: 'GRL', c: 'rgb(249 115 22)' },
                  { t: 'User Synergy', d: 'Optimized matching', i: 'SYN', c: 'rgb(59 130 246)' }
                ].map((node, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-all group/node">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0" style={{ backgroundColor: `${node.c}40`, border: `1px solid ${node.c}60` }}>
                      {node.i}
                    </div>
                    <div className="text-left overflow-hidden">
                      <h5 className="text-[11px] font-bold text-white truncate">{node.t}</h5>
                      <p className="text-[9px] text-gray-500 font-medium truncate">{node.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-black uppercase tracking-widest w-fit">
            The Ecosystem
          </div>
          <h2 className="text-5xl lg:text-7xl font-black text-[var(--text-primary)] leading-[0.9] tracking-tighter">
            Intelligence <br/>
            <span className="opacity-40">without limits.</span>
          </h2>
          <p className="text-xl text-[var(--text-secondary)] font-medium leading-relaxed">
            Helplystack isn't just a platform; it's a living, breathing network that learns from every interaction. 
            Our AI doesn't just categorize—it connects human potential.
          </p>
          
          <div className="space-y-4">
            {[
              { t: 'AI Intelligence', d: 'Auto-categorization & urgency detection.', c: 'var(--accent)' },
              { t: 'Trust Graph', d: 'Verified contribution & social proof.', c: 'rgb(168 85 247)' },
              { t: 'Solved Requests', d: 'Real impact tracked in real-time.', c: 'rgb(249 115 22)' }
            ].map((f, i) => (
              <div key={i} className="group p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--accent)]/50 transition-all flex items-center gap-6">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110" style={{ backgroundColor: `${f.c}15`, color: f.c }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                 </div>
                 <div>
                    <h4 className="font-black text-[var(--text-primary)]">{f.t}</h4>
                    <p className="text-sm text-[var(--text-secondary)] font-medium opacity-70">{f.d}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Flow Section */}
      <div className="mt-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#129780] font-bold text-xs uppercase tracking-wider mb-2">CORE FLOW</p>
            <h3 className="text-3xl font-bold text-[var(--text-primary)]">From struggling alone to solving together</h3>
          </div>
          <Link to="/explore">
            <Button variant="secondary" className="rounded-full shadow-sm border-none bg-[var(--bg-card)] text-[var(--text-primary)]">Try onboarding AI</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm rounded-[24px] p-8 bg-[var(--bg-card)] group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </div>
            <h4 className="font-bold text-xl mb-3 text-[var(--text-primary)]">Ask for help clearly</h4>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed opacity-80">
              Create structured requests with category, urgency, AI suggestions, and tags that attract the right people.
            </p>
          </Card>
          <Card className="border-none shadow-sm rounded-[24px] p-8 bg-[var(--bg-card)] group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <h4 className="font-bold text-xl mb-3 text-[var(--text-primary)]">Discover the right people</h4>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed opacity-80">
              Use the explore feed, helper lists, notifications, and messaging to move quickly once a match happens.
            </p>
          </Card>
          <Card className="border-none shadow-sm rounded-[24px] p-8 bg-[var(--bg-card)] group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h4 className="font-bold text-xl mb-3 text-[var(--text-primary)]">Track real contribution</h4>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed opacity-80">
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
            <h3 className="text-3xl font-bold text-[var(--text-primary)]">Community problems currently in motion</h3>
          </div>
          <Link to="/explore">
            <Button variant="secondary" className="rounded-full shadow-sm border-none bg-[var(--bg-card)] text-[var(--text-primary)]">View full feed</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-1 md:col-span-3 text-center py-12 text-gray-500 font-medium">Loading live community requests...</div>
          ) : featuredRequests.length > 0 ? (
            featuredRequests.map((post) => (
              <Card key={post.id} className="border-none shadow-lg rounded-[24px] p-6 flex flex-col bg-[var(--bg-card)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="border-none text-[var(--accent)] bg-[var(--accent)]/10 font-bold px-3 py-1 text-[10px] uppercase">{post.category || 'General'}</Badge>
                  <Badge variant="destructive" className="bg-[var(--badge-red-bg)] text-[var(--badge-red-text)] border-none font-bold px-3 py-1 text-[10px] uppercase">{post.urgency || 'Normal'}</Badge>
                </div>
                <h4 className="font-black text-lg leading-tight mb-3 line-clamp-2 text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{post.title}</h4>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 flex-1 line-clamp-3 opacity-80">
                  {post.description}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline" className="bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] font-medium text-[9px]">{tag}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-black text-xs">
                      {post.authorName?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[var(--text-primary)]">{post.authorName || 'Anonymous'}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] opacity-60">{post.authorLocation || 'Unknown'}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate(`/request/${post.id}`)}
                    className="rounded-xl px-4 py-2 h-auto text-[var(--accent)] hover:bg-[var(--accent)]/5 font-black text-[10px] uppercase tracking-wider"
                  >
                    View details
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
