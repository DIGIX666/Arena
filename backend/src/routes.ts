import { Router } from 'express';
import authController from './controllers/auth.controller';
import jwtGuard from './middleware/jwt.guard';
import userController from './controllers/user.controller';

const router = Router();

// Public routes
router.get('/verify-username/:username', authController.verifyUsername);
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.use(jwtGuard);
router.get('/me', userController.me);
router.post('/download-key', userController.downloadKey);
router.post('/meta-tx', (req, res) => {
  res.json({ ok: true });
});

export default router;

