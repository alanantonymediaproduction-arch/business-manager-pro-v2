'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Plus, X, Pencil, Trash2, UserCircle2, Banknote, TrendingUp } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  nationality: string | null;
  role: string;
  created_at: string;
  totalCommission?: number;
  todayCommission?: number;
  totalEarnings?: number;
  todayEarnings?: number;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', nationality: '', role: '' });

  const fetchStaff = () => {
    setLoading(true);
    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStaff(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openModal = (s?: Staff) => {
    if (s && s.id !== 'special-persona') {
      setEditingId(s.id);
      setFormData({ name: s.name, nationality: s.nationality || '', role: s.role });
    } else {
      setEditingId(null);
      setFormData({ name: '', nationality: '', role: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = '/api/staff';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        setIsModalOpen(false);
        fetchStaff();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      const response = await fetch(`/api/staff?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setStaff(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Calculate team totals
  const teamTotalCommission = staff.reduce((sum, s) => sum + (s.totalCommission || 0), 0);
  const teamTodayCommission = staff.reduce((sum, s) => sum + (s.todayCommission || 0), 0);
  const teamTotalEarnings = staff.reduce((sum, s) => sum + (s.totalEarnings || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Staff Profiles</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your team and track their performance.</p>
          </div>
          <button onClick={() => openModal()} className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium">
            <Plus size={18} /> Create Staff Profile
          </button>
        </div>

        {/* Team Summary KPIs */}
        {staff.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm font-medium">Team Total Earnings</span>
                <Banknote size={16} className="text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-500">{teamTotalEarnings.toLocaleString()} AED</div>
            </div>
            <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm font-medium">Team Total Commission</span>
                <TrendingUp size={16} className="text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">{teamTotalCommission.toLocaleString()} AED</div>
            </div>
            <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm font-medium">Today&apos;s Commissions</span>
                <TrendingUp size={16} className="text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-400">{teamTodayCommission.toLocaleString()} AED</div>
            </div>
          </div>
        )}

        {/* Staff Cards */}
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading staff...</div>
        ) : staff.length === 0 ? (
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-12 text-center">
            <UserCircle2 size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Staff Profiles Yet</h3>
            <p className="text-gray-500 text-sm mb-6">Create your first staff profile to get started.</p>
            <button onClick={() => openModal()} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-colors font-medium">
              <Plus size={16} className="inline mr-2" /> Add First Staff
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map(s => (
              <div key={s.id} className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors group">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${s.id === 'special-persona' ? 'bg-red-600/20 text-red-400' : 'bg-white/10 text-white'}`}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{s.name}</h3>
                      <p className="text-sm text-gray-400">{s.role}</p>
                    </div>
                  </div>
                  
                  {s.id !== 'special-persona' && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(s)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Financial Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-black/30 rounded-xl p-3">
                    <span className="text-xs text-gray-500 block mb-1">Total Earned</span>
                    <span className="text-lg font-bold text-green-500">{(s.totalEarnings || 0).toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-1">AED</span>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3">
                    <span className="text-xs text-gray-500 block mb-1">Total Commission</span>
                    <span className="text-lg font-bold text-blue-400">{(s.totalCommission || 0).toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-1">AED</span>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3">
                    <span className="text-xs text-gray-500 block mb-1">Today Earned</span>
                    <span className="text-lg font-bold text-green-400">{(s.todayEarnings || 0).toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-1">AED</span>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3">
                    <span className="text-xs text-gray-500 block mb-1">Today Commission</span>
                    <span className="text-lg font-bold text-yellow-400">{(s.todayCommission || 0).toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-1">AED</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5">
                  <span className="text-gray-500">
                    {s.nationality || 'No nationality'}
                  </span>
                  {s.id === 'special-persona' ? (
                    <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full">Persona</span>
                  ) : (
                    <span className="text-xs text-gray-500">
                      Joined {new Date(s.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit Staff Profile' : 'Create Staff Profile'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Full Name</label>
                <input required type="text" placeholder="e.g. Ahmed Khan" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Role / Position</label>
                <select className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="">Select Role...</option>
                  <option value="Manager">Manager</option>
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                  <option value="Driver">Driver</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Nationality</label>
                <input type="text" placeholder="e.g. Indian, Filipino" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl font-medium transition-colors mt-4" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (editingId ? 'Update Staff Profile' : 'Create Staff Profile')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
