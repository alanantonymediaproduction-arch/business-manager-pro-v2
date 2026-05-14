'use client';

import { useState } from 'react';
import { Diamond, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (isLoginMode) {
      // Login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
        setIsLoading(false);
      } else {
        window.location.href = '/';
      }
    } else {
      // Sign Up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else if (data.user?.identities?.length === 0) {
        setMessage({ type: 'error', text: 'An account with this email already exists.' });
      } else {
        setMessage({ type: 'success', text: 'Success! If email confirmations are enabled, check your inbox. Otherwise, you can now sign in.' });
        setIsLoginMode(true);
        setPassword('');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-[#1c1c1c] border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />
        
        <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
          <Diamond size={24} className="text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-1">BackupPlanPro</h1>
        <p className="text-sm text-gray-400 mb-8">Executive Precision & Control</p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-500" />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="admin@backupplan.pro"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {message.text && (
            <div className={`p-3 rounded-xl text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-white text-black hover:bg-gray-200 rounded-xl py-3 mt-4 font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create Account')}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-6 flex justify-center items-center text-sm text-gray-400">
          <span>{isLoginMode ? "Don't have an account?" : "Already have an account?"}</span>
          <button 
            type="button" 
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setMessage({ type: '', text: '' });
            }}
            className="ml-2 text-white font-medium hover:text-red-400 transition-colors"
          >
            {isLoginMode ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
