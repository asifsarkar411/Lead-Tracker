'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Bell, 
  Sun, 
  Moon, 
  Plus, 
  Settings, 
  Search, 
  MessageSquare, 
  Layers, 
  AlertCircle,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ onMobileMenuToggle }) {
  const { 
    theme, 
    toggleTheme, 
    settings, 
    totalNoticeCount, 
    dueFollowUps,
    dueOutreachFollowUps,
    setIsLeadModalOpen, 
    setEditingLead,
    setIsReminderModalOpen,
    setIsAdminModalOpen,
    searchTerm,
    setSearchTerm,
    setActiveTab,
    playNotificationChime
  } = useApp();

  const [isNoticeDropdownOpen, setIsNoticeDropdownOpen] = useState(false);

  const handleOpenNewLead = () => {
    setEditingLead(null);
    setIsLeadModalOpen(true);
  };

  const handleOpenReminders = () => {
    playNotificationChime();
    setIsReminderModalOpen(true);
    setIsNoticeDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left Brand & Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-3 cursor-pointer group"
            >
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={settings.logoUrl} 
                  alt={settings.siteName} 
                  className="w-9 h-9 object-contain rounded-lg"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
              )}
              <div>
                <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  {settings.siteName || 'ApexLead Tracker'}
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-800">
                    Live CRM
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-xs">
                  {settings.tagline || 'Sales & WhatsApp Leads Management'}
                </p>
              </div>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads by name, phone, service or requirements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Add WhatsApp Lead Button */}
            <button
              onClick={handleOpenNewLead}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Lead</span>
            </button>

            {/* Notification Bell with Dropdown & Audio Chime */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNoticeDropdownOpen(!isNoticeDropdownOpen)}
                className={`relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  totalNoticeCount > 0 ? 'text-amber-500 dark:text-amber-400' : ''
                }`}
                title="Follow-up Reminders & Notice"
              >
                <Bell className="w-5 h-5" />
                {totalNoticeCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {totalNoticeCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNoticeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3 px-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                        Follow-up Notices ({totalNoticeCount})
                      </h4>
                    </div>
                    <button
                      onClick={handleOpenReminders}
                      className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="py-2 max-h-64 overflow-y-auto space-y-2">
                    {totalNoticeCount === 0 ? (
                      <p className="text-xs text-center py-6 text-slate-500 dark:text-slate-400">
                        🎉 Awesome! All follow-up schedules are clear!
                      </p>
                    ) : (
                      <>
                        {dueFollowUps.slice(0, 4).map((lead) => (
                          <div 
                            key={lead._id}
                            onClick={() => {
                              setIsNoticeDropdownOpen(false);
                              setIsReminderModalOpen(true);
                            }}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                {lead.name}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                WhatsApp Lead • Due: {lead.followUpDate} ({lead.followUpTime || '11:00'})
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300">
                              Urgent
                            </span>
                          </div>
                        ))}

                        {dueOutreachFollowUps.slice(0, 2).map((lead) => (
                          <div 
                            key={lead._id}
                            onClick={() => {
                              setIsNoticeDropdownOpen(false);
                              setIsReminderModalOpen(true);
                            }}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                {lead.name} ({lead.company || 'Outreach'})
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Cold Outreach • Due: {lead.followUpDate}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                              Outreach
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <button
                      onClick={playNotificationChime}
                      className="text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center gap-1"
                    >
                      🔊 Test Chime
                    </button>
                    <button
                      onClick={handleOpenReminders}
                      className="w-full text-center py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                    >
                      Open Reminder Notice Center
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            {/* Admin Panel Button */}
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Admin Settings & Dynamic Controls"
            >
              <Settings className="w-5 h-5" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}

