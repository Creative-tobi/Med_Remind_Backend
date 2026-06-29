import express from 'express'
import { Register, login, GetUserProfile } from '../controller/auth.controller.js'
import { verifyToken } from '../middleware/authmiddleware.js'


const router = express.Router()

router.post('/register', Register);
router.post('/login', login);

//protected route
router.get('/profile', verifyToken, GetUserProfile);

export default router;