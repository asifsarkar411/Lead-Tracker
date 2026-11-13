import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  businessName: { type: String, default: '' },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  services: [{ type: String }], // 'Website Development', 'SEO', 'Paid Ads', 'GBP', etc.
  askingCost: { type: Number, required: true, default: 0 }, // Quoted/Initial asking price
  wonCost: { type: Number, required: true, default: 0 },    // Final agreed / won deal price
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Partial', 'Paid', 'Overdue', 'Refunded'], 
    default: 'Pending' 
  },
  paidAmount: { type: Number, default: 0 },
  clientStatus: { 
    type: String, 
    enum: ['Onboarding', 'Active', 'In Progress', 'Delivered', 'Retainer', 'On Hold', 'Completed'], 
    default: 'Active' 
  },
  contractDuration: { type: String, default: '1 Month' }, // or 'Monthly Retainer', 'One-Time'
  startDate: { type: String, default: '' },
  deliveryDate: { type: String, default: '' },
  notes: { type: String, default: '' },
  leadRefId: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Client || mongoose.model('Client', ClientSchema);

