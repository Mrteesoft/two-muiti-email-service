import { IMessage } from '../models/Message';

export class EmailService {
  /**
   * Simulates sending an email by logging the output
   * @param message - The message object containing email and message content
   */
  static async sendEmail(message: IMessage): Promise<void> {
    try {
      console.log(`🔄 Starting email send process for ${message.email}`);

      // Simulate potential network issues (5% chance of failure for testing retry logic)
      if (Math.random() < 0.05) {
        throw new Error('Simulated network timeout');
      }

      // Simulate email sending delay (realistic behavior)
      const delay = 1000 + Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, delay));

      // Log the email sending simulation
      console.log(`📧 Sending message to [${message.email}]: ${message.message}`);

      // Additional logging for development
      console.log(`✅ Email sent successfully to ${message.email} at ${new Date().toISOString()}`);

    } catch (error) {
      console.error(`❌ Failed to send email to ${message.email}:`, error);
      throw new Error(`Email delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates if an email can be sent
   * @param message - The message object to validate
   */
  static validateMessage(message: IMessage): boolean {
    if (!message.email || !message.message) {
      console.error('❌ Invalid message: missing email or message content');
      return false;
    }
    
    if (!message.email.includes('@')) {
      console.error('❌ Invalid email format');
      return false;
    }
    
    return true;
  }
}
