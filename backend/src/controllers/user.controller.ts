import { Request, Response } from 'express';
import userService from '../services/user.service';

export default {
  async me(req: Request, res: Response) {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    res.json({
      username: user.username,
      chzAddress: user.chzAddress,
    });
  },

  async downloadKey(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) throw new Error('Utilisateur non authentifié');
      const keyEnc = await userService.getEncryptedKey(user.id);
      res.json({ keyEnc });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
};

