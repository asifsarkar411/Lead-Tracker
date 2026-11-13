'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  MessageSquare, 
  DollarSign, 
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function AdminSettingsView() {
  const { 
    settings, 
    saveSettings, 
    dbStatus, 
    refreshAllData,
    theme,
    toggleTheme
  } = useApp();

  const [formData, setFormData] = useState({
    siteName: '',
    tagline: '',
    logoUrl: '',
    currencySymbol: '$',
    agencyPhone: '',
    agencyEmail: '',
    services: [],
    whatsappTemplates: [],
  });

  const [newServiceName, setNewServiceName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || 'ApexLead Growth CRM',
        tagline: settings.tagline || 'High-Converting Digital Agency Sales & WhatsApp Leads Tracker',
        logoUrl: settings.logoUrl || '',
        currencySymbol: settings.currencySymbol || '$',
        agencyPhone: settings.agencyPhone || '+1 234 567 8900',
        agencyEmail: settings.agencyEmail || 'sales@agency.com',
        services: settings.services || [],
        whatsappTemplates: settings.whatsappTemplates || [],
      });
    }
  }, [settings]);

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    if (formData.services.includes(newServiceName.trim())) {
      setErrorMessage('Service already exists');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, newServiceName.trim()],
    }));
    setNewServiceName('');
    setErrorMessage('');
  };

  const handleRemoveService = (serviceToRemove) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== serviceToRemove),
    }));
  };

  const handleTemplateChange = (index, field, value) => {
    const updated = [...formData.whatsappTemplates];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, whatsappTemplates: updated });
  };

  const handleAddTemplate = () => {
    setFormData((prev) => ({
      ...prev,
      whatsappTemplates: [
        ...prev.whatsappTemplates,
        {
          title: 'Custom Follow-up #' + (prev.whatsappTemplates.length + 1),
          message: 'Hi {name}! Following up from our team regarding {service}. Would today be good for a quick call?',
        },
      ],
    }));
  };

  const handleRemoveTemplate = (index) => {
    setFormData((prev) => ({
      ...prev,
      whatsappTemplates: prev.whatsappTemplates.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    const res = await saveSettings(formData);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setErrorMessage(res.error || 'Failed to save settings.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            <span>Admin Control Panel & Dynamic Frontend</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control website branding, logo, services list, WhatsApp templates, and MongoDB Atlas database connection.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Updates...' : 'Save All Changes'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Website settings and dynamic frontend controls updated successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section 1: Website Branding & Logo */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              Website Branding & Logo Control
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the name, tagline, and logo shown across the entire application.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Website / Agency Name *
            </label>
            <input
              type="text"
              required
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Currency Symbol
            </label>
            <select
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="$">$ (USD - United States Dollar)</option>
              <option value="৳">৳ (BDT - Bangladeshi Taka)</option>
              <option value="₹">₹ (INR - Indian Rupee)</option>
              <option value="£">£ (GBP - British Pound)</option>
              <option value="€">€ (EUR - Euro)</option>
              <option value="AED">AED (United Arab Emirates Dirham)</option>
              <option value="C$">C$ (CAD - Canadian Dollar)</option>
              <option value="A$">A$ (AUD - Australian Dollar)</option>
              <option value="SAR">SAR (Saudi Riyal)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Website Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Logo Image URL (Optional)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                placeholder="https://example.com/your-agency-logo.png"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {formData.logoUrl && (
                <div className="w-10 h-10 p-1 border rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Leave blank to use the modern default gradient icon badge.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Agency Contact WhatsApp Phone
            </label>
            <input
              type="text"
              value={formData.agencyPhone}
              onChange={(e) => setFormData({ ...formData, agencyPhone: e.target.value })}
              className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Agency Sales Email
            </label>
            <input
              type="email"
              value={formData.agencyEmail}
              onChange={(e) => setFormData({ ...formData, agencyEmail: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Dynamic Agency Services Manager */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Dynamic Agency Services Manager ({formData.services.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add or remove services offered by your agency (e.g. Website development, SEO, Paid ads, GBP). These dynamically update all forms and filters!
            </p>
          </div>
        </div>

        {/* Existing Services List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {formData.services.map((srv) => (
            <div
              key={srv}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs"
            >
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {srv}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveService(srv)}
                className="text-slate-400 hover:text-red-500 p-1"
                title="Remove Service"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Service Input */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="e.g. Mobile App Development, AI Chatbot Setup, TikTok Ads..."
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            type="button"
            onClick={handleAddService}
            className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" />
            Add Service
          </button>
        </div>
      </div>

      {/* Section 3: Dynamic WhatsApp Message Templates */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              Dynamic WhatsApp Follow-Up Templates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize 1-click WhatsApp messaging templates. Variables available: <code>{`{name}`}</code>, <code>{`{service}`}</code>
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddTemplate}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + Add Template
          </button>
        </div>

        <div className="space-y-4">
          {formData.whatsappTemplates.map((tpl, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={tpl.title}
                  onChange={(e) => handleTemplateChange(idx, 'title', e.target.value)}
                  className="font-bold text-xs bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTemplate(idx)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                rows={2}
                value={tpl.message}
                onChange={(e) => handleTemplateChange(idx, 'message', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: MongoDB Atlas Connection & Vercel Live Deployment */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                MongoDB Atlas & Vercel Deployment Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deploy live to Vercel via GitHub with persistent MongoDB Atlas storage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              dbStatus.isMongoConnected
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
            }`}>
              <span className={`h-2 w-2 rounded-full ${dbStatus.isMongoConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {dbStatus.isMongoConnected ? 'MongoDB Atlas Connected' : 'Demo Mode (Atlas Ready)'}
            </span>

            <button
              type="button"
              onClick={refreshAllData}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Refresh connection status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-white">
            Quick MongoDB Atlas Connection Guide:
          </h4>
          <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-300">
            <li>Log in to <a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 font-semibold underline">MongoDB Atlas</a> and create a free Shared (M0) Cluster.</li>
            <li>Under <strong>Database Access</strong>, add a user (e.g. <code>leadAdmin</code>) with password.</li>
            <li>Under <strong>Network Access</strong>, add IP Address <code>0.0.0.0/0</code> (Allow Access from Anywhere for Vercel).</li>
            <li>Click <strong>Connect</strong> &gt; <strong>Drivers</strong> &gt; Copy your connection string:
              <pre className="mt-1 p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.xxxxx.mongodb.net/leadtracker?retryWrites=true&amp;w=majority
              </pre>
            </li>
            <li>Add <code>MONGODB_URI</code> to your local <code>.env.local</code> file or to your <strong>Vercel Project &gt; Settings &gt; Environment Variables</strong> when deploying!</li>
          </ol>
        </div>
      </div>

    </div>
  );
}

