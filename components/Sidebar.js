'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileSpreadsheet, 
  Briefcase, 
  BellRing, 
  Settings, 
  FolderKanban,
  ChevronDown,
  ChevronRight,
  Star,
  Link2
} from 'lucide-react';

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { 
    activeTab, 
    setActiveTab, 
    clientListSubTab, 
    setClientListSubTab, 
    leads, 
    outreachLeads, 
    clients, 
    demoLinks,
    successfulClients,
    totalNoticeCount,
    settings
  } = useApp();

  const [isClientListOpen, setIsClientListOpen] = useState(true);

  const handleSelectTab = (id) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectClientListSub = (subTab) => {
    setActiveTab('client-list');
    setClientListSubTab(subTab);
    if (onCloseMobile) onCloseMobile();
  };

  const hotLeadsCount = leads.filter(l => l.potentialityStatus === 'Hot').length;

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
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-40 h-screen lg:h-[calc(100vh-4rem)] w-72 lg:w-64 flex-shrink-0 bg-white/95 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 p-4 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="space-y-1.5 overflow-y-auto">
          {/* Mobile Drawer Header with Logo & Close Button */}
          <div className="lg:hidden flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={settings.logoUrl} 
                  alt={settings.siteName || 'Logo'} 
                  className="max-h-8 max-w-[100px] object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                  ৳
                </div>
              )}
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block truncate max-w-[140px]">
                  {settings.siteName || 'Lead Tracker'}
                </span>
                <span className="text-[10px] text-slate-400">Agency CRM</span>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Agency Navigation
          </div>

          {/* 1. Dashboard */}
          <button
            onClick={() => handleSelectTab('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-semibold text-xs transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span>Dashboard</span>
            </div>
          </button>

          {/* 2. WhatsApp Leads (Separate Inbound Channel) */}
          <button
            onClick={() => handleSelectTab('leads')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-semibold text-xs transition-all ${
              activeTab === 'leads'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className={`w-4 h-4 ${activeTab === 'leads' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span>WhatsApp Leads</span>
            </div>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {leads.length}
            </span>
          </button>

          {/* 3. Outreach Leads (Separate Cold Channel) */}
          <button
            onClick={() => handleSelectTab('outreach')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-semibold text-xs transition-all ${
              activeTab === 'outreach'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'outreach' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
              <span>Outreach Leads</span>
            </div>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {outreachLeads.length}
            </span>
          </button>

          {/* 4. Onboarded Clients (Separate Channel) */}
          <button
            onClick={() => handleSelectTab('clients')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-semibold text-xs transition-all ${
              activeTab === 'clients'
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase className={`w-4 h-4 ${activeTab === 'clients' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
              <span>Onboarded Clients</span>
            </div>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              {clients.length}
            </span>
          </button>

          {/* 5. Client List (Dropdown Options: Successful Clients & Demo Links) */}
          <div className="pt-1">
            <button
              onClick={() => setIsClientListOpen(!isClientListOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-semibold text-xs transition-all ${
                activeTab === 'client-list'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderKanban className={`w-4 h-4 ${activeTab === 'client-list' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>Client List</span>
              </div>
              {isClientListOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {/* Sub-menu Dropdown */}
            {isClientListOpen && (
              <div className="pl-6 pr-1 pt-1.5 space-y-1">
                {/* Sub option 1: Successful Clients */}
                <button
                  onClick={() => handleSelectClientListSub('successful')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'client-list' && clientListSubTab === 'successful'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span>Successful Clients</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    {successfulClients.length}
                  </span>
                </button>

                {/* Sub option 2: Demo Links */}
                <button
                  onClick={() => handleSelectClientListSub('demo-links')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'client-list' && clientListSubTab === 'demo-links'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Demo Links</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {demoLinks.length}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* 6. Follow-up Notices */}
          <button
            onClick={() => handleSelectTab('reminders')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-semibold text-xs transition-all ${
              activeTab === 'reminders'
                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <BellRing className={`w-4 h-4 ${activeTab === 'reminders' ? 'text-red-500' : 'text-slate-400'}`} />
              <span>Follow-up Notice</span>
            </div>
            {totalNoticeCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-500 text-white animate-pulse">
                {totalNoticeCount}
              </span>
            )}
          </button>

          {/* 7. Admin Panel */}
          <button
            onClick={() => handleSelectTab('admin')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-semibold text-xs transition-all ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4" />
              <span>Admin Panel</span>
            </div>
          </button>
        </div>

        {/* Clean Footer without Git/Database technical boxes */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              Agency CRM Suite
            </span>
            <span className="text-[10px] text-slate-400">
              100% Dynamic & Editable
            </span>
          </div>
        </div>

      </aside>
    </>
  );
}
