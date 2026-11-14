import { connectToDatabase } from './db';
import Lead from '../models/Lead';
import OutreachLead from '../models/OutreachLead';
import Client from '../models/Client';
import Settings from '../models/Settings';
import DemoLink from '../models/DemoLink';
import SuccessfulClient from '../models/SuccessfulClient';
import { 
  initialLeads, 
  initialOutreachLeads, 
  initialClients, 
  initialSettings, 
  initialDemoLinks,
  initialSuccessfulClients 
} from './mockData';

// In-memory fallback stores when MongoDB is not connected
let memoryStore = {
  leads: [...initialLeads],
  outreachLeads: [...initialOutreachLeads],
  clients: [...initialClients],
  settings: { ...initialSettings },
  demoLinks: [...initialDemoLinks],
  successfulClients: [...initialSuccessfulClients],
};

export async function getStoreStatus() {
  const db = await connectToDatabase();
  return {
    isMongoConnected: !!db,
    usingFallback: !db,
    mongoUriConfigured: !!process.env.MONGODB_URI
  };
}

// ====================== SETTINGS ======================
export async function getSettings() {
  const db = await connectToDatabase();
  if (db) {
    try {
      let settings = await Settings.findOne({});
      if (!settings) {
        const { _id, ...cleanInit } = initialSettings;
        settings = await Settings.create(cleanInit);
      }
      return JSON.parse(JSON.stringify(settings));
    } catch (e) {
      console.warn('MongoDB error fetching settings, fallback to memory:', e.message);
    }
  }
  return memoryStore.settings;
}

export async function updateSettings(newSettings) {
  const db = await connectToDatabase();
  // Strip immutable fields
  const { _id, createdAt, updatedAt, ...cleanUpdate } = newSettings;
  
  // Ensure currency is always BDT (৳)
  cleanUpdate.currencySymbol = '৳';

  if (db) {
    try {
      let settings = await Settings.findOneAndUpdate(
        {}, 
        { $set: cleanUpdate }, 
        { new: true, upsert: true }
      );
      return JSON.parse(JSON.stringify(settings));
    } catch (e) {
      console.warn('MongoDB error updating settings, fallback to memory:', e.message);
    }
  }
  memoryStore.settings = { ...memoryStore.settings, ...cleanUpdate };
  return memoryStore.settings;
}

// Helper: Filter items by Date / Month / Year
function applyDateFilter(item, query) {
  const itemDate = item.createdAt ? item.createdAt.split('T')[0] : (item.date || '');
  if (!itemDate) return true;

  if (query.date && query.date !== 'All') {
    if (itemDate !== query.date) return false;
  }
  if (query.month && query.month !== 'All') {
    // Format: 'YYYY-MM' or 'MM'
    if (!itemDate.includes(query.month)) return false;
  }
  if (query.year && query.year !== 'All') {
    // Format: 'YYYY'
    if (!itemDate.startsWith(query.year)) return false;
  }
  return true;
}

// ====================== LEADS ======================
export async function getLeads(query = {}) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const filter = { isArchived: false };
      if (query.status && query.status !== 'All') {
        filter.potentialityStatus = query.status;
      }
      if (query.service && query.service !== 'All') {
        filter.services = query.service;
      }
      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: 'i' } },
          { phone: { $regex: query.search, $options: 'i' } },
          { requirements: { $regex: query.search, $options: 'i' } },
        ];
      }
      let leads = await Lead.find(filter).sort({ createdAt: -1 });
      let results = JSON.parse(JSON.stringify(leads));

      // Apply in-memory date/month/year filter
      if (query.date || query.month || query.year) {
        results = results.filter(l => applyDateFilter(l, query));
      }

      return results;
    } catch (e) {
      console.warn('MongoDB error fetching leads, fallback to memory:', e.message);
    }
  }

  let list = memoryStore.leads.filter(l => !l.isArchived);
  if (query.status && query.status !== 'All') {
    list = list.filter(l => l.potentialityStatus === query.status);
  }
  if (query.service && query.service !== 'All') {
    list = list.filter(l => (l.services || []).includes(query.service));
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    list = list.filter(l => 
      (l.name && l.name.toLowerCase().includes(s)) ||
      (l.phone && l.phone.toLowerCase().includes(s)) ||
      (l.requirements && l.requirements.toLowerCase().includes(s))
    );
  }
  if (query.date || query.month || query.year) {
    list = list.filter(l => applyDateFilter(l, query));
  }
  return list;
}

