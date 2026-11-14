'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import DateFilterBar from './DateFilterBar';
import { parseExcelOrCsvFile, exportToExcel, exportToCsv } from '@/lib/excelUtils';
import { 
  Plus, 
  Search, 
  Phone, 
  Send, 
  Calendar, 
  Clock, 
  FileText, 
  Trash2, 
  Edit3, 
  UserCheck, 
  Download, 
  Upload, 
  FileSpreadsheet,
  Flame, 
  CheckCircle,
  AlertCircle,
  X,
  FileUp
} from 'lucide-react';

export default function LeadsView() {
  const { 
    leads, 
    settings, 
    saveLead,
    importLeadsBatch,
    removeLead, 
    convertToClient,
    setIsLeadModalOpen, 
    setEditingLead,
    searchTerm,
    setSearchTerm
  } = useApp();

  const [selectedPotential, setSelectedPotential] = useState('All');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedProposal, setSelectedProposal] = useState('All');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [rawText, setRawText] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Quick WhatsApp Launcher
  const handleOpenWhatsApp = (phone, name, services) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const serviceName = Array.isArray(services) && services.length > 0 ? services[0] : 'our digital marketing services';
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

      return true;
    });
  }, [leads, searchTerm, selectedPotential, selectedService, selectedProposal]);

  // Quick In-Line Cell Update
  const handleQuickUpdate = async (id, field, value) => {
    await saveLead({ _id: id, [field]: value });
  };

  // Export handlers
  const handleExportExcel = () => {
    const exportData = filteredLeads.map((l, index) => ({
      'SL': index + 1,
      'Date': l.createdAt ? l.createdAt.split('T')[0] : todayStr,
      'Client Name': l.name || '',
      'WhatsApp Phone': l.phone || '',
      'Email': l.email || '',
      'Requirements': l.requirements || '',
      'Services': (l.services || []).join(', '),
      'Potentiality Status': l.potentialityStatus || 'Warm',
      'Proposal Status': l.proposalSentStatus || 'Not Sent',
      'Follow-up Date': l.followUpDate || '',
      'Follow-up Time': l.followUpTime || '11:00 AM',
      'Notes Count': (l.followUpNotes || []).length,
      'Budget (BDT)': l.estimatedBudget || 0
    }));

    exportToExcel(exportData, `WhatsApp_Leads_${todayStr}.xlsx`, 'Leads');
  };

  const handleExportCsvFile = () => {
    const exportData = filteredLeads.map((l, index) => ({
      'SL': index + 1,
      'Date': l.createdAt ? l.createdAt.split('T')[0] : todayStr,
      'Client Name': l.name || '',
      'WhatsApp Phone': l.phone || '',
      'Email': l.email || '',
      'Requirements': l.requirements || '',
      'Services': (l.services || []).join(', '),
      'Potentiality Status': l.potentialityStatus || 'Warm',
      'Proposal Status': l.proposalSentStatus || 'Not Sent',
      'Follow-up Date': l.followUpDate || '',
      'Follow-up Time': l.followUpTime || '11:00 AM'
    }));

    exportToCsv(exportData, `WhatsApp_Leads_${todayStr}.csv`);
  };

  // Import handler (.xlsx, .xls, .csv)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rows = await parseExcelOrCsvFile(file);
      processImportRows(rows);
    } catch (err) {
      alert('Error parsing file: ' + err.message);
    }
  };

  const processImportRows = (rows) => {
    if (!rows || rows.length === 0) return;

    const formatted = rows.map((r, idx) => {
      // Find key matching name, phone, service, reqs, etc.
      const keys = Object.keys(r);
      const nameKey = keys.find(k => /name|client/i.test(k));
      const phoneKey = keys.find(k => /phone|whatsapp|mobile|contact/i.test(k));
      const reqKey = keys.find(k => /req|detail|note|inquir/i.test(k));
      const srvKey = keys.find(k => /service|category/i.test(k));
      const dateKey = keys.find(k => /date|created/i.test(k));
      const potKey = keys.find(k => /poten|status/i.test(k));

      const name = nameKey ? String(r[nameKey]).trim() : `Lead #${idx + 1}`;
      const phone = phoneKey ? String(r[phoneKey]).trim() : '';
      const requirements = reqKey ? String(r[reqKey]).trim() : '';
      const servicesStr = srvKey ? String(r[srvKey]).trim() : 'Website Development';
      const services = servicesStr.includes(',') ? servicesStr.split(',').map(s => s.trim()) : [servicesStr];
      const potentialityStatus = potKey && ['Hot', 'Warm', 'Cold', 'Converted', 'Lost'].includes(r[potKey]) 
        ? r[potKey] 
        : 'Warm';

      return {
        name,
        phone,
        requirements,
        services: services.filter(Boolean),
        potentialityStatus,
        proposalSentStatus: 'Not Sent',
        followUpDate: todayStr,
        followUpTime: '11:00 AM',
        createdAt: dateKey && r[dateKey] ? String(r[dateKey]) : new Date().toISOString(),
        followUpNotes: []
      };
    });

    setImportPreview(formatted.filter(item => item.name && item.phone));
  };

  const handleSaveImportedBatch = async () => {
    if (importPreview.length === 0) return;
    await importLeadsBatch(importPreview);
    setIsImportModalOpen(false);
    setImportPreview([]);
    setRawText('');
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
            Interactive spreadsheet view for all inbound WhatsApp leads. Import & Export as Excel (.xlsx) or CSV.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
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
            <span>Add Inbound Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Search Lead
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Name, phone, service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Potentiality Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Potentiality
            </label>
            <select
              value={selectedPotential}
              onChange={(e) => setSelectedPotential(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
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
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Service Requested
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Services</option>
              {(settings.services || []).map((srv) => (
                <option key={srv} value={srv}>{srv}</option>
              ))}
            </select>
          </div>

          {/* Proposal Status */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Proposal Status
            </label>
            <select
              value={selectedProposal}
              onChange={(e) => setSelectedProposal(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
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

        </div>
      </div>

      {/* Excel-like Arranged Table View */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[650px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3.5 w-10 text-center">SL</th>
                <th className="py-3 px-4 min-w-[120px]">Date</th>
                <th className="py-3 px-4 min-w-[160px]">Client Name</th>
                <th className="py-3 px-4 min-w-[150px]">WhatsApp Phone</th>
                <th className="py-3 px-4 min-w-[200px]">Requirements</th>
                <th className="py-3 px-4 min-w-[160px]">Services</th>
                <th className="py-3 px-4 min-w-[140px]">Potentiality</th>
                <th className="py-3 px-4 min-w-[140px]">Proposal Status</th>
                <th className="py-3 px-4 min-w-[150px]">Follow-up Notice</th>
                <th className="py-3 px-4 min-w-[110px]">Notes</th>
                <th className="py-3 px-4 text-right min-w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <FileSpreadsheet className="w-10 h-10 mx-auto opacity-50 text-emerald-500" />
                      <h4 className="font-bold text-slate-700 dark:text-slate-300">No WhatsApp Leads Found</h4>
                      <p className="text-xs text-slate-500">
                        Your WhatsApp lead sheet is currently fresh and clean. Click &quot;Add Inbound Lead&quot; or import an Excel/CSV file to start tracking.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, index) => {
                  const isOverdue = lead.followUpDate && lead.followUpDate < todayStr;
                  const isDueToday = lead.followUpDate && lead.followUpDate === todayStr;
                  const noteCount = (lead.followUpNotes || []).length;
                  const leadDate = lead.createdAt ? lead.createdAt.split('T')[0] : todayStr;

                  return (
                    <tr 
                      key={lead._id}
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* SL */}
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {leadDate}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {lead.name}
                        </div>
                        {lead.email && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {lead.email}
                          </div>
                        )}
                      </td>

                      {/* Phone with 1-click WhatsApp */}
                      <td className="py-3 px-4 font-mono">
                        <button
                          onClick={() => handleOpenWhatsApp(lead.phone, lead.name, lead.services)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                          title="Click to chat on WhatsApp"
                        >
                          <Phone className="w-3 h-3 text-emerald-500" />
                          <span>{lead.phone}</span>
                        </button>
                      </td>

                      {/* Requirements */}
                      <td className="py-3 px-4">
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 max-w-xs">
                          {lead.requirements || 'No details specified.'}
                        </p>
                      </td>

                      {/* Services */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(lead.services || []).map((srv) => (
                            <span
                              key={srv}
                              className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800"
                            >
                              {srv}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Potentiality Status (In-cell Dropdown) */}
                      <td className="py-3 px-4">
                        <select
                          value={lead.potentialityStatus}
                          onChange={(e) => handleQuickUpdate(lead._id, 'potentialityStatus', e.target.value)}
                          className={`px-2 py-1 text-xs font-bold rounded-xl border focus:outline-none cursor-pointer ${
                            lead.potentialityStatus === 'Hot'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                              : lead.potentialityStatus === 'Warm'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                                : lead.potentialityStatus === 'Converted'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300'
                          }`}
                        >
                          <option value="Hot">🔥 Hot</option>
                          <option value="Warm">☀️ Warm</option>
                          <option value="Cold">❄️ Cold</option>
                          <option value="Converted">🏆 Converted</option>
                          <option value="Lost">❌ Lost</option>
                        </select>
                      </td>

                      {/* Proposal Status (In-cell Dropdown) */}
                      <td className="py-3 px-4">
                        <select
                          value={lead.proposalSentStatus}
                          onChange={(e) => handleQuickUpdate(lead._id, 'proposalSentStatus', e.target.value)}
                          className="px-2 py-1 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value="Not Sent">Not Sent</option>
                          <option value="Drafted">Drafted</option>
                          <option value="Sent">Sent</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Follow-up Notice Date */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="date"
                            value={lead.followUpDate || ''}
                            onChange={(e) => handleQuickUpdate(lead._id, 'followUpDate', e.target.value)}
                            className={`px-2 py-1 text-xs font-semibold rounded-lg border focus:outline-none ${
                              isOverdue
                                ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 animate-pulse'
                                : isDueToday
                                  ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                            }`}
                          />
                        </div>
                      </td>

                      {/* Follow-up Notes Count */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setEditingLead(lead);
                            setIsLeadModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{noteCount} {noteCount === 1 ? 'Note' : 'Notes'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct WhatsApp Message */}
                          <button
                            onClick={() => handleOpenWhatsApp(lead.phone, lead.name, lead.services)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                            title="WhatsApp Chat"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {/* Convert to Onboarded Client */}
                          <button
                            onClick={() => convertToClient(lead)}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60"
                            title="Onboard this Lead"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setEditingLead(lead);
                              setIsLeadModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Lead"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete lead "${lead.name}"?`)) {
                                removeLead(lead._id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* ================= IMPORT EXCEL / CSV MODAL ================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-500" />
                  Import WhatsApp Leads (Excel .xlsx / CSV)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your Excel spreadsheet (.xlsx, .xls) or CSV file. It will automatically arrange into columns and save to your database.
                </p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors">
              <FileUp className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Click to browse Excel (.xlsx, .xls) or CSV
              </p>
              <p className="text-[11px] text-slate-400 mb-3">
                Columns auto-matched: Name, Phone, Service, Requirements, Date, Status
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>

            {/* Preview Status */}
            {importPreview.length > 0 && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span>
                  ✓ <strong>{importPreview.length}</strong> valid leads parsed and ready to save!
                </span>
                <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded-full font-bold">
                  Ready
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveImportedBatch}
                disabled={importPreview.length === 0}
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/20"
              >
                Save {importPreview.length} Leads to Table
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
