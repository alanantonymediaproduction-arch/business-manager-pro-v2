'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Search, MessageCircle, Bell, BellRing, Star, ChevronDown, Check, Clock, Zap } from 'lucide-react';

interface LifecycleItem {
  id: string; name: string; phone: string; channel: string;
  service_status: string; staff_name: string | null; notes: string | null;
  follow_up_agreed: boolean; last_contact_date: string | null;
  created_at: string; source_table: string; follow_up_due: boolean;
  amount: number; extra: Record<string, unknown>;
}

interface Counts { active: number; completed: number; deserve: number; followUp: number; }

type Tab = 'active' | 'completed' | 'deserve';

export default function LifecyclePage() {
  const [items, setItems] = useState<LifecycleItem[]>([]);
  const [counts, setCounts] = useState<Counts>({ active: 0, completed: 0, deserve: 0, followUp: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [highPriority, setHighPriority] = useState<Set<string>>(new Set());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    const p = new URLSearchParams();
    p.append('tab', activeTab);
    if (searchQuery) p.append('search', searchQuery);

    fetch(`/api/lifecycle?${p.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.items) setItems(d.items);
        if (d.counts) setCounts(d.counts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [activeTab, searchQuery]);

  const updateStatus = async (item: LifecycleItem, newStatus: string) => {
    setOpenDropdown(null);
    await fetch('/api/lifecycle', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, source_table: item.source_table, service_status: newStatus })
    });
    fetchData();
  };

  const markContacted = async (item: LifecycleItem) => {
    await fetch('/api/lifecycle', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, source_table: item.source_table, last_contact_date: new Date().toISOString() })
    });
    fetchData();
  };

  const toggleHighPriority = (id: string) => {
    setHighPriority(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const openWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const statusColors: Record<string, string> = {
    'Active': 'bg-white/10 text-gray-300',
    'Pending': 'bg-orange-500/20 text-orange-400',
    'In Progress': 'bg-cyan-500/20 text-cyan-400',
    'Scheduled': 'bg-blue-500/20 text-blue-400',
    'Completed': 'bg-green-500/20 text-green-400'
  };

  const tabConfig: { key: Tab; label: string; color: string; activeColor: string }[] = [
    { key: 'active', label: 'Active', color: 'text-gray-400 hover:text-white', activeColor: 'text-white bg-white/10' },
    { key: 'completed', label: 'Completed', color: 'text-green-400/60 hover:text-green-400', activeColor: 'text-white bg-green-600' },
    { key: 'deserve', label: 'Deserve', color: 'text-amber-400/60 hover:text-amber-400', activeColor: 'text-white bg-amber-600' }
  ];

  const tabCounts: Record<Tab, number> = { active: counts.active, completed: counts.completed, deserve: counts.deserve };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
              <Zap size={24} className="text-amber-400" /> Service Lifecycle
            </h1>
            <p className="text-gray-400 text-sm mt-1">Track services from active → completed → deserve</p>
          </div>
          {counts.followUp > 0 && (
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-xl animate-pulse">
              <BellRing size={16} className="text-orange-400" />
              <span className="text-sm text-orange-400 font-medium">{counts.followUp} follow-up{counts.followUp > 1 ? 's' : ''} due</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabConfig.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === t.key ? t.activeColor : t.color}`}>
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.key ? 'bg-white/20' : 'bg-white/5'}`}>
                {tabCounts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-3 mb-6">
          <div className="flex items-center bg-[#111] border border-white/10 rounded-xl px-4 py-3">
            <Search size={16} className="text-gray-400 mr-3 shrink-0" />
            <input type="text" placeholder="Search name or phone..." className="bg-transparent text-white w-full text-sm focus:outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-400 py-12 bg-[#1c1c1c] border border-white/10 rounded-2xl">
            <p>No records in this section.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={`${item.source_table}-${item.id}`} className={`bg-[#1c1c1c] border rounded-2xl p-4 transition-colors relative ${item.follow_up_due ? 'border-orange-500/40' : highPriority.has(item.id) ? 'border-amber-500/40' : 'border-white/10 hover:border-white/20'}`}>
                {/* Follow-up indicator */}
                {item.follow_up_due && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-bounce">
                    <Bell size={12} className="text-white" />
                  </div>
                )}

                {/* High priority star */}
                {highPriority.has(item.id) && (
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <Star size={12} className="text-white fill-white" />
                  </div>
                )}

                {/* Top Row */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <p className="text-xs text-gray-400">{item.phone}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openWhatsApp(item.phone)} className="p-1.5 bg-green-600/20 hover:bg-green-600/40 rounded-lg text-green-400 transition-colors">
                      <MessageCircle size={14} />
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.channel === 'Online' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {item.channel}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[item.service_status] || 'bg-white/10 text-gray-300'}`}>
                    {item.service_status}
                  </span>
                  {item.follow_up_agreed && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Follow-up ✓</span>}
                </div>

                {/* Notes */}
                {item.notes && (
                  <p className="text-xs text-gray-400 bg-black/20 rounded-lg p-2 mb-3 line-clamp-2">📝 {item.notes}</p>
                )}

                {/* Amount (online) */}
                {item.channel === 'Online' && item.amount > 0 && (
                  <div className="text-xs mb-3">
                    <span className="text-gray-500">Amount: </span>
                    <span className="font-bold text-purple-400">{item.amount.toLocaleString()} AED</span>
                  </div>
                )}

                {/* Footer with date + actions */}
                <div className="flex justify-between items-center border-t border-white/5 pt-2">
                  <span className="text-xs text-gray-500">📅 {new Date(item.created_at).toLocaleDateString()}</span>
                  <div className="flex gap-1">
                    {/* Status change dropdown */}
                    <div className="relative">
                      <button onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors text-xs flex items-center gap-1">
                        <ChevronDown size={12} /> Status
                      </button>
                      {openDropdown === item.id && (
                        <div className="absolute right-0 bottom-full mb-1 bg-[#2a2a2a] border border-white/10 rounded-xl p-1 min-w-[140px] shadow-xl z-10">
                          {['Active', 'Pending', 'In Progress', 'Scheduled', 'Completed'].map(s => (
                            <button key={s} onClick={() => updateStatus(item, s)} className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 ${item.service_status === s ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                              {item.service_status === s && <Check size={10} />} {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Follow-up actions */}
                    {item.follow_up_due && (
                      <>
                        <button onClick={() => markContacted(item)} className="p-1.5 bg-green-500/10 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors" title="Mark as contacted">
                          <Clock size={12} />
                        </button>
                        <button onClick={() => toggleHighPriority(item.id)} className={`p-1.5 rounded-lg transition-colors ${highPriority.has(item.id) ? 'bg-amber-500/30 text-amber-400' : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'}`} title="Toggle High Priority">
                          <Star size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
