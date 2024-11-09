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
    doc.text(
      `Allergies: ${meal.allergyId ? meal.allergyId.allergy_name : "None"}`
    );

    // Finalize the PDF and end the stream
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
  
  