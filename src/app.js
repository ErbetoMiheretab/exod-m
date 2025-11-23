import compression from 'compression';
import cors from 'cors';
import express, { json, urlencoded, Router } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { cors as corsConfig, env } from './config/env.js';
// NOTE: We use default import here because errorHandler was exported as default
import userRouter from './modules/users/routes/index.js'; 
import errorHandler from './shared/middleware/errorHandler.js'; 
// import { requestLogger } from './shared/middleware/requestLogger'; // Uncomment if you have this file created



class App {
  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeModules();
    this.initializeErrorHandling();
  }

  initializeMiddlewares() {
    // Security
    this.app.use(helmet());
    this.app.use(cors(corsConfig));

    // Body parsing
    this.app.use(json({ limit: '10mb' }));
    this.app.use(urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    this.app.use(compression());

    // Logging
    if (env === 'development') {
      this.app.use(morgan('dev'));
    }
    // this.app.use(requestLogger); // Uncomment if you have this middleware

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
  }

  initializeModules() {
    const apiRouter = Router();

    // Mount modules
    // Note: We pass the router object directly, not calling it as a function
    apiRouter.use('/users', userRouter);

    // Mount API router (Prefix: /api/v1)
    this.app.use('/api/v1', apiRouter);

    // 404 handler (Catch-all)
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
      });
    });
  }

  initializeErrorHandling() {
    // Bind the error handler
    this.app.use(errorHandler);
  }

  getApp() {
    return this.app;
  }
}

// Export the initialized Express app instance
export default new App().getApp();