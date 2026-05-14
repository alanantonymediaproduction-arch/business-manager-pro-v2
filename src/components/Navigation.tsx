'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BadgeCheck, 
  ReceiptText, 
  BarChart3, 
  Bell,
  LogOut,
  Settings,
  Contact,
  Globe,
  Activity
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const [personaName, setPersonaName] = useState('Deepa');

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data?.custom_persona_name) setPersonaName(data.custom_persona_name);
      });
  }, []);

  return (
    <header className="flex flex-col md:flex-row justify-between items-center p-4 md:p-5 px-4 md:px-8 border-b border-white/10 bg-[#1c1c1c] gap-4 md:gap-0">
      <div className="flex justify-between items-center w-full md:w-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex justify-center items-center overflow-hidden">
            <Image src="/next.svg" alt="User" width={32} height={32} style={{ opacity: 0.5 }} />
          </div>
          <span className="text-lg font-semibold text-white">BackupPlanPro</span>
        </div>
        
        {/* Mobile quick actions */}
        <div className="flex items-center gap-2 md:hidden">
          <button className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <Bell size={18} />
          </button>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-red-600/20 transition-colors">
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </div>
      
      <nav className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
        <Link href="/" className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md whitespace-nowrap transition-colors ${pathname === '/' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <LayoutDashboard size={16} /> Main Dashboard
        </Link>
        <Link href="/dashboard/deepa" className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md whitespace-nowrap transition-colors ${pathname === '/dashboard/deepa' ? 'text-white bg-red-600' : 'text-red-400 hover:text-white hover:bg-red-600/50'}`}>
          <LayoutDashboard size={16} /> {personaName} Dashboard
        </Link>
        <Link href="/customers" className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md whitespace-nowrap transition-colors ${pathname === '/customers' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <Users size={16} /> Customers
        </Link>
        <Link href="/lifecycle" className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md whitespace-nowrap transition-colors ${pathname === '/lifecycle' ? 'text-white bg-amber-600' : 'text-amber-400 hover:text-white hover:bg-amber-600/50'}`}>
          <Activity size={16} /> Lifecycle
        </Link>
        <Link href="/staff" className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md whitespace-nowrap transition-colors ${pathname === '/staff' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <Contact size={16} /> Staff
        </Link>
        <Link href="/online-services" className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md whitespace-nowrap transition-colors ${pathname === '/online-services' ? 'text-white bg-purple-600' : 'text-purple-400 hover:text-white hover:bg-purple-600/50'}`}>
          <Globe size={16} /> Online
        </Link>
        <Link href="/settings" className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md whitespace-nowrap transition-colors ${pathname === '/settings' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <Settings size={16} /> Settings
        </Link>
      </nav>

      <div className="hidden md:flex items-center gap-2">
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
