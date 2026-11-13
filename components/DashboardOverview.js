'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Users, 
  Flame, 
  BellRing, 
  CheckCircle2, 
  DollarSign, 
  ArrowUpRight, 
  MessageSquare, 
  Send, 
  Clock, 
  Calendar,
  Sparkles,
  PhoneCall,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function DashboardOverview() {
  const { 
    settings, 
    leads, 
    outreachLeads, 
    clients, 
    stats, 
    dueFollowUps, 
    dueOutreachFollowUps, 
    totalNoticeCount,
    setActiveTab,
    setIsReminderModalOpen,
    setIsLeadModalOpen,
    setEditingLead,
    playNotificationChime
  } = useApp();

  const currency = settings.currencySymbol || '$';

  // Hot Leads
  const hotLeads = leads.filter(l => l.potentialityStatus === 'Hot');
  
  // Pipeline metrics
  const totalAsking = clients.reduce((acc, c) => acc + (Number(c.askingCost) || 0), 0);
  const totalWon = clients.reduce((acc, c) => acc + (Number(c.wonCost) || 0), 0);
  const totalCollected = clients.reduce((acc, c) => acc + (Number(c.paidAmount) || 0), 0);
  const totalPending = Math.max(0, totalWon - totalCollected);

  // Follow-up status
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueLeads = leads.filter(l => l.followUpDate && l.followUpDate < todayStr);
  const todayLeads = leads.filter(l => l.followUpDate && l.followUpDate === todayStr);

  // Helper for quick WhatsApp message
  const openWhatsApp = (phone, name, service) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const template = settings.whatsappTemplates?.[0]?.message || 'Hello {name}! Following up regarding {service}.';
    const msg = template
      .replace('{name}', name || 'Client')
      .replace('{service}', (Array.isArray(service) ? service[0] : service) || 'our digital agency services');
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Follow-up Notice Urgent Banner */}
      {totalNoticeCount > 0 && (
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border border-red-500/30 dark:border-red-500/40 shadow-sm animate-pulse-subtle">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500 text-white shadow-md shadow-red-500/30">
                <BellRing className="w-5 h-5 animate-bounce-gentle" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-900 dark:text-red-200 flex items-center gap-2">
                  Action Required: {totalNoticeCount} Follow-up {totalNoticeCount === 1 ? 'Notice' : 'Notices'} Due!
                  <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-extrabold">
                    Don&apos;t Lose Deals!
                  </span>
                </h3>
                <p className="text-xs text-red-700 dark:text-red-300/80 mt-0.5">
                  {overdueLeads.length} overdue and {todayLeads.length} scheduled for today. Contact leads on WhatsApp now to maintain high conversion!
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
                <span>Follow Up Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Inbound Leads */}
        <div 
          onClick={() => setActiveTab('leads')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              WhatsApp Inbound Leads
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {leads.length}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              Ad Inflow
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {hotLeads.length} Hot closing opportunities
          </p>
        </div>

        {/* Hot Potential Leads */}
        <div 
          onClick={() => setActiveTab('leads')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              High Potential Leads
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-500">
              {hotLeads.length}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              🔥 Priority Closing
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {leads.filter(l => l.potentialityStatus === 'Warm').length} Warm leads nurturing
          </p>
        </div>

        {/* Closed Won Revenue */}
        <div 
          onClick={() => setActiveTab('clients')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Won Closed Revenue
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {currency}{totalWon.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
              {clients.length} Clients
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Asking Quoted: {currency}{totalAsking.toLocaleString()}
          </p>
        </div>

        {/* Cash Collected & Balance */}
        <div 
          onClick={() => setActiveTab('clients')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/40 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Payment Collected
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-teal-500">
              {currency}{totalCollected.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-amber-500">
              Pending: {currency}{totalPending.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {Math.round((totalCollected / (totalWon || 1)) * 100)}% realization rate
          </p>
        </div>

      </div>

      {/* Grid: High Priority Hot Leads & Services Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Hot Inbound WhatsApp Leads (Action Center) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Hot Leads & Immediate Actions</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {hotLeads.length} Hot
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct WhatsApp contact, requirement details & follow-up notices
              </p>
            </div>

            <button
              onClick={() => setActiveTab('leads')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All Leads</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {hotLeads.length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hot leads marked currently. Update potentiality status on your inbound leads!</p>
              </div>
            ) : (
              hotLeads.map((lead) => {
                const isOverdue = lead.followUpDate && lead.followUpDate < todayStr;
                const isDueToday = lead.followUpDate && lead.followUpDate === todayStr;

                return (
                  <div 
                    key={lead._id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {lead.name}
                        </span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {lead.phone}
                        </span>
                        
                        {/* Notice Tag */}
                        {isOverdue && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" /> Overdue: {lead.followUpDate}
                          </span>
                        )}
                        {isDueToday && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Due Today ({lead.followUpTime || '11:00'})
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                        {lead.requirements || 'Requirements not specified yet'}
                      </p>

                      <div className="flex flex-wrap gap-1.5 items-center">
                        {(lead.services || []).map((srv) => (
                          <span 
                            key={srv}
                            className="px-2 py-0.5 text-[10px] rounded-md font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40"
                          >
                            {srv}
                          </span>
                        ))}
                        <span className="text-[10px] text-slate-400 font-medium">
                          Proposal: {lead.proposalSentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {/* WhatsApp Direct Action Button */}
                      <button
                        onClick={() => openWhatsApp(lead.phone, lead.name, lead.services)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 flex items-center gap-1.5 transition-colors"
                        title="Open WhatsApp with greeting"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      {/* Edit / View Lead Details */}
                      <button
                        onClick={() => {
                          setEditingLead(lead);
                          setIsLeadModalOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Agency Services & Quick Add Outreach */}
        <div className="space-y-6">
          
          {/* Services Portfolio */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              Active Agency Services
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Dynamically offered & trackable in client requirements
            </p>

            <div className="space-y-2.5">
              {(settings.services || []).map((srv, index) => {
                const count = leads.filter(l => (l.services || []).includes(srv)).length;
                return (
                  <div 
                    key={srv}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-2">
                      {srv}
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {count} {count === 1 ? 'Lead' : 'Leads'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cold Outreach CSV Quick Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent border border-blue-500/20 shadow-sm">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Outreach & CSV Import
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Upload lead CSVs and manage them in an organized interactive spreadsheet.
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {outreachLeads.length} Cold Leads Tracked
              </span>
              <button
                onClick={() => setActiveTab('outreach')}
                className="px-3 py-1.5 font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm"
              >
                Open CSV Sheet
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

