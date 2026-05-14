'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  number: string;
  total_paid_amount: number;
  amount_paid_to_staff: number;
  staff_name: string | null;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', number: '', total_paid_amount: '', amount_paid_to_staff: '', staff_name: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
        setLoading(false);
      });
  };

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        name: customer.name,
        number: customer.number,
        total_paid_amount: customer.total_paid_amount?.toString() || '0',
        amount_paid_to_staff: customer.amount_paid_to_staff?.toString() || '0',
        staff_name: customer.staff_name || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', number: '', total_paid_amount: '', amount_paid_to_staff: '', staff_name: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = '/api/customers';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        setIsModalOpen(false);
        fetchCustomers();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      const response = await fetch(`/api/customers?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCustomers(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Financial Customers</h1>
          <button onClick={() => openModal()} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus size={16} /> Add Entry
          </button>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading records...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="p-4 font-medium">Customer Name</th>
                  <th className="p-4 font-medium">Number</th>
                  <th className="p-4 font-medium">Staff Assigned</th>
                  <th className="p-4 font-medium">Total Paid</th>
                  <th className="p-4 font-medium">Paid to Staff</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-medium">{c.name}</td>
                    <td className="p-4 text-gray-400">{c.number}</td>
                    <td className="p-4 text-gray-400">{c.staff_name || '-'}</td>
                    <td className="p-4 font-semibold text-green-500">${Number(c.total_paid_amount || 0).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-red-500">${Number(c.amount_paid_to_staff || 0).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(c)} className="p-2 bg-white/5 hover:bg-white/10 rounded text-gray-300">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">No customer financial records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit Financial Entry' : 'New Financial Entry'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Customer Name</label>
                <input required type="text" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Customer Number</label>
                <input required type="text" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Staff Assigned To</label>
                <input type="text" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" placeholder="e.g., Deepa" value={formData.staff_name} onChange={e => setFormData({...formData, staff_name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400 font-bold text-green-500">TOTAL PAID AMOUNT ($)</label>
                <input required type="number" step="0.01" className="w-full bg-[#111] border border-green-500/30 rounded-lg p-3 text-white focus:outline-none focus:border-green-500" value={formData.total_paid_amount} onChange={e => setFormData({...formData, total_paid_amount: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400 font-bold text-red-500">Amount Paid to Staff ($)</label>
                <input required type="number" step="0.01" className="w-full bg-[#111] border border-red-500/30 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.amount_paid_to_staff} onChange={e => setFormData({...formData, amount_paid_to_staff: e.target.value})} />
              </div>
              
              <div className="pt-2">
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-medium transition-colors" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
