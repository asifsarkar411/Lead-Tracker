import { connectToDatabase } from './db';
import Lead from '../models/Lead';
import OutreachLead from '../models/OutreachLead';
import Client from '../models/Client';
import Settings from '../models/Settings';
import { initialLeads, initialOutreachLeads, initialClients, initialSettings } from './mockData';

// In-memory fallback stores when MongoDB is not connected
let memoryStore = {
  leads: [...initialLeads],
  outreachLeads: [...initialOutreachLeads],
  clients: [...initialClients],
  settings: { ...initialSettings },
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
        settings = await Settings.create(initialSettings);
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
  if (db) {
    try {
      let settings = await Settings.findOneAndUpdate({}, newSettings, {
        new: true,
        upsert: true
      });
      return JSON.parse(JSON.stringify(settings));
    } catch (e) {
      console.warn('MongoDB error updating settings, fallback to memory:', e.message);
    }
  }
  memoryStore.settings = { ...memoryStore.settings, ...newSettings };
  return memoryStore.settings;
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
      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: 'i' } },
          { phone: { $regex: query.search, $options: 'i' } },
          { requirements: { $regex: query.search, $options: 'i' } },
        ];
      }
      const leads = await Lead.find(filter).sort({ createdAt: -1 });
      return JSON.parse(JSON.stringify(leads));
    } catch (e) {
      console.warn('MongoDB error fetching leads, fallback to memory:', e.message);
    }
  }

  let list = memoryStore.leads.filter(l => !l.isArchived);
  if (query.status && query.status !== 'All') {
    list = list.filter(l => l.potentialityStatus === query.status);
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    list = list.filter(l => 
      (l.name && l.name.toLowerCase().includes(s)) ||
      (l.phone && l.phone.toLowerCase().includes(s)) ||
      (l.requirements && l.requirements.toLowerCase().includes(s))
    );
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
    createdAt: new Date().toISOString(),
    followUpNotes: data.followUpNotes || []
  };
  memoryStore.leads.unshift(newLead);
  return newLead;
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
      const list = await OutreachLead.find(filter).sort({ createdAt: -1 });
      return JSON.parse(JSON.stringify(list));
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
      const list = await Client.find(filter).sort({ createdAt: -1 });
      return JSON.parse(JSON.stringify(list));
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
    createdAt: new Date().toISOString()
  };
  memoryStore.clients.unshift(newClient);
  return newClient;
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

