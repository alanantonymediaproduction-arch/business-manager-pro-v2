'use client';

import { useState, useEffect } from 'react';
import { Search, Banknote, Tag, Building2, Trophy, TrendingUp, MoreVertical, Plus, Hourglass, ReceiptText, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Navigation from '@/components/Navigation';

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

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState('earning');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard')
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
        body: JSON.stringify({ type, amount: parseFloat(amount), description })
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

  if (loading || !data) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  if ('error' in data) {
    return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <div className="text-red-500 text-xl font-semibold">Error Loading Dashboard</div>
      <div className="text-gray-400">{(data as any).error}</div>
      <div className="text-sm text-gray-500 mt-4 max-w-md text-center">
        Make sure you have run the latest schema.sql in your Supabase SQL Editor.
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-1">Welcome back</h1>
            <p className="text-gray-400 text-sm">Here's your high-level overview for today.</p>
          </div>
          <div className="flex items-center bg-[#1c1c1c] border border-white/10 rounded-lg px-4 py-2 w-64">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Quick search..." className="bg-transparent border-none text-white w-full text-sm focus:outline-none" />
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-sm font-medium">Today Earnings</span>
              <Banknote size={16} className="text-gray-400" />
            </div>
            <div className="text-3xl font-semibold mb-2">{data.todayEarnings.toLocaleString()} AED</div>
            <div className="text-xs flex items-center gap-1 text-green-500">
              <TrendingUp size={12} /> <span>+14.5%</span>
            </div>
          </div>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-sm font-medium">Today Commissions</span>
              <Tag size={16} className="text-gray-400" />
            </div>
            <div className="text-3xl font-semibold mb-2">{data.todayCommissions.toLocaleString()} AED</div>
            <div className="text-xs flex items-center gap-1 text-green-500">
              <TrendingUp size={12} /> <span>+5.2%</span>
            </div>
          </div>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-sm font-medium">Total Earnings</span>
              <Building2 size={16} className="text-gray-400" />
            </div>
            <div className="text-3xl font-semibold mb-2">{(data.totalEarnings / 1000).toFixed(1)}K AED</div>
            <div className="text-xs flex items-center gap-1 text-gray-500">🗓 This Month</div>
          </div>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-sm font-medium">Total Commissions</span>
              <Trophy size={16} className="text-gray-400" />
            </div>
            <div className="text-3xl font-semibold mb-2">{(data.totalCommissions / 1000).toFixed(1)}K AED</div>
            <div className="text-xs flex items-center gap-1 text-gray-500">🗓 This Month</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-[#1c1c1c] border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-semibold">Daily Earnings Overview</span>
              <button className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === new Date().toLocaleDateString('en-US', { weekday: 'short' }) ? '#e53935' : '#404040'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-5 flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-sm font-bold text-blue-400">Company Share</span>
                <span className="text-2xl font-semibold">{data.companyShare.toLocaleString()} AED</span>
              </div>
              <div className="bg-white/10 w-10 h-10 rounded-lg flex justify-center items-center">
                <TrendingUp size={20} className="text-white" />
              </div>
            </div>
            <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-5 flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-sm">Today Expenses</span>
                <span className="text-2xl font-semibold">{data.todayExpenses.toLocaleString()} AED</span>
              </div>
              <div className="bg-white/10 w-10 h-10 rounded-lg flex justify-center items-center">
                <ReceiptText size={20} className="text-white" />
              </div>
            </div>
            <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-5 flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-sm">Pending Payments</span>
                <span className="text-2xl font-semibold">{data.pendingPayments}</span>
              </div>
              <div className="bg-white/10 w-10 h-10 rounded-lg flex justify-center items-center">
                <Hourglass size={20} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-red-600 text-white rounded-full flex justify-center items-center shadow-[0_4px_12px_rgba(229,57,53,0.4)] hover:bg-red-700 hover:scale-105 transition-all z-40" onClick={() => setIsModalOpen(true)}>
        <Plus size={24} />
      </button>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add Transaction</h2>
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
                <input required type="number" step="0.01" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Description</label>
                <input required type="text" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" placeholder="e.g. Client Payment" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-medium transition-colors mt-4" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
