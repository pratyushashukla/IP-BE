import nodemailer from 'nodemailer';

// Creating a Nodemailer transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',  // For Gmail. We can change if we want other services
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generic function to send emails
const sendEmail = async (to, subject, text, attachments = []) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
    attachments: attachments,
  };

  try {
    // Sending email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
    return info;
  } catch (error) {
    console.error(`Error sending email: ${error}`);
    throw error;
  }
};

// Function to send confirmation email to user after registration is done
const sendConfirmationEmail = async (to, name) => {
  const subject = 'Welcome to Inmate+!';
  const text = `Hello ${name},\n\nThank you for registering for Inmate+. You can now log in to your account using the credentials provided during registration.\n\nBest regards,\nThe Inmate+ Team`;

  try {
    const info = await sendEmail(to, subject, text);
    return info;
  } catch (error) {
    console.error('Error in sending confirmation email:', error);
    throw error;
  }
};

// Function to send OTP for forgot password
const sendPasswordResetCode = async (to, otp) => {
  const subject = 'Password Reset Verification Code';
  const text = `Hello,\n\nYour password reset verification code is ${otp}. This code is valid for 1 hour.\n\nBest regards,\nThe Inmate+ Team`;

  try {
    const info = await sendEmail(to, subject, text);
    return info;
  } catch (error) {
    console.error('Error in sending password reset code:', error);
    throw error;
  }
};

// Email handler based on the flag
export const sendEmailToUser = async ({ to, name = '', otp = '', type }) => {
  try {
    if (type === 'confirmation') {
      // Send confirmation email
      return await sendConfirmationEmail(to, name);
    } else if (type === 'forgotPassword') {
      // Send forgot password OTP email
      return await sendPasswordResetCode(to, otp);
    } else {
      throw new Error('Invalid email type');
    }
  } catch (error) {
    console.error('Error in sending generic email:', error);
    throw error;
  }
};

//send meal plan PDF email
export const sendMealPlanEmail = async (to, inmateName, mealPlanDetails, pdfPath) => {
  const subject = `Meal Plan for ${inmateName}`;
  const text = `Hello,\n\nAttached is the meal plan for ${inmateName}.\n\n${mealPlanDetails}`;
  const attachments = [{ filename: `meal_plan_${inmateName}.pdf`, path: pdfPath }];

  try {
    return await sendEmail(to, subject, text, attachments);
  } catch (error) {
    console.error('Error in sending meal plan email:', error);
    throw error;
  }
};

//notify user of password reset
export const sendPasswordResetNotification = async (to, newPassword) => {
  const subject = 'Password Reset Notification';
  const text = `Hello,\n\nYour password has been successfully reset. Your new password is: ${newPassword}\n\nBest regards,\nThe Inmate+ Team`;

  try {
    return await sendEmail(to, subject, text);
  } catch (error) {
    console.error('Error in sending password reset notification:', error);
    throw error;
  }
};

// Function to send report PDF as an email attachment
export const sendReportEmail = async (to, inmateName, reportType, pdfPath) => {
  const subject = `Inmate Report for ${inmateName}`;
  const text = `Hello,\n\nAttached is the ${reportType} report for ${inmateName}.\n\nBest regards,\nThe Inmate+ Team`;
  const attachments = [{ filename: `report_${inmateName}.pdf`, path: pdfPath }];

  try {
    return await sendEmail(to, subject, text, attachments);
  } catch (error) {
    console.error('Error in sending report email:', error);
    throw error;
  }
};