export async function createLead(data) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const newLead = await Lead.create(data);
      return JSON.parse(JSON.stringify(newLead));
    } catch (e) {
      console.warn('MongoDB error creating lead, fallback to memory:', e.message);
    }
  }

  const newLead = {
    ...data,
    _id: 'lead_' + Date.now(),
    createdAt: data.createdAt || new Date().toISOString(),
    followUpNotes: data.followUpNotes || []
  };
  memoryStore.leads.unshift(newLead);
  return newLead;
}

export async function importBatchLeads(items) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const created = await Lead.insertMany(items);
      return JSON.parse(JSON.stringify(created));
    } catch (e) {
      console.warn('MongoDB error batch inserting leads, fallback to memory:', e.message);
    }
  }

  const created = items.map((item, idx) => ({
    ...item,
    _id: 'lead_' + (Date.now() + idx),
    createdAt: item.createdAt || new Date().toISOString(),
    followUpNotes: item.followUpNotes || []
  }));
  memoryStore.leads.unshift(...created);
  return created;
}

export async function updateLead(id, data) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const updated = await Lead.findByIdAndUpdate(id, data, { new: true });
      if (updated) return JSON.parse(JSON.stringify(updated));
    } catch (e) {
      console.warn('MongoDB error updating lead, fallback to memory:', e.message);
    }
  }

  const index = memoryStore.leads.findIndex(l => l._id === id);
  if (index !== -1) {
    memoryStore.leads[index] = { ...memoryStore.leads[index], ...data, updatedAt: new Date().toISOString() };
    return memoryStore.leads[index];
  }
  return null;
}

export async function deleteLead(id) {
  const db = await connectToDatabase();
  if (db) {
    try {
      await Lead.findByIdAndDelete(id);
      return { success: true };
    } catch (e) {
      console.warn('MongoDB error deleting lead, fallback to memory:', e.message);
    }
  }

  memoryStore.leads = memoryStore.leads.filter(l => l._id !== id);
  return { success: true };
}

// ====================== OUTREACH LEADS ======================
export async function getOutreachLeads(query = {}) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const filter = {};
      if (query.status && query.status !== 'All') {
        filter.potentialityStatus = query.status;
      }
      if (query.meetingStatus && query.meetingStatus !== 'All') {
        filter.meetingStatus = query.meetingStatus;
      }
      let list = await OutreachLead.find(filter).sort({ createdAt: -1 });
      let results = JSON.parse(JSON.stringify(list));

      if (query.date || query.month || query.year) {
        results = results.filter(o => applyDateFilter(o, query));
      }
      return results;
    } catch (e) {
      console.warn('MongoDB error fetching outreach, fallback to memory:', e.message);
    }
  }

  let list = [...memoryStore.outreachLeads];
  if (query.status && query.status !== 'All') {
    list = list.filter(o => o.potentialityStatus === query.status);
  }
  if (query.meetingStatus && query.meetingStatus !== 'All') {
    list = list.filter(o => o.meetingStatus === query.meetingStatus);
  }
  if (query.date || query.month || query.year) {
    list = list.filter(o => applyDateFilter(o, query));
  }
  return list;
}

export async function createOutreachLead(data) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const newLead = await OutreachLead.create(data);
      return JSON.parse(JSON.stringify(newLead));
    } catch (e) {
      console.warn('MongoDB error creating outreach, fallback to memory:', e.message);
    }
  }

  const newLead = {
    ...data,
    _id: 'outreach_' + Date.now() + '_' + Math.random().toString(36).substring(7),
    createdAt: data.createdAt || new Date().toISOString(),
    followUpNotes: data.followUpNotes || []
  };
  memoryStore.outreachLeads.unshift(newLead);
  return newLead;
}

export async function importBatchOutreachLeads(items) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const created = await OutreachLead.insertMany(items);
      return JSON.parse(JSON.stringify(created));
    } catch (e) {
      console.warn('MongoDB error batch inserting, fallback to memory:', e.message);
    }
  }

  const created = items.map((item, idx) => ({
    ...item,
    _id: 'outreach_' + (Date.now() + idx),
    createdAt: item.createdAt || new Date().toISOString(),
    followUpNotes: item.followUpNotes || []
  }));
  memoryStore.outreachLeads.unshift(...created);
  return created;
}

