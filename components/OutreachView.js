'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import DateFilterBar from './DateFilterBar';
import { parseExcelOrCsvFile, exportToExcel, exportToCsv } from '@/lib/excelUtils';
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
  FileUp
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [activeOutreachForNotes, setActiveOutreachForNotes] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [importPreview, setImportPreview] = useState([]);
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

  // Export handlers
  const handleExportExcel = () => {
    const exportData = filteredList.map((item, idx) => ({
      'SL': idx + 1,
      'Date': item.createdAt ? item.createdAt.split('T')[0] : todayStr,
      'Contact Name': item.name || '',
      'Company Name': item.company || '',
      'Phone / WhatsApp': item.phone || '',
      'Email': item.email || '',
      'Website': item.website || '',
      'Potentiality': item.potentialityStatus || 'Cold',
      'Meeting Status': item.meetingStatus || 'Not Scheduled',
      'Proposal Status': item.proposalSentStatus || 'Not Sent',
      'Follow-up Date': item.followUpDate || '',
      'Notes Count': (item.followUpNotes || []).length,
      'General Notes': item.generalNotes || ''
    }));

    exportToExcel(exportData, `Outreach_Leads_${todayStr}.xlsx`, 'Outreach');
  };

  const handleExportCsvFile = () => {
    const exportData = filteredList.map((item, idx) => ({
      'SL': idx + 1,
      'Date': item.createdAt ? item.createdAt.split('T')[0] : todayStr,
      'Contact Name': item.name || '',
      'Company Name': item.company || '',
      'Phone / WhatsApp': item.phone || '',
      'Email': item.email || '',
      'Website': item.website || '',
      'Potentiality': item.potentialityStatus || 'Cold',
      'Meeting Status': item.meetingStatus || 'Not Scheduled',
      'Proposal Status': item.proposalSentStatus || 'Not Sent',
      'Follow-up Date': item.followUpDate || ''
    }));

    exportToCsv(exportData, `Outreach_Leads_${todayStr}.csv`);
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
      const keys = Object.keys(r);
      const nameKey = keys.find(k => /name|contact/i.test(k));
      const compKey = keys.find(k => /company|business/i.test(k));
      const phoneKey = keys.find(k => /phone|whatsapp|mobile/i.test(k));
      const emailKey = keys.find(k => /email/i.test(k));
      const webKey = keys.find(k => /web|site|url/i.test(k));
      const noteKey = keys.find(k => /note|req/i.test(k));

      return {
        name: nameKey ? String(r[nameKey]).trim() : `Outreach Lead #${idx + 1}`,
        company: compKey ? String(r[compKey]).trim() : '',
        phone: phoneKey ? String(r[phoneKey]).trim() : '',
        email: emailKey ? String(r[emailKey]).trim() : '',
        website: webKey ? String(r[webKey]).trim() : '',
        services: ['Website Development', 'SEO (Search Engine Optimization)'],
        potentialityStatus: 'Cold',
        meetingStatus: 'Not Scheduled',
        proposalSentStatus: 'Not Sent',
        followUpDate: todayStr,
        generalNotes: noteKey ? String(r[noteKey]).trim() : '',
        batchTag: batchName,
        createdAt: new Date().toISOString(),
        followUpNotes: []
      };
    });

    setImportPreview(formatted.filter(item => item.name));
  };

  const handleSaveImportedBatch = async () => {
    if (importPreview.length === 0) return;
    await importOutreachBatch(importPreview);
    setIsImportModalOpen(false);
    setImportPreview([]);
  };

  // In-line cell update
  const handleQuickUpdate = async (id, field, value) => {
    await saveOutreachLead({ _id: id, [field]: value });
  };

  // Follow-up note adder
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

  const handleOpenWhatsApp = (phone, name, company) => {
    const clean = phone.replace(/[^0-9]/g, '');
    const msg = `Hello ${name || 'there'}! Reaching out regarding growth for ${company || 'your business'}. We help businesses rank on Google and run profitable ad campaigns. Would you be open to a 5-minute chat?`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Date Filter Bar */}
      <DateFilterBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-500" />
            <span>Cold Outreach Leads Sheet</span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {filteredList.length} Leads
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Import cold leads via Excel/CSV. Convert into arranged interactive spreadsheet with meeting status & 1-click onboarding.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 transition-colors border border-blue-200 dark:border-blue-800"
            title="Download Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsvFile}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
            title="Download CSV"
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

          {/* Add Single Lead */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search outreach leads by name, company, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterPotential}
            onChange={(e) => setFilterPotential(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="All">All Potentialities</option>
            <option value="Hot">🔥 Hot</option>
            <option value="Warm">☀️ Warm</option>
            <option value="Cold">❄️ Cold</option>
            <option value="Qualified">Qualified</option>
            <option value="Unresponsive">Unresponsive</option>
          </select>

          <select
            value={filterMeeting}
            onChange={(e) => setFilterMeeting(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="All">All Meetings</option>
            <option value="Meeting Scheduled">📅 Scheduled</option>
            <option value="Completed">✓ Completed</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="No Show">No Show</option>
            <option value="Not Scheduled">Not Scheduled</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[650px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3.5 w-10 text-center">SL</th>
                <th className="py-3 px-4 min-w-[160px]">Contact & Company</th>
                <th className="py-3 px-4 min-w-[140px]">WhatsApp Phone</th>
                <th className="py-3 px-4 min-w-[140px]">Potentiality</th>
                <th className="py-3 px-4 min-w-[150px]">Meeting Status</th>
                <th className="py-3 px-4 min-w-[140px]">Proposal Status</th>
                <th className="py-3 px-4 min-w-[140px]">Follow-up Notice</th>
                <th className="py-3 px-4 min-w-[110px]">Notes</th>
                <th className="py-3 px-4 text-right min-w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <FileSpreadsheet className="w-10 h-10 mx-auto opacity-50 text-blue-500" />
                      <h4 className="font-bold text-slate-700 dark:text-slate-300">No Cold Outreach Leads</h4>
                      <p className="text-xs text-slate-500">
                        Upload an outreach Excel/CSV file or click &quot;Add Single Lead&quot; to begin tracking outreach.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, index) => {
                  const isOverdue = item.followUpDate && item.followUpDate < todayStr;
                  const isDueToday = item.followUpDate && item.followUpDate === todayStr;
                  const noteCount = (item.followUpNotes || []).length;

                  return (
                    <tr 
                      key={item._id}
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.company || 'Outreach Lead'} {item.email && `• ${item.email}`}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        {item.phone ? (
                          <button
                            onClick={() => handleOpenWhatsApp(item.phone, item.name, item.company)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <Phone className="w-3 h-3 text-emerald-500" />
                            <span>{item.phone}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">No phone</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={item.potentialityStatus}
                          onChange={(e) => handleQuickUpdate(item._id, 'potentialityStatus', e.target.value)}
                          className={`px-2 py-1 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
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
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={item.meetingStatus}
                          onChange={(e) => handleQuickUpdate(item._id, 'meetingStatus', e.target.value)}
                          className="px-2 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value="Not Scheduled">Not Scheduled</option>
                          <option value="Meeting Scheduled">📅 Scheduled</option>
                          <option value="Completed">✓ Completed</option>
                          <option value="Rescheduled">Rescheduled</option>
                          <option value="No Show">No Show</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={item.proposalSentStatus}
                          onChange={(e) => handleQuickUpdate(item._id, 'proposalSentStatus', e.target.value)}
                          className="px-2 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value="Not Sent">Not Sent</option>
                          <option value="Drafted">Drafted</option>
                          <option value="Sent">Sent</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <input
                          type="date"
                          value={item.followUpDate || ''}
                          onChange={(e) => handleQuickUpdate(item._id, 'followUpDate', e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-lg border focus:outline-none ${
                            isOverdue
                              ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 animate-pulse'
                              : isDueToday
                                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                          }`}
                        />
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setActiveOutreachForNotes(item);
                            setIsNoteModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          <span>{noteCount} {noteCount === 1 ? 'Note' : 'Notes'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => convertToClient(item)}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60"
                            title="Onboard this lead as Client"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete outreach lead "${item.name}"?`)) {
                                removeOutreachLead(item._id);
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

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-500" />
                Import Cold Outreach Leads (Excel / CSV)
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors">
              <FileUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Click to browse Excel (.xlsx, .xls) or CSV
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="text-xs text-slate-500 mt-2"
              />
            </div>

            {importPreview.length > 0 && (
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
                <span>✓ {importPreview.length} leads parsed ready to import</span>
                <span className="font-bold text-[10px] bg-blue-200 dark:bg-blue-900 px-2 py-0.5 rounded-full">Ready</span>
              </div>
            )}

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
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
              >
                Save to Outreach Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multiple Follow-up Notes Modal */}
      {isNoteModalOpen && activeOutreachForNotes && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Follow-up Notes: {activeOutreachForNotes.name}
              </h3>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(activeOutreachForNotes.followUpNotes || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No previous follow-up notes recorded.
                </p>
              ) : (
                activeOutreachForNotes.followUpNotes.map((n, idx) => (
                  <div key={n._id || idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Note #{idx + 1}</span>
                      <span>{new Date(n.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <textarea
                rows={2}
                placeholder="Log follow-up touchpoint note..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                onClick={handleAddFollowUpNote}
                disabled={!newNoteText.trim()}
                className="w-full py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
              >
                Save Follow-up Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Single Lead Modal */}
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
                  placeholder="e.g. Marcus Sterling"
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Business
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sterling Law Partners"
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
                    placeholder="+8801700000000"
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
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500"
              >
                Save Lead
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
