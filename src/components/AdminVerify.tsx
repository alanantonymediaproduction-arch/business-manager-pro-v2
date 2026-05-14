'use client';

import { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface AdminVerifyProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  actionLabel?: string;
}

export default function AdminVerify({ isOpen, onClose, onVerified, actionLabel = 'this action' }: AdminVerifyProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/profile');
      const profile = await res.json();
      const storedPin = profile?.admin_pin || '1234';
      
      if (pin === storedPin) {
        setPin('');
        onVerified();
      } else {
        setError('Wrong PIN. Access denied.');
      }
    } catch {
      setError('Failed to verify. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[60] p-4" onClick={onClose}>
      <div className="bg-[#1c1c1c] border border-red-500/30 rounded-2xl w-full max-w-sm shadow-2xl shadow-red-500/10" onClick={e => e.stopPropagation()}>
        <div className="p-5 text-center border-b border-white/10">
          <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldAlert size={28} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-white">Admin Verification</h2>
          <p className="text-xs text-gray-400 mt-1">Enter your 4-digit PIN to {actionLabel}</p>
        </div>
        
        <div className="p-5 space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="• • • •"
              className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-red-500 transition-colors"
              value={pin}
              onChange={e => { setPin(e.target.value.replace(/[^0-9]/g, '')); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter' && pin.length === 4) handleVerify(); }}
              autoFocus
            />
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 p-3 rounded-xl transition-colors text-sm">
              Cancel
            </button>
            <button 
              onClick={handleVerify} 
              disabled={pin.length !== 4 || loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Checking...' : 'Verify'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
