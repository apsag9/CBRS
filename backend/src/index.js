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
import { scheduleReminders } from './notifications.js';

async function start() {
  const app = express();
  
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
  
  // CORS configuration — allow local development ports dynamically and optional FRONTEND_URL
  const frontendUrl = process.env.FRONTEND_URL;
  function corsOriginValidator(origin, callback) {
    // Allow server-to-server requests (no origin)
    if (!origin) return callback(null, true);

    // If a specific FRONTEND_URL is set, allow it
    if (frontendUrl && origin === frontendUrl) return callback(null, true);

    // Allow any localhost origin (useful when vite picks 5173/5174 etc.)
    try {
      const u = new URL(origin);
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return callback(null, true);
    } catch (err) {
      // ignore parse errors
    }

    // otherwise block
    return callback(new Error('Not allowed by CORS'));
  }

  app.use(cors({ origin: corsOriginValidator, credentials: true }));
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(morgan('dev'));
  
  // Session management
  app.use(session({
    ...config.session,
    resave: false,
    saveUninitialized: false,
  }));

  // Health check endpoint
  app.get('/health', (req, res) => res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  }));

  // Mount API routes with /api prefix
  app.use('/api', router);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({ 
      message: err.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // Connect to MongoDB
  await connectDB();

  // Start reminder scheduler (if configured)
  try {
    scheduleReminders();
    console.log('Reminder scheduler started (if enabled)');
  } catch (err) {
    console.warn('Failed to start reminder scheduler:', err.message);
  }

  // Start server (HTTPS or HTTP) with port-retry on EADDRINUSE
  async function startServerWithRetries(startHttps = false, initialPort = config.port, maxRetries = 5) {
    let port = Number(initialPort) || 4001;

    // prepare HTTPS options if needed
    let httpsOptions = null;
    if (startHttps && config.https.cert && config.https.key) {
      httpsOptions = {
        cert: fs.readFileSync(config.https.cert),
        key: fs.readFileSync(config.https.key)
      };
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++, port++) {
      try {
        await new Promise((resolve, reject) => {
          let server;
          const onListen = () => resolve(server);
          const onError = (err) => reject(err);

          if (httpsOptions) {
            server = https.createServer(httpsOptions, app)
              .once('error', onError)
              .once('listening', onListen)
              .listen(port);
          } else {
            server = app
              .listen(port)
              .once('error', onError)
              .once('listening', onListen);
          }
        });

        console.log(`✅ Backend running on http${httpsOptions ? 's' : ''}://localhost:${port}`);
        if (httpsOptions) console.log('🔒 HTTPS enabled');
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        return; // success
      } catch (err) {
        if (err && err.code === 'EADDRINUSE') {
          console.warn(`Port ${port} in use, trying ${port + 1}...`);
          // continue loop and try next port
        } else {
          // if HTTPS failed because of cert read or other reason, surface and optionally fall back
          if (startHttps && (!config.https.cert || !config.https.key)) {
            console.warn('HTTPS not configured properly, falling back to HTTP');
            // try HTTP once using initial port
            httpsOptions = null;
            attempt = -1; // reset attempts for HTTP fallback
            continue;
          }
          console.error('❌ Failed to start server:', err);
          throw err;
        }
      }
    }

    console.error('❌ Unable to start server: all attempted ports are in use');
    process.exit(1);
  }

  // Try HTTPS first when enabled, otherwise start HTTP; function will retry ports when needed
  if (config.https.enabled) {
    startServerWithRetries(true).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  } else {
    startServerWithRetries(false).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});