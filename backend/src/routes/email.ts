import { Router, Request, Response } from 'express';
import { listEmails } from '../tools/emailTools';

const router = Router();

router.get('/inbox', async (req: Request, res: Response) => {
  const session = req.session as any;
  if (!session.tokens) return res.status(401).json({ error: 'Not authenticated' });
  
  try {
    const emails = await listEmails(session.tokens, 10);
    res.json(emails);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;