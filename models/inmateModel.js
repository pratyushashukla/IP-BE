import mongoose from "mongoose";

const inmateSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxlength: 100,
    },
    lastName: {
      type: String,
      required: true,
      maxlength: 100,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    contactNumber: {
      type: String,
      maxlength: 15,
      unique: true, // This is consider to be unique for each inmates
    },
    status: {
      type: String,
      enum: ["Active", "InActive"],
      required: true,
    },
    sentenceDuration: {
      type: Number,
      required: true, // Total duration of the inmate’s sentence in months
    },
    isActive: {
      type: Boolean,
      default: true, // Defaults to true, will be set to false on delete
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field to calculate the remaining time (in months) until release
inmateSchema.virtual("timeLeft").get(function () {
  // Calculate the time passed since `createdAt` in months
  const now = new Date();
  const monthsPassed =
    (now.getFullYear() - this.createdAt.getFullYear()) * 12 +
    (now.getMonth() - this.createdAt.getMonth());

  // Calculate remaining time
  const timeLeft = this.sentenceDuration - monthsPassed;

  // If timeLeft is less than 0, the inmate has completed the sentence
  return timeLeft > 0 ? timeLeft : 0;
});

const Inmate = mongoose.models.Inmate || mongoose.model("Inmate", inmateSchema);

export default Inmate;
