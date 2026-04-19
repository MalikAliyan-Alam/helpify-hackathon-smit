import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await signup(email, password, name);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else {
        toast.error('Failed to create an account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast.success('Successfully signed in with Google!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to sign in with Google.');
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
          <Button 
            variant="outline" 
            className="w-full rounded-full font-semibold py-3 text-base border-gray-200 shadow-sm bg-white text-gray-700 mb-6 flex items-center justify-center gap-3" 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

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
