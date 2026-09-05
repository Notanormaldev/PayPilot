import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pino from 'pino';

// Routers
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { employeesRouter } from './routes/employees.js';
import { contractsRouter } from './routes/contracts.js';
import { attendanceRouter } from './routes/attendance.js';
import { timeOffRouter } from './routes/time-off.js';
import { salaryStructuresRouter } from './routes/salary-structures.js';
import { payrunsRouter } from './routes/payruns.js';
import { sentinelRouter } from './routes/sentinel.js';
import { dashboardRouter } from './routes/dashboard.js';
import { notificationsRouter } from './routes/notifications.js';
import { settingsRouter } from './routes/settings.js';
import { taxRouter } from './routes/tax.js';
import { schedulesRouter } from './routes/schedules.js';

dotenv.config();

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

const app = express();
const PORT = process.env.PORT || 4000;

// Global Middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/contracts', contractsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/time-off', timeOffRouter);
app.use('/api/salary-structures', salaryStructuresRouter);
app.use('/api/payruns', payrunsRouter);
app.use('/api/sentinel', sentinelRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/tax', taxRouter);
app.use('/api/schedules', schedulesRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(err, 'Unhandled error');
  res.status(500).json({
    error: 'InternalServerError',
    message: err.message || 'An unexpected error occurred',
  });
});

app.listen(PORT, () => {
  logger.info(`🚀 PayPilot API server running on http://localhost:${PORT}`);
  console.log(`🚀 PayPilot API server running on http://localhost:${PORT}`);
});

export default app;
