import { connectDatabase, disconnectDatabase } from './config/database';
import { EmailWorker } from './workers/emailWorker';
import { HealthServer } from './server/healthServer';
import dotenv from 'dotenv';

dotenv.config();

let emailWorker: EmailWorker;
let healthServer: HealthServer;

const startWorkerService = async (): Promise<void> => {
  try {
    console.log('🚀 Starting Service B (Worker Service)...');

    // Connect to MongoDB
    await connectDatabase();

    // Initialize the health server
    healthServer = new HealthServer();
    await healthServer.start(3002);

    // Initialize the email worker
    emailWorker = new EmailWorker();
    healthServer.setEmailWorker(emailWorker);

    console.log('✅ Service B (Worker Service) is running and ready to process jobs');
    console.log('📋 Listening for email processing jobs...');

  } catch (error) {
    console.error('❌ Failed to start worker service:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  try {
    if (emailWorker) {
      await emailWorker.close();
      console.log('✅ Email worker closed');
    }

    if (healthServer) {
      await healthServer.stop();
      console.log('✅ Health server stopped');
    }

    await disconnectDatabase();
    console.log('✅ Database connection closed');

    console.log('✅ Service B shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the service
startWorkerService();
