import { Worker, Job } from 'bullmq';
import { createRedisConnection } from '../config/redis';
import { Message } from '../models/Message';
import { EmailService } from '../services/emailService';

export interface EmailJobData {
  messageId: string;
}

export class EmailWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker<EmailJobData>(
      'email-processing',
      this.processEmailJob.bind(this),
      {
        connection: createRedisConnection(),
        concurrency: 5, // Process up to 5 jobs concurrently
      }
    );

    this.setupEventHandlers();
  }

  private async processEmailJob(job: Job<EmailJobData>): Promise<void> {
    const { messageId } = job.data;
    
    console.log(`🔄 Processing email job for message ID: ${messageId}`);

    try {
      // Fetch the message from MongoDB using the provided ID
      const message = await Message.findById(messageId);
      
      if (!message) {
        throw new Error(`Message with ID ${messageId} not found in database`);
      }

      console.log(`📋 Retrieved message for ${message.email}`);

      // Validate the message before sending
      if (!EmailService.validateMessage(message)) {
        throw new Error('Invalid message data');
      }

      // Simulate sending the email
      await EmailService.sendEmail(message);

      console.log(`✅ Email job completed successfully for message ID: ${messageId}`);
      
    } catch (error) {
      console.error(`❌ Email job failed for message ID: ${messageId}`, error);
      throw error; // Re-throw to mark job as failed
    }
  }

  private setupEventHandlers(): void {
    this.worker.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed successfully after ${job.attemptsMade} attempt(s)`);
    });

    this.worker.on('failed', (job, err) => {
      const attempts = job?.attemptsMade || 0;
      const maxAttempts = job?.opts?.attempts || 3;

      if (attempts >= maxAttempts) {
        console.error(`❌ Job ${job?.id} permanently failed after ${attempts} attempts:`, err.message);
        console.error(`📧 Failed to process email for message ID: ${job?.data?.messageId}`);
      } else {
        console.warn(`⚠️ Job ${job?.id} failed (attempt ${attempts}/${maxAttempts}):`, err.message);
        console.log(`🔄 Job will be retried automatically`);
      }
    });

    this.worker.on('error', (err) => {
      console.error('❌ Worker error:', err);
    });

    this.worker.on('ready', () => {
      console.log('🚀 Email worker is ready and waiting for jobs');
    });

    this.worker.on('stalled', (jobId) => {
      console.warn(`⚠️ Job ${jobId} stalled - will be retried`);
    });

    this.worker.on('progress', (job, progress) => {
      console.log(`📊 Job ${job.id} progress: ${progress}%`);
    });
  }

  public async close(): Promise<void> {
    console.log('🛑 Closing email worker...');
    await this.worker.close();
    console.log('✅ Email worker closed');
  }

  public getWorker(): Worker {
    return this.worker;
  }
}
