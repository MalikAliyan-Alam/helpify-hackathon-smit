import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export function AICenterPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [mentorCount, setMentorCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch posts
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const fetchedPosts = [];
      snapshot.forEach((doc) => {
        fetchedPosts.push({ id: doc.id, ...doc.data() });
      });
      setPosts(fetchedPosts);
      setLoading(false);
    });

    // Fetch users for mentor pool
    const usersQ = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
      let trusted = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.trustScore && data.trustScore >= 90) {
          trusted++;
        } else if (!data.trustScore) {
          trusted++; // Default trust score is 100, so we count them
        }
      });
      setMentorCount(trusted);
    });

    return () => {
      unsubscribePosts();
      unsubscribeUsers();
    };
  }, []);

  // Calculate Metrics
  const openPosts = posts.filter(p => p.status !== 'Solved');
  
  const categoryCounts = openPosts.reduce((acc, p) => {
    if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  let mostRequestedCategory = 'General';
  let maxCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostRequestedCategory = cat;
    }
  }

  const highUrgencyCount = openPosts.filter(p => p.urgency === 'High').length;

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
        <Card className="bg-[var(--bg-card)] border-none shadow-sm rounded-[24px] p-8 flex flex-col justify-between">
          <div>
            <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-4">TREND PULSE</p>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] leading-tight mb-6">
              {mostRequestedCategory.split(' ').map((word, i) => (
                <React.Fragment key={i}>
                  {word}<br/>
                </React.Fragment>
              ))}
            </h3>
          </div>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Most common support area based on active community requests.
          </p>
        </Card>

        {/* Metric 2 */}
        <Card className="bg-[var(--bg-card)] border-none shadow-sm rounded-[24px] p-8 flex flex-col justify-between">
          <div>
            <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-4">URGENCY WATCH</p>
            <h3 className="text-4xl font-bold text-[var(--text-primary)] mb-6">{highUrgencyCount}</h3>
          </div>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Requests currently flagged high priority by the urgency detector.
          </p>
        </Card>

        {/* Metric 3 */}
        <Card className="bg-[var(--bg-card)] border-none shadow-sm rounded-[24px] p-8 flex flex-col justify-between">
          <div>
            <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-4">MENTOR POOL</p>
            <h3 className="text-4xl font-bold text-[var(--text-primary)] mb-6">{mentorCount}</h3>
          </div>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Trusted helpers with strong response history and contribution signals.
          </p>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="bg-[var(--bg-card)] border-none shadow-sm rounded-[24px] p-8 lg:p-10 mt-2">
        <p className="text-[var(--accent)] font-bold text-[10px] uppercase tracking-wider mb-2">AI RECOMMENDATIONS</p>
        <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Requests needing attention</h3>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-[var(--text-secondary)] font-medium">Analyzing community feed...</div>
          ) : openPosts.length > 0 ? (
            openPosts.map((post) => {
              const aiSummary = `AI signals indicate this is a ${post.category || 'General'} request with ${post.urgency?.toLowerCase() || 'normal'} urgency. Best suited for members with ${post.tags?.[0]?.toLowerCase() || 'relevant'} expertise to resolve quickly.`;
              return (
                <div 
                  key={post.id} 
                  onClick={() => navigate(`/request/${post.id}`)}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6 lg:p-8 cursor-pointer hover:border-[var(--accent)]/30 transition-colors"
                >
                  <h4 className="font-bold text-[17px] leading-snug mb-3 text-[var(--text-primary)]">{post.title}</h4>
                  <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed mb-6 max-w-4xl">
                    {aiSummary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-none text-[var(--accent)] bg-[var(--accent)]/10">{post.category || 'General'}</Badge>
                    <Badge variant="outline" className={`border-none ${post.urgency === 'High' ? 'bg-[var(--badge-red-bg)] text-[var(--badge-red-text)]' : 'border-[var(--border-color)] text-[var(--accent)] bg-[var(--accent)]/10'}`}>
                      {post.urgency || 'Normal'}
                    </Badge>
                  </div>
                </div>
              );
            })
          ) : (
             <div className="text-center py-12 text-gray-500 font-medium">No active requests needing attention right now.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
