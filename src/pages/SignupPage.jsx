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
      navigate('/onboarding');
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
      navigate('/onboarding');
    } catch (err) {
      console.error(err);
      toast.error('Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Background Decorative Blurs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--accent)] opacity-[0.07] blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 opacity-[0.05] blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center group">
            <div className="relative w-14 h-14 flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-[var(--accent)] opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity"></div>
              <div className="relative w-10 h-10 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <div className="absolute top-0 left-0 w-7 h-7 bg-gradient-to-tr from-[var(--accent)] to-[#2dd4bf] rounded-lg z-30 shadow-lg border border-white/20"></div>
                <div className="absolute top-2 left-2 w-7 h-7 bg-[var(--accent)] opacity-60 rounded-lg z-20"></div>
                <div className="absolute top-4 left-4 w-7 h-7 bg-[var(--accent)] opacity-30 rounded-lg z-10"></div>
              </div>
            </div>
            <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter mb-2">Join Helplystack</h1>
            <p className="text-[var(--text-secondary)] font-medium">Create an account to start your journey.</p>
          </Link>
        </div>

        <Card className="border border-[var(--glass-border)] shadow-2xl rounded-[32px] p-8 lg:p-10 bg-[var(--glass-bg)] backdrop-blur-2xl">
          <Button 
            variant="outline" 
            className="w-full rounded-2xl font-bold py-4 text-sm border-[var(--border-color)] shadow-sm bg-[var(--bg-card)] text-[var(--text-primary)] mb-8 flex items-center justify-center gap-3 hover:bg-[var(--bg-secondary)] transition-all" 
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
          
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-color)]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="px-4 bg-transparent text-[var(--text-secondary)]">Or secure sign up</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 px-1">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 transition-all font-medium"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 px-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 transition-all font-medium"
                placeholder="hello@helplystack.com"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 px-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 transition-all font-medium"
                placeholder="Create a strong password"
                minLength="6"
              />
            </div>
            <Button disabled={loading} className="w-full rounded-2xl font-black py-4 text-base mt-4 shadow-xl shadow-[var(--accent)]/20" type="submit">
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Already have an account? <Link to="/login" className="text-[var(--accent)] font-bold hover:underline ml-1">Log in</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
