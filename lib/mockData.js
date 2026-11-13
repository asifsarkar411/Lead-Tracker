export const initialSettings = {
  _id: 'default_settings',
  siteName: 'ApexLead Growth CRM',
  tagline: 'High-Converting Digital Agency Sales & WhatsApp Leads Tracker',
  logoUrl: '',
  currencySymbol: '$',
  agencyPhone: '+1 234 567 8900',
  agencyEmail: 'sales@agencygrowth.com',
  services: [
    'Website Development',
    'SEO (Search Engine Optimization)',
    'Digital Marketing',
    'Paid Ads (Meta & Google)',
    'GBP (Google Business Profile Optimization)',
    'Social Media Management'
  ],
  whatsappTemplates: [
    {
      title: 'Initial WhatsApp Outreach',
      message: 'Hello {name}! Thank you for reaching out to us regarding {service}. We have reviewed your business requirements and would love to show you how we can generate high-intent leads. When is a good time for a 5-minute call?'
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

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

export const initialLeads = [
  {
    _id: 'lead_1',
    name: 'Rahim Chowdhury',
    phone: '+8801712345678',
    email: 'rahim@techbangla.com',
    requirements: 'Needs a high-converting e-commerce website with payment gateway and localized SEO setup.',
    services: ['Website Development', 'SEO (Search Engine Optimization)'],
    potentialityStatus: 'Hot',
    proposalSentStatus: 'Sent',
    estimatedBudget: 1800,
    followUpDate: today,
    followUpTime: '14:30',
    followUpNotes: [
      {
        _id: 'note_1',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        note: 'Lead contacted via WhatsApp Ad. Discussed their 50-product shopify/woocommerce migration.',
        outcome: 'Positive',
        addedAt: '2 days ago'
      },
      {
        _id: 'note_2',
        date: new Date(Date.now() - 86400000).toISOString(),
        note: 'Sent detailed PDF proposal with portfolio samples. Client said they will discuss with business partner.',
        outcome: 'Sent Details',
        addedAt: 'Yesterday'
      }
    ],
    generalNotes: 'Very interested in fast turnaround. High closing probability if we offer 1-month free maintenance.',
    leadSource: 'WhatsApp Ads',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    _id: 'lead_2',
    name: 'David Miller',
    phone: '+14155552671',
    email: 'david@millerplumbing.com',
    requirements: 'Local plumbing company looking to rank top 3 in Google Map pack and run Google Local Service Ads.',
    services: ['GBP (Google Business Profile Optimization)', 'Paid Ads (Meta & Google)'],
    potentialityStatus: 'Hot',
    proposalSentStatus: 'Under Review',
    estimatedBudget: 1200,
    followUpDate: today,
    followUpTime: '16:00',
    followUpNotes: [
      {
        _id: 'note_3',
        date: new Date(Date.now() - 86400000).toISOString(),
        note: 'Shared audit of their current GMB profile showing missing citations and negative reviews. Promised to present strategy today.',
        outcome: 'Meeting Requested',
        addedAt: 'Yesterday'
      }
    ],
    generalNotes: 'Call in afternoon US time. Prepared to pay via Stripe invoice.',
    leadSource: 'WhatsApp Ads',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    _id: 'lead_3',
    name: 'Fatima Al-Mansoor',
    phone: '+971501234567',
    email: 'fatima@luxuryspa.ae',
    requirements: 'Luxury spa in Dubai wants Instagram & Facebook paid ad campaigns to boost weekend booking volume.',
    services: ['Paid Ads (Meta & Google)', 'Digital Marketing'],
    potentialityStatus: 'Warm',
    proposalSentStatus: 'Drafted',
    estimatedBudget: 2500,
    followUpDate: tomorrow,
    followUpTime: '11:00',
    followUpNotes: [
      {
        _id: 'note_4',
        date: new Date(Date.now() - 86400000).toISOString(),
        note: 'Inquired about monthly ad spend vs management fee. Sent initial price tiers.',
        outcome: 'Connected',
        addedAt: 'Yesterday'
      }
    ],
    generalNotes: 'Prefers communication over WhatsApp voice notes.',
    leadSource: 'WhatsApp Ads',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'lead_4',
    name: 'Carlos Hernandez',
    phone: '+34612345678',
    email: 'carlos@restobar-bcn.es',
    requirements: 'Restaurant website redesign with table reservation widget and local Google Business Profile rank.',
    services: ['Website Development', 'GBP (Google Business Profile Optimization)'],
    potentialityStatus: 'Cold',
    proposalSentStatus: 'Not Sent',
    estimatedBudget: 900,
    followUpDate: yesterday, // Overdue notice demo!
    followUpTime: '10:00',
    followUpNotes: [
      {
        _id: 'note_5',
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        note: 'Initial WhatsApp text received. Sent menu design question. Awaiting response.',
        outcome: 'No Answer',
        addedAt: '3 days ago'
      }
    ],
    generalNotes: 'Overdue follow-up! Needs a reminder nudge.',
    leadSource: 'WhatsApp Ads',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    _id: 'lead_5',
    name: 'Sarah Jenkins',
    phone: '+447911123456',
    email: 'sarah@jenkinscoaching.co.uk',
    requirements: 'Full organic SEO and sales funnel for online coaching business.',
    services: ['SEO (Search Engine Optimization)', 'Digital Marketing'],
    potentialityStatus: 'Warm',
    proposalSentStatus: 'Sent',
    estimatedBudget: 1500,
    followUpDate: nextWeek,
    followUpTime: '15:00',
    followUpNotes: [
      {
        _id: 'note_6',
        date: new Date(Date.now() - 86400000).toISOString(),
        note: 'Reviewed current ranking keywords. Competitors are outranking on 8 major terms. Sent proposal.',
        outcome: 'Sent Details',
        addedAt: 'Yesterday'
      }
    ],
    generalNotes: 'Budget is flexible if ROI can be demonstrated within 90 days.',
    leadSource: 'WhatsApp Ads',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export const initialOutreachLeads = [
  {
    _id: 'outreach_1',
    name: 'Michael Chang',
    company: 'Apex Dental Care',
    phone: '+14158889901',
    email: 'contact@apexdentalcare.com',
    website: 'https://apexdentalcare.com',
    services: ['GBP (Google Business Profile Optimization)', 'SEO (Search Engine Optimization)'],
    potentialityStatus: 'Hot',
    meetingStatus: 'Meeting Scheduled',
    proposalSentStatus: 'Sent',
    followUpDate: today,
    followUpNotes: [
      {
        _id: 'onote_1',
        date: new Date(Date.now() - 86400000).toISOString(),
        note: 'Cold outreach on WhatsApp. Dr. Chang responded wanting more local patients in San Jose area.',
        addedAt: 'Yesterday'
      }
    ],
    generalNotes: 'Zoom call scheduled for 3 PM PST.',
    batchTag: 'Dental Clinics CSV - Q4',
    convertedToClient: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    _id: 'outreach_2',
    name: 'Emily Watson',
    company: 'Watson Legal Group',
    phone: '+12125550198',
    email: 'info@watsonlegal.org',
    website: 'https://watsonlegal.org',
    services: ['Website Development', 'Paid Ads (Meta & Google)'],
    potentialityStatus: 'Warm',
    meetingStatus: 'Completed',
    proposalSentStatus: 'Under Review',
    followUpDate: tomorrow,
    followUpNotes: [
      {
        _id: 'onote_2',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        note: 'Completed discovery call. Current website is not mobile responsive.',
        addedAt: '2 days ago'
      }
    ],
    generalNotes: 'Reviewing budget with law partners.',
    batchTag: 'Law Firms Outreach CSV',
    convertedToClient: false,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    _id: 'outreach_3',
    name: 'Oliver Scott',
    company: 'Scott Real Estate BKK',
    phone: '+66812345678',
    email: 'oliver@scottrealestate.co',
    website: 'https://scottrealestate.co',
    services: ['Paid Ads (Meta & Google)', 'Digital Marketing'],
    potentialityStatus: 'Cold',
    meetingStatus: 'Not Scheduled',
    proposalSentStatus: 'Not Sent',
    followUpDate: yesterday,
    followUpNotes: [
      {
        _id: 'onote_3',
        date: new Date(Date.now() - 4 * 86400000).toISOString(),
        note: 'Sent introductory message with case study link.',
        addedAt: '4 days ago'
      }
    ],
    generalNotes: 'Follow up with quick WhatsApp voice note.',
    batchTag: 'Real Estate Brokers Batch 2',
    convertedToClient: false,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

export const initialClients = [
  {
    _id: 'client_1',
    clientName: 'Tariq Mansoor',
    businessName: 'Oasis Auto Spa Dubai',
    phone: '+971529998877',
    email: 'tariq@oasisautospa.ae',
    services: ['Paid Ads (Meta & Google)', 'GBP (Google Business Profile Optimization)'],
    askingCost: 2200,
    wonCost: 1950,
    paymentStatus: 'Paid',
    paidAmount: 1950,
    clientStatus: 'Active',
    contractDuration: 'Monthly Retainer',
    startDate: '2026-10-01',
    deliveryDate: '2027-04-01',
    notes: 'Paid first 2 months upfront via wire transfer. Generating 45+ leads/month on WhatsApp.',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString()
  },
  {
    _id: 'client_2',
    clientName: 'Dr. Jennifer Hayes',
    businessName: 'Hayes Dental Studio',
    phone: '+14157776655',
    email: 'jennifer@hayesdentalstudio.com',
    services: ['Website Development', 'SEO (Search Engine Optimization)'],
    askingCost: 3500,
    wonCost: 3100,
    paymentStatus: 'Partial',
    paidAmount: 1550,
    clientStatus: 'In Progress',
    contractDuration: 'One-Time Project + SEO',
    startDate: '2026-11-01',
    deliveryDate: '2026-12-15',
    notes: '50% deposit received ($1,550). Remaining $1,550 due upon website launch.',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    _id: 'client_3',
    clientName: 'Liam O’Connor',
    businessName: 'Dublin Solar Solutions',
    phone: '+353871234567',
    email: 'liam@dublinsolar.ie',
    services: ['Paid Ads (Meta & Google)', 'Digital Marketing'],
    askingCost: 1800,
    wonCost: 1600,
    paymentStatus: 'Pending',
    paidAmount: 0,
    clientStatus: 'Onboarding',
    contractDuration: 'Monthly Retainer',
    startDate: '2026-11-10',
    deliveryDate: '2026-12-10',
    notes: 'Invoice sent today. Awaiting bank clearance before launching ad creatives.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

