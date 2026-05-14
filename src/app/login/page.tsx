'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Diamond, User, Lock, Eye, EyeOff, ArrowRight, Key, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      document.cookie = 'auth=true; path=/';
      setIsLoading(false);
      router.push('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-[#1c1c1c] border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />
        
        <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
          <Diamond size={24} className="text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-1">Business Manager Pro</h1>
        <p className="text-sm text-gray-400 mb-8">Executive Precision & Control</p>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-300">Email or Phone Number</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-500" />
              </div>
              <input 
                type="text" 
                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors" 
                placeholder="admin@sterling.com" 
                defaultValue="admin@sterling.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-300">Password or OTP</label>
              <span className="text-xs text-red-500 hover:text-red-400 cursor-pointer transition-colors">Forgot?</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors" 
                placeholder="••••••••" 
                defaultValue="password123"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-300 transition-colors">
                {showPassword ? (
                  <EyeOff size={18} onClick={() => setShowPassword(false)} />
                ) : (
                  <Eye size={18} onClick={() => setShowPassword(true)} />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" className="w-4 h-4 bg-[#111] border border-white/10 rounded accent-red-600" id="remember" />
            <label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer">Remember device</label>
          </div>

          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 mt-4" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Secure Login'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#1c1c1c] px-4 text-xs text-gray-500 uppercase tracking-wider">Enterprise SSO</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="bg-[#111] border border-white/10 hover:bg-white/5 text-gray-300 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
            <Key size={16} className="text-gray-400" /> Okta
          </button>
          <button type="button" className="bg-[#111] border border-white/10 hover:bg-white/5 text-gray-300 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
            <Shield size={16} className="text-gray-400" /> SAML
          </button>
        </div>

        <div className="mt-8 flex justify-center items-center gap-3 text-xs text-gray-600">
          <span className="hover:text-gray-400 cursor-pointer transition-colors">Privacy Policy</span>
          <span>·</span>
          <span className="hover:text-gray-400 cursor-pointer transition-colors">Support</span>
        </div>
      </div>
    </div>
  );
}
