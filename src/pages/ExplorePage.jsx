import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export function ExplorePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [urgencyFilter, setUrgencyFilter] = useState('All urgency levels');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = [];
      snapshot.forEach(doc => {
        fetchedPosts.push({ id: doc.id, ...doc.data() });
      });
      setPosts(fetchedPosts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredPosts = posts.filter(post => {
    // Category match
    if (categoryFilter !== 'All categories' && post.category !== categoryFilter) return false;
    // Urgency match
    if (urgencyFilter !== 'All urgency levels' && post.urgency !== urgencyFilter) return false;
    // Location match
    if (locationFilter) {
      const pLoc = post.authorLocation?.toLowerCase() || '';
      if (!pLoc.includes(locationFilter.toLowerCase())) return false;
    }
    // Skills match
    if (skillsFilter) {
      const searchSkills = skillsFilter.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
      const postTags = (post.tags || []).map(t => t.toLowerCase());
      if (searchSkills.length > 0) {
        const hasMatch = searchSkills.some(skill => postTags.some(tag => tag.includes(skill)));
        if (!hasMatch) return false;
      }
    }
    return true;
  });

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
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] appearance-none"
              >
                <option>All categories</option>
                <option>Web Development</option>
                <option>Design</option>
                <option>Career</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency</label>
              <select 
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] appearance-none"
              >
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
                value={skillsFilter}
                onChange={(e) => setSkillsFilter(e.target.value)}
                placeholder="React, Figma, Git/GitHub" 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input 
                type="text" 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Karachi, Lahore, Remote" 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
              />
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4 border-gray-200 shadow-sm bg-white font-semibold"
              onClick={() => {
                setCategoryFilter('All categories');
                setUrgencyFilter('All urgency levels');
                setSkillsFilter('');
                setLocationFilter('');
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>

        {/* Feed List */}
        <div className="flex flex-col gap-4">
          {loading ? (
             <div className="py-12 text-center text-gray-500 font-medium">Loading community requests...</div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <Card key={post.id} className="bg-white border-none shadow-sm rounded-[24px] p-6 lg:p-8 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="border-gray-200 text-[#129780] bg-[#f0f9f8]">{post.category || 'General'}</Badge>
                  <Badge variant="destructive" className="bg-[#fef2f2] text-[#ef4444] border-none">{post.urgency || 'Normal'}</Badge>
                  <Badge variant="outline" className={`border-none ${post.status?.toLowerCase() === 'solved' ? 'bg-green-500/20 text-green-400' : 'border-gray-200 text-[#129780] bg-[#f0f9f8]'}`}>
                    {post.status || 'Open'}
                  </Badge>
                </div>
                <h4 className="font-bold text-xl leading-snug mb-3">{post.title}</h4>
                <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
                  {post.description}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {post.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="bg-[#f6f8f9] border-none text-gray-600">{tag}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm text-[#2b3231]">{post.authorName || 'Anonymous'}</p>
                        {post.authorVerified && (
                          <div className="text-[#129780] bg-[#129780]/10 p-0.5 rounded-full cursor-help group relative">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                              Verified Expert in {post.authorVerifiedSkill}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{post.authorLocation || 'Unknown'} • {post.helpers?.length || 0} helpers interested</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/request/${post.id}`)}
                    className="rounded-full border-gray-200 shadow-sm bg-white font-semibold px-6 py-2"
                  >
                    Open details
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="bg-white border-none shadow-sm rounded-[24px] p-12 text-center">
              <p className="text-gray-500">No requests found matching your filters.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
