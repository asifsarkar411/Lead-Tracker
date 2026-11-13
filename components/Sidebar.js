'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileSpreadsheet, 
  Briefcase, 
  BellRing, 
  Settings, 
  Flame, 
  TrendingUp,
  Database
} from 'lucide-react';

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { 
    activeTab, 
    setActiveTab, 
    leads, 
    outreachLeads, 
    clients, 
    totalNoticeCount,
    dbStatus
  } = useApp();

  const hotLeadsCount = leads.filter(l => l.potentialityStatus === 'Hot').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Pipeline & Analytics'
    },
    {
      id: 'leads',
      label: 'WhatsApp Leads',
      icon: MessageSquare,
      badge: hotLeadsCount > 0 ? `${hotLeadsCount} Hot` : `${leads.length}`,
      badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
      desc: 'Inbound Ads & Chat'
    },
    {
      id: 'outreach',
      label: 'Outreach & CSV',
      icon: FileSpreadsheet,
      badge: outreachLeads.length,
      badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30',
      desc: 'Cold Leads Sheet'
    },
    {
      id: 'clients',
      label: 'Onboarded Clients',
      icon: Briefcase,
      badge: clients.length,
      badgeColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30',
      desc: 'Deals & Revenue'
    },
    {
      id: 'reminders',
      label: 'Notice & Reminders',
      icon: BellRing,
      badge: totalNoticeCount > 0 ? totalNoticeCount : null,
      badgeColor: 'bg-red-500 text-white animate-pulse',
      desc: 'Follow-up Alerts'
    },
    {
      id: 'admin',
      label: 'Admin Control',
      icon: Settings,
      badge: null,
      desc: 'Dynamic Branding & Services'
    }
  ];

  const handleSelectTab = (id) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 flex-shrink-0 bg-white/95 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 p-4 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Agency Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <div>
                    <span className="block">{item.label}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                      {item.desc}
                    </span>
                  </div>
                </div>

                {item.badge !== null && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Database Status Card in Sidebar Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                Database Engine
              </span>
              <span className={`h-2 w-2 rounded-full ${dbStatus.isMongoConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {dbStatus.isMongoConnected 
                ? 'Connected to MongoDB Atlas'
                : 'Demo/Local Mode Active (MongoDB Atlas ready)'
              }
            </p>
          </div>
        </div>

      </aside>
    </>
  );
}

