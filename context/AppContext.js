'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialSettings, initialLeads, initialOutreachLeads, initialClients } from '@/lib/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Theme state
  const [theme, setTheme] = useState('dark');
  
  // App settings state (dynamic branding, logo, services, etc.)
  const [settings, setSettings] = useState(initialSettings);
  const [dbStatus, setDbStatus] = useState({ isMongoConnected: false, usingFallback: true, mongoUriConfigured: false });

  // Main data collections
  const [leads, setLeads] = useState([]);
  const [outreachLeads, setOutreachLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'leads', 'outreach', 'clients', 'reminders', 'admin'
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);
  const [editingOutreach, setEditingOutreach] = useState(null);

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Audio notice sound player
  const playNotificationChime = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio play restricted or unsupported:', e);
    }
  }, []);

  // Theme synchronization
  useEffect(() => {
    const savedTheme = localStorage.getItem('lead_tracker_theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('lead_tracker_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initial data fetchers
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        if (data.status) setDbStatus(data.status);
      }
    } catch (e) {
      console.warn('Failed to fetch settings from API, using defaults:', e);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success && data.leads) {
        setLeads(data.leads);
      }
    } catch (e) {
      console.warn('Failed to fetch leads from API, using defaults:', e);
      setLeads(initialLeads);
    }
  }, []);

  const fetchOutreach = useCallback(async () => {
    try {
      const res = await fetch('/api/outreach');
      const data = await res.json();
      if (data.success && data.outreachLeads) {
        setOutreachLeads(data.outreachLeads);
      }
    } catch (e) {
      console.warn('Failed to fetch outreach from API, using defaults:', e);
      setOutreachLeads(initialOutreachLeads);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (data.success && data.clients) {
        setClients(data.clients);
      }
    } catch (e) {
      console.warn('Failed to fetch clients from API, using defaults:', e);
      setClients(initialClients);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.warn('Failed to fetch stats from API:', e);
    }
  }, []);

  const refreshAllData = useCallback(() => {
    fetchSettings();
    fetchLeads();
    fetchOutreach();
    fetchClients();
    fetchStats();
  }, [fetchSettings, fetchLeads, fetchOutreach, fetchClients, fetchStats]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Lead CRUD Operations
  const saveLead = async (leadData) => {
    const isEdit = !!leadData._id;
    const url = isEdit ? `/api/leads/${leadData._id}` : '/api/leads';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      const result = await res.json();
      if (result.success) {
        await refreshAllData();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const removeLead = async (id) => {
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        await refreshAllData();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Outreach CRUD Operations
  const saveOutreachLead = async (outreachData) => {
    const isEdit = !!outreachData._id;
    const url = isEdit ? `/api/outreach/${outreachData._id}` : '/api/outreach';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outreachData),
      });
      const result = await res.json();
      if (result.success) {
        await refreshAllData();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const importOutreachBatch = async (items) => {
    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
      const result = await res.json();
      if (result.success) {
        await refreshAllData();
        return { success: true, count: result.count };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const removeOutreachLead = async (id) => {
    try {
      const res = await fetch(`/api/outreach/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        await refreshAllData();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Client CRUD Operations
  const saveClient = async (clientData) => {
    const isEdit = !!clientData._id;
    const url = isEdit ? `/api/clients/${clientData._id}` : '/api/clients';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });
      const result = await res.json();
      if (result.success) {
        await refreshAllData();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const removeClient = async (id) => {
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        await refreshAllData();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Update Settings
  const saveSettings = async (newSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const result = await res.json();
      if (result.success) {
        setSettings(result.settings);
        if (result.status) setDbStatus(result.status);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Helper: Convert Lead or Outreach into Onboarded Client
  const convertToClient = (leadOrOutreach) => {
    const isOutreach = !!leadOrOutreach.company;
    const newClientData = {
      clientName: leadOrOutreach.name,
      businessName: isOutreach ? leadOrOutreach.company : (leadOrOutreach.name + ' Business'),
      phone: leadOrOutreach.phone,
      email: leadOrOutreach.email || '',
      services: leadOrOutreach.services || [],
      askingCost: leadOrOutreach.estimatedBudget || 1500,
      wonCost: leadOrOutreach.estimatedBudget || 1500,
      paymentStatus: 'Pending',
      paidAmount: 0,
      clientStatus: 'Onboarding',
      contractDuration: 'Monthly Retainer',
      startDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      notes: `Converted from ${isOutreach ? 'Outreach Cold Lead' : 'WhatsApp Ad Lead'}. Notes: ${leadOrOutreach.generalNotes || leadOrOutreach.requirements || ''}`,
      leadRefId: leadOrOutreach._id
    };

    setEditingClient(newClientData);
    setIsClientModalOpen(true);
  };

  // Calculate follow-up notices
  const todayStr = new Date().toISOString().split('T')[0];
  
  const dueFollowUps = leads.filter(l => l.followUpDate && l.followUpDate <= todayStr);
  const dueOutreachFollowUps = outreachLeads.filter(o => o.followUpDate && o.followUpDate <= todayStr);
  const totalNoticeCount = dueFollowUps.length + dueOutreachFollowUps.length;

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        settings,
        saveSettings,
        dbStatus,
        leads,
        saveLead,
        removeLead,
        outreachLeads,
        saveOutreachLead,
        importOutreachBatch,
        removeOutreachLead,
        clients,
        saveClient,
        removeClient,
        stats,
        refreshAllData,
        activeTab,
        setActiveTab,
        searchTerm,
        setSearchTerm,
        // Modals
        isLeadModalOpen,
        setIsLeadModalOpen,
        editingLead,
        setEditingLead,
        isClientModalOpen,
        setIsClientModalOpen,
        editingClient,
        setEditingClient,
        isOutreachModalOpen,
        setIsOutreachModalOpen,
        editingOutreach,
        setEditingOutreach,
        isReminderModalOpen,
        setIsReminderModalOpen,
        isAdminModalOpen,
        setIsAdminModalOpen,
        // Reminders & Notices
        dueFollowUps,
        dueOutreachFollowUps,
        totalNoticeCount,
        playNotificationChime,
        convertToClient,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

