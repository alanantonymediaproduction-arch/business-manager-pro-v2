'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import AdminVerify from '@/components/AdminVerify';
import { Plus, X, Pencil, Trash2, Search, Filter, MessageCircle, ArrowUpDown, Download } from 'lucide-react';

interface Staff { id: string; name: string; }

interface Customer {
  id: string;
  name: string;
  number: string;
  nationality: string | null;
  age: number | null;
  room_number: string | null;
  body_size: string | null;
  behavior: string | null;
  meeting_duration: string | null;
  appointment_date_time: string | null;
  is_repeat: boolean;
  is_mallu: boolean;
  repeat_count: number;
  total_paid_amount: number;
  amount_paid_to_staff: number;
  staff_name: string | null;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMallu, setFilterMallu] = useState('');
  const [filterRepeat, setFilterRepeat] = useState('');
  const [filterBehavior, setFilterBehavior] = useState('');
  const [filterSpending, setFilterSpending] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const emptyForm = {
    name: '', number: '', nationality: '', age: '', room_number: '',
    body_size: '', behavior: '', meeting_duration: '',
    appointment_date_time: '', is_repeat: false, is_mallu: false,
    repeat_count: '0', total_paid_amount: '', amount_paid_to_staff: '', staff_name: ''
  };
  const [formData, setFormData] = useState(emptyForm);

  const fetchCustomers = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (searchQuery) p.append('search', searchQuery);
    if (filterMallu) p.append('isMallu', filterMallu);
    if (filterRepeat) p.append('isRepeat', filterRepeat);
    if (filterBehavior) p.append('behavior', filterBehavior);
    if (filterSpending) p.append('spending', filterSpending);
    p.append('sort', sortBy);

    fetch(`/api/customers?${p.toString()}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setCustomers(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/staff').then(r => r.json()).then(d => { if (Array.isArray(d)) setStaffList(d); });
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 400);
    return () => clearTimeout(t);
  }, [searchQuery, filterMallu, filterRepeat, filterBehavior, filterSpending, sortBy]);

  const openModal = (c?: Customer) => {
    if (c) {
      setEditingId(c.id);
      setFormData({
        name: c.name, number: c.number, nationality: c.nationality || '',
        age: c.age?.toString() || '', room_number: c.room_number || '',
        body_size: c.body_size || '', behavior: c.behavior || '',
        meeting_duration: c.meeting_duration || '',
        appointment_date_time: c.appointment_date_time ? new Date(c.appointment_date_time).toISOString().slice(0, 16) : '',
        is_repeat: c.is_repeat, is_mallu: c.is_mallu,
        repeat_count: c.repeat_count?.toString() || '0',
        total_paid_amount: c.total_paid_amount?.toString() || '0',
        amount_paid_to_staff: c.amount_paid_to_staff?.toString() || '0',
        staff_name: c.staff_name || ''
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
      const res = await fetch('/api/customers', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { setIsModalOpen(false); fetchCustomers(); }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };
  // Admin verification state
  const [adminOpen, setAdminOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [adminLabel, setAdminLabel] = useState('');

  const requireAdmin = (label: string, action: () => void) => {
    setAdminLabel(label);
    setPendingAction(() => action);
    setAdminOpen(true);
  };

  const handleEdit = (c: Customer) => {
    requireAdmin('edit this record', () => openModal(c));
  };

  const handleDelete = (id: string) => {
    requireAdmin('delete this record', async () => {
      const res = await fetch(`/api/customers?id=${id}`, { method: 'DELETE' });
      if (res.ok) setCustomers(prev => prev.filter(c => c.id !== id));
    });
  };

  const openWhatsApp = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${clean}`, '_blank');
  };

  const exportCSV = () => {
    const h = ['Name','Number','Nationality','Room','Amount','Commission','Behavior','Duration','Repeat','Mallu','Date'];
    const csv = [h.join(','), ...customers.map(c => [
      `"${c.name}"`,`"${c.number}"`,`"${c.nationality||''}"`,`"${c.room_number||''}"`,
      c.total_paid_amount||0, c.amount_paid_to_staff||0,`"${c.behavior||''}"`,`"${c.meeting_duration||''}"`,
      c.is_repeat?'Yes':'No', c.is_mallu?'Yes':'No', new Date(c.created_at).toLocaleDateString()
    ].join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const inputCls = "w-full bg-[#111] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors";
  const labelCls = "text-xs font-medium text-gray-400 mb-1 block";

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
          <h1 className="text-2xl md:text-3xl font-semibold">Customers</h1>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={exportCSV} className="flex-1 md:flex-none bg-[#1c1c1c] border border-white/10 hover:bg-white/5 text-white px-3 py-2 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
              <Download size={14} /> CSV
            </button>
            <button onClick={() => openModal()} className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors">
              <Plus size={16} /> Add Customer
            </button>
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
            <select className="bg-[#111] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white" value={filterMallu} onChange={e => setFilterMallu(e.target.value)}>
              <option value="">All</option><option value="true">Mallu Only</option>
            </select>
            <select className="bg-[#111] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white" value={filterRepeat} onChange={e => setFilterRepeat(e.target.value)}>
              <option value="">All</option><option value="true">Repeat Only</option>
            </select>
            <select className="bg-[#111] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white" value={filterBehavior} onChange={e => setFilterBehavior(e.target.value)}>
              <option value="">Behavior</option><option value="Good">Good</option><option value="Very Good">Very Good</option><option value="Bad">Bad</option>
            </select>
            <select className="bg-[#111] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white" value={filterSpending} onChange={e => setFilterSpending(e.target.value)}>
              <option value="">Spending</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
            </select>
            <button onClick={() => setSortBy(sortBy === 'latest' ? 'highest' : 'latest')} className="ml-auto bg-[#111] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white flex items-center gap-1 hover:bg-white/5 transition-colors">
              <ArrowUpDown size={12} /> {sortBy === 'latest' ? 'Latest' : 'Top $'}
            </button>
          </div>
        </div>

        {/* Customer Cards */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="text-center text-gray-400 py-12 bg-[#1c1c1c] border border-white/10 rounded-2xl">No customers found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map(c => (
              <div key={c.id} className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-colors group">
                {/* Top Row */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-base">{c.name}</h3>
                    <p className="text-xs text-gray-400">{c.number}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openWhatsApp(c.number)} className="p-1.5 bg-green-600/20 hover:bg-green-600/40 rounded-lg text-green-400 transition-colors" title="WhatsApp">
                      <MessageCircle size={14} />
                    </button>
                    <button onClick={() => handleEdit(c)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {c.is_repeat && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Repeat ({c.repeat_count || 1})</span>}
                  {c.is_mallu && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Mallu</span>}
                  {c.behavior && <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.behavior === 'Very Good' ? 'bg-green-500/20 text-green-400' : c.behavior === 'Good' ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-400'}`}>{c.behavior}</span>}
                  {c.body_size && <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">{c.body_size}</span>}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="bg-black/30 rounded-lg p-2">
                    <span className="text-gray-500 block">Amount</span>
                    <span className="font-bold text-green-500">{(c.total_paid_amount || 0).toLocaleString()} AED</span>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2">
                    <span className="text-gray-500 block">Commission</span>
                    <span className="font-bold text-red-400">{(c.amount_paid_to_staff || 0).toLocaleString()} AED</span>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400 border-t border-white/5 pt-2">
                  {c.nationality && <span>🌍 {c.nationality}</span>}
                  {c.room_number && <span>🏠 Room {c.room_number}</span>}
                  {c.meeting_duration && <span>⏱ {c.meeting_duration}</span>}
                  {c.age && <span>👤 Age {c.age}</span>}
                  {c.staff_name && <span>👨‍💼 {c.staff_name}</span>}
                  <span>📅 {new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-end md:items-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-t-3xl md:rounded-2xl w-full md:max-w-2xl max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Sticky Header */}
            <div className="p-4 md:p-5 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Customer' : 'New Customer'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1"><X size={20} /></button>
            </div>

            {/* Scrollable Form */}
            <form className="p-4 md:p-5 overflow-y-auto flex-1 space-y-5" onSubmit={handleSubmit}>
              {/* Payment Section */}
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">💰 Payment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div><label className={labelCls}>Staff Assigned</label>
                    <select className={inputCls} value={formData.staff_name} onChange={e => setFormData({...formData, staff_name: e.target.value})}>
                      <option value="">Select...</option>
                      {staffList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div><label className={`${labelCls} text-green-500`}>Total Amount (AED)</label>
                    <input type="number" step="0.01" placeholder="0.00" className={`${inputCls} border-green-500/30`} value={formData.total_paid_amount} onChange={e => setFormData({...formData, total_paid_amount: e.target.value})} />
                  </div>
                  <div><label className={`${labelCls} text-red-400`}>Commission (AED)</label>
                    <input type="number" step="0.01" placeholder="0.00" className={`${inputCls} border-red-500/30`} value={formData.amount_paid_to_staff} onChange={e => setFormData({...formData, amount_paid_to_staff: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">👤 Basic Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div><label className={labelCls}>Customer Name *</label><input required type="text" className={inputCls} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                  <div><label className={labelCls}>Phone Number *</label><input required type="text" className={inputCls} value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} /></div>
                  <div><label className={labelCls}>Age</label><input type="number" className={inputCls} value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} /></div>
                  <div><label className={labelCls}>Nationality</label><input type="text" className={inputCls} value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} /></div>
                  <div><label className={labelCls}>Room Number</label><input type="text" className={inputCls} value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} /></div>
                  <div><label className={labelCls}>Date &amp; Time</label><input type="datetime-local" className={inputCls} value={formData.appointment_date_time} onChange={e => setFormData({...formData, appointment_date_time: e.target.value})} /></div>
                </div>
              </div>

              {/* Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">📋 Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div><label className={labelCls}>Meeting Duration</label>
                    <select className={inputCls} value={formData.meeting_duration} onChange={e => setFormData({...formData, meeting_duration: e.target.value})}>
                      <option value="">Select...</option>
                      <option value="1 Hour">1 Hour</option><option value="2 Hours">2 Hours</option>
                      <option value="3 Hours">3 Hours</option><option value="4 Hours">4 Hours</option>
                      <option value="More Than 5 Hours">More Than 5 Hours</option>
                    </select>
                  </div>
                  <div><label className={labelCls}>Behavior</label>
                    <select className={inputCls} value={formData.behavior} onChange={e => setFormData({...formData, behavior: e.target.value})}>
                      <option value="">Select...</option>
                      <option value="Bad">Bad</option><option value="Good">Good</option><option value="Very Good">Very Good</option>
                    </select>
                  </div>
                  <div><label className={labelCls}>Body Size</label>
                    <select className={inputCls} value={formData.body_size} onChange={e => setFormData({...formData, body_size: e.target.value})}>
                      <option value="">Select...</option>
                      <option value="Big">Big</option><option value="Normal">Normal</option><option value="Small">Small</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 flex-1 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 accent-red-500 rounded shrink-0" checked={formData.is_repeat} onChange={e => setFormData({...formData, is_repeat: e.target.checked})} />
                  <div><span className="text-sm font-medium text-white">Repeat Customer</span><br/><span className="text-xs text-gray-500">Returning client</span></div>
                </label>
                <label className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 flex-1 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 accent-yellow-500 rounded shrink-0" checked={formData.is_mallu} onChange={e => setFormData({...formData, is_mallu: e.target.checked})} />
                  <div><span className="text-sm font-medium text-white">Mallu Customer</span><br/><span className="text-xs text-gray-500">Malayali origin</span></div>
                </label>
              </div>

              {formData.is_repeat && (
                <div className="max-w-xs"><label className={labelCls}>Visit Count</label><input type="number" min="0" className={inputCls} value={formData.repeat_count} onChange={e => setFormData({...formData, repeat_count: e.target.value})} /></div>
              )}
            </form>

            {/* Sticky Submit */}
            <div className="p-4 border-t border-white/10 shrink-0 bg-[#1c1c1c]">
              <button type="submit" form="" onClick={handleSubmit} className="w-full bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-xl font-medium text-base transition-colors disabled:opacity-50" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (editingId ? 'Update Customer' : 'Save Customer')}
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
