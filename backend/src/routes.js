import { Router } from 'express';
import { login, register } from './controllers.js';

export const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
