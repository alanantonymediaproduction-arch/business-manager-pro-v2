'use client';

import { useState, useEffect } from 'react';
import { Banknote, Tag, Building2, Trophy, TrendingUp, MoreVertical, Plus, Hourglass, ReceiptText, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardData {
  todayEarnings: number;
  todayCommissions: number;
  totalEarnings: number;
  totalCommissions: number;
  todayExpenses: number;
  pendingPayments: number;
  companyShare: number;
  netProfit: number;
  chartData: { name: string; value: number }[];
}

export default function DeepaDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState('earning');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard?linked_staff_name=Deepa')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amount: parseFloat(amount), description, linked_staff_name: 'Deepa' })
      });
      
      if (response.ok) {
        const amt = parseFloat(amount);
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            todayEarnings: type === 'earning' ? prev.todayEarnings + amt : prev.todayEarnings,
            totalEarnings: type === 'earning' ? prev.totalEarnings + amt : prev.totalEarnings,
            todayExpenses: type === 'expense' ? prev.todayExpenses + amt : prev.todayExpenses,
            netProfit: type === 'earning' ? prev.netProfit + amt : prev.netProfit - amt
          };
        });
        setIsModalOpen(false);
        setAmount(''); setDescription('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !data) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Deepa Dashboard specific simple header */}
      <header className="p-5 px-8 border-b border-white/10 bg-[#1c1c1c] flex justify-between items-center">
        <span className="text-xl font-bold text-red-500">DEEPA DASHBOARD</span>
        <span className="text-sm text-gray-400">Private View</span>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-1">Your Overview</h1>
          <p className="text-gray-400 text-sm">Financial metrics directly linked to your profile.</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-sm font-medium">Your Earnings Today</span>
              <Banknote size={16} className="text-gray-400" />
            </div>
            <div className="text-3xl font-semibold mb-2">${data.todayEarnings.toLocaleString()}</div>
          </div>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-sm font-medium">Your Commissions</span>
              <Tag size={16} className="text-gray-400" />
            </div>
            <div className="text-3xl font-semibold mb-2">${data.todayCommissions.toLocaleString()}</div>
          </div>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-sm font-medium">Total Generated</span>
              <Building2 size={16} className="text-gray-400" />
            </div>
            <div className="text-3xl font-semibold mb-2">${(data.totalEarnings / 1000).toFixed(1)}K</div>
            <div className="text-xs flex items-center gap-1 text-gray-500">🗓 Lifetime</div>
          </div>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-sm font-medium">Company Share</span>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <div className="text-3xl font-semibold mb-2">${data.companyShare.toLocaleString()}</div>
          </div>
        </div>
      </main>

      <button className="fixed bottom-8 right-8 w-14 h-14 bg-red-600 text-white rounded-full flex justify-center items-center shadow-[0_4px_12px_rgba(229,57,53,0.4)] hover:bg-red-700 transition-all z-40" onClick={() => setIsModalOpen(true)}>
        <Plus size={24} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Log New Activity</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Type</label>
                <select className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={type} onChange={e => setType(e.target.value)}>
                  <option value="earning">Earning</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Amount ($)</label>
                <input required type="number" step="0.01" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Description</label>
                <input required type="text" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-medium transition-colors mt-4" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Activity'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
