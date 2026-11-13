'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Phone, 
  Calendar, 
  Clock, 
  Send, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Flame, 
  Snowflake, 
  SunMedium, 
  FileText,
  AlertCircle,
  ExternalLink,
  UserCheck
} from 'lucide-react';

export default function LeadsView() {
  const { 
    leads, 
    settings, 
    setIsLeadModalOpen, 
    setEditingLead, 
    removeLead, 
    convertToClient,
    searchTerm,
    setSearchTerm
  } = useApp();

  const [selectedPotential, setSelectedPotential] = useState('All');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedProposal, setSelectedProposal] = useState('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All'); // 'All', 'Overdue', 'Today', 'Upcoming'

  const todayStr = new Date().toISOString().split('T')[0];

  // Quick WhatsApp Launcher
  const handleOpenWhatsApp = (phone, name, services) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const serviceName = Array.isArray(services) && services.length > 0 ? services[0] : 'our services';
    const template = settings.whatsappTemplates?.[0]?.message || 'Hello {name}! Following up regarding {service}.';
    const text = template
      .replace('{name}', name || 'Client')
      .replace('{service}', serviceName);

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = 
          lead.name?.toLowerCase().includes(q) ||
          lead.phone?.includes(q) ||
          lead.requirements?.toLowerCase().includes(q) ||
          (lead.services || []).some(s => s.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Potentiality
      if (selectedPotential !== 'All' && lead.potentialityStatus !== selectedPotential) {
        return false;
      }

      // Service
      if (selectedService !== 'All' && !(lead.services || []).includes(selectedService)) {
        return false;
      }

      // Proposal
      if (selectedProposal !== 'All' && lead.proposalSentStatus !== selectedProposal) {
        return false;
      }

      // Follow-up Date Filter
      if (selectedDateFilter === 'Overdue') {
        return lead.followUpDate && lead.followUpDate < todayStr;
      } else if (selectedDateFilter === 'Today') {
        return lead.followUpDate && lead.followUpDate === todayStr;
      } else if (selectedDateFilter === 'Upcoming') {
        return lead.followUpDate && lead.followUpDate > todayStr;
      }

      return true;
    });
  }, [leads, searchTerm, selectedPotential, selectedService, selectedProposal, selectedDateFilter, todayStr]);

  const getPotentialBadge = (status) => {
    switch (status) {
      case 'Hot':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Flame className="w-3 h-3 text-amber-500" /> Hot Deal
          </span>
        );
      case 'Warm':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <SunMedium className="w-3 h-3 text-emerald-500" /> Warm
          </span>
        );
      case 'Cold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Snowflake className="w-3 h-3 text-blue-400" /> Cold
          </span>
        );
      case 'Converted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <CheckCircle className="w-3 h-3 text-purple-500" /> Won Client
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const getProposalBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Accepted</span>;
      case 'Sent':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Sent</span>;
      case 'Under Review':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Under Review</span>;
      case 'Drafted':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Drafted</span>;
      case 'Rejected':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Not Sent</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & New Lead Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>WhatsApp & Inbound Leads</span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {leads.length} Total
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Collected via ads and direct WhatsApp inquiries. Track services, requirements, proposal status & follow-up notices.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingLead(null);
            setIsLeadModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Inbound Lead</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Potentiality Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 mb-1">
              Potentiality
            </label>
            <select
              value={selectedPotential}
              onChange={(e) => setSelectedPotential(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="All">All Potentialities</option>
              <option value="Hot">🔥 Hot Deal</option>
              <option value="Warm">☀️ Warm</option>
              <option value="Cold">❄️ Cold</option>
              <option value="Converted">🏆 Converted</option>
              <option value="Lost">❌ Lost</option>
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 mb-1">
              Service Requested
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="All">All Services</option>
              {(settings.services || []).map((srv) => (
                <option key={srv} value={srv}>{srv}</option>
              ))}
            </select>
          </div>

          {/* Proposal Status */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 mb-1">
              Proposal Status
            </label>
            <select
              value={selectedProposal}
              onChange={(e) => setSelectedProposal(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="All">All Proposals</option>
              <option value="Not Sent">Not Sent</option>
              <option value="Drafted">Drafted</option>
              <option value="Sent">Sent</option>
              <option value="Under Review">Under Review</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Follow-up Notice Urgency */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 mb-1">
              Follow-up Notice
            </label>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="All">All Follow-up Dates</option>
              <option value="Overdue">🚨 Overdue Notice</option>
              <option value="Today">⏰ Due Today</option>
              <option value="Upcoming">📅 Upcoming</option>
            </select>
          </div>

        </div>
      </div>

      {/* Leads List / Cards */}
      <div className="space-y-4">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <MessageSquare className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No leads match your filters</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria or add a new WhatsApp lead to start tracking!
            </p>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const isOverdue = lead.followUpDate && lead.followUpDate < todayStr;
            const isDueToday = lead.followUpDate && lead.followUpDate === todayStr;
            const followUpCount = (lead.followUpNotes || []).length;
            const lastNote = followUpCount > 0 ? lead.followUpNotes[followUpCount - 1] : null;

            return (
              <div
                key={lead._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header Row: Name, Phone, Potentiality, Date Notice */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {lead.name}
                      </h3>
                      
                      {/* WhatsApp Phone with click action */}
                      <button
                        onClick={() => handleOpenWhatsApp(lead.phone, lead.name, lead.services)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                        title="Click to chat on WhatsApp"
                      >
                        <Phone className="w-3 h-3 text-emerald-500" />
                        <span>{lead.phone}</span>
                      </button>

                      {getPotentialBadge(lead.potentialityStatus)}
                    </div>

                    {lead.email && (
                      <p className="text-xs text-slate-400">
                        {lead.email}
                      </p>
                    )}
                  </div>

                  {/* Follow-up Date Notice Badge */}
                  <div className="flex items-center gap-2">
                    {lead.followUpDate ? (
                      <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                        isOverdue 
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800 animate-pulse'
                          : isDueToday 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
                        {isDueToday && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        {!isOverdue && !isDueToday && <Calendar className="w-3.5 h-3.5 text-slate-500" />}
                        <span>
                          {isOverdue ? 'Overdue Notice: ' : isDueToday ? 'Due Today: ' : 'Follow-up: '}
                          {lead.followUpDate} ({lead.followUpTime || '11:00'})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        No follow-up date set
                      </span>
                    )}
                  </div>
                </div>

                {/* Requirements & Services Row */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="font-semibold text-slate-900 dark:text-white mr-1.5">Requirements:</span>
                    {lead.requirements || 'No specific requirements logged.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-slate-400 font-medium mr-1">Services:</span>
                    {(lead.services || []).map((srv) => (
                      <span 
                        key={srv}
                        className="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        {srv}
                      </span>
                    ))}

                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">Proposal:</span>
                      {getProposalBadge(lead.proposalSentStatus)}
                    </div>
                  </div>
                </div>

                {/* Multiple Follow-up Notes Timeline Preview */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      <strong>{followUpCount}</strong> follow-up {followUpCount === 1 ? 'note' : 'notes'} recorded
                    </span>
                    {lastNote && (
                      <span className="truncate max-w-xs sm:max-w-md italic text-slate-600 dark:text-slate-300">
                        • &quot;{lastNote.note}&quot; ({lastNote.outcome || 'Note'})
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    
                    {/* Direct WhatsApp Message */}
                    <button
                      onClick={() => handleOpenWhatsApp(lead.phone, lead.name, lead.services)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 flex items-center gap-1.5 transition-colors"
                      title="Send WhatsApp Follow-up"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp Chat</span>
                    </button>

                    {/* Convert to Onboarded Client */}
                    <button
                      onClick={() => convertToClient(lead)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl text-purple-700 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900 flex items-center gap-1.5 transition-colors"
                      title="Convert this lead into an Onboarded Client"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Onboard Deal</span>
                    </button>

                    {/* Edit Lead & Add Follow-up Notes */}
                    <button
                      onClick={() => {
                        setEditingLead(lead);
                        setIsLeadModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Lead & Follow-up Notes"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Lead */}
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete lead "${lead.name}"?`)) {
                          removeLead(lead._id);
                        }
                      }}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

