'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Settings, Save, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const [customName, setCustomName] = useState('Deepa');
  const [adminPin, setAdminPin] = useState('1234');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data?.custom_persona_name) setCustomName(data.custom_persona_name);
        if (data?.admin_pin) setAdminPin(data.admin_pin);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_persona_name: customName, admin_pin: adminPin })
      });

      if (res.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings.');
      }
    } catch {
      setMessage('Error connecting to server.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings size={24} className="text-gray-400" />
          <h1 className="text-2xl md:text-3xl font-semibold">Platform Settings</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Persona Config */}
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-semibold mb-1">Dynamic Persona</h2>
            <p className="text-gray-400 text-sm mb-4">Name for your secondary isolated financial dashboard.</p>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Persona Name</label>
              <input 
                type="text" required
                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
              />
            </div>
          </div>

          {/* Admin PIN */}
          <div className="bg-[#1c1c1c] border border-red-500/20 rounded-2xl p-5 md:p-6">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert size={18} className="text-red-500" />
              <h2 className="text-lg font-semibold">Admin Security PIN</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              This 4-digit PIN is required whenever someone tries to edit or delete records.
            </p>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">PIN Code</label>
              <input 
                type="text"
                inputMode="numeric"
                maxLength={4}
                required
                pattern="[0-9]{4}"
                className="w-full bg-[#111] border border-red-500/30 rounded-xl py-3 px-4 text-white text-xl tracking-[0.3em] font-mono focus:outline-none focus:border-red-500 transition-colors max-w-xs"
                value={adminPin}
                onChange={e => setAdminPin(e.target.value.replace(/[^0-9]/g, ''))}
              />
              <p className="text-xs text-gray-500 mt-2">Default PIN is 1234. Change it to something secure.</p>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm ${message.includes('success') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" disabled={isSaving}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save All Settings'}
          </button>
        </form>
      </main>
    </div>
  );
}
