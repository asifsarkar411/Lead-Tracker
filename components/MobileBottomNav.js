'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileSpreadsheet, 
  Briefcase, 
  FolderKanban, 
  Settings,
  Calendar
} from 'lucide-react';

export default function MobileBottomNav() {
  const { 
    activeTab, 
    setActiveTab, 
    leads, 
    outreachLeads, 
    meetings,
    clients 
  } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      badge: 0
    },
    {
      id: 'leads',
      label: 'WhatsApp',
      icon: MessageSquare,
      badge: leads.length
    },
    {
      id: 'outreach',
      label: 'Outreach',
      icon: FileSpreadsheet,
      badge: outreachLeads.length
    },
    {
      id: 'meetings',
      label: 'Meetings',
      icon: Calendar,
      badge: meetings.length
    },
    {
      id: 'clients',
      label: 'Onboard',
      icon: Briefcase,
      badge: clients.length
    },
    {
      id: 'client-list',
      label: 'Clients/Demo',
      icon: FolderKanban,
      badge: 0
    }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] transition-colors">
      <div className="grid grid-cols-6 items-center justify-between gap-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[14px] h-3.5 text-[9px] font-black rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 truncate max-w-full leading-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

