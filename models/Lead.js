import mongoose from 'mongoose';

const FollowUpNoteSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  note: { type: String, required: true },
  outcome: { 
    type: String, 
    enum: ['Connected', 'No Answer', 'Sent Details', 'Meeting Requested', 'Positive', 'Needs Recheck', 'Not Interested'], 
    default: 'Connected' 
  },
  addedAt: { type: String }
}, { _id: true });

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true }, // WhatsApp phone number
  email: { type: String, default: '' },
  requirements: { type: String, default: '' },
  services: [{ type: String }], // e.g. 'Website Development', 'SEO', 'Paid Ads', 'GBP', 'Digital Marketing'
  potentialityStatus: { 
    type: String, 
    enum: ['Hot', 'Warm', 'Cold', 'Lost', 'Converted'], 
    default: 'Warm' 
  },
  proposalSentStatus: { 
    type: String, 
    enum: ['Not Sent', 'Drafted', 'Sent', 'Under Review', 'Accepted', 'Rejected'], 
    default: 'Not Sent' 
  },
  estimatedBudget: { type: Number, default: 0 },
  followUpDate: { type: String, default: '' }, // YYYY-MM-DD
  followUpTime: { type: String, default: '11:00' },
  followUpNotes: [FollowUpNoteSchema],
  generalNotes: { type: String, default: '' },
  leadSource: { type: String, default: 'WhatsApp Ads' },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

