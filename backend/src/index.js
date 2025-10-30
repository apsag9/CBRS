import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import session from 'express-session';
import helmet from 'helmet';
import https from 'https';
import fs from 'fs';
import { config } from './config.js';
import { router } from './routes.js';
import connectDB from './config/db.js';

async function start() {
  const app = express();
  
  // Security headers
  app.use(helmet());
  
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan('dev'));
  
  // Session management
  app.use(session({
    ...config.session,
    resave: false,
    saveUninitialized: false,
  }));

  // Health check endpoint
  app.get('/health', (req, res) => res.json({ ok: true }));

  // Mount API routes with prefix
  app.use('/api', router);

  // Mount routes directly without /api prefix since it's already in the routes
  app.use(router);
  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use('/api', router);
  app.get('/health', (req, res) => res.json({ ok: true }));

  await connectDB();

  if (config.https.enabled && config.https.cert && config.https.key) {
    const httpsOptions = {
      cert: fs.readFileSync(config.https.cert),
      key: fs.readFileSync(config.https.key)
    };
    
    https.createServer(httpsOptions, app).listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on https://localhost:${config.port}`);
    });
  } else {
    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on http://localhost:${config.port}`);
    });
  }
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
