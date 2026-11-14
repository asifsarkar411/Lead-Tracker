'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import DateFilterBar from './DateFilterBar';
import { 
  Users, 
  Flame, 
  BellRing, 
  CheckCircle2, 
  DollarSign, 
  ArrowUpRight, 
  MessageSquare, 
  FileSpreadsheet,
  Briefcase,
  Send, 
  Clock, 
  Calendar,
  Sparkles,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function DashboardOverview() {
  const { 
    settings, 
    leads, 
    outreachLeads, 
    clients, 
    allFollowUpNotices,
    totalNoticeCount,
    setActiveTab,
    setIsReminderModalOpen,
    setIsLeadModalOpen,
    setEditingLead,
    saveLead,
    saveOutreachLead,
    playNotificationChime
  } = useApp();

  const currency = '৳';

  // Hot Leads
  const hotLeads = leads.filter(l => l.potentialityStatus === 'Hot');
  
  // Pipeline metrics
  const totalAsking = clients.reduce((acc, c) => acc + (Number(c.askingCost) || 0), 0);
  const totalWon = clients.reduce((acc, c) => acc + (Number(c.wonCost) || 0), 0);
  const totalCollected = clients.reduce((acc, c) => acc + (Number(c.paidAmount) || 0), 0);
  const totalPending = Math.max(0, totalWon - totalCollected);

  // Quick WhatsApp Launcher
  const openWhatsApp = (phone, name, service) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const template = settings.whatsappTemplates?.[0]?.message || 'Hello {name}! Following up regarding {service}.';
    const msg = template
      .replace('{name}', name || 'Client')
      .replace('{service}', (Array.isArray(service) ? service[0] : service) || 'our digital marketing services');
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleReschedule = async (notice, daysToAdd) => {
    const newDate = new Date(Date.now() + daysToAdd * 86400000).toISOString().split('T')[0];
    const isOutreach = notice.type === 'Cold Outreach';
    const existingNotes = notice.item?.followUpNotes || [];
    const updatedNotes = [
      ...existingNotes,
      {
        _id: 'note_' + Date.now(),
        date: new Date().toISOString(),
        note: `Rescheduled follow-up to ${newDate}`,
        outcome: 'Connected',
        addedAt: 'Just now'
      }
    ];

    if (isOutreach) {
      await saveOutreachLead({
        _id: notice._id,
        followUpDate: newDate,
        followUpNotes: updatedNotes
      });
    } else {
      await saveLead({
        _id: notice._id,
        followUpDate: newDate,
        followUpNotes: updatedNotes
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Date, Month & Year Filter Bar */}
      <DateFilterBar />

      {/* Follow-up Notice Urgent Alert Banner */}
      {totalNoticeCount > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border border-red-500/30 dark:border-red-500/40 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-500 text-white shadow-md shadow-red-500/30">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-900 dark:text-red-200 flex items-center gap-2">
                  <span>Urgent Notice: {totalNoticeCount} Client Follow-ups Due!</span>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-extrabold rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                    High Priority
                  </span>
                </h3>
                <p className="text-xs text-red-700 dark:text-red-300/80 mt-0.5">
                  Clients are waiting for response. Contact on WhatsApp immediately to prevent deal drop-offs.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  playNotificationChime();
                  setIsReminderModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-500 shadow-sm shadow-red-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Open Notice Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* WhatsApp Inbound Leads */}
        <div 
          onClick={() => setActiveTab('leads')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              WhatsApp Leads
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {leads.length}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {hotLeads.length} Hot Deals
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Ad inflow & WhatsApp inquiries
          </p>
        </div>

        {/* Cold Outreach Leads */}
        <div 
          onClick={() => setActiveTab('outreach')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Outreach Leads
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {outreachLeads.length}
            </span>
            <span className="text-xs font-bold text-blue-500">
              CSV Sheet
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Cold outreach pipeline
          </p>
        </div>

        {/* Won Closed Revenue */}
        <div 
          onClick={() => setActiveTab('clients')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Won Revenue (BDT)
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <span className="font-extrabold text-sm">৳</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {currency} {totalWon.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              {clients.length} Clients
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Total quoted: {currency} {totalAsking.toLocaleString()}
          </p>
        </div>

        {/* Collected Cash & Due */}
        <div 
          onClick={() => setActiveTab('clients')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/40 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Cash Collected
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
              {currency} {totalCollected.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-amber-500">
              Due: {currency} {totalPending.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Paid in bank / Mobile banking
          </p>
        </div>

      </div>

      {/* Main Grid: Accurate Follow-Up Notifications Board & Agency Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Accurate Follow-Up Notification Board with exact time & client */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-500" />
                <span>Client Follow-up Notice Board</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {allFollowUpNotices.length} Scheduled
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exact client name, phone number, service requirements, and scheduled follow-up time
              </p>
            </div>

            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Follow-up Cards List */}
          <div className="space-y-3">
            {allFollowUpNotices.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Pending Follow-ups</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Add a follow-up date and time when adding or editing a lead to receive notifications here.
                </p>
              </div>
            ) : (
              allFollowUpNotices.map((notice) => (
                <div
                  key={notice._id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    notice.isOverdue
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/60'
                      : notice.isToday
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {notice.name}
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                          {notice.phone}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {notice.type}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-800 dark:text-slate-200">Service:</strong> {notice.service} 
                        {notice.requirements ? ` • ${notice.requirements}` : ''}
                      </p>
                    </div>

                    {/* Follow-up Date & Time Urgency */}
                    <div className="text-right">
                      <div className={`text-xs font-bold flex items-center gap-1 sm:justify-end ${
                        notice.isOverdue ? 'text-red-600' : notice.isToday ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {notice.isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
                        {notice.isToday && <Clock className="w-3.5 h-3.5" />}
                        <span>{notice.isOverdue ? 'Overdue: ' : notice.isToday ? 'Due Today: ' : ''}{notice.followUpDate}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                        Time: {notice.followUpTime || '11:00 AM'}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <button
                      onClick={() => openWhatsApp(notice.phone, notice.name, notice.service)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Message on WhatsApp</span>
                    </button>

                    {/* Reschedule Shortcuts */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[11px] text-slate-400 font-medium">Push:</span>
                      <button
                        onClick={() => handleReschedule(notice, 1)}
                        className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200"
                      >
                        +1 Day
                      </button>
                      <button
                        onClick={() => handleReschedule(notice, 3)}
                        className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200"
                      >
                        +3 Days
                      </button>
                      <button
                        onClick={() => handleReschedule(notice, 7)}
                        className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200"
                      >
                        +1 Week
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Quick Channels & Portfolio Links */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Sales Quick Actions
            </h4>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  setEditingLead(null);
                  setIsLeadModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center justify-between"
              >
                <span>+ Add WhatsApp Lead</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('outreach')}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex items-center justify-between"
              >
                <span>📂 Import Outreach Excel / CSV</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('client-list')}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center justify-between"
              >
                <span>🔗 Categorized Demo Links</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Agency Services */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Agency Service Portfolio
            </h4>
            <div className="space-y-2">
              {(settings.services || []).map((srv) => (
                <div 
                  key={srv}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <span className="truncate pr-2">{srv}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
