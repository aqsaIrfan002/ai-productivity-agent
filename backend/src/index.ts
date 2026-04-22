import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Otto backend is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Load routes with error catching
try {
  const authRoutes = require('./routes/auth').default;
  app.use('/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (e) {
  console.error('❌ Auth routes failed:', e);
}

try {
  const agentRoutes = require('./routes/agent').default;
  app.use('/agent', agentRoutes);
  console.log('✅ Agent routes loaded');
} catch (e) {
  console.error('❌ Agent routes failed:', e);
}

try {
  const emailRoutes = require('./routes/email').default;
  app.use('/email', emailRoutes);
  console.log('✅ Email routes loaded');
} catch (e) {
  console.error('❌ Email routes failed:', e);
}

try {
  const calendarRoutes = require('./routes/calendar').default;
  app.use('/calendar', calendarRoutes);
  console.log('✅ Calendar routes loaded');
} catch (e) {
  console.error('❌ Calendar routes failed:', e);
}

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});