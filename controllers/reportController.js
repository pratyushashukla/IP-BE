import Inmate from '../models/inmateModel.js';
import TaskAssignment from '../models/taskAssignmentModel.js';
import Meal from '../models/mealModel.js';
import Visitor from '../models/visitorModel.js';
import Appointment from '../models/appointmentModel.js';
import Report from '../models/reportModel.js';
import { generateReportPDF, deleteFile } from '../utils/pdfGenerator.js';
import { sendReportEmail } from '../utils/emailService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureDownloadsDir = () => {
  const downloadsPath = path.join(__dirname, '../downloads');
  if (!fs.existsSync(downloadsPath)) {
    fs.mkdirSync(downloadsPath, { recursive: true });
  }
};

// Helper function to generate the report file
export const generateReportFile = async (inmateId, type, userId) => {
  ensureDownloadsDir();

  // Fetch inmate with populated fields
  const inmate = await Inmate.findById(inmateId);
  if (!inmate) throw new Error('Inmate not found');

  let data = { inmate };

  switch (type) {
    case 'complete':       
      const tasks = await TaskAssignment.find({ inmateId })
        .populate({
          path: 'taskId',
          select: 'title description assignedBy',
          populate: { path: 'assignedBy', select: 'firstname lastname' },
        });
      const meals = await Meal.find({ inmateId }).populate('allergyId', 'allergyName');
      const visitors = await Visitor.find({ inmateId });
      const appointments = await Appointment.find({ inmateId }).populate('visitorId', 'firstname lastname');
      data = { ...data, tasks, meals, visitors, appointments };
      break;
    case 'tasks':
      data.tasks = await TaskAssignment.find({ inmateId })
        .populate({
          path: 'taskId',
          select: 'title description assignedBy',
          populate: { path: 'assignedBy', select: 'firstname lastname' },
        });
      break;
    case 'meal':
      data.meals = await Meal.find({ inmateId }).populate('allergyId', 'allergyName');
      break;
    case 'visitor':
      data.visitors = await Visitor.find({ inmateId });
      break;
    default:
      throw new Error('Invalid report type');
  }

  const pdfBuffer = await generateReportPDF(type, data);
  const reportFileName = `report_${inmateId}_${Date.now()}.pdf`;
  const reportFilePath = path.join(__dirname, '../downloads', reportFileName);
  fs.writeFileSync(reportFilePath, pdfBuffer);

  // Record the report in the database
  const report = new Report({ inmateId, reportType: type, generatedBy: userId, reportFilePath });
  await report.save();

  return { pdfBuffer, reportFilePath, reportFileName };
};

// Generate report and download as response
export const generateReport = async (req, res) => {
    const { inmateId, type } = req.body;
    const userId = req.user.userId;
  
    try {
      const { reportFilePath } = await generateReportFile(inmateId, type, userId);
      res.download(reportFilePath, (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).json({ message: "Error downloading file" });
        } else {
          deleteFile(reportFilePath);
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
// List generated reports for a specific inmate
export const listGeneratedReportsForInmate = async (req, res) => {
  const { inmateId } = req.params;

  try {
    const reports = await Report.find({ inmateId }).populate('generatedBy', 'firstname lastname');
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendReportByEmail = async (req, res) => {
  const { inmateId, type, recipientEmail } = req.body;
  const userId = req.user.userId;

  try {
    const { reportFilePath, reportFileName } = await generateReportFile(inmateId, type, userId);
    const inmate = await Inmate.findById(inmateId);
    const inmateName = `${inmate.firstName} ${inmate.lastName}`;
    
    await sendReportEmail(recipientEmail, inmateName, type, reportFilePath);
    
    deleteFile(reportFilePath); // Optional: Delete file after sending
    res.status(200).json({ message: "Report sent successfully to " + recipientEmail });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
