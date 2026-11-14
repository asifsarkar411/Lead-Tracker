'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DashboardOverview from '@/components/DashboardOverview';
import LeadsView from '@/components/LeadsView';
import OutreachView from '@/components/OutreachView';
import ClientsView from '@/components/ClientsView';
import ClientListView from '@/components/ClientListView';
import MeetingsView from '@/components/MeetingsView';
import AdminSettingsView from '@/components/AdminSettingsView';
import LeadModal from '@/components/LeadModal';
import ClientModal from '@/components/ClientModal';
import MeetingModal from '@/components/MeetingModal';
import AuthModal from '@/components/AuthModal';
import ReminderNoticeModal from '@/components/ReminderNoticeModal';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function Home() {
  const { activeTab, setActiveTab } = useApp();
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
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 overflow-y-auto pb-24 lg:pb-8">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'leads' && <LeadsView />}
          {activeTab === 'outreach' && <OutreachView />}
          {activeTab === 'meetings' && <MeetingsView />}
          {activeTab === 'clients' && <ClientsView />}
          {activeTab === 'client-list' && <ClientListView />}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/30">
                <h3 className="text-base font-bold text-red-700 dark:text-red-300">
                  Client Follow-up Notice Center
                </h3>
                <p className="text-xs text-red-800/80 dark:text-red-300/80">
                  Real-time alerts for overdue, today, and upcoming client follow-ups.
                </p>
              </div>
              <DashboardOverview />
            </div>
          )}
          {activeTab === 'admin' && <AdminSettingsView />}
        </main>
      </div>

      {/* Global Mobile Bottom Navigation (Web App PWA Feel) */}
      <MobileBottomNav />

      {/* Global Interactive Modals */}
      <LeadModal />
      <ClientModal />
      <MeetingModal />
      <AuthModal />
      <ReminderNoticeModal />

    </div>
  );
}
