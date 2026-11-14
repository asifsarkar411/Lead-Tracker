import mongoose from 'mongoose';

const DemoLinkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: [
      'Website Development',
      'SEO (Search Engine Optimization)',
      'GBP (Google Business Profile)',
      'Paid Ads (Meta & Google)',
      'Digital Marketing',
      'E-commerce Solutions',
      'Other Demos'
    ], 
    default: 'Website Development' 
  },
  url: { type: String, required: true },
  description: { type: String, default: '' },
  clientName: { type: String, default: '' },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.DemoLink || mongoose.model('DemoLink', DemoLinkSchema);
