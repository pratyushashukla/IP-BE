import PDFDocument from 'pdfkit';
import fs from 'fs';

// function to generate PDF
export const generateMealPlanPDF = (meal, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);

    writeStream.on("finish", () => {
      console.log("PDF creation finished and file closed.");
      resolve(); // Resolve the promise once the PDF is completely written
    });

    writeStream.on("error", (error) => {
      console.error(`Error creating PDF: ${error.message}`);
      reject(error); // Reject promise if there's an error
    });

    // Pipe document content to file
    doc.pipe(writeStream);

    // PDF content
    doc
      .fontSize(18)
      .text(
        `Meal Plan for ${meal.inmateId.firstName} ${meal.inmateId.lastName}`,
        { underline: true }
      );
    doc.moveDown();
    doc.fontSize(12).text(`Meal Type: ${meal.mealType}`);
    doc.text(`Meal Plan: ${meal.mealPlan}`);
    doc.text(`Dietary Preferences: ${meal.dietaryPreferences || "None"}`);

    // Correct allergy formatting
    const allergies = meal.allergyId && meal.allergyId.length > 0
      ? meal.allergyId.map((a) => a.allergyName).join(", ")
      : "None";
    doc.text(`Allergies: ${allergies}`);

    // Finalize the PDF and end the stream
    doc.end();
  });
};



export const generateReportPDF = (type, data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Header with Inmate's Name
    const inmateName = `${data.inmate.firstName} ${data.inmate.lastName}`;
    doc.fontSize(24).text(`Report of ${inmateName}`, { align: 'center', underline: true });
    doc.moveDown(1.5);

    // Inmate Details (shown in every report type)
    doc.fontSize(16).text("Inmate Details", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Name: ${inmateName}`);
    doc.text(`DOB: ${data.inmate.dateOfBirth}`);
    doc.text(`Gender: ${data.inmate.gender}`);
    doc.text(`Contact: ${data.inmate.contactNumber || 'N/A'}`);
    doc.text(`Sentence Duration: ${data.inmate.sentenceDuration} months`);
    doc.text(`Time Left: ${data.inmate.timeLeft} months`);
    doc.moveDown();

    // Task Assignments - Only if type is 'complete' or 'task'
    if (type === 'complete' || type === 'tasks') {
      doc.fontSize(16).text("Task Assignments", { underline: true });
      doc.moveDown(0.5);
      if (data.tasks && data.tasks.length > 0) {
        data.tasks.forEach((task) => {
          doc.fontSize(12).text(`Title: ${task.taskId?.title || 'N/A'}`);
          doc.text(`Description: ${task.taskId?.description || 'N/A'}`);
          const assignedBy = task.taskId?.assignedBy
            ? `${task.taskId.assignedBy.firstname || 'N/A'} ${task.taskId.assignedBy.lastname || 'N/A'}`
            : 'N/A'; // Fallback if assignedBy is null
          doc.text(`Assigned By: ${assignedBy}`);
          doc.text(`Status: ${task.completionStatus ? 'Completed' : 'Pending'}`);
          doc.text(`Due Date: ${task.dueDate || 'N/A'}`);
          doc.moveDown(0.5);
        });
      } else {
        doc.fontSize(12).text("No tasks assigned", { italic: true });
      }
      doc.moveDown();
    }

    // Meal Plan - Only if type is 'complete' or 'meal'
    if (type === 'complete' || type === 'meal') {
      doc.fontSize(16).text("Meal Plan", { underline: true });
      doc.moveDown(0.5);
      if (data.meals && data.meals.length > 0) {
        data.meals.forEach((meal) => {
          doc.fontSize(12).text(`Meal Type: ${meal.mealType}`);
          doc.text(`Plan Duration: ${meal.mealPlan}`);
          doc.text(`Dietary Preferences: ${meal.dietaryPreferences || 'N/A'}`);
          const allergies = meal.allergyId && meal.allergyId.length > 0 
            ? meal.allergyId.map((a) => a.allergyName).join(', ') 
            : 'None';
          doc.text(`Allergies: ${allergies}`);
          doc.moveDown(0.5);
        });
      } else {
        doc.fontSize(12).text("No meal plans assigned", { italic: true });
      }
      doc.moveDown();
    }

    // Visitor Interactions with nested Appointments - Only if type is 'complete' or 'visitor'
    if (type === 'complete' || type === 'visitor') {
      doc.fontSize(16).text("Visitor Interactions", { underline: true });
      doc.moveDown(0.5);
      if (data.visitors && data.visitors.length > 0) {
        data.visitors.forEach((visitor) => {
          doc.fontSize(12).text(`Visitor Name: ${visitor.firstname || 'N/A'} ${visitor.lastname || 'N/A'}`);
          doc.text(`Relationship: ${visitor.relationship || 'N/A'}`);
          doc.text(`Contact: ${visitor.contactNumber || 'N/A'}`);
          doc.moveDown(0.5);

          // Appointments nested under each visitor
          // Only filter appointments if data.appointments is defined
          const visitorAppointments = (data.appointments || []).filter(appointment => 
            appointment.visitorId && appointment.visitorId._id.equals(visitor._id)
          );
          
          if (visitorAppointments.length > 0) {
            doc.text("Appointments:");
            visitorAppointments.forEach((appointment) => {
              doc.fontSize(12).text(`   - Start Time: ${appointment.startTime || 'N/A'}`);
              doc.text(`   - Estimated End Time: ${appointment.estimatedEndTime || 'N/A'}`);
              doc.text(`   - Actual End Time: ${appointment.actualEndTime || 'N/A'}`);
              doc.text(`   - Status: ${appointment.status}`);
              doc.text(`   - Remarks: ${appointment.remarks || 'N/A'}`);
              if (appointment.cancellationReason) doc.text(`   - Cancellation Reason: ${appointment.cancellationReason}`);
              doc.text(`   - Identity Verified: ${appointment.identityVerified ? 'Yes' : 'No'}`);
              doc.text(`   - Flagged for Security: ${appointment.flaggedForSecurity ? 'Yes' : 'No'}`);
              doc.moveDown(0.5);
            });
          } else {
            doc.text("   No appointments found for this visitor", { italic: true });
          }
          doc.moveDown();
        });
      } else {
        doc.fontSize(12).text("No visitor interactions", { italic: true });
      }
      doc.moveDown();
    }

    doc.end();
  });
};



export const deleteFile = (filePath) => {
  fs.unlink(filePath, (error) => {
    if (error) {
      if (error.code === 'ENOENT') {
        console.warn(`File not found for deletion at ${filePath}`);
      } else {
        console.error(`Failed to delete file at ${filePath}:`, error);
      }
    } else {
      console.log(`File deleted successfully at ${filePath}`);
    }
  });
};



  
  