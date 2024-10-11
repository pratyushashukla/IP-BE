import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import sendEmailToUser  from '../utils/emailService.js';

export const signup = async (req, res) => {
  const userObj = req.body; 
  const salt = await bcrypt.genSalt(10);
  const hashPass = await bcrypt.hash(userObj.password, salt);
  userObj.password = hashPass;

  const post = new User(userObj);

  try {
    await post.save();
     //Sendign Email After User is Registered Successfully
     try {
      await sendEmailToUser({
        to: userObj.email,          
        name: userObj.firstname,    
        type: 'confirmation'        
      });
      res.status(200).json({ message: "Signup successful. Confirmation email sent. Login to continue" });
    } catch (emailError) {
      console.error(`Failed to send email: ${emailError.message}`);
      res.status(200).json({ message: "Signup successful, but email could not be sent. Please contact support." });
    }
  } catch (err) {
    res.status(400).json({ message: `Error while signing up due to ${err}` });
  }
};
