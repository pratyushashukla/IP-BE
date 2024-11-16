import express from 'express';
import { generateReport, listGeneratedReportsForInmate, sendReportByEmail, getReportForInmate } from '../controllers/reportController.js';

const router = express.Router();

router.post('/generate', generateReport);
router.get('/:inmateId', listGeneratedReportsForInmate);
router.post('/send-email', sendReportByEmail);
router.get('/:inmateId/:reportType', getReportForInmate);

export default router;
