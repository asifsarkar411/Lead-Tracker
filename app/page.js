'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DashboardOverview from '@/components/DashboardOverview';
import LeadsView from '@/components/LeadsView';
import OutreachView from '@/components/OutreachView';
import ClientsView from '@/components/ClientsView';
import AdminSettingsView from '@/components/AdminSettingsView';
import LeadModal from '@/components/LeadModal';
import ClientModal from '@/components/ClientModal';
import ReminderNoticeModal from '@/components/ReminderNoticeModal';

export default function Home() {
  const { activeTab, setActiveTab, isAdminModalOpen, setIsAdminModalOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Sticky Navigation */}
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar 
          mobileOpen={mobileMenuOpen} 
          onCloseMobile={() => setMobileMenuOpen(false)} 
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'leads' && <LeadsView />}
          {activeTab === 'outreach' && <OutreachView />}
          {activeTab === 'clients' && <ClientsView />}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <h3 className="text-base font-bold text-amber-700 dark:text-amber-300">
                  Follow-up Notices & Alarms
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                  Manage all client follow-ups due today, overdue notices, and upcoming contacts.
                </p>
              </div>
              <DashboardOverview />
            </div>
          )}
          {activeTab === 'admin' && <AdminSettingsView />}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <LeadModal />
      <ClientModal />
      <ReminderNoticeModal />

      {/* Admin Panel Floating Modal (when triggered from top navbar button) */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold">Admin Control Center</h3>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>
            <AdminSettingsView />
          </div>
        </div>
      )}

    </div>
  );
}

