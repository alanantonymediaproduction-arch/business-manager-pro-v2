'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ReportsPage() {
  const [data, setData] = useState<{name: string, value: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(json => {
        setData(json.chartData || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Detailed Reports</h1>
        </div>

        <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">Weekly Earnings Analysis</h2>
          {loading ? (
            <div className="text-center text-gray-400">Loading report data...</div>
          ) : (
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 12 }} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === new Date().toLocaleDateString('en-US', { weekday: 'short' }) ? '#e53935' : '#404040'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
