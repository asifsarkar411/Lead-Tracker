import mongoose from 'mongoose';

const DemoLinkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  clientName: { type: String, default: '' },
  businessType: { type: String, default: '' },
  category: {
    type: String,
    default: 'Web Design & Development'
  },
  url: { type: String, required: true },
  linkType: { type: String, default: 'Frontend' }, // Frontend, Admin Panel, Store-Front, Website
  username: { type: String, default: '' },
  password: { type: String, default: '' },
  notes: { type: String, default: '' },
  description: { type: String, default: '' },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.DemoLink || mongoose.model('DemoLink', DemoLinkSchema);
