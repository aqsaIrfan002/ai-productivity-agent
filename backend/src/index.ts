process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 UNHANDLED REJECTION:', reason);
});

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import agentRoutes from './routes/agent';
import emailRoutes from './routes/email';
import calendarRoutes from './routes/calendar';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

console.log('ENV CHECK:', {
  PORT: process.env.PORT,
  HAS_SESSION_SECRET: !!process.env.SESSION_SECRET,
  HAS_GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
  HAS_GEMINI_KEY: !!process.env.GEMINI_API_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL,
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || '',
    'http://localhost:3000',
    'https://ai-productivity-agent-frontend.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'vOYA7fz90s2iFyjZcnCjoOJC0duWMQ8t',
  resave: false,
  saveUninitialized: false,
  proxy: true, 
  cookie: {
    secure: true,     
    sameSite: 'none', 
    httpOnly: true,    
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Otto backend is running' });
});

app.use('/auth', authRoutes);
app.use('/agent', agentRoutes);
app.use('/email', emailRoutes);
app.use('/calendar', calendarRoutes);

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server is strictly listening on 0.0.0.0:${PORT}`);
});