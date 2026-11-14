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

export const initialDemoLinks = [
  {
    _id: 'demo_1',
    title: 'Modern E-commerce Store with Payment Gateway',
    category: 'Website Development',
    url: 'https://demo-ecommerce.agencygrowth.dev',
    description: 'Fast Next.js WooCommerce/Shopify alternative with bKash/Nagad and card checkout.',
    clientName: 'Fashion & Retail Demo',
    tags: ['E-commerce', 'Next.js', 'Online Store'],
    isFeatured: true
  },
  {
    _id: 'demo_2',
    title: 'Corporate Agency & Service Business Website',
    category: 'Website Development',
    url: 'https://demo-corporate.agencygrowth.dev',
    description: 'High-converting portfolio layout with WhatsApp booking, lead capture and blog.',
    clientName: 'B2B Corporate Demo',
    tags: ['Corporate', 'Agency', 'Lead Gen'],
    isFeatured: true
  },
  {
    _id: 'demo_3',
    title: 'Top 3 Google Map (GBP) Ranking & Local SEO Case Study',
    category: 'GBP (Google Business Profile)',
    url: 'https://demo-gbp-ranking.agencygrowth.dev',
    description: 'Ranked local clinic top 3 on Google Map pack within 45 days, generating 120+ calls/month.',
    clientName: 'Dental Care San Jose / Dhaka',
    tags: ['Google Maps', 'GBP', 'Local SEO'],
    isFeatured: true
  },
  {
    _id: 'demo_4',
    title: 'Organic Google Ranking & SEO Traffic Growth',
    category: 'SEO (Search Engine Optimization)',
    url: 'https://demo-seo-casestudy.agencygrowth.dev',
    description: 'Scaled organic search clicks from 1,200 to 34,000 monthly visits via on-page and technical SEO.',
    clientName: 'B2C E-commerce SEO',
    tags: ['SEO', 'Google Rank', 'Organic Traffic'],
    isFeatured: true
  },
  {
    _id: 'demo_5',
    title: 'High-ROAS Meta & Google Paid Ads Funnel',
    category: 'Paid Ads (Meta & Google)',
    url: 'https://demo-paidads.agencygrowth.dev',
    description: 'Generated 4.8x ROAS with Facebook & Instagram video ads and targeted Google Search PPC.',
    clientName: 'Auto Spa & Real Estate',
    tags: ['Meta Ads', 'Google Ads', 'ROAS Funnel'],
    isFeatured: true
  }
];
