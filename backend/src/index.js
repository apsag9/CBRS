import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config.js';
import { router } from './routes.js';
import connectDB from './config/db.js';

async function start() {
  const app = express();
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan('dev'));

  app.use('/api', router);
  app.get('/health', (req, res) => res.json({ ok: true }));

  await connectDB();

  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
