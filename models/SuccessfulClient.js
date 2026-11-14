import mongoose from 'mongoose';

const SuccessfulClientSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  businessName: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  services: [{ type: String }],
  liveWebsiteUrl: { type: String, default: '' },
  projectValue: { type: Number, default: 0 }, // in BDT (৳)
  completionDate: { type: String, default: '' },
  reviewRating: { type: Number, default: 5 },
  clientFeedback: { type: String, default: '' },
  caseStudyNote: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.SuccessfulClient || mongoose.model('SuccessfulClient', SuccessfulClientSchema);

