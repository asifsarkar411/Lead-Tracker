import mongoose from 'mongoose';

const OutreachFollowUpSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  note: { type: String, required: true },
  addedAt: { type: String }
}, { _id: true });

const OutreachLeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  services: [{ type: String }],
  potentialityStatus: { 
    type: String, 
    enum: ['Hot', 'Warm', 'Cold', 'Unresponsive', 'Not Interested', 'Qualified'], 
    default: 'Cold' 
  },
  meetingStatus: { 
    type: String, 
    enum: ['Not Scheduled', 'Meeting Scheduled', 'Completed', 'Rescheduled', 'No Show'], 
    default: 'Not Scheduled' 
  },
  proposalSentStatus: { 
    type: String, 
    enum: ['Not Sent', 'Drafted', 'Sent', 'Accepted', 'Rejected'], 
    default: 'Not Sent' 
  },
  followUpDate: { type: String, default: '' },
  followUpNotes: [OutreachFollowUpSchema],
  generalNotes: { type: String, default: '' },
  batchTag: { type: String, default: 'Default Import' },
  convertedToClient: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.OutreachLead || mongoose.model('OutreachLead', OutreachLeadSchema);

