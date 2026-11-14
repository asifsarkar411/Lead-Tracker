import mongoose from 'mongoose';

const SuccessfulClientSchema = new mongoose.Schema({
  clientName: { type: String, default: '' },
  businessName: { type: String, default: '' },
  category: { type: String, default: 'Web Design & Development' },
  industry: { type: String, default: '' },
  website: { type: String, default: '' },
  liveWebsiteUrl: { type: String, default: '' },
  serviceResult: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  services: [{ type: String }],
  projectValue: { type: Number, default: 0 }, // in BDT (৳)
  completionDate: { type: String, default: '' },
  reviewRating: { type: Number, default: 5 },
  clientFeedback: { type: String, default: '' },
  notes: { type: String, default: '' },
  caseStudyNote: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.SuccessfulClient || mongoose.model('SuccessfulClient', SuccessfulClientSchema);
