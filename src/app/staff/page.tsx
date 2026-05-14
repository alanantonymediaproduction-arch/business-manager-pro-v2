'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Plus, X } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  nationality: string | null;
  role: string;
  created_at: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', nationality: '', role: '' });

  useEffect(() => {
    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStaff(data);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const newStaff = await response.json();
        setStaff(prev => [newStaff, ...prev]);
        setIsModalOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold">Staff Profiles</h1>
          <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Plus size={16} /> Add Staff
          </button>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading staff...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Nationality</th>
                  <th className="p-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{s.name}</td>
                    <td className="p-4 text-gray-400">{s.role}</td>
                    <td className="p-4 text-gray-400">{s.nationality || '-'}</td>
                    <td className="p-4 text-gray-400">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add New Staff</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Name</label>
                <input required type="text" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Role</label>
                <input required type="text" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" placeholder="e.g. Sales, Support" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Nationality</label>
                <input type="text" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-medium transition-colors mt-4" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Staff'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
