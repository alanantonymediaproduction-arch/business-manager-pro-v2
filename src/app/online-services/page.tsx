'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import AdminVerify from '@/components/AdminVerify';
import { Plus, X, Pencil, Trash2, Search, Filter, MessageCircle, Globe } from 'lucide-react';

interface OnlineService {
  id: string;
  customer_name: string;
  phone_number: string;
  amount: number;
  session_time: string | null;
  payment_method: string | null;
  service_type: string | null;
  service_status: string;
  notes: string | null;
  follow_up_agreed: boolean;
  last_contact_date: string | null;
  created_at: string;
}

export default function OnlineServicesPage() {
  const [services, setServices] = useState<OnlineService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterService, setFilterService] = useState('');

  const emptyForm = { customer_name: '', phone_number: '', amount: '', session_time: '', payment_method: '', service_type: '', service_status: 'Active', notes: '', follow_up_agreed: false };
  const [formData, setFormData] = useState(emptyForm);

  const fetchData = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (searchQuery) p.append('search', searchQuery);
    if (filterPayment) p.append('paymentMethod', filterPayment);
    if (filterService) p.append('serviceType', filterService);

    fetch(`/api/online-services?${p.toString()}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setServices(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(fetchData, 400);
    return () => clearTimeout(t);
  }, [searchQuery, filterPayment, filterService]);

  const openModal = (s?: OnlineService) => {
    if (s) {
      setEditingId(s.id);
      setFormData({
        customer_name: s.customer_name, phone_number: s.phone_number,
        amount: s.amount.toString(), session_time: s.session_time || '',
        payment_method: s.payment_method || '', service_type: s.service_type || '',
        service_status: s.service_status || 'Active', notes: s.notes || '',
        follow_up_agreed: s.follow_up_agreed || false
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...formData } : formData;
      const res = await fetch('/api/online-services', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { setIsModalOpen(false); fetchData(); }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  // Admin verification
  const [adminOpen, setAdminOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [adminLabel, setAdminLabel] = useState('');

  const requireAdmin = (label: string, action: () => void) => {
    setAdminLabel(label);
    setPendingAction(() => action);
    setAdminOpen(true);
  };

  const handleEdit = (s: OnlineService) => requireAdmin('edit this record', () => openModal(s));
  const handleDelete = (id: string) => requireAdmin('delete this record', async () => {
    const res = await fetch(`/api/online-services?id=${id}`, { method: 'DELETE' });
    if (res.ok) setServices(prev => prev.filter(s => s.id !== id));
  });

  const openWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const totalEarnings = services.reduce((s, r) => s + Number(r.amount), 0);
  const inputCls = "w-full bg-[#111] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors";
  const labelCls = "text-xs font-medium text-gray-400 mb-1 block";

  const paymentColor = (m: string | null) => {
    if (m === 'Cash') return 'bg-green-500/20 text-green-400';
    if (m === 'Bank Account') return 'bg-blue-500/20 text-blue-400';
    if (m === 'Google Pay') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-white/10 text-gray-400';
  };

  const serviceColor = (t: string | null) => {
    if (t === 'Video Call') return 'bg-purple-500/20 text-purple-400';
    if (t === 'Audio Call') return 'bg-cyan-500/20 text-cyan-400';
    if (t === 'Photos + Audio') return 'bg-pink-500/20 text-pink-400';
    if (t === 'Video Clips + Audio') return 'bg-orange-500/20 text-orange-400';
    return 'bg-white/10 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><Globe size={24} className="text-purple-400" /> Online Services</h1>
            <p className="text-gray-400 text-sm mt-1">Manage virtual service sessions separately.</p>
          </div>
          <button onClick={() => openModal()} className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors">
            <Plus size={16} /> New Session
          </button>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-4">
            <span className="text-xs text-gray-400">Total Sessions</span>
            <div className="text-2xl font-bold mt-1">{services.length}</div>
          </div>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-4">
            <span className="text-xs text-gray-400">Total Earnings</span>
            <div className="text-2xl font-bold text-purple-400 mt-1">₹{totalEarnings.toLocaleString()}</div>
          </div>
          <div className="hidden md:block bg-[#1c1c1c] border border-white/10 rounded-2xl p-4">
            <span className="text-xs text-gray-400">Avg per Session</span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">₹{services.length ? Math.round(totalEarnings / services.length).toLocaleString() : 0}</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-3 md:p-4 mb-6 space-y-3">
          <div className="flex items-center bg-[#111] border border-white/10 rounded-xl px-4 py-3">
            <Search size={16} className="text-gray-400 mr-3 shrink-0" />
            <input type="text" placeholder="Search name or phone..." className="bg-transparent text-white w-full text-sm focus:outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Filter size={14} className="text-gray-400 shrink-0" />
            <select className="bg-[#111] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white" value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
              <option value="">Payment</option><option value="Cash">Cash</option><option value="Bank Account">Bank</option><option value="Google Pay">Google Pay</option>
            </select>
            <select className="bg-[#111] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white" value={filterService} onChange={e => setFilterService(e.target.value)}>
              <option value="">Service</option><option value="Video Call">Video Call</option><option value="Audio Call">Audio Call</option>
              <option value="Photos + Audio">Photos + Audio</option><option value="Video Clips + Audio">Video Clips</option>
            </select>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : services.length === 0 ? (
          <div className="text-center text-gray-400 py-12 bg-[#1c1c1c] border border-white/10 rounded-2xl">
            <Globe size={40} className="mx-auto text-gray-600 mb-3" />
            <p>No online sessions yet. Create your first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(s => (
              <div key={s.id} className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-4 hover:border-purple-500/30 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{s.customer_name}</h3>
                    <p className="text-xs text-gray-400">{s.phone_number}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openWhatsApp(s.phone_number)} className="p-1.5 bg-green-600/20 hover:bg-green-600/40 rounded-lg text-green-400 transition-colors">
                      <MessageCircle size={14} />
                    </button>
                    <button onClick={() => handleEdit(s)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {s.service_type && <span className={`text-[10px] px-2 py-0.5 rounded-full ${serviceColor(s.service_type)}`}>{s.service_type}</span>}
                  {s.payment_method && <span className={`text-[10px] px-2 py-0.5 rounded-full ${paymentColor(s.payment_method)}`}>{s.payment_method}</span>}
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs text-gray-500">Amount</span>
                    <div className="text-lg font-bold text-purple-400">₹{Number(s.amount).toLocaleString()}</div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {s.session_time && <div>⏱ {s.session_time}</div>}
                    <div>📅 {new Date(s.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-end md:items-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-t-3xl md:rounded-2xl w-full md:max-w-lg max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 md:p-5 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Session' : 'New Online Session'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1"><X size={20} /></button>
            </div>
            <form className="p-4 md:p-5 overflow-y-auto flex-1 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className={labelCls}>Customer Name *</label><input required type="text" className={inputCls} value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} /></div>
                <div><label className={labelCls}>Phone Number *</label><input required type="text" className={inputCls} value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className={`${labelCls} text-purple-400`}>Amount (INR) *</label><input required type="number" step="0.01" className={`${inputCls} border-purple-500/30`} value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} /></div>
                <div><label className={labelCls}>Session Time</label><input type="text" placeholder="e.g. 30 min, 1 hour" className={inputCls} value={formData.session_time} onChange={e => setFormData({...formData, session_time: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className={labelCls}>Payment Method</label>
                  <select className={inputCls} value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
                    <option value="">Select...</option>
                    <option value="Cash">Cash</option><option value="Bank Account">Bank Account</option><option value="Google Pay">Google Pay</option>
                  </select>
                </div>
                <div><label className={labelCls}>Service Type</label>
                  <select className={inputCls} value={formData.service_type} onChange={e => setFormData({...formData, service_type: e.target.value})}>
                    <option value="">Select...</option>
                    <option value="Video Call">Video Call</option><option value="Audio Call">Audio Call</option>
                    <option value="Photos + Audio">Photos + Audio</option><option value="Video Clips + Audio">Video Clips + Audio</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className={labelCls}>Status</label>
                  <select className={inputCls} value={formData.service_status} onChange={e => setFormData({...formData, service_status: e.target.value})}>
                    <option value="Active">Active</option><option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option><option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div><label className={labelCls}>Notes</label>
                  <textarea className={`${inputCls} min-h-[60px] resize-none`} placeholder="Notes..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
              </div>
              <label className="flex items-center gap-3 bg-orange-500/10 p-3 rounded-xl border border-orange-500/20 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 accent-orange-500 rounded shrink-0" checked={formData.follow_up_agreed} onChange={e => setFormData({...formData, follow_up_agreed: e.target.checked})} />
                <div><span className="text-sm font-medium text-white">Follow-up Agreed</span><br/><span className="text-xs text-gray-500">30-day reminder</span></div>
              </label>
            </form>
            <div className="p-4 border-t border-white/10 shrink-0 bg-[#1c1c1c]">
              <button onClick={handleSubmit} className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3.5 rounded-xl font-medium transition-colors" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (editingId ? 'Update Session' : 'Save Session')}
              </button>
            </div>
          </div>
        </div>
      )}
      <AdminVerify
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onVerified={() => { setAdminOpen(false); if (pendingAction) pendingAction(); }}
        actionLabel={adminLabel}
      />
    </div>
  );
}
