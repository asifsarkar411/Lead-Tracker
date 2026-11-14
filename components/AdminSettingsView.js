'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  MessageSquare, 
  Sparkles,
  Link2,
  Phone
} from 'lucide-react';

export default function AdminSettingsView() {
  const { 
    settings, 
    saveSettings, 
    refreshAllData 
  } = useApp();

  const [formData, setFormData] = useState({
    siteName: '',
    tagline: '',
    logoUrl: '',
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
        siteName: settings.siteName || 'Lead Tracker',
        tagline: settings.tagline || 'Agency Sales & WhatsApp Leads Tracker',
        logoUrl: settings.logoUrl || '',
        agencyPhone: settings.agencyPhone || '+8801700000000',
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

    // Ensure currency remains ৳ (BDT)
    const payload = {
      ...formData,
      currencySymbol: '৳'
    };

    const res = await saveSettings(payload);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      await refreshAllData();
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setErrorMessage(res.error || 'Failed to save settings.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            <span>Admin Control Panel</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
              Dynamic Controls
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control website branding, logo image, services portfolio, and WhatsApp follow-up templates dynamically.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save All Changes'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Website branding, logo and service controls saved and updated across the frontend!</span>
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
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            Website Branding & Logo Settings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Changes made here reflect immediately on the frontend header, title, and branding.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Website / Brand Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lead Tracker / Agency CRM"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Currency
            </label>
            <div className="w-full px-3.5 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>৳ (BDT - Bangladeshi Taka)</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Standard</span>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Website Tagline
            </label>
            <input
              type="text"
              placeholder="e.g. Digital Agency Sales & WhatsApp Leads Tracker"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Website Logo URL
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {formData.logoUrl && (
                <div className="w-10 h-10 p-1 border rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Enter any direct image link for your agency logo. If left blank, the modern ৳ badge will be used.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Agency Contact WhatsApp Phone
            </label>
            <input
              type="text"
              placeholder="+8801700000000"
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
              placeholder="sales@agency.com"
              value={formData.agencyEmail}
              onChange={(e) => setFormData({ ...formData, agencyEmail: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Dynamic Agency Services Manager */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Dynamic Agency Services Manager ({formData.services.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add or remove services offered by your agency. Updates all lead intake forms and filters dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {formData.services.map((srv) => (
            <div
              key={srv}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs"
            >
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
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

        <div className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="e.g. Mobile App Development, Shopify Store Setup, AI Chatbots..."
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
              WhatsApp Quick Message Templates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize 1-click WhatsApp follow-up messages. Tags: <code>{`{name}`}</code>, <code>{`{service}`}</code>
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

    </div>
  );
}
