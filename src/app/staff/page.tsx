'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Plus, X } from 'lucide-react';
import styles from '../customers/page.module.css'; // Reusing table CSS
import modalStyles from '../page.module.css'; // Reusing modal CSS

interface Staff {
  id: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStaff(data);
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
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, status })
      });
      
      if (response.ok) {
        const newStaff = await response.json();
        // Optimistic update
        setStaff(prev => [newStaff, ...prev]);
        setIsModalOpen(false);
        setName(''); setRole(''); setStatus('Active');
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
          <h1 className={styles.title}>Staff</h1>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Staff
          </button>
        </div>

        <div className={styles.tableCard}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading staff...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id} className={styles.tr}>
                    <td className={styles.td} style={{ fontWeight: 500 }}>{s.name}</td>
                    <td className={styles.td} style={{ color: 'var(--muted-foreground)' }}>{s.role}</td>
                    <td className={styles.td}>
                      <span className={s.status === 'Active' ? styles.statusActive : styles.statusInactive}>
                        {s.status}
                      </span>
                    </td>
                    <td className={styles.td} style={{ color: 'var(--muted-foreground)' }}>
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                      No staff found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className={modalStyles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={modalStyles.modal} onClick={e => e.stopPropagation()}>
            <div className={modalStyles.modalHeader}>
              <h2>Add New Staff</h2>
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
                <label>Role</label>
                <input required type="text" className={modalStyles.input} placeholder="e.g. Sales Rep" value={role} onChange={e => setRole(e.target.value)} />
              </div>
              <div className={modalStyles.inputGroup}>
                <label>Status</label>
                <select className={modalStyles.select} value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" className={modalStyles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Staff'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
