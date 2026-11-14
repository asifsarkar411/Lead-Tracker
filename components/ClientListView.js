'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Star, 
  Link2, 
  ExternalLink, 
  Copy, 
  Send, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Search, 
  Globe, 
  Sparkles,
  X,
  Phone,
  Upload,
  Download,
  FileSpreadsheet,
  Key,
  ShieldCheck,
  Building2,
  Tag
} from 'lucide-react';
import { parseExcelOrCsvFile, exportToExcel, exportToCsv } from '@/lib/excelUtils';

export default function ClientListView() {
  const { 
    clientListSubTab, 
    setClientListSubTab,
    successfulClients,
    saveSuccessfulClient,
    removeSuccessfulClient,
    importSuccessfulClientsBatch,
    demoLinks,
    saveDemoLink,
    removeDemoLink,
    importDemoLinksBatch,
    settings 
  } = useApp();

  const [copiedId, setCopiedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [editingSuccess, setEditingSuccess] = useState(null);
  const [successForm, setSuccessForm] = useState({
    clientName: '',
    businessName: '',
    category: 'Web Design & Development',
    industry: '',
    website: '',
    liveWebsiteUrl: '',
    serviceResult: '',
    notes: ''
  });

  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [editingDemo, setEditingDemo] = useState(null);
  const [demoForm, setDemoForm] = useState({
    title: '',
    clientName: '',
    businessType: '',
    category: 'Web Design & Development',
    url: '',
    linkType: 'Frontend',
    username: '',
    password: '',
    notes: ''
  });

  // Batch import modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  // Distinct categories
  const distinctDemoCategories = useMemo(() => {
    const set = new Set();
    demoLinks.forEach(d => { if (d.category) set.add(d.category); });
    return Array.from(set).filter(Boolean);
  }, [demoLinks]);

  const distinctSuccessCategories = useMemo(() => {
    const set = new Set();
    successfulClients.forEach(s => { if (s.category) set.add(s.category); });
    return Array.from(set).filter(Boolean);
  }, [successfulClients]);

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // WhatsApp share link helper
  const handleWhatsAppShare = (url, title, category) => {
    const text = `Hi! Here is our portfolio demo for ${title} (${category}):\n${url}\n\nLet me know if you would like something similar for your business!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filtered Demo Links
  const filteredDemos = useMemo(() => {
    return demoLinks.filter((d) => {
      if (selectedCategory !== 'All' && d.category !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          d.title?.toLowerCase().includes(q) ||
          d.clientName?.toLowerCase().includes(q) ||
          d.businessType?.toLowerCase().includes(q) ||
          d.category?.toLowerCase().includes(q) ||
          d.linkType?.toLowerCase().includes(q) ||
          d.notes?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [demoLinks, selectedCategory, search]);

  // Filtered Successful Clients
  const filteredSuccessful = useMemo(() => {
    return successfulClients.filter((c) => {
      if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.clientName?.toLowerCase().includes(q) ||
          c.businessName?.toLowerCase().includes(q) ||
          c.industry?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.website?.toLowerCase().includes(q) ||
          c.notes?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [successfulClients, selectedCategory, search]);

  // Export handlers
  const handleExport = (format) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (clientListSubTab === 'successful') {
      const data = filteredSuccessful.map((s, idx) => ({
        'No.': idx + 1,
        'Category': s.category || 'Web Design & Development',
        'Industry': s.industry || '',
        'Client / Brand': s.businessName || s.clientName || '',
        'Website / Keyword': s.website || s.liveWebsiteUrl || '',
        'Service / Result': s.serviceResult || '',
        'Notes': s.notes || ''
      }));
      if (format === 'xlsx') {
        exportToExcel(data, `Successful_Clients_${todayStr}.xlsx`, 'client successfull portfolio');
      } else {
        exportToCsv(data, `Successful_Clients_${todayStr}.csv`);
      }
    } else {
      const data = filteredDemos.map((d, idx) => ({
        'No.': idx + 1,
        'Category': d.category || 'Web Design & Development',
        'Business Type / Project': d.businessType || '',
        'Client / Brand Name': d.clientName || d.title || '',
        'URL / Link': d.url || '',
        'Link Type': d.linkType || 'Frontend',
        'Username': d.username || '',
        'Password': d.password || '',
        'Notes': d.notes || ''
      }));
      if (format === 'xlsx') {
        exportToExcel(data, `Demo_Links_${todayStr}.xlsx`, 'Client List');
      } else {
        exportToCsv(data, `Demo_Links_${todayStr}.csv`);
      }
    }
  };

  // Import file handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const typeHint = clientListSubTab === 'successful' ? 'successful_client' : 'demo';
      const parsed = await parseExcelOrCsvFile(file, typeHint);
      if (!parsed || parsed.length === 0) {
        alert('No valid items found matching current tab. Please check file format.');
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
      if (clientListSubTab === 'successful') {
        await importSuccessfulClientsBatch(importPreview);
      } else {
        await importDemoLinksBatch(importPreview);
      }
      setIsImportModalOpen(false);
      setImportPreview([]);
    } catch (err) {
      alert('Error saving batch: ' + err.message);
    } finally {
      setIsSavingBatch(false);
    }
  };

  // Save manual success client
  const handleSaveSuccess = async (e) => {
    e.preventDefault();
    const payload = {
      ...successForm,
      businessName: successForm.businessName || successForm.clientName,
      clientName: successForm.clientName || successForm.businessName,
      liveWebsiteUrl: successForm.website?.startsWith('http') ? successForm.website : (successForm.website ? `https://${successForm.website}` : '')
    };
    if (editingSuccess?._id) payload._id = editingSuccess._id;

    await saveSuccessfulClient(payload);
    setIsSuccessModalOpen(false);
    setEditingSuccess(null);
  };

  // Save manual demo link
  const handleSaveDemo = async (e) => {
    e.preventDefault();
    const payload = {
      ...demoForm,
      title: demoForm.clientName || demoForm.title || 'Demo Project'
    };
    if (editingDemo?._id) payload._id = editingDemo._id;

    await saveDemoLink(payload);
    setIsDemoModalOpen(false);
    setEditingDemo(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Client List & Showcase</span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {clientListSubTab === 'successful' ? `${successfulClients.length} Successful Clients` : `${demoLinks.length} Demo Links`}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showcase successful client deliverables or share categorized live demo links with credentials.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1">
          <button
            onClick={() => {
              setClientListSubTab('successful');
              setSelectedCategory('All');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              clientListSubTab === 'successful'
                ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Successful Clients ({successfulClients.length})</span>
          </button>

          <button
            onClick={() => {
              setClientListSubTab('demo-links');
              setSelectedCategory('All');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              clientListSubTab === 'demo-links'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Demo Links ({demoLinks.length})</span>
          </button>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${clientListSubTab === 'successful' ? 'clients, industries...' : 'demos, categories...'}`}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Categories</option>
              {(clientListSubTab === 'successful' ? distinctSuccessCategories : distinctDemoCategories).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {/* Export Excel */}
          <button
            onClick={() => handleExport('xlsx')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-200 dark:border-emerald-800"
            title="Download Excel Spreadsheet (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={() => handleExport('csv')}
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

          {/* Add Item Button */}
          {clientListSubTab === 'successful' ? (
            <button
              onClick={() => {
                setEditingSuccess(null);
                setSuccessForm({
                  clientName: '',
                  businessName: '',
                  category: 'Web Design & Development',
                  industry: '',
                  website: '',
                  liveWebsiteUrl: '',
                  serviceResult: '',
                  notes: ''
                });
                setIsSuccessModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingDemo(null);
                setDemoForm({
                  title: '',
                  clientName: '',
                  businessType: '',
                  category: 'Web Design & Development',
                  url: '',
                  linkType: 'Frontend',
                  username: '',
                  password: '',
                  notes: ''
                });
                setIsDemoModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Demo Link</span>
            </button>
          )}
        </div>

      </div>

      {/* VIEW: SUCCESSFUL CLIENTS TABLE */}
      {clientListSubTab === 'successful' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[700px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No.</th>
                  <th className="py-3 px-4 min-w-[200px]">Client / Brand</th>
                  <th className="py-3 px-4 min-w-[160px]">Category</th>
                  <th className="py-3 px-4 min-w-[150px]">Industry</th>
                  <th className="py-3 px-4 min-w-[180px]">Website / Live URL</th>
                  <th className="py-3 px-4 min-w-[160px]">Service / Result</th>
                  <th className="py-3 px-4 min-w-[160px]">Notes</th>
                  <th className="py-3 px-4 text-right min-w-[110px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredSuccessful.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Star className="w-10 h-10 mx-auto opacity-50 text-amber-500" />
                        <h4 className="font-bold text-slate-700 dark:text-slate-300">No Successful Clients Found</h4>
                        <p className="text-xs text-slate-500">
                          Click &quot;Import Excel / CSV&quot; to import your portfolio sheet.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSuccessful.map((item, idx) => {
                    const liveUrl = item.liveWebsiteUrl || (item.website?.startsWith('http') ? item.website : (item.website ? `https://${item.website}` : ''));

                    return (
                      <tr 
                        key={item._id || idx}
                        className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* No. */}
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Client / Brand */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.businessName || item.clientName}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                            {item.category || 'Web Design & Development'}
                          </span>
                        </td>

                        {/* Industry */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                          {item.industry || '-'}
                        </td>

                        {/* Website */}
                        <td className="py-3 px-4 font-mono">
                          {liveUrl ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={liveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                              >
                                <Globe className="w-3 h-3 text-blue-500" />
                                <span className="truncate max-w-[140px]">{item.website || liveUrl}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                              <button
                                onClick={() => handleCopy(liveUrl, item._id)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="Copy link"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No link</span>
                          )}
                        </td>

                        {/* Service / Result */}
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {item.serviceResult || '-'}
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[150px]" title={item.notes}>
                          {item.notes || '-'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingSuccess(item);
                                setSuccessForm({
                                  clientName: item.clientName || '',
                                  businessName: item.businessName || '',
                                  category: item.category || 'Web Design & Development',
                                  industry: item.industry || '',
                                  website: item.website || '',
                                  liveWebsiteUrl: item.liveWebsiteUrl || '',
                                  serviceResult: item.serviceResult || '',
                                  notes: item.notes || ''
                                });
                                setIsSuccessModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Client"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete client "${item.businessName || item.clientName}"?`)) {
                                  removeSuccessfulClient(item._id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                              title="Delete Client"
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
      )}

      {/* VIEW: DEMO LINKS TABLE */}
      {clientListSubTab === 'demo-links' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[700px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No.</th>
                  <th className="py-3 px-4 min-w-[180px]">Client / Project</th>
                  <th className="py-3 px-3.5 min-w-[150px]">Category</th>
                  <th className="py-3 px-3.5 min-w-[140px]">Business Type</th>
                  <th className="py-3 px-3.5 min-w-[110px]">Link Type</th>
                  <th className="py-3 px-4 min-w-[200px]">URL / Live Link</th>
                  <th className="py-3 px-4 min-w-[180px]">Credentials</th>
                  <th className="py-3 px-4 min-w-[160px]">Notes</th>
                  <th className="py-3 px-4 text-right min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredDemos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Link2 className="w-10 h-10 mx-auto opacity-50 text-blue-500" />
                        <h4 className="font-bold text-slate-700 dark:text-slate-300">No Demo Links Found</h4>
                        <p className="text-xs text-slate-500">
                          Click &quot;Import Excel / CSV&quot; to import your demo sheets.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDemos.map((item, idx) => {
                    return (
                      <tr 
                        key={item._id || idx}
                        className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* No. */}
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Client / Project */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.clientName || item.title}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3.5">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                            {item.category || 'Web Design & Development'}
                          </span>
                        </td>

                        {/* Business Type */}
                        <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400 font-medium">
                          {item.businessType || '-'}
                        </td>

                        {/* Link Type Badge */}
                        <td className="py-3 px-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            item.linkType?.includes('Admin')
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}>
                            {item.linkType || 'Frontend'}
                          </span>
                        </td>

                        {/* URL Link with open, copy, share */}
                        <td className="py-3 px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                              title={item.url}
                            >
                              <Globe className="w-3 h-3 text-blue-500" />
                              <span className="truncate max-w-[130px]">{item.url}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                            <button
                              onClick={() => handleCopy(item.url, item._id)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Copy link"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleWhatsAppShare(item.url, item.clientName || item.title, item.category)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded"
                              title="Share on WhatsApp"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Credentials */}
                        <td className="py-3 px-4">
                          {item.username || item.password ? (
                            <div className="space-y-0.5 font-mono text-[10px]">
                              {item.username && (
                                <div className="flex items-center gap-1">
                                  <span className="text-slate-400">User:</span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.username}</span>
                                  <button onClick={() => handleCopy(item.username, item._id + '_u')} className="p-0.5 text-slate-400 hover:text-slate-600">
                                    <Copy className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              )}
                              {item.password && (
                                <div className="flex items-center gap-1">
                                  <span className="text-slate-400">Pass:</span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.password}</span>
                                  <button onClick={() => handleCopy(item.password, item._id + '_p')} className="p-0.5 text-slate-400 hover:text-slate-600">
                                    <Copy className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">-</span>
                          )}
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[140px]" title={item.notes}>
                          {item.notes || '-'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingDemo(item);
                                setDemoForm({
                                  title: item.title || '',
                                  clientName: item.clientName || '',
                                  businessType: item.businessType || '',
                                  category: item.category || 'Web Design & Development',
                                  url: item.url || '',
                                  linkType: item.linkType || 'Frontend',
                                  username: item.username || '',
                                  password: item.password || '',
                                  notes: item.notes || ''
                                });
                                setIsDemoModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Demo"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete demo link "${item.clientName || item.title}"?`)) {
                                  removeDemoLink(item._id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                              title="Delete Demo"
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
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span>Import {clientListSubTab === 'successful' ? 'Successful Clients' : 'Demo Links'} Excel / CSV</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload &quot;client_list_and_demo.xlsx&quot; or CSV. The system auto-detects the matching sheets!
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
                id="client-demo-upload"
                className="hidden"
              />
              <label htmlFor="client-demo-upload" className="cursor-pointer space-y-2 block">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-blue-500" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click to select Excel (.xlsx) or CSV file
                </div>
                <div className="text-[11px] text-slate-400">
                  {clientListSubTab === 'successful' 
                    ? 'Extracts from "client successfull portfolio" sheet' 
                    : 'Extracts from "Client List" & "Demo website" sheets'}
                </div>
              </label>
            </div>

            {/* Preview Section */}
            {importPreview.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Detected {importPreview.length} items ready to save</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">✓ Format Recognized</span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {importPreview.slice(0, 10).map((item, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between bg-white dark:bg-slate-900">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{item.clientName || item.businessName || item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.category} • {item.industry || item.businessType || item.linkType}</div>
                      </div>
                      <div className="text-right font-mono text-[11px] text-blue-600 truncate max-w-[140px]">
                        {item.website || item.url}
                      </div>
                    </div>
                  ))}
                  {importPreview.length > 10 && (
                    <div className="p-2 text-center text-slate-400 text-[11px] bg-slate-50 dark:bg-slate-800">
                      + {importPreview.length - 10} more items will be imported
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
                {isSavingBatch ? 'Saving...' : `Import ${importPreview.length} Items`}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Manual Add / Edit Modal for Successful Client */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingSuccess ? 'Edit Successful Client' : 'Add Successful Client'}
              </h3>
              <button onClick={() => setIsSuccessModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveSuccess} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Client / Brand Name *</label>
                <input
                  type="text"
                  required
                  value={successForm.businessName}
                  onChange={(e) => setSuccessForm({ ...successForm, businessName: e.target.value, clientName: e.target.value })}
                  placeholder="e.g. Salmon Developers Limited"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <input
                    type="text"
                    value={successForm.category}
                    onChange={(e) => setSuccessForm({ ...successForm, category: e.target.value })}
                    placeholder="e.g. Web Design & Development"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Industry</label>
                  <input
                    type="text"
                    value={successForm.industry}
                    onChange={(e) => setSuccessForm({ ...successForm, industry: e.target.value })}
                    placeholder="e.g. Real Estate, Restaurant"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Live Website URL</label>
                <input
                  type="text"
                  value={successForm.website}
                  onChange={(e) => setSuccessForm({ ...successForm, website: e.target.value })}
                  placeholder="e.g. salmondevelopersbd.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Service / Deliverable Result</label>
                <input
                  type="text"
                  value={successForm.serviceResult}
                  onChange={(e) => setSuccessForm({ ...successForm, serviceResult: e.target.value })}
                  placeholder="e.g. Custom Web Development & SEO"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={successForm.notes}
                  onChange={(e) => setSuccessForm({ ...successForm, notes: e.target.value })}
                  placeholder="Additional delivery notes or results..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-amber-600 hover:bg-amber-500"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add / Edit Modal for Demo Link */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingDemo ? 'Edit Demo Link' : 'Add Demo Link'}
              </h3>
              <button onClick={() => setIsDemoModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveDemo} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Client / Project Title *</label>
                <input
                  type="text"
                  required
                  value={demoForm.clientName}
                  onChange={(e) => setDemoForm({ ...demoForm, clientName: e.target.value, title: e.target.value })}
                  placeholder="e.g. Treandx or EasyTech - Fashion"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <input
                    type="text"
                    value={demoForm.category}
                    onChange={(e) => setDemoForm({ ...demoForm, category: e.target.value })}
                    placeholder="e.g. Web Design & Development"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Business Type</label>
                  <input
                    type="text"
                    value={demoForm.businessType}
                    onChange={(e) => setDemoForm({ ...demoForm, businessType: e.target.value })}
                    placeholder="e.g. Real Estate, Fashion"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">URL / Link *</label>
                  <input
                    type="url"
                    required
                    value={demoForm.url}
                    onChange={(e) => setDemoForm({ ...demoForm, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Link Type</label>
                  <select
                    value={demoForm.linkType}
                    onChange={(e) => setDemoForm({ ...demoForm, linkType: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Admin Panel">Admin Panel</option>
                    <option value="Store-Front">Store-Front</option>
                    <option value="Website">Website</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Demo Username</label>
                  <input
                    type="text"
                    value={demoForm.username}
                    onChange={(e) => setDemoForm({ ...demoForm, username: e.target.value })}
                    placeholder="e.g. admin@gmail.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Demo Password</label>
                  <input
                    type="text"
                    value={demoForm.password}
                    onChange={(e) => setDemoForm({ ...demoForm, password: e.target.value })}
                    placeholder="e.g. 12345678"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={demoForm.notes}
                  onChange={(e) => setDemoForm({ ...demoForm, notes: e.target.value })}
                  placeholder="Special instructions or shared admin info..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDemoModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500"
                >
                  Save Demo Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
