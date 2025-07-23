import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  email: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [1, 'Message cannot be empty'],
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Add index for better query performance
MessageSchema.index({ email: 1 });
MessageSchema.index({ createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