export async function updateOutreachLead(id, data) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const updated = await OutreachLead.findByIdAndUpdate(id, data, { new: true });
      if (updated) return JSON.parse(JSON.stringify(updated));
    } catch (e) {
      console.warn('MongoDB error updating outreach, fallback to memory:', e.message);
    }
  }

  const index = memoryStore.outreachLeads.findIndex(o => o._id === id);
  if (index !== -1) {
    memoryStore.outreachLeads[index] = { ...memoryStore.outreachLeads[index], ...data };
    return memoryStore.outreachLeads[index];
  }
  return null;
}

export async function deleteOutreachLead(id) {
  const db = await connectToDatabase();
  if (db) {
    try {
      await OutreachLead.findByIdAndDelete(id);
      return { success: true };
    } catch (e) {
      console.warn('MongoDB error deleting outreach, fallback to memory:', e.message);
    }
  }

  memoryStore.outreachLeads = memoryStore.outreachLeads.filter(o => o._id !== id);
  return { success: true };
}

// ====================== ONBOARDED CLIENTS ======================
export async function getClients(query = {}) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const filter = {};
      if (query.paymentStatus && query.paymentStatus !== 'All') {
        filter.paymentStatus = query.paymentStatus;
      }
      if (query.clientStatus && query.clientStatus !== 'All') {
        filter.clientStatus = query.clientStatus;
      }
      let list = await Client.find(filter).sort({ createdAt: -1 });
      let results = JSON.parse(JSON.stringify(list));

      if (query.date || query.month || query.year) {
        results = results.filter(c => applyDateFilter(c, query));
      }
      return results;
    } catch (e) {
      console.warn('MongoDB error fetching clients, fallback to memory:', e.message);
    }
  }

  let list = [...memoryStore.clients];
  if (query.paymentStatus && query.paymentStatus !== 'All') {
    list = list.filter(c => c.paymentStatus === query.paymentStatus);
  }
  if (query.clientStatus && query.clientStatus !== 'All') {
    list = list.filter(c => c.clientStatus === query.clientStatus);
  }
  if (query.date || query.month || query.year) {
    list = list.filter(c => applyDateFilter(c, query));
  }
  return list;
}

export async function createClient(data) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const newClient = await Client.create(data);
      return JSON.parse(JSON.stringify(newClient));
    } catch (e) {
      console.warn('MongoDB error creating client, fallback to memory:', e.message);
    }
  }

  const newClient = {
    ...data,
    _id: 'client_' + Date.now(),
    createdAt: data.createdAt || new Date().toISOString()
  };
  memoryStore.clients.unshift(newClient);
  return newClient;
}

export async function importBatchClients(items) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const created = await Client.insertMany(items);
      return JSON.parse(JSON.stringify(created));
    } catch (e) {
      console.warn('MongoDB error batch inserting clients, fallback to memory:', e.message);
    }
  }

  const created = items.map((item, idx) => ({
    ...item,
    _id: 'client_' + (Date.now() + idx),
    createdAt: item.createdAt || new Date().toISOString()
  }));
  memoryStore.clients.unshift(...created);
  return created;
}

export async function updateClient(id, data) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const updated = await Client.findByIdAndUpdate(id, data, { new: true });
      if (updated) return JSON.parse(JSON.stringify(updated));
    } catch (e) {
      console.warn('MongoDB error updating client, fallback to memory:', e.message);
    }
  }

  const index = memoryStore.clients.findIndex(c => c._id === id);
  if (index !== -1) {
    memoryStore.clients[index] = { ...memoryStore.clients[index], ...data };
    return memoryStore.clients[index];
  }
  return null;
}

export async function deleteClient(id) {
  const db = await connectToDatabase();
  if (db) {
    try {
      await Client.findByIdAndDelete(id);
      return { success: true };
    } catch (e) {
      console.warn('MongoDB error deleting client, fallback to memory:', e.message);
    }
  }

  memoryStore.clients = memoryStore.clients.filter(c => c._id !== id);
  return { success: true };
}

// ====================== DEMO LINKS ======================
export async function getDemoLinks(query = {}) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const filter = {};
      if (query.category && query.category !== 'All') {
        filter.category = query.category;
      }
      const list = await DemoLink.find(filter).sort({ createdAt: -1 });
      return JSON.parse(JSON.stringify(list));
    } catch (e) {
      console.warn('MongoDB error fetching demo links, fallback to memory:', e.message);
    }
  }

  let list = [...memoryStore.demoLinks];
  if (query.category && query.category !== 'All') {
    list = list.filter(d => d.category === query.category);
  }
  return list;
}

