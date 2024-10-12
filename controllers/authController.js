import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

export const signup = async (req, res) => {
  const userObj = req.body.data;
  const salt = await bcrypt.genSalt(10);
  const hashPass = await bcrypt.hash(userObj.password, salt);
  userObj.password = hashPass;

  const post = new User(userObj);

  try {
    await post.save();
    res.status(200).json({ message: "Signup Successfull, Login to continue" });
  } catch (err) {
    res.status(400).json({ message: `Error while signing up due to ${err}` });
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