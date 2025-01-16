import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the Alert document and export it
export interface IAlert extends Document {
  userId: string;
  cryptoId: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
}

// Define the schema
const alertSchema = new Schema<IAlert>({
  userId: {
    type: String,
    required: true
  },
  cryptoId: {
    type: String,
    required: true
  },
  targetPrice: {
    type: Number,
    required: true
  },
  condition: {
    type: String,
    enum: ['above', 'below'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the model
const Alert = mongoose.model<IAlert>('Alert', alertSchema);

export default Alert;

