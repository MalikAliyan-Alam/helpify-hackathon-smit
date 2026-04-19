import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function CreateRequestPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [urgency, setUrgency] = useState('High');
  const [loading, setLoading] = useState(false);
  
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !description) {
      toast.error('Please fill in both title and description.');
      return;
    }

    try {
      setLoading(true);
      const requestData = {
        title,
        description,
        tags: tags.split(',').map(tag => tag.trim()).filter(t => t),
        category,
        urgency,
        status: 'Open',
        userId: currentUser.uid,
        authorName: userData?.name || currentUser.displayName || currentUser.email || 'Anonymous',
        authorLocation: userData?.location || 'Unknown',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'posts'), requestData);
      
      toast.success('Request published successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to publish request.');
    } finally {
      setLoading(false);
    }
  }

  // Basic mock AI guidance updates based on inputs
  const aiCategory = title.toLowerCase().includes('design') ? 'Design' : 'Web Development';
  const aiUrgency = description.length > 50 ? 'Medium' : 'Low';
  const aiTags = title ? 'Looking good!' : 'Add more detail for smarter tags';

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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Need review on my JavaScript quiz app before submission" 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea 
                rows="6"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the challenge, your current progress, deadline, and what kind of help would be useful." 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                <input 
                  type="text" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="JavaScript, Debugging, Review" 
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] appearance-none"
                >
                  <option>Web Development</option>
                  <option>Design</option>
                  <option>Career</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency</label>
              <select 
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780] appearance-none max-w-xs"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button type="button" variant="outline" className="rounded-full bg-white border-gray-200 shadow-sm font-semibold px-6" onClick={() => {
                if(title) setCategory(aiCategory);
                if(description) setUrgency(aiUrgency);
                toast.success("AI Suggestions applied!");
              }}>Apply AI suggestions</Button>
              <Button type="submit" disabled={loading} className="rounded-full font-semibold px-6">
                {loading ? 'Publishing...' : 'Publish request'}
              </Button>
            </div>
          </form>
        </Card>

        {/* AI Assistant Sidebar */}
        <Card className="bg-white border-none shadow-sm rounded-[24px] p-8 sticky top-8">
          <p className="text-[#129780] font-bold text-[10px] uppercase tracking-wider mb-2">AI ASSISTANT</p>
          <h3 className="text-3xl font-bold text-[#2b3231] mb-8">Smart request guidance</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="text-sm text-gray-600">Suggested category</span>
              <span className="text-sm font-bold text-[#2b3231]">{title ? aiCategory : 'Community'}</span>
            </div>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="text-sm text-gray-600">Detected urgency</span>
              <span className="text-sm font-bold text-[#2b3231]">{description ? aiUrgency : 'Low'}</span>
            </div>

            <div className="flex items-start justify-between border-b border-gray-100 pb-4 gap-4">
              <span className="text-sm text-gray-600 whitespace-nowrap">Suggested tags</span>
              <span className="text-sm font-bold text-[#2b3231] text-right">{aiTags}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-gray-600 whitespace-nowrap">Rewrite suggestion</span>
              <span className="text-sm font-bold text-[#2b3231] text-right">
                {description.length > 20 ? 'Looks solid! Be sure to include what you already tried.' : 'Start describing the challenge to generate a stronger version.'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
