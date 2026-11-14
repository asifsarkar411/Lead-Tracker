'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import DateFilterBar from '@/components/DateFilterBar';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  ChevronDown,
  UserCheck,
  Flame,
  Zap,
  Moon,
  ExternalLink,
  PhoneCall,
  PhoneOff,
  LayoutGrid
} from 'lucide-react';
import { parseExcelOrCsvFile, exportToExcel, exportToCsv } from '@/lib/excelUtils';

export default function LeadsView() {
  const { 
    leads, 
    saveLead, 
    removeLead, 
    importLeadsBatch,
    setEditingLead, 
    setIsLeadModalOpen, 
    setIsMeetingModalOpen,
    setEditingMeeting,
    settings, 
    searchTerm, 
    setSearchTerm,
    convertToClient
  } = useApp();

  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedOnboardStatus, setSelectedOnboardStatus] = useState('All');
  const [selectedProposal, setSelectedProposal] = useState('All');
  const [selectedCallStatus, setSelectedCallStatus] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Modals & previews
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [activeLeadForNotes, setActiveLeadForNotes] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [isSavingBatch, setIsSavingBatch] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Quick WhatsApp Launcher
  const handleOpenWhatsApp = (phone, name, requirement) => {
    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    const serviceName = requirement || 'website development and digital marketing';
    const template = settings.whatsappTemplates?.[0]?.message || 'Hello {name}! Following up regarding {service}.';
    const text = template
      .replace('{name}', name || 'Client')
      .replace('{service}', serviceName);

    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      alert('No numeric phone number found for WhatsApp direct launcher.');
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = 
          lead.name?.toLowerCase().includes(q) ||
          lead.phone?.toLowerCase().includes(q) ||
          lead.requirements?.toLowerCase().includes(q) ||
          lead.latestFeedback?.toLowerCase().includes(q) ||
          lead.platform?.toLowerCase().includes(q) ||
          lead.firstFollowUp?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Priority
      if (selectedPriority !== 'All' && lead.priority !== selectedPriority) {
        return false;
      }

      // Onboard status
      if (selectedOnboardStatus !== 'All' && lead.onboardStatus !== selectedOnboardStatus) {
        return false;
      }

      // Proposal
      if (selectedProposal !== 'All' && lead.proposalSentStatus !== selectedProposal) {
        return false;
      }

      // Call status
      if (selectedCallStatus === 'Received' && lead.callNotReceived) return false;
      if (selectedCallStatus === 'NotReceived' && !lead.callNotReceived) return false;

      return true;
    });
  }, [leads, searchTerm, selectedPriority, selectedOnboardStatus, selectedProposal, selectedCallStatus]);

  // Quick In-Line Cell Update
  const handleQuickUpdate = async (id, field, value) => {
    await saveLead({ _id: id, [field]: value });
  };

  // Export handlers
  const handleExportExcel = () => {
    const exportData = filteredLeads.map((l) => ({
      'Date': l.createdAt ? l.createdAt.split('T')[0] : todayStr,
      'Not receive call': l.callNotReceived ? 'TRUE' : 'FALSE',
      'WhatsApp Number': l.phone || '',
      'Requirement': l.requirements || '',
      'Priority': l.priority || 'Medium ⚡',
      'Proposal Status': l.proposalSentStatus || 'Not Sent',
      'Onboard Status': l.onboardStatus || 'New Lead',
      '1st Follow-Up': l.firstFollowUp || '',
      '2nd Follow-Up': l.secondFollowUp || '',
      '3rd Follow-Up': l.thirdFollowUp || '',
      'Latest Feedback': l.latestFeedback || '',
      'Next Action': l.nextAction || 'Follow Up',
      'Deal Value (৳)': l.dealValue || 0,
      'Platform': l.platform || '',
      'Campaign Name': l.campaignName || '',
      'Ad Creative / Type': l.adCreative || ''
    }));

    exportToExcel(exportData, `WhatsApp_Leads_${todayStr}.xlsx`, 'November');
  };

  const handleExportCsvFile = () => {
    const exportData = filteredLeads.map((l) => ({
      'Date': l.createdAt ? l.createdAt.split('T')[0] : todayStr,
      'Not receive call': l.callNotReceived ? 'TRUE' : 'FALSE',
      'WhatsApp Number': l.phone || '',
      'Requirement': l.requirements || '',
      'Priority': l.priority || 'Medium ⚡',
      'Proposal Status': l.proposalSentStatus || 'Not Sent',
      'Onboard Status': l.onboardStatus || 'New Lead',
      '1st Follow-Up': l.firstFollowUp || '',
      '2nd Follow-Up': l.secondFollowUp || '',
      '3rd Follow-Up': l.thirdFollowUp || '',
      'Latest Feedback': l.latestFeedback || '',
      'Next Action': l.nextAction || 'Follow Up',
      'Deal Value (৳)': l.dealValue || 0,
      'Platform': l.platform || '',
      'Campaign Name': l.campaignName || '',
      'Ad Creative / Type': l.adCreative || ''
    }));

    exportToCsv(exportData, `WhatsApp_Leads_${todayStr}.csv`);
  };

  // Import handler (.xlsx, .xls, .csv)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedLeads = await parseExcelOrCsvFile(file, 'whatsapp');
      if (!parsedLeads || parsedLeads.length === 0) {
        alert('No valid WhatsApp leads found in the file. Please check file format.');
        return;
      }
      setImportPreview(parsedLeads);
    } catch (err) {
      alert('Error parsing file: ' + err.message);
    }
  };

  const handleSaveImportedBatch = async () => {
    if (importPreview.length === 0) return;
    setIsSavingBatch(true);
    try {
      await importLeadsBatch(importPreview);
      setIsImportModalOpen(false);
      setImportPreview([]);
    } catch (err) {
      alert('Error saving batch: ' + err.message);
    } finally {
      setIsSavingBatch(false);
    }
  };

  // Add note to active lead
  const handleAddNote = async () => {
    if (!newNoteText.trim() || !activeLeadForNotes) return;
    const existing = activeLeadForNotes.followUpNotes || [];
    const updatedNotes = [
      ...existing,
      {
        _id: 'fn_' + Date.now(),
        date: new Date().toISOString(),
        note: newNoteText.trim(),
        outcome: 'Connected'
      }
    ];

    await saveLead({
      _id: activeLeadForNotes._id,
      followUpNotes: updatedNotes,
      latestFeedback: newNoteText.trim()
    });

    setActiveLeadForNotes({
      ...activeLeadForNotes,
      followUpNotes: updatedNotes,
      latestFeedback: newNoteText.trim()
    });
    setNewNoteText('');
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Date Filter Bar */}
      <DateFilterBar />

      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
            <span>WhatsApp Leads Table</span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {filteredLeads.length} Leads
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive spreadsheet view for all inbound WhatsApp leads. Import & Export matching your master workbook format.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle (Table / Mobile Cards) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
              title="Table View"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === 'cards' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
              title="Mobile Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Export Excel (.xlsx) */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-200 dark:border-emerald-800"
            title="Download Excel Spreadsheet (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsvFile}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Download CSV (.csv)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Import Excel / CSV */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Excel / CSV</span>
          </button>

          {/* Add Inbound Lead */}
          <button
            onClick={() => {
              setEditingLead(null);
              setIsLeadModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add WhatsApp Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search phone, handle, feedback..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Priorities</option>
              <option value="High 🔥">🔥 High Priority</option>
              <option value="Medium ⚡">⚡ Medium Priority</option>
              <option value="Low 💤">💤 Low Priority</option>
            </select>
          </div>

          {/* Onboard Status Filter */}
          <div>
            <select
              value={selectedOnboardStatus}
              onChange={(e) => setSelectedOnboardStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Onboard Status</option>
              <option value="New Lead">New Lead</option>
              <option value="In Contact">In Contact</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Onboarded / Won 🎉">Won / Onboarded 🎉</option>
              <option value="Lost ❌">Lost ❌</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          {/* Proposal Status */}
          <div>
            <select
              value={selectedProposal}
              onChange={(e) => setSelectedProposal(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Proposal Status</option>
              <option value="Not Sent">Not Sent</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Requirement Gathering">Requirement Gathering</option>
              <option value="Under Review">Under Review</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Call Received Filter */}
          <div>
            <select
              value={selectedCallStatus}
              onChange={(e) => setSelectedCallStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Calls</option>
              <option value="Received">📞 Call Received</option>
              <option value="NotReceived">❌ Call Not Received</option>
            </select>
          </div>

        </div>
      </div>

      {/* View Mode: Table or Mobile App Cards */}
      {viewMode === 'table' ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[700px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">SL</th>
                  <th className="py-3 px-3.5 min-w-[105px]">Date</th>
                  <th className="py-3 px-3.5 min-w-[130px]">Call Status</th>
                  <th className="py-3 px-4 min-w-[170px]">WhatsApp / Handle</th>
                  <th className="py-3 px-4 min-w-[160px]">Requirement</th>
                  <th className="py-3 px-3.5 min-w-[125px]">Priority</th>
                  <th className="py-3 px-3.5 min-w-[130px]">Proposal Status</th>
                  <th className="py-3 px-3.5 min-w-[145px]">Onboard Status</th>
                  <th className="py-3 px-4 min-w-[180px]">1st Follow-Up</th>
                  <th className="py-3 px-4 min-w-[180px]">Latest Feedback</th>
                  <th className="py-3 px-3.5 min-w-[125px]">Next Action</th>
                  <th className="py-3 px-3.5 min-w-[110px]">Deal Value</th>
                  <th className="py-3 px-3.5 min-w-[120px]">Platform</th>
                  <th className="py-3 px-4 text-right min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-16 text-center text-slate-400">
                      <div className="max-w-sm mx-auto space-y-2">
                        <FileSpreadsheet className="w-10 h-10 mx-auto opacity-50 text-emerald-500" />
                        <h4 className="font-bold text-slate-700 dark:text-slate-300">No WhatsApp Leads Found</h4>
                        <p className="text-xs text-slate-500">
                          No leads match current filter. Click &quot;Import Excel / CSV&quot; to import your workbook.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, index) => {
                    const leadDate = lead.createdAt ? lead.createdAt.split('T')[0] : (lead.date || todayStr);
                    const isCallFailed = lead.callNotReceived;

                    return (
                      <tr 
                        key={lead._id || index}
                        className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* SL */}
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {index + 1}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {leadDate}
                        </td>

                        {/* Call Status Badge (Toggleable) */}
                        <td className="py-3 px-3.5">
                          <button
                            onClick={() => handleQuickUpdate(lead._id, 'callNotReceived', !lead.callNotReceived)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                              isCallFailed
                                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60'
                            }`}
                            title="Click to toggle call status"
                          >
                            {isCallFailed ? (
                              <>
                                <PhoneOff className="w-2.5 h-2.5" />
                                <span>Not Received</span>
                              </>
                            ) : (
                              <>
                                <PhoneCall className="w-2.5 h-2.5" />
                                <span>Received</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Phone / WhatsApp / Handle */}
                        <td className="py-3 px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenWhatsApp(lead.phone, lead.name, lead.requirements)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                              title="Open WhatsApp chat"
                            >
                              <Phone className="w-3 h-3 text-emerald-500" />
                              <span className="truncate max-w-[130px]">{lead.phone || lead.name}</span>
                            </button>
                            <button
                              onClick={() => handleCopy(lead.phone || lead.name, lead._id)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Copy number"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Requirement */}
                        <td className="py-3 px-4">
                          <div className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-2 max-w-[180px]" title={lead.requirements}>
                            {lead.requirements || 'Website Development'}
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-3.5">
                          <select
                            value={lead.priority || 'Medium ⚡'}
                            onChange={(e) => handleQuickUpdate(lead._id, 'priority', e.target.value)}
                            className="px-2 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            <option value="High 🔥">🔥 High</option>
                            <option value="Medium ⚡">⚡ Medium</option>
                            <option value="Low 💤">💤 Low</option>
                          </select>
                        </td>

                        {/* Proposal Status */}
                        <td className="py-3 px-3.5">
                          <select
                            value={lead.proposalSentStatus || 'Not Sent'}
                            onChange={(e) => handleQuickUpdate(lead._id, 'proposalSentStatus', e.target.value)}
                            className="px-2 py-1 text-[11px] font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            <option value="Not Sent">Not Sent</option>
                            <option value="Proposal Sent">Proposal Sent</option>
                            <option value="Requirement Gathering">Requirement Gathering</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>

                        {/* Onboard Status */}
                        <td className="py-3 px-3.5">
                          <select
                            value={lead.onboardStatus || 'New Lead'}
                            onChange={(e) => handleQuickUpdate(lead._id, 'onboardStatus', e.target.value)}
                            className={`px-2 py-1 text-[11px] font-bold rounded-xl border cursor-pointer ${
                              lead.onboardStatus?.includes('Won') || lead.onboardStatus?.includes('Onboarded')
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                : lead.onboardStatus?.includes('Lost')
                                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            <option value="New Lead">New Lead</option>
                            <option value="In Contact">In Contact</option>
                            <option value="Proposal Sent">Proposal Sent</option>
                            <option value="Onboarded / Won 🎉">Won 🎉</option>
                            <option value="Lost ❌">Lost ❌</option>
                            <option value="On Hold">On Hold</option>
                          </select>
                        </td>

                        {/* 1st Follow-Up */}
                        <td className="py-3 px-4">
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 max-w-[180px]" title={lead.firstFollowUp}>
                            {lead.firstFollowUp || '-'}
                          </span>
                        </td>

                        {/* Latest Feedback */}
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 line-clamp-2 max-w-[180px]" title={lead.latestFeedback}>
                            {lead.latestFeedback || '-'}
                          </span>
                        </td>

                        {/* Next Action */}
                        <td className="py-3 px-3.5">
                          <span className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                            {lead.nextAction || 'Follow Up'}
                          </span>
                        </td>

                        {/* Deal Value */}
                        <td className="py-3 px-3.5 font-bold font-mono text-slate-900 dark:text-white">
                          {lead.dealValue ? `৳${lead.dealValue.toLocaleString()}` : '-'}
                        </td>

                        {/* Platform */}
                        <td className="py-3 px-3.5 text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[110px]" title={lead.platform}>
                          {lead.platform || 'Facebook'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingMeeting({
                                  title: `Demo Call with ${lead.name || lead.phone}`,
                                  clientName: lead.name || lead.phone,
                                  phone: lead.phone,
                                  meetingDate: todayStr,
                                  agenda: `Discuss ${lead.requirements || 'Website Development'} & present demo links.`
                                });
                                setIsMeetingModalOpen(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                              title="Schedule Client Meeting / Call"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setActiveLeadForNotes(lead)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                              title="View/Add Follow-up Notes"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => convertToClient(lead)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                              title="Convert to Onboarded Client"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingLead(lead);
                                setIsLeadModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Lead Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete lead ${lead.phone || lead.name}?`)) {
                                  removeLead(lead._id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Mobile Cards View (Web Application Responsive Feed) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              <FileSpreadsheet className="w-10 h-10 mx-auto opacity-50 text-emerald-500 mb-2" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">No WhatsApp Leads Found</h4>
              <p className="text-xs text-slate-500">No leads match current filter.</p>
            </div>
          ) : (
            filteredLeads.map((lead, index) => {
              const isCallFailed = lead.callNotReceived;
              const leadDate = lead.createdAt ? lead.createdAt.split('T')[0] : (lead.date || todayStr);

              return (
                <div 
                  key={lead._id || index}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                        <span className="truncate max-w-[150px]">{lead.phone || lead.name}</span>
                        <button
                          onClick={() => handleCopy(lead.phone || lead.name, lead._id)}
                          className="text-slate-400 hover:text-slate-600"
                          title="Copy"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">{leadDate}</span>
                    </div>

                    <button
                      onClick={() => handleQuickUpdate(lead._id, 'callNotReceived', !lead.callNotReceived)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        isCallFailed
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60'
                      }`}
                    >
                      {isCallFailed ? <PhoneOff className="w-2.5 h-2.5" /> : <PhoneCall className="w-2.5 h-2.5" />}
                      <span>{isCallFailed ? 'Not Received' : 'Call Received'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Requirement</span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {lead.requirements || 'Website Development'}
                    </p>
                  </div>

                  {/* Big Touch WhatsApp Launcher Button */}
                  <button
                    onClick={() => handleOpenWhatsApp(lead.phone, lead.name, lead.requirements)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Priority</label>
                      <select
                        value={lead.priority || 'Medium ⚡'}
                        onChange={(e) => handleQuickUpdate(lead._id, 'priority', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="High 🔥">🔥 High</option>
                        <option value="Medium ⚡">⚡ Medium</option>
                        <option value="Low 💤">💤 Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Onboard Status</label>
                      <select
                        value={lead.onboardStatus || 'New Lead'}
                        onChange={(e) => handleQuickUpdate(lead._id, 'onboardStatus', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="New Lead">New Lead</option>
                        <option value="In Contact">In Contact</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Onboarded / Won 🎉">Won 🎉</option>
                        <option value="Lost ❌">Lost ❌</option>
                        <option value="On Hold">On Hold</option>
                      </select>
                    </div>
                  </div>

                  {(lead.latestFeedback || lead.firstFollowUp) && (
                    <div className="text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      {lead.firstFollowUp && (
                        <p className="text-slate-600 dark:text-slate-400 truncate">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">1st: </span>
                          {lead.firstFollowUp}
                        </p>
                      )}
                      {lead.latestFeedback && (
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          <span className="font-semibold text-emerald-600">Feedback: </span>
                          {lead.latestFeedback}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {lead.dealValue ? `৳${lead.dealValue.toLocaleString()}` : '৳0'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {lead.platform || 'WhatsApp'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingMeeting({
                            title: `Demo Call with ${lead.name || lead.phone}`,
                            clientName: lead.name || lead.phone,
                            phone: lead.phone,
                            meetingDate: todayStr,
                            agenda: `Discuss ${lead.requirements || 'Website Development'} & present demo links.`
                          });
                          setIsMeetingModalOpen(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg"
                        title="Schedule Meeting"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setActiveLeadForNotes(lead)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg"
                        title="Notes"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => convertToClient(lead)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg"
                        title="Convert to Won Client"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingLead(lead);
                          setIsLeadModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeLead(lead._id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Notes / History Drawer Modal */}
      {activeLeadForNotes && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Follow-Up History & Notes</h3>
                <p className="text-xs text-slate-500 font-mono">{activeLeadForNotes.phone || activeLeadForNotes.name}</p>
              </div>
              <button
                onClick={() => setActiveLeadForNotes(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Note list */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {(activeLeadForNotes.followUpNotes || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">No recorded notes yet.</p>
              ) : (
                (activeLeadForNotes.followUpNotes || []).map((n, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                    <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {n.date ? new Date(n.date).toLocaleString() : 'Recent'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Add note */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Add New Follow-Up Note</label>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Enter client conversation summary, feedback, or promised dates..."
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveLeadForNotes(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel / CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span>Import WhatsApp Master Excel / CSV</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload your WhatsApp lead sheet (e.g. &quot;WhatsApp_IT_Lead_Tracker.xlsx&quot; or any CSV).
                </p>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportPreview([]);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* File Upload Zone */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-800/50">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                id="whatsapp-file-upload"
                className="hidden"
              />
              <label htmlFor="whatsapp-file-upload" className="cursor-pointer space-y-2 block">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-blue-500" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click to select Excel (.xlsx) or CSV file
                </div>
                <div className="text-[11px] text-slate-400">
                  Supports multi-sheet workbooks (`November`, `3smediMarketing`, etc.)
                </div>
              </label>
            </div>

            {/* Preview Section */}
            {importPreview.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Detected {importPreview.length} Valid Leads Ready to Save</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">✓ Format Recognized</span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {importPreview.slice(0, 10).map((l, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between bg-white dark:bg-slate-900">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{l.phone || l.name}</div>
                        <div className="text-[11px] text-slate-500">{l.requirements} • {l.platform || 'WhatsApp'}</div>
                      </div>
                      <div className="text-right font-mono text-[11px] text-slate-500">
                        {l.priority}
                      </div>
                    </div>
                  ))}
                  {importPreview.length > 10 && (
                    <div className="p-2 text-center text-slate-400 text-[11px] bg-slate-50 dark:bg-slate-800">
                      + {importPreview.length - 10} more leads will be imported
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportPreview([]);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveImportedBatch}
                disabled={importPreview.length === 0 || isSavingBatch}
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all"
              >
                {isSavingBatch ? 'Saving...' : `Import ${importPreview.length} Leads`}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
