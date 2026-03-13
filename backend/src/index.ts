import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/rooms.routes';
import guestRoutes from './routes/guests.routes';
import reservationRoutes from './routes/reservations.routes';
import invoiceRoutes from './routes/invoices.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

// ─── Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json());

// ─── Health Check ──────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────
app.listen(config.port, () => {
  console.log(`Hotel Jay Suites API running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
