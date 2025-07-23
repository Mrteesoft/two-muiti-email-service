import express from 'express';
import cors from 'cors';
import { EmailWorker } from '../workers/emailWorker';

export class HealthServer {
  private app: express.Application;
  private server: any;
  private emailWorker: EmailWorker | null = null;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const isWorkerHealthy = this.emailWorker ? true : false;
      
      res.status(isWorkerHealthy ? 200 : 503).json({
        success: isWorkerHealthy,
        message: isWorkerHealthy ? 'Worker Service is running' : 'Worker Service is not ready',
        timestamp: new Date().toISOString(),
        service: 'worker-service',
        worker: {
          status: isWorkerHealthy ? 'running' : 'not-ready',
          uptime: process.uptime(),
        }
      });
    });

    // Worker status endpoint
    this.app.get('/status', (req, res) => {
      res.json({
        success: true,
        message: 'Worker Service Status',
        timestamp: new Date().toISOString(),
        service: 'worker-service',
        worker: {
          status: this.emailWorker ? 'running' : 'not-ready',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          pid: process.pid,
        }
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
      });
    });
  }

  public setEmailWorker(worker: EmailWorker): void {
    this.emailWorker = worker;
  }

  public start(port: number = 3002): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(port, () => {
        console.log(`🏥 Worker Service health server running on port ${port}`);
        console.log(`📍 Health check: http://localhost:${port}/health`);
        console.log(`📍 Status: http://localhost:${port}/status`);
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('✅ Health server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
