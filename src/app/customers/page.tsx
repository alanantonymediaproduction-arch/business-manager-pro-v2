'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Plus, X } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  number: string;
  nationality: string | null;
  age: number | null;
  body_size: string | null;
  behavior: string | null;
  ethnicity_category: string | null;
  appointment_date_time: string | null;
  is_repeat: boolean;
  call_notification: string | null;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', number: '', nationality: '', age: '', body_size: '',
    behavior: '', ethnicity_category: 'Others', appointment_date_time: '',
    is_repeat: false, call_notification: 'OK'
  });

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const newCustomer = await response.json();
        setCustomers(prev => [newCustomer, ...prev]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Customers</h1>
          <button onClick={() => setIsModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus size={16} /> Add Customer
          </button>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading customers...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Number</th>
                  <th className="p-4 font-medium">Nationality</th>
                  <th className="p-4 font-medium">Ethnicity</th>
                  <th className="p-4 font-medium">Repeat</th>
                  <th className="p-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{c.name}</td>
                    <td className="p-4 text-gray-400">{c.number}</td>
                    <td className="p-4 text-gray-400">{c.nationality || '-'}</td>
                    <td className="p-4 text-gray-400">{c.ethnicity_category || '-'}</td>
                    <td className="p-4">
                      {c.is_repeat ? <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs">Yes</span> : <span className="bg-gray-500/10 text-gray-400 px-2 py-1 rounded-full text-xs">No</span>}
                    </td>
                    <td className="p-4 text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#1c1c1c] z-10">
              <h2 className="text-xl font-semibold">Add New Customer</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form className="p-6 grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Name</label>
                <input required type="text" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Number</label>
                <input required type="text" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Nationality</label>
                <input type="text" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Age</label>
                <input type="number" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Body Size</label>
                <input type="text" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.body_size} onChange={e => setFormData({...formData, body_size: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Behavior</label>
                <input type="text" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.behavior} onChange={e => setFormData({...formData, behavior: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Ethnicity Category</label>
                <select className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.ethnicity_category} onChange={e => setFormData({...formData, ethnicity_category: e.target.value})}>
                  <option value="Malayali">Malayali</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Call Notification</label>
                <select className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.call_notification} onChange={e => setFormData({...formData, call_notification: e.target.value})}>
                  <option value="OK">OK</option>
                  <option value="Not OK">Not OK</option>
                </select>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-sm text-gray-400">Appointment Date/Time</label>
                <input type="datetime-local" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.appointment_date_time} onChange={e => setFormData({...formData, appointment_date_time: e.target.value})} />
              </div>
              <div className="space-y-1 col-span-2 flex items-center gap-2">
                <input type="checkbox" className="w-5 h-5 accent-red-500 rounded border-white/10 bg-[#111]" checked={formData.is_repeat} onChange={e => setFormData({...formData, is_repeat: e.target.checked})} />
                <label className="text-sm text-gray-400">Repeat Customer</label>
              </div>
              
              <div className="col-span-2 mt-4">
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-medium transition-colors" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
