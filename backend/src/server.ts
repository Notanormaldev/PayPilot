import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pino from 'pino';
import { healthRouter } from './routes/health';
import { employeesRouter } from './routes/employees';
import { contractsRouter } from './routes/contracts';
import { payrunsRouter } from './routes/payruns';
import { sentinelRouter } from './routes/sentinel';
import { dashboardRouter } from './routes/dashboard';
import { timeOffRouter } from './routes/time-off';
import { attendanceRouter } from './routes/attendance';
import { salaryStructuresRouter } from './routes/salary-structures';

dotenv.config();

const logger = pino({
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: { colorize: true },
        }
      : undefined,
});

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/health', healthRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/contracts', contractsRouter);
app.use('/api/payruns', payrunsRouter);
app.use('/api/sentinel', sentinelRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/time-off', timeOffRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/salary-structures', salaryStructuresRouter);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(port, () => {
  logger.info(`🚀 PayPilot API server running on http://localhost:${port}`);
  console.log(`🚀 PayPilot API server running on http://localhost:${port}`);
});

export default app;
