import mongoose from 'mongoose';

const OutreachFollowUpSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  note: { type: String, required: true },
  addedAt: { type: String }
}, { _id: true });

const OutreachLeadSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  business: { type: String, default: '' },
  company: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  services: [{ type: String }],
  contacted: { type: String, default: 'No' }, // Yes / No
  priority: { type: String, default: 'Medium' }, // High, Medium, Low
  followUpStatus: { type: String, default: 'Not started' }, // Not started, In progress, Completed, etc.
  potentialityStatus: { type: String, default: 'Cold' }, // Hot, Warm, Cold
  meetingStatus: { type: String, default: 'Not Scheduled' },
  proposalSentStatus: { type: String, default: 'Not Sent' }, // Not sent, Sent, Accepted, etc.
  firstFollowUp: { type: String, default: '' },
  secondFollowUp: { type: String, default: '' },
  thirdFollowUp: { type: String, default: '' },
  moreFollowUps: { type: String, default: '' },
  category: { type: String, default: '' },
  otherCategories: { type: String, default: '' },
  mapRank: { type: Number, default: null },
  rating: { type: Number, default: null },
  reviews: { type: Number, default: null },
  address: { type: String, default: '' },
  facebook: { type: String, default: '' },
  instagram: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  cms: { type: String, default: '' },
  analytics: { type: String, default: '' },
  opportunityScore: { type: Number, default: null },
  temperature: { type: String, default: '' }, // Hot, Warm, Cold
  problemsFound: { type: String, default: '' },
  googleMaps: { type: String, default: '' },
  followUpDate: { type: String, default: '' },
  followUpNotes: [OutreachFollowUpSchema],
  generalNotes: { type: String, default: '' },
  batchTag: { type: String, default: 'Outreach Leads' },
  convertedToClient: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.OutreachLead || mongoose.model('OutreachLead', OutreachLeadSchema);
