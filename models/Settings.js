import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Lead Tracker' },
  tagline: { type: String, default: 'Digital Agency Sales & WhatsApp Leads Tracker' },
  logoUrl: { type: String, default: '' },
  currencySymbol: { type: String, default: '৳' }, // Strictly BDT (৳)
  agencyPhone: { type: String, default: '+8801700000000' },
  agencyEmail: { type: String, default: 'sales@agency.com' },
  services: {
    type: [String],
    default: [
      'Website Development',
      'SEO (Search Engine Optimization)',
      'Digital Marketing',
      'Paid Ads (Meta & Google)',
      'GBP (Google Business Profile)',
      'Social Media Management'
    ]
  },
  whatsappTemplates: {
    type: [
      {
        title: { type: String },
        message: { type: String }
      }
    ],
    default: [
      {
        title: 'Initial WhatsApp Follow-up',
        message: 'Hello {name}! Thanks for contacting us regarding {service}. We have reviewed your requirements and would love to share a personalized plan. When would be a good time for a quick 5-minute call?'
      },
      {
        title: 'Proposal Follow-up',
        message: 'Hi {name}, following up on the proposal we shared for {service}. Let us know if you have any questions or if you would like any customizations made.'
      },
      {
        title: 'Special Offer Follow-up',
        message: 'Hey {name}, our team is currently reserving slots for this month’s {service} sprint. If we finalize this week, we can include bonus GBP setup free of charge!'
      }
    ]
  },
  defaultTheme: { type: String, default: 'dark' }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
