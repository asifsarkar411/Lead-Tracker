import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  clientName: { type: String, required: true },
  phone: { type: String, default: '' },
  meetingDate: { type: String, required: true }, // YYYY-MM-DD
  meetingTime: { type: String, default: '11:00 AM' }, // e.g. 03:30 PM
  platform: { 
    type: String, 
    enum: ['Google Meet', 'Zoom', 'WhatsApp Call', 'Phone Call', 'In-Person'], 
    default: 'Google Meet' 
  },
  meetingLink: { type: String, default: '' },
  agenda: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Completed', 'Rescheduled', 'Cancelled'], 
    default: 'Scheduled' 
  },
  notes: { type: String, default: '' },
  leadId: { type: String, default: '' },
  leadType: { type: String, default: 'WhatsApp' }, // 'WhatsApp' | 'Outreach' | 'Client'
  createdBy: { type: String, default: 'Sales Team' },
  assignedTo: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Meeting || mongoose.model('Meeting', MeetingSchema);

