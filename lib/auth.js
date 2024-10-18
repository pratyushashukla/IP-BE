import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const privateKey = process.env.JWT_PRIVATEKEY;

export const createToken = (id, email) => {
  const payload = {
    userId: id,
    email: email,
  };
  const createOptions = getOptions();

  try {
    const token = jwt.sign(payload, privateKey, createOptions);
    return { status: true, token: token };
  } catch (error) {
    return {
      message: "Error while creating the token due to " + error.message,
    };
  }
};

export const verifyToken = (authtoken, res) => {
  const token = authtoken;
  const verifyOtpions = getOptions();
  try {
    const payload = jwt.verify(token, privateKey, verifyOtpions);
    
    // Check if the token has expired based on 'exp' claim
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp < currentTime) {
      return { status: false, message: "Session expired. Please log in again." };
    }
   
    return { status: true, payload: payload };
  } catch (error) {
    console.log("error while verifying JWT Token", error.message);
    return { message: error.message };
  }
};

function getOptions() {
  return {
    expiresIn: "3h",
  };
}
