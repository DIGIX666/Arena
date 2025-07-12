import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export default {
  async verifyUsername(req: Request, res: Response) {
    const available = await AuthService.isUsernameAvailable(req.params.username);
    res.json({ available });
  },

  async signup(req: Request, res: Response) {
    try {
      const token = await AuthService.signup(req.body);
      res.json({ token });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const token = await AuthService.login(req.body);
      res.json({ token });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }
};
