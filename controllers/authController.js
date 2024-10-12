import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import * as auth from "../lib/auth.js";

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