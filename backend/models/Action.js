import mongoose from 'mongoose';

const actionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
  owner: { type: String, required: true },
  deadline: { type: Date },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'overdue'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Action', actionSchema);