export async function createDemoLink(data) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const created = await DemoLink.create(data);
      return JSON.parse(JSON.stringify(created));
    } catch (e) {
      console.warn('MongoDB error creating demo link, fallback to memory:', e.message);
    }
  }

  const created = {
    ...data,
    _id: 'demo_' + Date.now(),
    createdAt: new Date().toISOString()
  };
  memoryStore.demoLinks.unshift(created);
  return created;
}

export async function importBatchDemoLinks(items) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const created = await DemoLink.insertMany(items);
      return JSON.parse(JSON.stringify(created));
    } catch (e) {
      console.warn('MongoDB error batch inserting demo links, fallback to memory:', e.message);
    }
  }

  const created = items.map((item, idx) => ({
    ...item,
    _id: 'demo_' + (Date.now() + idx),
    createdAt: item.createdAt || new Date().toISOString()
  }));
  memoryStore.demoLinks.unshift(...created);
  return created;
}

export async function updateDemoLink(id, data) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const updated = await DemoLink.findByIdAndUpdate(id, data, { new: true });
      if (updated) return JSON.parse(JSON.stringify(updated));
    } catch (e) {
      console.warn('MongoDB error updating demo link, fallback to memory:', e.message);
    }
  }

  const index = memoryStore.demoLinks.findIndex(d => d._id === id);
  if (index !== -1) {
    memoryStore.demoLinks[index] = { ...memoryStore.demoLinks[index], ...data };
    return memoryStore.demoLinks[index];
  }
  return null;
}

export async function deleteDemoLink(id) {
  const db = await connectToDatabase();
  if (db) {
    try {
      await DemoLink.findByIdAndDelete(id);
      return { success: true };
    } catch (e) {
      console.warn('MongoDB error deleting demo link, fallback to memory:', e.message);
    }
  }

  memoryStore.demoLinks = memoryStore.demoLinks.filter(d => d._id !== id);
  return { success: true };
}

// ====================== SUCCESSFUL CLIENTS ======================
export async function getSuccessfulClients(query = {}) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const list = await SuccessfulClient.find({}).sort({ createdAt: -1 });
      return JSON.parse(JSON.stringify(list));
    } catch (e) {
      console.warn('MongoDB error fetching successful clients, fallback to memory:', e.message);
    }
  }

  return [...memoryStore.successfulClients];
}

export async function createSuccessfulClient(data) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const created = await SuccessfulClient.create(data);
      return JSON.parse(JSON.stringify(created));
    } catch (e) {
      console.warn('MongoDB error creating successful client, fallback to memory:', e.message);
    }
  }

  const created = {
    ...data,
    _id: 'success_' + Date.now(),
    createdAt: new Date().toISOString()
  };
  memoryStore.successfulClients.unshift(created);
  return created;
}

export async function importBatchSuccessfulClients(items) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const created = await SuccessfulClient.insertMany(items);
      return JSON.parse(JSON.stringify(created));
    } catch (e) {
      console.warn('MongoDB error batch inserting successful clients, fallback to memory:', e.message);
    }
  }

  const created = items.map((item, idx) => ({
    ...item,
    _id: 'success_' + (Date.now() + idx),
    createdAt: item.createdAt || new Date().toISOString()
  }));
  memoryStore.successfulClients.unshift(...created);
  return created;
}

export async function updateSuccessfulClient(id, data) {
  const db = await connectToDatabase();
  if (db) {
    try {
      const updated = await SuccessfulClient.findByIdAndUpdate(id, data, { new: true });
      if (updated) return JSON.parse(JSON.stringify(updated));
    } catch (e) {
      console.warn('MongoDB error updating successful client, fallback to memory:', e.message);
    }
  }

  const index = memoryStore.successfulClients.findIndex(s => s._id === id);
  if (index !== -1) {
    memoryStore.successfulClients[index] = { ...memoryStore.successfulClients[index], ...data };
    return memoryStore.successfulClients[index];
  }
  return null;
}

export async function deleteSuccessfulClient(id) {
  const db = await connectToDatabase();
  if (db) {
    try {
      await SuccessfulClient.findByIdAndDelete(id);
      return { success: true };
    } catch (e) {
      console.warn('MongoDB error deleting successful client, fallback to memory:', e.message);
    }
  }

  memoryStore.successfulClients = memoryStore.successfulClients.filter(s => s._id !== id);
  return { success: true };
}
