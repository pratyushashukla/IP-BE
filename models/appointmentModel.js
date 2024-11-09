import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor", // Refers to Visitor model
      required: true,
    },
    inmateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inmate", // Refers to Inmate model
      required: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Refers to Staff/User model
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    estimatedEndTime: {
      type: Date,
      required: true,
    },
    actualEndTime: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ["Completed", "Canceled", "Scheduled", "Ongoing"],
      required: true,
      default: "Scheduled",
    },
    identityVerified: {
      type: Boolean,
      default: false,
    },
    flaggedForSecurity: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
