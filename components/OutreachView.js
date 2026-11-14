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
  MessageSquare, 
  Calendar, 
  Trash2, 
  UserCheck, 
  Flame, 
  Zap, 
  Snowflake,
  ExternalLink,
  Edit3,
  Star,
  Copy,
  MapPin,
  Globe,
  LayoutGrid
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
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterFollowStatus, setFilterFollowStatus] = useState('All');
  const [filterContacted, setFilterContacted] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [isSavingBatch, setIsSavingBatch] = useState(false);
  const [activeOutreachForNotes, setActiveOutreachForNotes] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Manual Add Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [manualForm, setManualForm] = useState({
    business: '',
    phone: '',
    category: 'Skin care clinic',
    contacted: 'No',
    priority: 'Medium',
    followUpStatus: 'Not started',
    followUpDate: new Date().toISOString().split('T')[0],
    firstFollowUp: '',
    proposalSentStatus: 'Not sent',
    generalNotes: '',
    website: '',
    email: '',
    address: '',
    rating: '',
    reviews: '',
    opportunityScore: '',
    temperature: 'Warm',
    problemsFound: '',
    googleMaps: ''
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Distinct categories from data
  const distinctCategories = useMemo(() => {
    const set = new Set();
    outreachLeads.forEach(o => {
      if (o.category) set.add(o.category);
      if (o.batchTag) set.add(o.batchTag);
    });
    return Array.from(set).filter(Boolean);
  }, [outreachLeads]);

  // Filtered outreach leads
  const filteredList = useMemo(() => {
    return outreachLeads.filter((item) => {
      if (search) {
        const q = search.toLowerCase();
        const matches = 
          item.business?.toLowerCase().includes(q) ||
          item.name?.toLowerCase().includes(q) ||
          item.phone?.includes(q) ||
          item.email?.toLowerCase().includes(q) ||
          item.firstFollowUp?.toLowerCase().includes(q) ||
          item.problemsFound?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (filterCategory !== 'All' && item.category !== filterCategory && item.batchTag !== filterCategory) {
        return false;
      }

      if (filterPriority !== 'All' && item.priority !== filterPriority) {
        return false;
      }

      if (filterFollowStatus !== 'All' && item.followUpStatus !== filterFollowStatus) {
        return false;
      }

      if (filterContacted !== 'All' && item.contacted !== filterContacted) {
        return false;
      }

      return true;
    });
  }, [outreachLeads, search, filterCategory, filterPriority, filterFollowStatus, filterContacted]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenWhatsApp = (phone, businessName) => {
    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    const text = `Hello! Reaching out regarding web development and digital marketing for ${businessName || 'your business'}.`;
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      alert('No numeric phone found for this outreach lead.');
    }
  };

  // Export handlers
  const handleExportExcel = () => {
    const exportData = filteredList.map((item, idx) => ({
      '#': idx + 1,
      'Business': item.business || item.name || '',
      'Phone': item.phone || '',
      'Contacted': item.contacted || 'No',
      'Priority': item.priority || 'Medium',
      'Follow Up Status': item.followUpStatus || 'Not started',
      'Next Follow-Up Date': item.followUpDate || '',
      '1st Follow-Up Update': item.firstFollowUp || '',
      '2nd Follow-Up Update': item.secondFollowUp || '',
      '3rd Follow-Up Update': item.thirdFollowUp || '',
      'More Follow-Ups': item.moreFollowUps || '',
      'Proposal Status': item.proposalSentStatus || 'Not sent',
      'Notes': item.generalNotes || '',
      'Category': item.category || '',
      'Other Categories': item.otherCategories || '',
      'Map Rank': item.mapRank || '',
      'Rating': item.rating || '',
      'Reviews': item.reviews || '',
      'Email': item.email || '',
      'Website': item.website || '',
      'Facebook': item.facebook || '',
      'Instagram': item.instagram || '',
      'LinkedIn': item.linkedin || '',
      'Address': item.address || '',
      'CMS': item.cms || '',
      'Analytics': item.analytics || '',
      'Opportunity Score': item.opportunityScore || '',
      'Temperature': item.temperature || '',
      'Problems Found': item.problemsFound || '',
      'Google Maps': item.googleMaps || ''
    }));

    exportToExcel(exportData, `Outreach_Leads_${todayStr}.xlsx`, 'Outreach');
  };

  const handleExportCsvFile = () => {
    const exportData = filteredList.map((item, idx) => ({
      '#': idx + 1,
      'Business': item.business || item.name || '',
      'Phone': item.phone || '',
      'Contacted': item.contacted || 'No',
      'Priority': item.priority || 'Medium',
      'Follow Up Status': item.followUpStatus || 'Not started',
      'Next Follow-Up Date': item.followUpDate || '',
      '1st Follow-Up Update': item.firstFollowUp || '',
      'Proposal Status': item.proposalSentStatus || 'Not sent',
      'Notes': item.generalNotes || '',
      'Category': item.category || '',
      'Opportunity Score': item.opportunityScore || '',
      'Temperature': item.temperature || '',
      'Problems Found': item.problemsFound || ''
    }));

    exportToCsv(exportData, `Outreach_Leads_${todayStr}.csv`);
  };

  // Import handler (.xlsx, .xls, .csv)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseExcelOrCsvFile(file, 'outreach');
      if (!parsed || parsed.length === 0) {
        alert('No valid outreach leads found. Please check file format.');
        return;
      }
      setImportPreview(parsed);
    } catch (err) {
      alert('Error parsing file: ' + err.message);
    }
  };

  const handleSaveImportedBatch = async () => {
    if (importPreview.length === 0) return;
    setIsSavingBatch(true);
    try {
      await importOutreachBatch(importPreview);
      setIsImportModalOpen(false);
      setImportPreview([]);
    } catch (err) {
      alert('Error saving batch: ' + err.message);
    } finally {
      setIsSavingBatch(false);
    }
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
      followUpNotes: updatedNotes,
      firstFollowUp: newNoteText.trim(),
      followUpStatus: 'In progress'
    });

    setActiveOutreachForNotes({
      ...activeOutreachForNotes,
      followUpNotes: updatedNotes,
      firstFollowUp: newNoteText.trim()
    });
    setNewNoteText('');
  };

  // Manual save
  const handleSaveManual = async (e) => {
    e.preventDefault();
    const payload = {
      ...manualForm,
      name: manualForm.business || 'Outreach Lead',
      company: manualForm.business
    };

    if (editingItem?._id) {
      payload._id = editingItem._id;
    }

    await saveOutreachLead(payload);
    setIsManualModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Date Filter Bar */}
      <DateFilterBar />

      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
            <span>Outreach Leads Master Sheet</span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              {filteredList.length} Leads
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit-backed cold outreach sheet with audit findings, opportunity scores, Google Maps, and multi-round follow-ups.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Spreadsheet Table View"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Mobile Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Export Excel (.xlsx) */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors border border-indigo-200 dark:border-indigo-800"
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
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Excel / CSV</span>
          </button>

          {/* Add Outreach Lead */}
          <button
            onClick={() => {
              setEditingItem(null);
              setManualForm({
                business: '',
                phone: '',
                category: 'Skin care clinic',
                contacted: 'No',
                priority: 'Medium',
                followUpStatus: 'Not started',
                followUpDate: todayStr,
                firstFollowUp: '',
                proposalSentStatus: 'Not sent',
                generalNotes: '',
                website: '',
                email: '',
                address: '',
                rating: '',
                reviews: '',
                opportunityScore: '',
                temperature: 'Warm',
                problemsFound: '',
                googleMaps: ''
              });
              setIsManualModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Outreach Lead</span>
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business, phone, audit..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Categories</option>
              {distinctCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Priorities</option>
              <option value="High">🔥 High</option>
              <option value="Medium">⚡ Medium</option>
              <option value="Low">💤 Low</option>
            </select>
          </div>

          {/* Follow-up Status */}
          <div>
            <select
              value={filterFollowStatus}
              onChange={(e) => setFilterFollowStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Follow-Up Status</option>
              <option value="Not started">Not started</option>
              <option value="In progress">In progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Contacted Filter */}
          <div>
            <select
              value={filterContacted}
              onChange={(e) => setFilterContacted(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Contacted Status</option>
              <option value="Yes">Yes (Contacted)</option>
              <option value="No">No (Uncontacted)</option>
            </select>
          </div>

        </div>
      </div>

      {/* View Mode: Spreadsheet Table or Mobile App Cards */}
      {viewMode === 'table' ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[700px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-4 min-w-[200px]">Business</th>
                  <th className="py-3 px-4 min-w-[150px]">Phone / WhatsApp</th>
                  <th className="py-3 px-3.5 min-w-[140px]">Category</th>
                  <th className="py-3 px-3.5 min-w-[110px]">Contacted</th>
                  <th className="py-3 px-3.5 min-w-[120px]">Priority / Temp</th>
                  <th className="py-3 px-3.5 min-w-[130px]">Follow-Up Status</th>
                  <th className="py-3 px-4 min-w-[220px]">1st Follow-Up Update</th>
                  <th className="py-3 px-3.5 min-w-[130px]">Proposal Status</th>
                  <th className="py-3 px-4 min-w-[220px]">Audit / Problems Found</th>
                  <th className="py-3 px-4 text-right min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-16 text-center text-slate-400">
                      <div className="max-w-sm mx-auto space-y-2">
                        <FileSpreadsheet className="w-10 h-10 mx-auto opacity-50 text-indigo-500" />
                        <h4 className="font-bold text-slate-700 dark:text-slate-300">No Outreach Leads Found</h4>
                        <p className="text-xs text-slate-500">
                          Click &quot;Import Excel / CSV&quot; to import your November Outreach workbook.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => {
                    const isContacted = item.contacted === 'Yes';
                    const isHot = item.temperature === 'Hot' || item.priority === 'High';
                    const isWarm = item.temperature === 'Warm' || item.priority === 'Medium';

                    return (
                      <tr 
                        key={item._id || idx}
                        className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* # */}
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Business */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.business || item.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            {item.address && (
                              <span className="truncate max-w-[160px]" title={item.address}>
                                📍 {item.address}
                              </span>
                            )}
                            {item.rating && (
                              <span className="font-semibold text-amber-500">
                                ★ {item.rating} ({item.reviews || 0})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Phone / WhatsApp */}
                        <td className="py-3 px-4 font-mono">
                          {item.phone ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenWhatsApp(item.phone, item.business)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                                title="Open WhatsApp chat"
                              >
                                <Phone className="w-3 h-3 text-emerald-500" />
                                <span>{item.phone}</span>
                              </button>
                              <button
                                onClick={() => handleCopy(item.phone, item._id)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="Copy number"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No Phone</span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3.5">
                          <span className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {item.category || item.batchTag || 'General'}
                          </span>
                        </td>

                        {/* Contacted (In-cell toggle) */}
                        <td className="py-3 px-3.5">
                          <select
                            value={item.contacted || 'No'}
                            onChange={(e) => handleQuickUpdate(item._id, 'contacted', e.target.value)}
                            className={`px-2 py-1 text-[11px] font-bold rounded-xl border cursor-pointer ${
                              isContacted
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </td>

                        {/* Priority / Temperature */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1">
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isHot 
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : isWarm
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            }`}>
                              {isHot ? <Flame className="w-2.5 h-2.5 text-rose-500" /> : <Zap className="w-2.5 h-2.5 text-amber-500" />}
                              <span>{item.temperature || item.priority || 'Warm'}</span>
                            </span>
                            {item.opportunityScore && (
                              <span className="text-[10px] font-mono font-bold text-slate-500">
                                {item.opportunityScore}pt
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Follow-up Status */}
                        <td className="py-3 px-3.5">
                          <select
                            value={item.followUpStatus || 'Not started'}
                            onChange={(e) => handleQuickUpdate(item._id, 'followUpStatus', e.target.value)}
                            className="px-2 py-1 text-[11px] font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            <option value="Not started">Not started</option>
                            <option value="In progress">In progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>

                        {/* 1st Follow-Up Update */}
                        <td className="py-3 px-4">
                          <span className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 max-w-xs" title={item.firstFollowUp}>
                            {item.firstFollowUp || '-'}
                          </span>
                        </td>

                        {/* Proposal Status */}
                        <td className="py-3 px-3.5">
                          <select
                            value={item.proposalSentStatus || 'Not sent'}
                            onChange={(e) => handleQuickUpdate(item._id, 'proposalSentStatus', e.target.value)}
                            className="px-2 py-1 text-[11px] font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            <option value="Not sent">Not sent</option>
                            <option value="Drafted">Drafted</option>
                            <option value="Sent">Sent</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>

                        {/* Audit / Problems Found */}
                        <td className="py-3 px-4">
                          <div className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 max-w-xs whitespace-pre-line" title={item.problemsFound}>
                            {item.problemsFound || 'No audit notes'}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {item.googleMaps && (
                              <a
                                href={item.googleMaps}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                                title="Open Google Maps link"
                              >
                                <MapPin className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => setActiveOutreachForNotes(item)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                              title="Notes & Multi Follow-ups"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => convertToClient({
                                name: item.business || item.name,
                                phone: item.phone,
                                services: ['Website Development', 'SEO']
                              })}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                              title="Convert to Won Client"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete outreach lead "${item.business || item.name}"?`)) {
                                  removeOutreachLead(item._id);
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
        /* Mobile App Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <FileSpreadsheet className="w-10 h-10 mx-auto opacity-50 text-indigo-500 mb-2" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">No Outreach Leads Found</h4>
              <p className="text-xs text-slate-500">
                Click &quot;Import Excel / CSV&quot; to import your November Outreach workbook.
              </p>
            </div>
          ) : (
            filteredList.map((item, idx) => {
              const isContacted = item.contacted === 'Yes';
              const isHot = item.temperature === 'Hot' || item.priority === 'High';
              const isWarm = item.temperature === 'Warm' || item.priority === 'Medium';

              return (
                <div
                  key={item._id || idx}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">#{idx + 1}</span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {item.business || item.name}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {item.category || item.batchTag || 'General'}
                        </span>
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isHot
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : isWarm
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}>
                          {isHot ? <Flame className="w-2.5 h-2.5 text-rose-500" /> : <Zap className="w-2.5 h-2.5 text-amber-500" />}
                          <span>{item.temperature || item.priority || 'Warm'}</span>
                        </span>
                        {item.opportunityScore && (
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            {item.opportunityScore}pt
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickUpdate(item._id, 'contacted', isContacted ? 'No' : 'Yes')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        isContacted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {isContacted ? '✓ Contacted' : '○ Uncontacted'}
                    </button>
                  </div>

                  {/* Location & Rating */}
                  {(item.address || item.rating) && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      {item.address && (
                        <span className="truncate max-w-[200px]" title={item.address}>
                          📍 {item.address}
                        </span>
                      )}
                      {item.rating && (
                        <span className="font-semibold text-amber-500 flex-shrink-0">
                          ★ {item.rating} ({item.reviews || 0})
                        </span>
                      )}
                    </div>
                  )}

                  {/* 1-Tap WhatsApp Launcher */}
                  {item.phone ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenWhatsApp(item.phone, item.business)}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp: {item.phone}</span>
                      </button>
                      <button
                        onClick={() => handleCopy(item.phone, item._id)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Copy phone"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-2 text-center text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      No phone number
                    </div>
                  )}

                  {/* Dropdowns: Follow Up & Proposal Status */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Follow-Up Status</label>
                      <select
                        value={item.followUpStatus || 'Not started'}
                        onChange={(e) => handleQuickUpdate(item._id, 'followUpStatus', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="Not started">Not started</option>
                        <option value="In progress">In progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Proposal</label>
                      <select
                        value={item.proposalSentStatus || 'Not sent'}
                        onChange={(e) => handleQuickUpdate(item._id, 'proposalSentStatus', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="Not sent">Not sent</option>
                        <option value="Drafted">Drafted</option>
                        <option value="Sent">Sent</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Audit / Follow Up Notes */}
                  {(item.firstFollowUp || item.problemsFound) && (
                    <div className="text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      {item.firstFollowUp && (
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          <span className="font-semibold text-indigo-600">1st Follow-up: </span>
                          {item.firstFollowUp}
                        </p>
                      )}
                      {item.problemsFound && (
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                          <span className="font-semibold text-amber-600">Audit: </span>
                          {item.problemsFound}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action row */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      {item.googleMaps && (
                        <a
                          href={item.googleMaps}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                          title="Google Maps"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {item.website && (
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => setActiveOutreachForNotes(item)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                        title="Notes & Follow-ups"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => convertToClient({
                          name: item.business || item.name,
                          phone: item.phone,
                          services: ['Website Development', 'SEO']
                        })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Convert Won</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${item.business || item.name}"?`)) {
                            removeOutreachLead(item._id);
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
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

      {/* Follow-up Notes Modal */}
      {activeOutreachForNotes && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Outreach Follow-up Rounds</h3>
                <p className="text-xs text-slate-500 font-mono">{activeOutreachForNotes.business || activeOutreachForNotes.phone}</p>
              </div>
              <button
                onClick={() => setActiveOutreachForNotes(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Note list */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {activeOutreachForNotes.firstFollowUp && (
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 block mb-0.5">1st Follow-Up:</span>
                  <p className="text-slate-800 dark:text-slate-200">{activeOutreachForNotes.firstFollowUp}</p>
                </div>
              )}
              {activeOutreachForNotes.secondFollowUp && (
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 block mb-0.5">2nd Follow-Up:</span>
                  <p className="text-slate-800 dark:text-slate-200">{activeOutreachForNotes.secondFollowUp}</p>
                </div>
              )}
              {activeOutreachForNotes.thirdFollowUp && (
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 block mb-0.5">3rd Follow-Up:</span>
                  <p className="text-slate-800 dark:text-slate-200">{activeOutreachForNotes.thirdFollowUp}</p>
                </div>
              )}
              {(activeOutreachForNotes.followUpNotes || []).map((n, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{n.addedAt || 'Added'}</span>
                </div>
              ))}
            </div>

            {/* Add note */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Add Next Round Update</label>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Enter client response, audit status, next follow-up plan..."
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveOutreachForNotes(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
                <button
                  onClick={handleAddFollowUpNote}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                >
                  Save Round Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  <span>Import Outreach Master Workbook / CSV</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload &quot;NovemberOutreach_Leads.xlsx&quot; or CSV. Reads all category sheets automatically!
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
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-800/50">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                id="outreach-file-upload"
                className="hidden"
              />
              <label htmlFor="outreach-file-upload" className="cursor-pointer space-y-2 block">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-indigo-500" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click to select Excel (.xlsx) or CSV file
                </div>
                <div className="text-[11px] text-slate-400">
                  Auto-extracts from sheets like Skin care, Real Estate, Dental clinic, Beauty product, etc.
                </div>
              </label>
            </div>

            {/* Preview Section */}
            {importPreview.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Detected {importPreview.length} Outreach Leads Ready to Save</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">✓ Format Recognized</span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {importPreview.slice(0, 10).map((item, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between bg-white dark:bg-slate-900">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{item.business}</div>
                        <div className="text-[11px] text-slate-500">{item.phone} • {item.category}</div>
                      </div>
                      <div className="text-right font-mono text-[11px] text-indigo-600 font-bold">
                        {item.opportunityScore ? `${item.opportunityScore}pt` : item.temperature}
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
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all"
              >
                {isSavingBatch ? 'Saving...' : `Import ${importPreview.length} Outreach Leads`}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
