'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialSettings } from '@/lib/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Theme state
  const [theme, setTheme] = useState('dark');
  
  // App settings state
  const [settings, setSettings] = useState(initialSettings);
  const [dbStatus, setDbStatus] = useState({ isMongoConnected: false, usingFallback: true, mongoUriConfigured: false });

  // Main data collections
  const [leads, setLeads] = useState([]);
  const [outreachLeads, setOutreachLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [demoLinks, setDemoLinks] = useState([]);
  const [successfulClients, setSuccessfulClients] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(null);

  // Active view tab
  // 'dashboard' | 'leads' | 'outreach' | 'clients' | 'client-list' | 'meetings' | 'admin'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clientListSubTab, setClientListSubTab] = useState('successful'); // 'successful' | 'demo-links'
  const [searchTerm, setSearchTerm] = useState('');

  // Date / Month / Year Filter State
  const [dateFilter, setDateFilter] = useState({
    type: 'all', // 'all', 'today', 'specific', 'month', 'year'
    date: '',
    month: '',
    year: '',
  });

  // Modals state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);
  const [editingOutreach, setEditingOutreach] = useState(null);

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isDemoLinkModalOpen, setIsDemoLinkModalOpen] = useState(false);
  const [editingDemoLink, setEditingDemoLink] = useState(null);

  const [isSuccessfulClientModalOpen, setIsSuccessfulClientModalOpen] = useState(false);
  const [editingSuccessfulClient, setEditingSuccessfulClient] = useState(null);

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

  // Theme & Settings synchronization from localStorage for instant 0ms load
  useEffect(() => {
    const savedTheme = localStorage.getItem('lead_tracker_theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const cachedSettings = localStorage.getItem('lead_tracker_settings_cache');
    if (cachedSettings) {
      try {
        const parsed = JSON.parse(cachedSettings);
        if (parsed && typeof parsed === 'object') {
          setSettings(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.warn('Error reading cached settings:', e);
      }
    }

    const cachedUser = localStorage.getItem('lead_tracker_auth_user');
    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        if (parsedUser && parsedUser.username) {
          setCurrentUser(parsedUser);
        }
      } catch (e) {
        console.warn('Error reading cached user session:', e);
      }
    }
  }, []);

  // Update browser tab title and dynamic favicon when website name or logo changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (settings?.siteName) {
        document.title = `${settings.siteName} | ${settings.tagline || 'Sales & Lead Tracker'}`;
      }
      if (settings?.logoUrl) {
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'shortcut icon';
          document.head.appendChild(link);
        }
        link.href = settings.logoUrl;
      }
    }
  }, [settings?.siteName, settings?.tagline, settings?.logoUrl]);

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

  // Build query string helper for date filters
  const buildDateQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (dateFilter.type === 'today') {
      params.append('date', new Date().toISOString().split('T')[0]);
    } else if (dateFilter.type === 'specific' && dateFilter.date) {
      params.append('date', dateFilter.date);
    } else if (dateFilter.type === 'month' && dateFilter.month) {
      params.append('month', dateFilter.month);
    } else if (dateFilter.type === 'year' && dateFilter.year) {
      params.append('year', dateFilter.year);
    }
    return params.toString();
  }, [dateFilter]);

  // Data fetchers
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        localStorage.setItem('lead_tracker_settings_cache', JSON.stringify(data.settings));
        if (data.status) setDbStatus(data.status);
      }
    } catch (e) {
      console.warn('Failed to fetch settings:', e);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const query = buildDateQueryString();
      const res = await fetch(`/api/leads${query ? '?' + query : ''}`);
      const data = await res.json();
      if (data.success && data.leads) {
        setLeads(data.leads);
      }
    } catch (e) {
      console.warn('Failed to fetch leads:', e);
    }
  }, [buildDateQueryString]);

  const fetchOutreach = useCallback(async () => {
    try {
      const query = buildDateQueryString();
      const res = await fetch(`/api/outreach${query ? '?' + query : ''}`);
      const data = await res.json();
      if (data.success && data.outreachLeads) {
        setOutreachLeads(data.outreachLeads);
      }
    } catch (e) {
      console.warn('Failed to fetch outreach:', e);
    }
  }, [buildDateQueryString]);

  const fetchClients = useCallback(async () => {
    try {
      const query = buildDateQueryString();
      const res = await fetch(`/api/clients${query ? '?' + query : ''}`);
      const data = await res.json();
      if (data.success && data.clients) {
        setClients(data.clients);
      }
    } catch (e) {
      console.warn('Failed to fetch clients:', e);
    }
  }, [buildDateQueryString]);

  const fetchDemoLinks = useCallback(async () => {
    try {
      const res = await fetch('/api/demo-links');
      const data = await res.json();
      if (data.success && data.demoLinks) {
        setDemoLinks(data.demoLinks);
      }
    } catch (e) {
      console.warn('Failed to fetch demo links:', e);
    }
  }, []);

  const fetchSuccessfulClients = useCallback(async () => {
    try {
      const res = await fetch('/api/successful-clients');
      const data = await res.json();
      if (data.success && data.successfulClients) {
        setSuccessfulClients(data.successfulClients);
      }
    } catch (e) {
      console.warn('Failed to fetch successful clients:', e);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const query = buildDateQueryString();
      const res = await fetch(`/api/stats${query ? '?' + query : ''}`);
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.warn('Failed to fetch stats:', e);
    }
  }, [buildDateQueryString]);

  const fetchMeetings = useCallback(async () => {
    try {
      const res = await fetch('/api/meetings');
      const data = await res.json();
      if (data.success && data.meetings) {
        setMeetings(data.meetings);
      }
    } catch (e) {
      console.warn('Failed to fetch meetings:', e);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (e) {
      console.warn('Failed to fetch users:', e);
    }
  }, []);

  const refreshAllData = useCallback(() => {
    fetchSettings();
    fetchLeads();
    fetchOutreach();
    fetchClients();
    fetchDemoLinks();
    fetchSuccessfulClients();
    fetchMeetings();
    fetchUsers();
    fetchStats();
  }, [fetchSettings, fetchLeads, fetchOutreach, fetchClients, fetchDemoLinks, fetchSuccessfulClients, fetchMeetings, fetchUsers, fetchStats]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Lead CRUD
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

  const importLeadsBatch = async (items) => {
    try {
      const res = await fetch('/api/leads', {
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

  // Outreach CRUD
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

  // Client CRUD
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

  const importClientsBatch = async (items) => {
    try {
      const res = await fetch('/api/clients', {
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

  const importDemoLinksBatch = async (items) => {
    try {
      const res = await fetch('/api/demo-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
      const result = await res.json();
      if (result.success) {
        await fetchDemoLinks();
        return { success: true, count: result.count };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const importSuccessfulClientsBatch = async (items) => {
    try {
      const res = await fetch('/api/successful-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
      const result = await res.json();
      if (result.success) {
        await fetchSuccessfulClients();
        return { success: true, count: result.count };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Demo Links CRUD
  const saveDemoLink = async (demoData) => {
    const isEdit = !!demoData._id;
    const url = isEdit ? `/api/demo-links/${demoData._id}` : '/api/demo-links';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoData),
      });
      const result = await res.json();
      if (result.success) {
        await fetchDemoLinks();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const removeDemoLink = async (id) => {
    try {
      const res = await fetch(`/api/demo-links/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        await fetchDemoLinks();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Successful Clients CRUD
  const saveSuccessfulClient = async (clientData) => {
    const isEdit = !!clientData._id;
    const url = isEdit ? `/api/successful-clients/${clientData._id}` : '/api/successful-clients';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });
      const result = await res.json();
      if (result.success) {
        await fetchSuccessfulClients();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const removeSuccessfulClient = async (id) => {
    try {
      const res = await fetch(`/api/successful-clients/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        await fetchSuccessfulClients();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Authentication
  const login = async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('lead_tracker_auth_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lead_tracker_auth_user');
  };

  // User Management CRUD
  const saveUser = async (userData) => {
    const isEdit = !!userData._id;
    const url = isEdit ? `/api/users/${userData._id}` : '/api/users';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const result = await res.json();
      if (result.success) {
        await fetchUsers();
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const removeUser = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        await fetchUsers();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Meetings CRUD
  const saveMeeting = async (meetingData) => {
    const isEdit = !!meetingData._id;
    const url = isEdit ? `/api/meetings/${meetingData._id}` : '/api/meetings';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData),
      });
      const result = await res.json();
      if (result.success) {
        await fetchMeetings();
        return { success: true, meeting: result.meeting };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const removeMeeting = async (id) => {
    try {
      const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        await fetchMeetings();
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
      // Optimistic update
      setSettings(prev => ({ ...prev, ...newSettings }));
      localStorage.setItem('lead_tracker_settings_cache', JSON.stringify(newSettings));

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const result = await res.json();
      if (result.success) {
        setSettings(result.settings);
        localStorage.setItem('lead_tracker_settings_cache', JSON.stringify(result.settings));
        if (result.status) setDbStatus(result.status);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Convert Lead / Outreach to Onboarded Client
  const convertToClient = (leadOrOutreach) => {
    const isOutreach = !!leadOrOutreach.company;
    const newClientData = {
      clientName: leadOrOutreach.name,
      businessName: isOutreach ? leadOrOutreach.company : (leadOrOutreach.name + ' Business'),
      phone: leadOrOutreach.phone,
      email: leadOrOutreach.email || '',
      services: leadOrOutreach.services || [],
      askingCost: '', // Start completely blank as requested
      wonCost: '',    // Start completely blank as requested
      paidAmount: '', // Start completely blank as requested
      paymentStatus: 'Pending',
      clientStatus: 'Onboarding',
      contractDuration: 'Monthly Retainer',
      startDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      notes: `Converted from ${isOutreach ? 'Outreach Cold Lead' : 'WhatsApp Ad Lead'}. ${leadOrOutreach.requirements || leadOrOutreach.generalNotes || ''}`,
      leadRefId: leadOrOutreach._id
    };

    setEditingClient(newClientData);
    setIsClientModalOpen(true);
  };

  // Calculate detailed follow-up notices
  const todayStr = new Date().toISOString().split('T')[0];

  const dueFollowUps = leads
    .filter(l => l.followUpDate && l.followUpDate <= todayStr)
    .map(l => ({
      _id: l._id,
      name: l.name,
      phone: l.phone,
      service: (l.services || [])[0] || 'Digital Services',
      requirements: l.requirements,
      followUpDate: l.followUpDate,
      followUpTime: l.followUpTime || '11:00 AM',
      type: 'WhatsApp Lead',
      potentialityStatus: l.potentialityStatus,
      isOverdue: l.followUpDate < todayStr,
      isToday: l.followUpDate === todayStr,
      item: l
    }));

  const dueOutreachFollowUps = outreachLeads
    .filter(o => o.followUpDate && o.followUpDate <= todayStr)
    .map(o => ({
      _id: o._id,
      name: o.name,
      phone: o.phone,
      service: (o.services || [])[0] || 'Outreach',
      requirements: o.company ? `Company: ${o.company}` : o.generalNotes,
      followUpDate: o.followUpDate,
      followUpTime: '11:00 AM',
      type: 'Cold Outreach',
      potentialityStatus: o.potentialityStatus,
      isOverdue: o.followUpDate < todayStr,
      isToday: o.followUpDate === todayStr,
      item: o
    }));

  const dueMeetings = meetings
    .filter(m => m.meetingDate && m.meetingDate <= todayStr && m.status === 'Scheduled')
    .map(m => ({
      _id: m._id,
      name: `${m.clientName} (Meeting: ${m.title})`,
      phone: m.phone,
      service: m.platform,
      requirements: m.agenda || m.meetingLink || 'Scheduled Call/Meeting',
      followUpDate: m.meetingDate,
      followUpTime: m.meetingTime || '11:00 AM',
      type: `Meeting (${m.platform})`,
      potentialityStatus: 'Scheduled',
      isOverdue: m.meetingDate < todayStr,
      isToday: m.meetingDate === todayStr,
      item: m
    }));

  const allFollowUpNotices = [...dueFollowUps, ...dueOutreachFollowUps, ...dueMeetings].sort((a, b) => {
    // Sort overdue first, then date
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    return a.followUpDate.localeCompare(b.followUpDate);
  });

  const totalNoticeCount = allFollowUpNotices.length;

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
        importLeadsBatch,
        removeLead,
        outreachLeads,
        saveOutreachLead,
        importOutreachBatch,
        removeOutreachLead,
        clients,
        saveClient,
        importClientsBatch,
        removeClient,
        demoLinks,
        saveDemoLink,
        importDemoLinksBatch,
        removeDemoLink,
        successfulClients,
        saveSuccessfulClient,
        importSuccessfulClientsBatch,
        removeSuccessfulClient,
        // Meetings
        meetings,
        fetchMeetings,
        saveMeeting,
        removeMeeting,
        isMeetingModalOpen,
        setIsMeetingModalOpen,
        editingMeeting,
        setEditingMeeting,
        // Users & Auth
        users,
        fetchUsers,
        saveUser,
        removeUser,
        currentUser,
        login,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        stats,
        refreshAllData,
        activeTab,
        setActiveTab,
        clientListSubTab,
        setClientListSubTab,
        searchTerm,
        setSearchTerm,
        dateFilter,
        setDateFilter,
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
        isDemoLinkModalOpen,
        setIsDemoLinkModalOpen,
        editingDemoLink,
        setEditingDemoLink,
        isSuccessfulClientModalOpen,
        setIsSuccessfulClientModalOpen,
        editingSuccessfulClient,
        setEditingSuccessfulClient,
        // Follow-up notices
        allFollowUpNotices,
        dueFollowUps,
        dueOutreachFollowUps,
        dueMeetings,
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
