'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  BadgeCheck, 
  ReceiptText, 
  BarChart3, 
  Bell 
} from 'lucide-react';
import styles from './Navigation.module.css';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.avatar}>
          <Image src="/next.svg" alt="User" width={32} height={32} style={{ opacity: 0.5 }} />
        </div>
        <span className={styles.brand}>Business Manager Pro</span>
      </div>
      
      <nav className={styles.nav}>
        <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
          <LayoutDashboard size={16} /> Dashboard
        </Link>
        <Link href="/customers" className={`${styles.navItem} ${pathname === '/customers' ? styles.active : ''}`}>
          <Users size={16} /> Customers
        </Link>
        <Link href="/staff" className={`${styles.navItem} ${pathname === '/staff' ? styles.active : ''}`}>
          <BadgeCheck size={16} /> Staff
        </Link>
        <Link href="/expenses" className={`${styles.navItem} ${pathname === '/expenses' ? styles.active : ''}`}>
          <ReceiptText size={16} /> Expenses
        </Link>
        <Link href="/reports" className={`${styles.navItem} ${pathname === '/reports' ? styles.active : ''}`}>
          <BarChart3 size={16} /> Reports
        </Link>
      </nav>

      <div className={styles.headerRight}>
        <button className={styles.iconBtn}>
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}
