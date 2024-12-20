import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import * as auth from "../lib/auth.js";
import { sendEmailToUser }  from '../utils/emailService.js';

export const signup = async (req, res) => {
  const userObj = req.body;

  // Validate phone number
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(userObj.phone)) {
    return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
  }

  // Validate password
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>?,./\\|`~\-]).{6,}$/;
  if (!passwordRegex.test(userObj.password)) {
    return res.status(400).json({ message: "Password must contain at least one uppercase letter, one special symbol, and one number." });
  }

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(userObj.password, salt);
    userObj.password = hashPass;

    // Create and save the user
    const post = new User(userObj);
    await post.save();

    // Send confirmation email
    try {
      await sendEmailToUser({
        to: userObj.email,
        name: userObj.firstname,
        type: 'confirmation'
      });
      res.status(200).json({ message: "Signup successful. Confirmation email sent. Login to continue." });
    } catch (emailError) {
      console.error(`Failed to send email: ${emailError.message}`);
      res.status(200).json({ message: "Signup successful, but email could not be sent. Please contact support." });
    }
  } catch (err) {
    res.status(400).json({ message: `Error while signing up due to ${err.message}` });
  }
};

export const login = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.body.email }).exec();
    const validPass = await bcrypt.compare(
      req.body.password,
      userData.password
    );
    if (!validPass) {
      res.status(400).json({ message: "Invalid Password entered" });
    }
    if (userData.status == "INACTIVE") {
      res.status(400).json({ message: "User is inactive, Contact Admin" });
    }
    const newToken = auth.createToken(userData._id, req.body.email);
    if (newToken.status) {
      try {
        const updateDataObj = {};
        updateDataObj.tokenStatus = true;
        updateDataObj.tokenCreatedAt = Date.now();
        const result = await User.findByIdAndUpdate(
          { _id: userData._id },
          updateDataObj,
          {
            new: true,
          }
        ).exec();
        res.cookie("authtoken", newToken.token);

        res
          .status(200)
          .json({ results: result, message: "Logged in successfully" });
      } catch (error) {
        console.error("Unable to update token status due to " + error.message);
      }
    } else {
      res.status(400).json({ message: "Invalid authtoken" });
    }
  } catch (error) {
    res.status(400).json({
      message: "Unable find the user. User doesnot exist with this email",
      error,
    });
  }
};

export const logout = async (req, res) => {
  const email = req.body.email;
  const updateDataObj = {};
  updateDataObj.tokenStatus = false;
  updateDataObj.tokenCreatedAt = null;
  try {
    const result = await User.updateOne({ email: email }, updateDataObj);
    res
      .clearCookie("authtoken")
      .status(200)
      .json({ message: "Logged out Successfully", result: result });
  } catch (error) {
    res
      .status(200)
      .json({ message: `Error while logging out due to ${error}` });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate a verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Save the code and its expiry to the user's document
    const obj = {
      resetPasswordToken: verificationCode,
      resetPasswordExpire: Date.now() + 3600000, // 1 hour
    };

    await User.updateOne({ email: email }, obj);

    try {
      // Send verification code via email
      const sentMail = await sendEmailToUser({
        to: email,
        otp: verificationCode,
        type: 'forgotPassword',
      });

      if (sentMail.accepted.length > 0) {
        return res
          .status(200)
          .json({ message: "Verification code sent to your email." });
      } else {
        throw new Error("Email failed to send");
      }
    } catch (err) {
      // Rollback the action: clear resetPasswordToken and resetPasswordExpire if email fails
      obj.resetPasswordToken = null;
      obj.resetPasswordExpire = null;
      // Save rollback changes
      await User.updateOne({ email: email }, obj);
      return res
        .status(500)
        .json({
          message: "Failed to send verification code. Please try again.",
          error: err,
        });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: `Server error due to ${err}. Please try again.` });
  }
};

export const resetPassword = async (req, res) => {
  const { password, code } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: code,
      resetPasswordExpire: { $gt: Date.now() }, // Ensure code is still valid
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    // Validate password strength here if necessary
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }

    let obj = {};

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    obj.password = await bcrypt.hash(password, salt);

    // Clear the reset token and expiration
    obj.resetPasswordToken = null;
    obj.resetPasswordExpire = null;

    // Save the updated user
    await User.updateOne({ resetPasswordToken: code }, obj);

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

export const verifyCode = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: code,
      resetPasswordExpire: { $gt: Date.now() }, // Check if the code is still valid
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    // Code is valid, allow the user to proceed
    res.status(200).json({ message: "Code verified. Proceed to reset password." });
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Resend Verification Code Endpoint
export const resendCode = async (req, res) => {
  const { email } = req.body;

  let obj = {};
  let verificationCode, existingUser;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate a unique 6-digit verification code
    const generateUniqueCode = async () => {
      do {
        verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser = await User.findOne({ resetPasswordToken: verificationCode });
      } while (existingUser);

      return verificationCode;
    };

    // Generate the unique verification code
    const newCode = await generateUniqueCode();

    // Save the new code and its expiry to the user's document
    obj.resetPasswordToken = newCode;
    obj.resetPasswordExpire = Date.now() + 3600000; // 1 hour

    await User.updateOne({ email: email }, obj);

    try {
      // Send new verification code via email
      const sentMail = await nodemailer.sendPasswordResetCode(email, newCode);

      if (sentMail.accepted.length > 0) {
        return res.status(200).json({ message: "New verification code sent to your email." });
      } else {
        throw new Error("Email failed to send");
      }
    } catch (err) {
      // Rollback the action: clear resetPasswordToken and resetPasswordExpire if email fails
      obj.resetPasswordToken = user.resetPasswordToken;
      obj.resetPasswordExpire = user.resetPasswordExpire;
      // Save rollback changes
      await User.updateOne({ email: email }, obj);
      return res
        .status(500)
        .json({ message: "Failed to send verification code. Please try again.", error: err });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};