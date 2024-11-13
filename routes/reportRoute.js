import express from 'express';
import { generateReport, listGeneratedReportsForInmate, sendReportByEmail } from '../controllers/reportController.js';

const router = express.Router();

router.post('/generate', generateReport);
router.get('/:inmateId', listGeneratedReportsForInmate);
router.post('/send-email', sendReportByEmail);

export default router;
