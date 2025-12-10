import { Router } from 'express';
import { handleSendingEmail, handleRecordingEmail } from '../controllers/email.controller';

const router = Router();

router.post('/send-email', handleSendingEmail);

router.post('/record-email', handleRecordingEmail);

export default router;