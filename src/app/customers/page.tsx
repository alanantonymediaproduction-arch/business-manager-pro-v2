'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Plus, X, Pencil, Trash2, Search, Filter } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
}

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

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNationality, setFilterNationality] = useState('');
  const [filterMalayali, setFilterMalayali] = useState(''); // '', 'true', 'false'
  const [filterRepeat, setFilterRepeat] = useState(''); // '', 'true'
  const [filterSpending, setFilterSpending] = useState(''); // '', 'High', 'Medium', 'Low'
  const [filterBehavior, setFilterBehavior] = useState(''); // '', 'Regular', 'VIP', 'Needs Attention', 'General'
  
  const [formData, setFormData] = useState({
    name: '', number: '', nationality: '', age: '', body_size: '',
    behavior: '', ethnicity_category: 'Others', appointment_date_time: '',
    is_repeat: false, call_notification: 'OK', total_paid_amount: '',
    amount_paid_to_staff: '', staff_name: ''
  });

  const fetchCustomers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (filterNationality) params.append('nationality', filterNationality);
    if (filterMalayali) params.append('malayali', filterMalayali);
    if (filterRepeat) params.append('isRepeat', filterRepeat);
    if (filterSpending) params.append('spending', filterSpending);
    if (filterBehavior) params.append('behavior', filterBehavior);

    fetch(`/api/customers?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchStaff = () => {
    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStaffList(data);
      });
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Debounced search and filter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery, filterNationality, filterMalayali, filterRepeat, filterSpending, filterBehavior]);

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        name: customer.name,
        number: customer.number,
        nationality: customer.nationality || '',
        age: customer.age?.toString() || '',
        body_size: customer.body_size || '',
        behavior: customer.behavior || '',
        ethnicity_category: customer.ethnicity_category || 'Others',
        appointment_date_time: customer.appointment_date_time ? new Date(customer.appointment_date_time).toISOString().slice(0, 16) : '',
        is_repeat: customer.is_repeat,
        call_notification: customer.call_notification || 'OK',
        total_paid_amount: customer.total_paid_amount?.toString() || '0',
        amount_paid_to_staff: customer.amount_paid_to_staff?.toString() || '0',
        staff_name: customer.staff_name || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', number: '', nationality: '', age: '', body_size: '',
        behavior: 'General', ethnicity_category: 'Others', appointment_date_time: '',
        is_repeat: false, call_notification: 'OK', total_paid_amount: '',
        amount_paid_to_staff: '', staff_name: ''
      });
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

  const exportCSV = () => {
    const headers = ['Name', 'Number', 'Staff Assigned', 'Total Paid (AED)', 'Paid to Staff (AED)', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...customers.map(c => [
        `"${c.name}"`, 
        `"${c.number}"`, 
        `"${c.staff_name || ''}"`, 
        c.total_paid_amount || 0, 
        c.amount_paid_to_staff || 0,
        new Date(c.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Customers</h1>
          <div className="flex gap-4">
            <button onClick={exportCSV} className="bg-[#1c1c1c] border border-white/10 hover:bg-white/5 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              Download CSV
            </button>
            <button onClick={() => openModal()} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Plus size={16} /> Add Customer
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-4 mb-6 flex flex-col gap-4">
          <div className="flex items-center bg-[#111] border border-white/10 rounded-xl px-4 py-3">
            <Search size={18} className="text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search by name or phone number..." 
              className="bg-transparent border-none text-white w-full focus:outline-none" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <span className="text-sm text-gray-400 font-medium">Filters:</span>
            </div>
            
            <input 
              type="text" 
              placeholder="Nationality" 
              className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 w-32" 
              value={filterNationality}
              onChange={e => setFilterNationality(e.target.value)}
            />

            <select 
              className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              value={filterMalayali}
              onChange={e => setFilterMalayali(e.target.value)}
            >
              <option value="">All Ethnicities</option>
              <option value="true">Malayali Only</option>
              <option value="false">Non-Malayali</option>
            </select>

            <select 
              className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              value={filterSpending}
              onChange={e => setFilterSpending(e.target.value)}
            >
              <option value="">All Spending</option>
              <option value="High">High (&gt;10k AED)</option>
              <option value="Medium">Medium (2.5k-10k)</option>
              <option value="Low">Low (&lt;2.5k AED)</option>
            </select>

            <select 
              className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              value={filterBehavior}
              onChange={e => setFilterBehavior(e.target.value)}
            >
              <option value="">All Behaviors</option>
              <option value="Regular">Regular</option>
              <option value="VIP">VIP</option>
              <option value="Needs Attention">Needs Attention</option>
              <option value="General">General</option>
            </select>

            <select 
              className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              value={filterRepeat}
              onChange={e => setFilterRepeat(e.target.value)}
            >
              <option value="">All Clients</option>
              <option value="true">Repeat Customers</option>
            </select>
          </div>
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
                    <td colSpan={6} className="p-8 text-center text-gray-400">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#1c1c1c] z-10">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form className="p-6 grid grid-cols-2 gap-x-6 gap-y-4" onSubmit={handleSubmit}>
              
              {/* Financial & Assignment Section */}
              <div className="col-span-2 grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl mb-2">
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Staff Assigned</label>
                  <select className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.staff_name} onChange={e => setFormData({...formData, staff_name: e.target.value})}>
                    <option value="">Select Staff...</option>
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.name}>{staff.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400 font-bold text-green-500">Total Paid Amount ($)</label>
                  <input type="number" step="0.01" className="w-full bg-[#111] border border-green-500/30 rounded-lg p-3 text-white focus:outline-none focus:border-green-500" value={formData.total_paid_amount} onChange={e => setFormData({...formData, total_paid_amount: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400 font-bold text-red-500">Amount Paid to Staff ($)</label>
                  <input type="number" step="0.01" className="w-full bg-[#111] border border-red-500/30 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.amount_paid_to_staff} onChange={e => setFormData({...formData, amount_paid_to_staff: e.target.value})} />
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Customer Name</label>
                <input required type="text" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Customer Number</label>
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
                <select className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" value={formData.behavior} onChange={e => setFormData({...formData, behavior: e.target.value})}>
                  <option value="General">General</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="Needs Attention">Needs Attention</option>
                </select>
              </div>

              {/* Categorization */}
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
              <div className="space-y-1 col-span-2 flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/10">
                <input type="checkbox" className="w-5 h-5 accent-red-500 rounded bg-[#111]" checked={formData.is_repeat} onChange={e => setFormData({...formData, is_repeat: e.target.checked})} />
                <label className="text-sm font-medium text-white">Repeat Customer (Mark if this is a returning client)</label>
              </div>
              
              <div className="col-span-2 mt-4">
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl font-medium text-lg transition-colors" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Customer Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
