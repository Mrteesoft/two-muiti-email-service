import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { addEmailJob } from '../config/queue';

export interface CreateMessageRequest {
  email: string;
  message: string;
}

export const createMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, message }: CreateMessageRequest = req.body;

    // Create and save the message to MongoDB
    const newMessage = new Message({
      email,
      message
    });

    const savedMessage = await newMessage.save();
    console.log(`✅ Message saved with ID: ${savedMessage._id}`);

    // Add job to the queue for processing
    await addEmailJob(savedMessage._id as string);

    res.status(201).json({
      success: true,
      message: 'Message created and queued for processing',
      data: {
        id: savedMessage._id,
        email: savedMessage.email,
        message: savedMessage.message,
        createdAt: savedMessage.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Error creating message:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const getAllMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 messages

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: messages,
      count: messages.length
    });
  } catch (error) {
    console.error('❌ Error retrieving messages:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
