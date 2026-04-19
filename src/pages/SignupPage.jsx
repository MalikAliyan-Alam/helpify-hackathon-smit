import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] pb-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#129780] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            H
          </div>
          <h1 className="text-3xl font-bold text-[#2b3231] tracking-tight mb-2">Join the platform</h1>
          <p className="text-gray-500">Create an account to start asking and helping.</p>
        </div>

        <Card className="bg-white border-none shadow-sm rounded-[24px] p-8">
          {error && <div className="bg-[#fce8e6] text-[#d93025] p-3 rounded-lg text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                placeholder="Ayesha Khan"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                placeholder="hello@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#129780]"
                placeholder="••••••••"
                minLength="6"
              />
            </div>
            <Button disabled={loading} className="w-full rounded-full font-semibold py-3 text-base mt-2" type="submit">
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-[#129780] font-bold hover:underline">Log in</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
