'use client';

import React, { useState } from 'react';
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
  Phone
} from 'lucide-react';

export default function ClientListView() {
  const { 
    clientListSubTab, 
    setClientListSubTab,
    successfulClients,
    saveSuccessfulClient,
    removeSuccessfulClient,
    demoLinks,
    saveDemoLink,
    removeDemoLink,
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
    phone: '',
    services: ['Website Development'],
    liveWebsiteUrl: '',
    projectValue: '',
    completionDate: new Date().toISOString().split('T')[0],
    clientFeedback: '',
    reviewRating: 5
  });

  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [editingDemo, setEditingDemo] = useState(null);
  const [demoForm, setDemoForm] = useState({
    title: '',
    category: 'Website Development',
    url: '',
    description: '',
    clientName: '',
    tags: []
  });

  const currency = '৳';

  const categories = [
    'All',
    'Website Development',
    'SEO (Search Engine Optimization)',
    'GBP (Google Business Profile)',
    'Paid Ads (Meta & Google)',
    'Digital Marketing'
  ];

  // Copy link helper
  const handleCopyLink = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // WhatsApp share link helper
  const handleWhatsAppShare = (url, title, category) => {
    const text = `Hi! Here is our portfolio demo link for ${title} (${category}):\n${url}\n\nLet me know if you would like something similar for your business!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filtered Demo Links
  const filteredDemos = demoLinks.filter((d) => {
    if (selectedCategory !== 'All' && d.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        d.title?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Successful Clients
  const filteredSuccessful = successfulClients.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        c.clientName?.toLowerCase().includes(q) ||
        c.businessName?.toLowerCase().includes(q) ||
        c.liveWebsiteUrl?.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
            Showcase successful client deliverables or share categorized live demo links with prospective leads.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1">
          <button
            onClick={() => setClientListSubTab('successful')}
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
            onClick={() => setClientListSubTab('demo-links')}
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

      {/* ================= VIEW 1: SUCCESSFUL CLIENTS ================= */}
      {clientListSubTab === 'successful' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search successful clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={() => {
                setEditingSuccess(null);
                setSuccessForm({
                  clientName: '',
                  businessName: '',
                  phone: '',
                  services: ['Website Development'],
                  liveWebsiteUrl: '',
                  projectValue: '',
                  completionDate: new Date().toISOString().split('T')[0],
                  clientFeedback: '',
                  reviewRating: 5
                });
                setIsSuccessModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Successful Client</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSuccessful.length === 0 ? (
              <div className="col-span-full py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <Star className="w-10 h-10 mx-auto text-amber-400 opacity-60 mb-2" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Successful Clients Added Yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Add completed client projects with their live website link to show social proof to prospective clients.
                </p>
              </div>
            ) : (
              filteredSuccessful.map((client) => (
                <div
                  key={client._id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {client.businessName}
                        </h3>
                        <p className="text-xs text-slate-500">Contact: {client.clientName}</p>
                      </div>
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        ★ {client.reviewRating || 5}.0
                      </div>
                    </div>

                    {client.liveWebsiteUrl && (
                      <a
                        href={client.liveWebsiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{client.liveWebsiteUrl.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {(client.services || []).map((srv) => (
                        <span
                          key={srv}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>

                    {client.clientFeedback && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        &quot;{client.clientFeedback}&quot;
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {currency} {(Number(client.projectValue) || 0).toLocaleString()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingSuccess(client);
                          setSuccessForm({
                            clientName: client.clientName,
                            businessName: client.businessName,
                            phone: client.phone || '',
                            services: client.services || ['Website Development'],
                            liveWebsiteUrl: client.liveWebsiteUrl || '',
                            projectValue: client.projectValue ? String(client.projectValue) : '',
                            completionDate: client.completionDate || '',
                            clientFeedback: client.clientFeedback || '',
                            reviewRating: client.reviewRating || 5
                          });
                          setIsSuccessModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete "${client.businessName}"?`)) {
                            removeSuccessfulClient(client._id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW 2: DEMO LINKS (CATEGORIZED) ================= */}
      {clientListSubTab === 'demo-links' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setEditingDemo(null);
                setDemoForm({
                  title: '',
                  category: 'Website Development',
                  url: '',
                  description: '',
                  clientName: '',
                  tags: []
                });
                setIsDemoModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Demo Link</span>
            </button>
          </div>

          {/* Demos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDemos.length === 0 ? (
              <div className="col-span-full py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <Link2 className="w-10 h-10 mx-auto text-blue-400 opacity-60 mb-2" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Demo Links Found</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Add categorized demo links for Website Development, SEO case studies, and GBP rankings.
                </p>
              </div>
            ) : (
              filteredDemos.map((demo) => (
                <div
                  key={demo._id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {demo.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingDemo(demo);
                            setDemoForm({
                              title: demo.title,
                              category: demo.category,
                              url: demo.url,
                              description: demo.description || '',
                              clientName: demo.clientName || '',
                              tags: demo.tags || []
                            });
                            setIsDemoModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${demo.title}"?`)) {
                              removeDemoLink(demo._id);
                            }
                          }}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {demo.title}
                    </h3>

                    {demo.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {demo.description}
                      </p>
                    )}

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
                      <span className="truncate pr-2">{demo.url}</span>
                      <a href={demo.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Actions: Copy & WhatsApp Share */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleCopyLink(demo.url, demo._id)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedId === demo._id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleWhatsAppShare(demo.url, demo.title, demo.category)}
                      className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      title="Send Demo Link on WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Successful Client Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSuccess ? 'Edit Successful Client' : 'Add Successful Client'}
              </h3>
              <button onClick={() => setIsSuccessModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Care Ltd."
                  value={successForm.businessName}
                  onChange={(e) => setSuccessForm({ ...successForm, businessName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client Contact Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jennifer Hayes"
                  value={successForm.clientName}
                  onChange={(e) => setSuccessForm({ ...successForm, clientName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Live Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={successForm.liveWebsiteUrl}
                  onChange={(e) => setSuccessForm({ ...successForm, liveWebsiteUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deal Value ({currency})
                  </label>
                  <input
                    type="number"
                    placeholder="35000"
                    value={successForm.projectValue}
                    onChange={(e) => setSuccessForm({ ...successForm, projectValue: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rating (1-5)
                  </label>
                  <select
                    value={successForm.reviewRating}
                    onChange={(e) => setSuccessForm({ ...successForm, reviewRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client Review / Feedback
                </label>
                <textarea
                  rows={2}
                  placeholder="Client feedback and results achieved..."
                  value={successForm.clientFeedback}
                  onChange={(e) => setSuccessForm({ ...successForm, clientFeedback: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!successForm.businessName || !successForm.clientName) return;
                  await saveSuccessfulClient({
                    ...(editingSuccess?._id ? { _id: editingSuccess._id } : {}),
                    ...successForm,
                    projectValue: Number(successForm.projectValue) || 0
                  });
                  setIsSuccessModalOpen(false);
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/20"
              >
                Save Successful Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Demo Link Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingDemo ? 'Edit Demo Link' : 'Add Demo Link'}
              </h3>
              <button onClick={() => setIsDemoModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Demo Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern E-commerce Store with bKash/Nagad"
                  value={demoForm.title}
                  onChange={(e) => setDemoForm({ ...demoForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={demoForm.category}
                  onChange={(e) => setDemoForm({ ...demoForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Website Development">Website Development</option>
                  <option value="SEO (Search Engine Optimization)">SEO (Search Engine Optimization)</option>
                  <option value="GBP (Google Business Profile)">GBP (Google Business Profile)</option>
                  <option value="Paid Ads (Meta & Google)">Paid Ads (Meta & Google)</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Live URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://demo.agency.com"
                  value={demoForm.url}
                  onChange={(e) => setDemoForm({ ...demoForm, url: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Key features, conversion rate, deliverables included..."
                  value={demoForm.description}
                  onChange={(e) => setDemoForm({ ...demoForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!demoForm.title || !demoForm.url) return;
                  await saveDemoLink({
                    ...(editingDemo?._id ? { _id: editingDemo._id } : {}),
                    ...demoForm
                  });
                  setIsDemoModalOpen(false);
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20"
              >
                Save Demo Link
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

