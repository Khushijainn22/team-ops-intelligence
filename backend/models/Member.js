import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String },
  email: { type: String },
  weeklyCapacity: { type: Number, default: 40 }, // hours per week
}, { timestamps: true });

export default mongoose.model('Member', memberSchema);
