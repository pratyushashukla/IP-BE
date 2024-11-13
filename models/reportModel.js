import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    inmateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inmate',
      required: true,
    },
    reportType: {
      type: String,
      enum: ['complete', 'tasks', 'meal', 'visitor'],
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Tracks which staff member generated the report
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    reportFilePath: { // Path where the report file is stored
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

export default Report;
