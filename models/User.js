import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, default: '', lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'sales_executive'], 
    default: 'sales_executive' 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  phone: { type: String, default: '' },
  lastLogin: { type: Date }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);

