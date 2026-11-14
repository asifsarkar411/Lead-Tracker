import mongoose from 'mongoose';

const FollowUpNoteSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  note: { type: String, required: true },
  outcome: { 
    type: String, 
    default: 'Connected' 
  },
  addedAt: { type: String }
}, { _id: true });

const LeadSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  phone: { type: String, required: true }, // WhatsApp Phone Number or @handle
  email: { type: String, default: '' },
  requirements: { type: String, default: '' },
  services: [{ type: String }],
  callNotReceived: { type: Boolean, default: false }, // "Not receive call" / "Call Not received"
  priority: { 
    type: String, 
    default: 'Medium ⚡' // High 🔥, Medium ⚡, Low 💤
  },
  potentialityStatus: { 
    type: String, 
    default: 'Warm' 
  },
  proposalSentStatus: { 
    type: String, 
    default: 'Not Sent' // Requirement Gathering, Proposal Preparing, Proposal Sent, Negotiation, Proposal Accepted, Proposal Rejected
  },
  onboardStatus: { 
    type: String, 
    default: 'New Lead' // New Lead, In Contact, Proposal Sent, Onboarded / Won 🎉, Lost ❌, On Hold
  },
  firstFollowUp: { type: String, default: '' },
  secondFollowUp: { type: String, default: '' },
  thirdFollowUp: { type: String, default: '' },
  latestFeedback: { type: String, default: '' },
  nextAction: { 
    type: String, 
    default: 'Follow Up' // Follow Up, Send Proposal, Call Back, Schedule Demo, Invoice Sent
  },
  dealValue: { type: Number, default: 0 }, // in BDT (৳)
  estimatedBudget: { type: Number, default: 0 },
  platform: { type: String, default: '' }, // Facebook Video, Facebook Poster, etc.
  campaignName: { type: String, default: '' },
  adCreative: { type: String, default: '' },
  followUpDate: { type: String, default: '' }, // YYYY-MM-DD
  followUpTime: { type: String, default: '11:00 AM' },
  followUpNotes: [FollowUpNoteSchema],
  generalNotes: { type: String, default: '' },
  leadSource: { type: String, default: 'WhatsApp Ads' },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
