import { Queue } from 'bullmq';
import { createRedisConnection } from './redis';

export interface EmailJobData {
  messageId: string;
}

export const emailQueue = new Queue<EmailJobData>('email-processing', {
  connection: createRedisConnection(),
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,      // Keep last 50 failed jobs
    attempts: 5,           // Retry failed jobs up to 5 times
    backoff: {
      type: 'exponential',
      delay: 2000,         // Start with 2 second delay
    },
    // Add delay between retries
    delay: 1000,           // 1 second delay before first attempt
  },
});

emailQueue.on('error', (error) => {
  console.error('❌ Email queue error:', error);
});

export const addEmailJob = async (messageId: string): Promise<void> => {
  try {
    await emailQueue.add('process-email', { messageId }, {
      priority: 1,
      delay: 0,
    });
    console.log(`✅ Email job added for message ID: ${messageId}`);
  } catch (error) {
    console.error('❌ Error adding email job:', error);
    throw error;
  }
};
