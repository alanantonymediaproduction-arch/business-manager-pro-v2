'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Plus, X } from 'lucide-react';
import styles from './page.module.css';
import modalStyles from '../page.module.css';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
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
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, status })
      });
      
      if (response.ok) {
        const newCustomer = await response.json();
        // Optimistic update
        setCustomers(prev => [newCustomer, ...prev]);
        setIsModalOpen(false);
        setName(''); setEmail(''); setPhone(''); setStatus('Active');
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
          <h1 className={styles.title}>Customers</h1>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Customer
          </button>
        </div>

        <div className={styles.tableCard}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading customers...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Phone</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className={styles.tr}>
                    <td className={styles.td} style={{ fontWeight: 500 }}>{c.name}</td>
                    <td className={styles.td} style={{ color: 'var(--muted-foreground)' }}>{c.email || '-'}</td>
                    <td className={styles.td} style={{ color: 'var(--muted-foreground)' }}>{c.phone || '-'}</td>
                    <td className={styles.td}>
                      <span className={c.status === 'Active' ? styles.statusActive : styles.statusInactive}>
                        {c.status}
                      </span>
                    </td>
                    <td className={styles.td} style={{ color: 'var(--muted-foreground)' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Add Customer Modal using shared dashboard modal styles */}
      {isModalOpen && (
        <div className={modalStyles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={modalStyles.modal} onClick={e => e.stopPropagation()}>
            <div className={modalStyles.modalHeader}>
              <h2>Add New Customer</h2>
              <button className={modalStyles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form className={modalStyles.modalBody} onSubmit={handleSubmit}>
              <div className={modalStyles.inputGroup}>
                <label>Name</label>
                <input required type="text" className={modalStyles.input} value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className={modalStyles.inputGroup}>
                <label>Email</label>
                <input type="email" className={modalStyles.input} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className={modalStyles.inputGroup}>
                <label>Phone</label>
                <input type="text" className={modalStyles.input} value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className={modalStyles.inputGroup}>
                <label>Status</label>
                <select className={modalStyles.select} value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" className={modalStyles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Customer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
