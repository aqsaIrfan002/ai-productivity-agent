import { Router, Request, Response } from 'express';
import { listUpcomingEvents, getTodaySchedule } from '../tools/calendarTools';

const router = Router();

router.get('/upcoming', async (req: Request, res: Response) => {
  const session = req.session as any;
  if (!session.tokens) return res.status(401).json({ error: 'Not authenticated' });
  
  try {
    const events = await listUpcomingEvents(session.tokens, 10);
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/today', async (req: Request, res: Response) => {
  const session = req.session as any;
  if (!session.tokens) return res.status(401).json({ error: 'Not authenticated' });
  
  try {
    const events = await getTodaySchedule(session.tokens);
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;