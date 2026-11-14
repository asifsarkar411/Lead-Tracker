import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  businessName: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  services: [{ type: String }],
  askingCost: { type: Number, default: 0 }, // Quoted/Initial asking price in BDT
  wonCost: { type: Number, default: 0 },    // Final agreed / won deal price in BDT
  paymentStatus: { 
    type: String, 
    default: 'Pending' // Pending, Partial, Paid, Overdue, Refunded
  },
  paidAmount: { type: Number, default: 0 },
  clientStatus: { 
    type: String, 
    default: 'Active' // Onboarding, Active, In Progress, Delivered, Retainer, On Hold, Completed
  },
  contractDuration: { type: String, default: '1 Month' },
  startDate: { type: String, default: '' },
  deliveryDate: { type: String, default: '' },
  notes: { type: String, default: '' },
  leadRefId: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Client || mongoose.model('Client', ClientSchema);
