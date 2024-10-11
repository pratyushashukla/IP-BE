import nodemailer from 'nodemailer';

// Creating a Nodemailer transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',  // For Gmail.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generic function to send emails
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
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
const sendEmailToUser = async ({ to, name = '', otp = '', type }) => {
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

export default sendEmailToUser;
