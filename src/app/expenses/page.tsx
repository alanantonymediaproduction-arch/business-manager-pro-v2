'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Plus, X } from 'lucide-react';
import styles from '../customers/page.module.css'; // Reusing table CSS
import modalStyles from '../page.module.css'; // Reusing modal CSS

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  createdAt: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/expenses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setExpenses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
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
        body: JSON.stringify({ type: 'expense', amount: parseFloat(amount), description })
      });
      
      if (response.ok) {
        // Optimistic update
        const newExpense = {
          id: Math.random().toString(),
          amount: parseFloat(amount),
          category: 'General',
          description: description,
          createdAt: new Date().toISOString()
        };
        setExpenses(prev => [newExpense, ...prev]);
        setIsModalOpen(false);
        setAmount(''); setDescription('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Navigation />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Expenses</h1>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Expense
          </button>
        </div>

        <div className={styles.tableCard}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading expenses...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Description</th>
                  <th className={styles.th}>Category</th>
                  <th className={styles.th}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} className={styles.tr}>
                    <td className={styles.td} style={{ color: 'var(--muted-foreground)' }}>
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td className={styles.td} style={{ fontWeight: 500 }}>{e.description || '-'}</td>
                    <td className={styles.td} style={{ color: 'var(--muted-foreground)' }}>{e.category}</td>
                    <td className={styles.td} style={{ fontWeight: 600, color: '#e53935' }}>
                      ${e.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                      No expenses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className={modalStyles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={modalStyles.modal} onClick={e => e.stopPropagation()}>
            <div className={modalStyles.modalHeader}>
              <h2>Add New Expense</h2>
              <button className={modalStyles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form className={modalStyles.modalBody} onSubmit={handleSubmit}>
              <div className={modalStyles.inputGroup}>
                <label>Amount ($)</label>
                <input required type="number" step="0.01" className={modalStyles.input} value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className={modalStyles.inputGroup}>
                <label>Description</label>
                <input required type="text" className={modalStyles.input} placeholder="e.g. Office Supplies" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <button type="submit" className={modalStyles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Expense'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
