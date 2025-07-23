import { Router } from 'express';
import { createMessage, getAllMessages } from '../controllers/messageController';
import { validateMessage, handleValidationErrors } from '../middleware/validation';

const router = Router();

// POST /messages - Create a new message
router.post(
  '/messages',
  validateMessage,
  handleValidationErrors,
  createMessage
);

// GET /messages - Get all messages (bonus feature)
router.get('/messages', getAllMessages);

export default router;
