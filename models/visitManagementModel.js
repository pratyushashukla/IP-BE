import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor', // Refers to Visitor model
      required: true,
    },
    inmateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inmate', // Refers to Inmate model
      required: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Refers to Staff/User model
      required: true,
    },
    visitDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'canceled', 'scheduled', 'ongoing'], 
      required: true,
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
      maxlength: 50,
    },
  },
  {
    timestamps: true, 
  }
);

const Visit = mongoose.model("Visit", visitSchema);

export default Visit;
