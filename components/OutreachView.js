'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Plus, 
  Search, 
  Phone, 
  Send, 
  Calendar, 
  Clock, 
  FileText, 
  Trash2, 
  UserCheck, 
  Flame, 
  CheckCircle,
  AlertCircle,
  X,
  FileUp,
  Layers
} from 'lucide-react';

export default function OutreachView() {
  const { 
    outreachLeads, 
    saveOutreachLead, 
    importOutreachBatch, 
    removeOutreachLead, 
    convertToClient,
    settings 
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterPotential, setFilterPotential] = useState('All');
  const [filterMeeting, setFilterMeeting] = useState('All');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [activeOutreachForNotes, setActiveOutreachForNotes] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');

  // CSV Parse state
  const [csvRawText, setCsvRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);
  const [batchName, setBatchName] = useState('Outreach Batch ' + new Date().toLocaleDateString());

  // Manual Add Form
  const [manualForm, setManualForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    services: ['Website Development', 'SEO (Search Engine Optimization)'],
    potentialityStatus: 'Cold',
    meetingStatus: 'Not Scheduled',
    proposalSentStatus: 'Not Sent',
    followUpDate: new Date().toISOString().split('T')[0],
    generalNotes: '',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtered outreach leads
  const filteredList = useMemo(() => {
    return outreachLeads.filter((item) => {
      if (search) {
        const q = search.toLowerCase();
        const matches = 
          item.name?.toLowerCase().includes(q) ||
          item.company?.toLowerCase().includes(q) ||
          item.phone?.includes(q) ||
          item.email?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (filterPotential !== 'All' && item.potentialityStatus !== filterPotential) {
        return false;
      }

      if (filterMeeting !== 'All' && item.meetingStatus !== filterMeeting) {
        return false;
      }

      return true;
    });
  }, [outreachLeads, search, filterPotential, filterMeeting]);

  // CSV File Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCsvRawText(content);
        parseCsv(content);
      }
    };
    reader.readAsText(file);
  };

  // CSV Parser with header detection
  const parseCsv = (text) => {
    try {
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        setParsedPreview([]);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

      const nameIdx = headers.findIndex(h => h.includes('name'));
      const compIdx = headers.findIndex(h => h.includes('company') || h.includes('business'));
      const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('whatsapp') || h.includes('mobile'));
      const emailIdx = headers.findIndex(h => h.includes('email'));
      const webIdx = headers.findIndex(h => h.includes('web') || h.includes('url') || h.includes('site'));
      const noteIdx = headers.findIndex(h => h.includes('note') || h.includes('req'));

      const results = [];
      for (let i = 1; i < lines.length; i++) {
        // Simple comma split handling basic quotes
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length === 0 || !cols.some(c => c.length > 0)) continue;

        const name = cols[nameIdx !== -1 ? nameIdx : 0] || 'Lead #' + i;
        const company = compIdx !== -1 ? cols[compIdx] : '';
        const phone = phoneIdx !== -1 ? cols[phoneIdx] : '';
        const email = emailIdx !== -1 ? cols[emailIdx] : '';
        const website = webIdx !== -1 ? cols[webIdx] : '';
        const generalNotes = noteIdx !== -1 ? cols[noteIdx] : '';

        results.push({
          name,
          company,
          phone,
          email,
          website,
          services: ['Website Development', 'SEO (Search Engine Optimization)'],
          potentialityStatus: 'Cold',
          meetingStatus: 'Not Scheduled',
          proposalSentStatus: 'Not Sent',
          followUpDate: todayStr,
          generalNotes,
          batchTag: batchName,
          followUpNotes: []
        });
      }

      setParsedPreview(results);
    } catch (err) {
      console.error('Error parsing CSV:', err);
    }
  };

  const handleSaveImportedCsv = async () => {
    if (parsedPreview.length === 0) return;
    await importOutreachBatch(parsedPreview);
    setIsCsvModalOpen(false);
    setParsedPreview([]);
    setCsvRawText('');
  };

  // Export current filtered list as CSV
  const handleExportCsv = () => {
    const headers = [
      'Name',
      'Company',
      'Phone',
      'Email',
      'Website',
      'Potentiality Status',
      'Meeting Status',
      'Proposal Status',
      'Follow-up Date',
      'Notes Count',
      'General Notes'
    ];

    const rows = filteredList.map(item => [
      `"${item.name || ''}"`,
      `"${item.company || ''}"`,
      `"${item.phone || ''}"`,
      `"${item.email || ''}"`,
      `"${item.website || ''}"`,
      `"${item.potentialityStatus || 'Cold'}"`,
      `"${item.meetingStatus || 'Not Scheduled'}"`,
      `"${item.proposalSentStatus || 'Not Sent'}"`,
      `"${item.followUpDate || ''}"`,
      `"${(item.followUpNotes || []).length}"`,
      `"${(item.generalNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `outreach_leads_sheet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // In-line update for quick editing in table
  const handleQuickUpdate = async (id, field, value) => {
    await saveOutreachLead({ _id: id, [field]: value });
  };

  // Add a follow-up note to outreach lead
  const handleAddFollowUpNote = async () => {
    if (!newNoteText.trim() || !activeOutreachForNotes) return;

    const existingNotes = activeOutreachForNotes.followUpNotes || [];
    const updatedNotes = [
      ...existingNotes,
      {
        _id: 'onote_' + Date.now(),
        date: new Date().toISOString(),
        note: newNoteText.trim(),
        addedAt: 'Just now'
      }
    ];

    await saveOutreachLead({
      _id: activeOutreachForNotes._id,
      followUpNotes: updatedNotes
    });

    setActiveOutreachForNotes({
      ...activeOutreachForNotes,
      followUpNotes: updatedNotes
    });

    setNewNoteText('');
  };

  // Quick WhatsApp Launcher
  const handleOpenWhatsApp = (phone, name, company) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const template = 'Hello {name}! Reaching out regarding growth for {company}. We help businesses rank higher on Google and run profitable ad campaigns. Would you be open to a 5-minute chat?';
    const text = template
      .replace('{name}', name || 'there')
      .replace('{company}', company || 'your company');

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-500" />
            <span>Cold Outreach Leads & Arranged Sheet</span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {outreachLeads.length} Leads
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Import CSV files from cold outreach. Converted into an arranged interactive spreadsheet with multiple follow-up notes, meeting status & 1-click onboarding.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Download Arranged Sheet as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Import CSV */}
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV File</span>
          </button>

          {/* Add Lead Manually */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single Lead</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by name, company, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Potentiality */}
          <select
            value={filterPotential}
            onChange={(e) => setFilterPotential(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="All">All Potentialities</option>
            <option value="Hot">🔥 Hot</option>
            <option value="Warm">☀️ Warm</option>
            <option value="Cold">❄️ Cold</option>
            <option value="Qualified">Qualified</option>
            <option value="Unresponsive">Unresponsive</option>
            <option value="Not Interested">Not Interested</option>
          </select>

          {/* Meeting Status */}
          <select
            value={filterMeeting}
            onChange={(e) => setFilterMeeting(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="All">All Meetings</option>
            <option value="Meeting Scheduled">Meeting Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="No Show">No Show</option>
            <option value="Not Scheduled">Not Scheduled</option>
          </select>
        </div>
      </div>

      {/* Arranged Interactive Sheet Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Contact & Company</th>
                <th className="py-3 px-4">WhatsApp Phone</th>
                <th className="py-3 px-4">Potentiality Status</th>
                <th className="py-3 px-4">Meeting Status</th>
                <th className="py-3 px-4">Proposal Sent</th>
                <th className="py-3 px-4">Follow-up Notice</th>
                <th className="py-3 px-4">Follow-up Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No outreach leads in this view. Import a CSV or click &quot;Add Single Lead&quot;.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isOverdue = item.followUpDate && item.followUpDate < todayStr;
                  const isDueToday = item.followUpDate && item.followUpDate === todayStr;
                  const noteCount = (item.followUpNotes || []).length;

                  return (
                    <tr 
                      key={item._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Company */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.company || 'Direct Outreach'} {item.email && `• ${item.email}`}
                        </div>
                      </td>

                      {/* WhatsApp Phone */}
                      <td className="py-3 px-4 font-mono">
                        {item.phone ? (
                          <button
                            onClick={() => handleOpenWhatsApp(item.phone, item.name, item.company)}
                            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                            title="Chat on WhatsApp"
                          >
                            <Phone className="w-3 h-3 text-emerald-500" />
                            <span>{item.phone}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">No phone</span>
                        )}
                      </td>

                      {/* Potentiality Status (In-line Dropdown) */}
                      <td className="py-3 px-4">
                        <select
                          value={item.potentialityStatus}
                          onChange={(e) => handleQuickUpdate(item._id, 'potentialityStatus', e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                            item.potentialityStatus === 'Hot'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                              : item.potentialityStatus === 'Warm'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300'
                          }`}
                        >
                          <option value="Hot">🔥 Hot</option>
                          <option value="Warm">☀️ Warm</option>
                          <option value="Cold">❄️ Cold</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Unresponsive">Unresponsive</option>
                          <option value="Not Interested">Not Interested</option>
                        </select>
                      </td>

                      {/* Meeting Status (In-line Dropdown) */}
                      <td className="py-3 px-4">
                        <select
                          value={item.meetingStatus}
                          onChange={(e) => handleQuickUpdate(item._id, 'meetingStatus', e.target.value)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none"
                        >
                          <option value="Not Scheduled">Not Scheduled</option>
                          <option value="Meeting Scheduled">📅 Meeting Scheduled</option>
                          <option value="Completed">✓ Completed</option>
                          <option value="Rescheduled">Rescheduled</option>
                          <option value="No Show">No Show</option>
                        </select>
                      </td>

                      {/* Proposal Status (In-line Dropdown) */}
                      <td className="py-3 px-4">
                        <select
                          value={item.proposalSentStatus}
                          onChange={(e) => handleQuickUpdate(item._id, 'proposalSentStatus', e.target.value)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none"
                        >
                          <option value="Not Sent">Not Sent</option>
                          <option value="Drafted">Drafted</option>
                          <option value="Sent">Sent</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Follow-up Notice Date */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="date"
                            value={item.followUpDate || ''}
                            onChange={(e) => handleQuickUpdate(item._id, 'followUpDate', e.target.value)}
                            className={`px-2 py-1 text-xs font-medium rounded-lg border focus:outline-none ${
                              isOverdue
                                ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 animate-pulse'
                                : isDueToday
                                  ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                            }`}
                          />
                        </div>
                      </td>

                      {/* Multiple Follow-up Notes Button */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setActiveOutreachForNotes(item);
                            setIsNoteModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          <span>{noteCount} {noteCount === 1 ? 'Note' : 'Notes'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Convert to Client */}
                          <button
                            onClick={() => convertToClient(item)}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                            title="Onboard as Client"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete outreach lead "${item.name}"?`)) {
                                removeOutreachLead(item._id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
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

      {/* ================= CSV UPLOAD MODAL ================= */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-500" />
                  Import Outreach CSV File
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload a lead spreadsheet or paste raw CSV text to automatically convert into organized interactive records.
                </p>
              </div>
              <button 
                onClick={() => setIsCsvModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Batch Tag Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Batch Import Tag
              </label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* File drop zone */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors">
              <FileUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Choose CSV file from your computer
              </p>
              <p className="text-[11px] text-slate-400 mb-3">
                Columns recognized: Name, Company, Phone, Email, Website, Notes
              </p>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Raw Text Paste Alternative */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Or Paste CSV Text Directly:
              </label>
              <textarea
                rows={4}
                placeholder="Name,Company,Phone,Email,Notes&#10;Dr. Alex,Dental Care,+14155551234,alex@dental.com,Needs GBP setup"
                value={csvRawText}
                onChange={(e) => {
                  setCsvRawText(e.target.value);
                  parseCsv(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Parsed Preview Counter */}
            {parsedPreview.length > 0 && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
                <span>
                  ✓ <strong>{parsedPreview.length}</strong> leads parsed and arranged ready to import!
                </span>
                <span className="text-[10px] bg-blue-200 dark:bg-blue-900 px-2 py-0.5 rounded-full font-bold">
                  Preview Ready
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveImportedCsv}
                disabled={parsedPreview.length === 0}
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20"
              >
                Save {parsedPreview.length} Leads to Arranged Sheet
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MULTIPLE FOLLOW-UP NOTES MODAL ================= */}
      {isNoteModalOpen && activeOutreachForNotes && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Follow-up Notes: {activeOutreachForNotes.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeOutreachForNotes.company || 'Outreach Lead'} • Multiple timestamped follow-up history
                </p>
              </div>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing notes */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(activeOutreachForNotes.followUpNotes || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No previous follow-up notes recorded. Add one below!
                </p>
              ) : (
                activeOutreachForNotes.followUpNotes.map((n, idx) => (
                  <div 
                    key={n._id || idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Follow-up Note #{idx + 1}</span>
                      <span>{new Date(n.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add new note */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Add New Follow-up Note:
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Sent follow-up WhatsApp message about their Google Map ranking..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                onClick={handleAddFollowUpNote}
                disabled={!newNoteText.trim()}
                className="w-full py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-sm"
              >
                Save Follow-up Note
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MANUAL SINGLE LEAD MODAL ================= */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Single Outreach Lead
              </h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Michael Chang"
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Clinic / Business
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Dental Care"
                  value={manualForm.company}
                  onChange={(e) => setManualForm({ ...manualForm, company: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+14158889901"
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="contact@business.com"
                    value={manualForm.email}
                    onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Potentiality Status
                  </label>
                  <select
                    value={manualForm.potentialityStatus}
                    onChange={(e) => setManualForm({ ...manualForm, potentialityStatus: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Hot">🔥 Hot</option>
                    <option value="Warm">☀️ Warm</option>
                    <option value="Cold">❄️ Cold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={manualForm.followUpDate}
                    onChange={(e) => setManualForm({ ...manualForm, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!manualForm.name) return;
                  await saveOutreachLead(manualForm);
                  setIsManualModalOpen(false);
                  setManualForm({
                    name: '',
                    company: '',
                    phone: '',
                    email: '',
                    website: '',
                    services: ['Website Development'],
                    potentialityStatus: 'Cold',
                    meetingStatus: 'Not Scheduled',
                    proposalSentStatus: 'Not Sent',
                    followUpDate: todayStr,
                    generalNotes: '',
                  });
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
              >
                Save Outreach Lead
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

