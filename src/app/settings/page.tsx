'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Settings, Save } from 'lucide-react';

export default function SettingsPage() {
  const [customName, setCustomName] = useState('Deepa');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data?.custom_persona_name) {
          setCustomName(data.custom_persona_name);
        }
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
        body: JSON.stringify({ custom_persona_name: customName })
      });

      if (res.ok) {
        setMessage('Settings saved successfully! Refreshing dashboard...');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (error) {
      setMessage('Error connecting to server.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings size={28} className="text-gray-400" />
          <h1 className="text-3xl font-semibold">Platform Settings</h1>
        </div>

        <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-2">Dynamic Persona Configuration</h2>
          <p className="text-gray-400 text-sm mb-6">
            Customize the name of your secondary isolated financial dashboard. Financial records assigned to this persona are calculated separately.
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Persona Name (e.g. Deepa, Sneha)</label>
              <input 
                type="text" 
                required
                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
              />
            </div>
            
            {message && (
              <div className={`p-3 rounded text-sm ${message.includes('success') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save size={18} /> {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
