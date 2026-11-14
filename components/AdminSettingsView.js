'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Phone,
  Upload,
  X,
  Eye,
  RefreshCw
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
  const fileInputRef = useRef(null);

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

  // Handle Logo File Upload (PNG, JPG, SVG, WebP)
  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Logo image size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setFormData(prev => ({ ...prev, logoUrl: dataUrl }));
      setErrorMessage('');
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    // Ensure currency strictly locked to BDT (৳)
    const payload = {
      ...formData,
      currencySymbol: '৳'
    };

    const res = await saveSettings(payload);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      await refreshAllData();
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to save settings.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            <span>Admin Control Panel</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
              Dynamic Controls
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload your agency logo, change website name dynamically, manage services portfolio and WhatsApp templates.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving Changes...' : 'Save All Changes'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="font-semibold">Website name, logo, and settings saved successfully! Changes are updated immediately across the site and browser tab.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section 1: Website Branding & Dynamic Logo Upload */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              Website Branding & Logo Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Changes made here immediately update the navbar, sidebar, header, and browser tab.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Website Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Website / Brand Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Intellec IT / Lead Tracker"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Standard Locked Currency */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Currency
            </label>
            <div className="w-full px-3.5 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>৳ (BDT - Bangladeshi Taka)</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Locked Standard</span>
            </div>
          </div>

          {/* Website Tagline */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Website Tagline
            </label>
            <input
              type="text"
              placeholder="e.g. Digital Agency Sales & WhatsApp Leads Tracker"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* LOGO UPLOAD ZONE */}
          <div className="sm:col-span-2 space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Website Logo (Upload Image File)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
              onChange={handleLogoFileUpload}
              className="hidden"
              id="admin-logo-upload"
            />

            {/* If no logo uploaded yet */}
            {!formData.logoUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click to Upload Logo Image
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Supports PNG, JPG, SVG, WebP (Max 5MB). Will display in navbar and browser icon.
                </div>
              </div>
            ) : (
              /* Logo Preview Cards (Light & Dark preview) */
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Light Background Preview */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Light Mode Preview
                    </span>
                    <div className="h-16 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={formData.logoUrl} 
                        alt="Logo Light Preview" 
                        className="max-h-14 max-w-[200px] object-contain" 
                      />
                    </div>
                  </div>

                  {/* Dark Background Preview */}
                  <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Dark Mode Preview
                    </span>
                    <div className="h-16 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={formData.logoUrl} 
                        alt="Logo Dark Preview" 
                        className="max-h-14 max-w-[200px] object-contain" 
                      />
                    </div>
                  </div>
                </div>

                {/* Logo Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Logo</span>
                  </button>
                </div>
              </div>
            )}

            {/* Direct URL input fallback */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Or paste direct Logo Image URL:
              </label>
              <input
                type="text"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

          </div>

          {/* Agency Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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

          {/* Agency Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Agency Sales Email
            </label>
            <input
              type="email"
              placeholder="sales@agency.com"
              value={formData.agencyEmail}
              onChange={(e) => setFormData({ ...formData, agencyEmail: e.target.value })}
              className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

        </div>
      </div>

      {/* Section 2: Services Management */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Agency Services Portfolio
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            These services populate dropdowns and tag selectors across WhatsApp leads and client onboarding.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add new service (e.g. Mobile App Development, UI/UX Design)"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAddService}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-purple-600 hover:bg-purple-500 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {formData.services.map((srv) => (
            <div
              key={srv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 text-xs font-semibold"
            >
              <span>{srv}</span>
              <button
                type="button"
                onClick={() => handleRemoveService(srv)}
                className="p-0.5 hover:text-red-500 rounded-full transition-colors"
                title="Remove service"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: WhatsApp Templates */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              WhatsApp Quick Message Templates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize 1-click WhatsApp follow-up messages. Use placeholders: <code className="text-emerald-500 font-mono">{"{name}"}</code> and <code className="text-emerald-500 font-mono">{"{service}"}</code>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddTemplate}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Template</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.whatsappTemplates.map((tpl, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={tpl.title}
                  onChange={(e) => handleTemplateChange(idx, 'title', e.target.value)}
                  placeholder="Template Title"
                  className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTemplate(idx)}
                  className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                  title="Remove template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                rows={2}
                value={tpl.message}
                onChange={(e) => handleTemplateChange(idx, 'message', e.target.value)}
                placeholder="Message template..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
