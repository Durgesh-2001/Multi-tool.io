import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Primary Information
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, default: null },
  password: { type: String, required: true },
  
  // Subscription & Credits
  isProUser: { type: Boolean, default: false },
  subscriptionPlan: { type: String, enum: ['Free', 'Micro', 'Weekly', 'Super', 'Pro', 'Pro+'], default: 'Free' },
  subscriptionStartDate: { type: Date },
  subscriptionEndDate: { type: Date },
  credits: { type: Number, default: 150 },
  freeGenerationsUsed: { type: Number, default: 0 },
  
  // Authentication & Security
  googleId: { type: String, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  
  // Metadata
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
export default User; 