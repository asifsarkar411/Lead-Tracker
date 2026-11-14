export const initialSettings = {
  _id: 'default_settings',
  siteName: 'Lead Tracker',
  tagline: 'Agency Sales, WhatsApp Leads & Outreach CRM',
  logoUrl: '',
  currencySymbol: '৳',
  agencyPhone: '+8801700000000',
  agencyEmail: 'sales@agency.com',
  services: [
    'Website Development',
    'SEO (Search Engine Optimization)',
    'Digital Marketing',
    'Paid Ads (Meta & Google)',
    'GBP (Google Business Profile)',
    'Social Media Management'
  ],
  whatsappTemplates: [
    {
      title: 'Initial WhatsApp Outreach',
      message: 'Hello {name}! Thank you for reaching out regarding {service}. We have reviewed your business requirements and would love to show you how we can generate high-intent leads. When is a good time for a 5-minute call?'
    },
    {
      title: 'Proposal Follow-up',
      message: 'Hi {name}, following up regarding the custom proposal sent for {service}. Have you had a chance to review it? I am available right now if you have any questions!'
    },
    {
      title: 'Special Incentive Follow-up',
      message: 'Hi {name}, quick update: we have an opening for our {service} onboarding this week. If you proceed by tomorrow, we will include Google Business Profile (GBP) audit and setup complimentary!'
    }
  ],
  defaultTheme: 'dark'
};

// All lead and client lists start completely fresh and empty as requested
export const initialLeads = [];
export const initialOutreachLeads = [];
export const initialClients = [];
export const initialSuccessfulClients = [];
export const initialDemoLinks = [];

