'use client';

import { useState, useEffect } from 'react';
import { 
  Search,
  Banknote,
  Tag,
  Building2,
  Trophy,
  TrendingUp,
  MoreVertical,
  Plus,
  Hourglass,
  ReceiptText,
  X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './page.module.css';
import Navigation from '@/components/Navigation';

interface DashboardData {
  todayEarnings: number;
  todayCommissions: number;
  totalEarnings: number;
  totalCommissions: number;
  todayExpenses: number;
  pendingPayments: number;
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
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
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
        // Optimistic UI Update for immediate feedback (especially useful on Vercel read-only FS)
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
        setAmount('');
        setDescription('');
      } else {
        alert('Failed to add transaction. (Note: Writes do not persist on Vercel preview)');
      }
    } catch (error) {
      console.error(error);
      alert('Error submitting data');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !data) {
    return <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <Navigation />

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.topSection}>
          <div className={styles.welcome}>
            <h1>Welcome back</h1>
            <p>Here's your high-level overview for today.</p>
          </div>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input type="text" placeholder="Quick search..." className={styles.searchInput} />
          </div>
        </div>

        {/* KPI Grid */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>Today Earnings</span>
              <Banknote size={16} className={styles.kpiIcon} />
            </div>
            <div className={styles.kpiValue}>${data.todayEarnings.toLocaleString()}</div>
            <div className={styles.kpiFooter}>
              <TrendingUp size={12} className={styles.positive} />
              <span className={styles.positive}>+14.5%</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>Today Commissions</span>
              <Tag size={16} className={styles.kpiIcon} />
            </div>
            <div className={styles.kpiValue}>${data.todayCommissions.toLocaleString()}</div>
            <div className={styles.kpiFooter}>
              <TrendingUp size={12} className={styles.positive} />
              <span className={styles.positive}>+5.2%</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>Total Earnings</span>
              <Building2 size={16} className={styles.kpiIcon} />
            </div>
            <div className={styles.kpiValue}>${(data.totalEarnings / 1000).toFixed(1)}K</div>
            <div className={styles.kpiFooter}>
              <span className={styles.neutral}>🗓 This Month</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiTitle}>Total Commissions</span>
              <Trophy size={16} className={styles.kpiIcon} />
            </div>
            <div className={styles.kpiValue}>${(data.totalCommissions / 1000).toFixed(1)}K</div>
            <div className={styles.kpiFooter}>
              <span className={styles.neutral}>🗓 This Month</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className={styles.contentGrid}>
          {/* Main Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <span className={styles.chartTitle}>Daily Earnings Overview</span>
              <button className={styles.iconBtn}>
                <MoreVertical size={20} />
              </button>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#a0a0a0', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#a0a0a0', fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === new Date().toLocaleDateString('en-US', { weekday: 'short' }) ? '#e53935' : '#404040'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Cards */}
          <div className={styles.sideCards}>
            <div className={styles.sideCard}>
              <div className={styles.sideCardLeft}>
                <span className={styles.sideCardTitle}>Net Profit</span>
                <span className={styles.sideCardValue}>${data.netProfit.toLocaleString()}</span>
              </div>
              <div className={styles.sideCardIcon}>
                <TrendingUp size={20} />
              </div>
            </div>

            <div className={styles.sideCard}>
              <div className={styles.sideCardLeft}>
                <span className={styles.sideCardTitle}>Today Expenses</span>
                <span className={styles.sideCardValue}>${data.todayExpenses.toLocaleString()}</span>
              </div>
              <div className={styles.sideCardIcon}>
                <ReceiptText size={20} />
              </div>
            </div>

            <div className={styles.sideCard}>
              <div className={styles.sideCardLeft}>
                <span className={styles.sideCardTitle}>Pending Payments</span>
                <span className={styles.sideCardValue}>{data.pendingPayments}</span>
              </div>
              <div className={styles.sideCardIcon}>
                <Hourglass size={20} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FAB */}
      <button className={styles.fab} onClick={() => setIsModalOpen(true)}>
        <Plus size={24} />
      </button>

      {/* Data Submission Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add Transaction</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form className={styles.modalBody} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>Type</label>
                <select 
                  className={styles.select} 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="earning">Earning</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Amount ($)</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Description</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="e.g., Client Payment" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
