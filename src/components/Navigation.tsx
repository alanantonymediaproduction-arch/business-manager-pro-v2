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
  Bell,
  LogOut
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="flex justify-between items-center p-5 px-8 border-b border-white/10 bg-[#1c1c1c]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex justify-center items-center overflow-hidden">
          <Image src="/next.svg" alt="User" width={32} height={32} style={{ opacity: 0.5 }} />
        </div>
        <span className="text-lg font-semibold text-white">BackupPlanPro</span>
      </div>
      
      <nav className="flex gap-6">
        <Link href="/" className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors ${pathname === '/' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <LayoutDashboard size={16} /> Dashboard
        </Link>
        <Link href="/dashboard/deepa" className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors ${pathname === '/dashboard/deepa' ? 'text-white bg-red-600' : 'text-red-400 hover:text-white hover:bg-red-600/50'}`}>
          <LayoutDashboard size={16} /> Deepa Dashboard
        </Link>
        <Link href="/customers" className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors ${pathname === '/customers' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <Users size={16} /> Customers
        </Link>
        <Link href="/staff" className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors ${pathname === '/staff' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <BadgeCheck size={16} /> Staff
        </Link>
        <Link href="/expenses" className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors ${pathname === '/expenses' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <ReceiptText size={16} /> Expenses
        </Link>
        <Link href="/reports" className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors ${pathname === '/reports' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <BarChart3 size={16} /> Reports
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        <button className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
          <Bell size={20} />
        </button>
        <form action="/auth/signout" method="post">
          <button type="submit" className="flex items-center gap-2 text-sm px-4 py-2 rounded-md transition-colors text-gray-400 hover:text-white hover:bg-red-600/20 hover:border-red-500/50 border border-transparent">
            <LogOut size={16} /> Logout
          </button>
        </form>
      </div>
    </header>
  );
}
